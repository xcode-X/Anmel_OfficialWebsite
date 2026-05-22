import bcrypt from 'bcryptjs';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import { APPLICATION_DOC_FIELDS } from './applicationDocFields';
import {
  isDataUrl,
  parseDataUrl,
  MAX_FIRESTORE_ATTACHMENT_BYTES,
  prepareFirestoreOnlyApplicationPayload,
} from './applicationMediaUpload';

/** API path → Firestore collection (public creates). */
export const API_COLLECTION_MAP = {
  '/student-registrations': 'studentRegistrations',
  '/contact': 'contactSubmissions',
};

/** Resource name for meta/realtime bump (matches backend publishContentChange). */
export const COLLECTION_RESOURCE_MAP = {
  studentRegistrations: 'students',
  contactSubmissions: 'contacts',
  testimonials: 'testimonials',
  blogPosts: 'blog',
  caseStudies: 'case-studies',
  scholarships: 'scholarships',
  scholarshipApplications: 'scholarship-applications',
  universities: 'universities',
  courses: 'courses',
  agents: 'agents',
  users: 'users',
  lmsContent: 'lms-content',
  securityScanRecords: 'pentest-results',
};

function stripUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function mapFirestoreDoc(snap) {
  if (!snap?.exists?.()) return null;
  const data = snap.data();
  const row = { id: snap.id, _id: snap.id, ...data };
  if (data.createdAt?.toDate) row.createdAt = data.createdAt.toDate().toISOString();
  if (data.updatedAt?.toDate) row.updatedAt = data.updatedAt.toDate().toISOString();
  if (data.publishedAt?.toDate) row.publishedAt = data.publishedAt.toDate().toISOString();
  return row;
}

function sortByDate(rows, field = 'createdAt') {
  return [...rows].sort((a, b) => {
    const ta = a[field] ? new Date(a[field]).getTime() : 0;
    const tb = b[field] ? new Date(b[field]).getTime() : 0;
    return tb - ta;
  });
}

export function isApiUnavailableError(err) {
  const status = err?.status;
  if (typeof status === 'number' && status >= 500) return true;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('unavailable') ||
    msg.includes('database unavailable') ||
    msg.includes('db_unavailable') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('temporarily unavailable')
  );
}

const FIREBASE_AUTH_ERRORS = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 8 characters.',
  'auth/operation-not-allowed': 'Email/password sign-up is disabled. Enable it in Firebase Console → Authentication → Sign-in method.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
};

export function formatFirebaseAuthError(err) {
  return FIREBASE_AUTH_ERRORS[err?.code] || err?.message || 'Registration failed.';
}

/**
 * Ensure signed-in Firebase user has users/{uid} with role admin (required by Firestore rules).
 * Safe to call on every admin login and before agent approve/reject.
 */
export async function ensureAdminFirestoreProfile() {
  const authUser = getFirebaseAuth().currentUser;
  if (!authUser) {
    throw new Error('Not signed in. Please log out and sign in to the admin dashboard again.');
  }

  const ref = doc(getFirebaseDb(), 'users', authUser.uid);
  const snap = await getDoc(ref);
  const email = (authUser.email || '').trim().toLowerCase();

  if (snap.exists() && snap.data()?.role === 'admin') {
    return mapFirestoreDoc(snap);
  }

  try {
    await setDoc(
      ref,
      {
        email,
        name: authUser.displayName || snap.data()?.name || email.split('@')[0] || 'Admin',
        role: 'admin',
        firebaseUid: authUser.uid,
        updatedAt: serverTimestamp(),
        ...(!snap.exists() ? { createdAt: serverTimestamp() } : {}),
      },
      { merge: true },
    );
  } catch (err) {
    const msg = err?.message || '';
    if (msg.includes('permission') || msg.includes('PERMISSION_DENIED')) {
      throw new Error(
        'Admin profile could not be saved. Deploy updated Firestore rules: firebase deploy --only firestore:rules',
      );
    }
    throw err;
  }

  return getAdminUserProfile(authUser.uid);
}

/** Create admin when backend has no service account (Firebase Auth + Firestore users doc). */
export async function registerAdminClient({ name, email, password }) {
  const normalized = String(email || '').trim().toLowerCase();
  const displayName = String(name || '').trim();
  if (!displayName) throw new Error('Name is required.');
  if (!normalized) throw new Error('Email is required.');
  if (String(password || '').length < 8) throw new Error('Password must be at least 8 characters.');

  const auth = getFirebaseAuth();
  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, normalized, password);
  } catch (err) {
    throw new Error(formatFirebaseAuthError(err));
  }

  try {
    await setDoc(doc(getFirebaseDb(), 'users', cred.user.uid), {
      email: normalized,
      name: displayName,
      role: 'admin',
      firebaseUid: cred.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    throw new Error(
      err?.message?.includes('permission')
        ? 'Could not save admin profile. Deploy Firestore rules: firebase deploy --only firestore:rules'
        : err?.message || 'Could not save admin profile.',
    );
  }

  await bumpRealtime('users');

  const token = await cred.user.getIdToken(true);
  localStorage.setItem('intelera_admin_token', token);
  return {
    token,
    user: { id: cred.user.uid, email: normalized, role: 'admin', name: displayName },
  };
}

/** Signal CMS dashboards (same doc as backend meta/realtime). */
export async function bumpRealtime(resource, meta = {}) {
  try {
    const ref = doc(getFirebaseDb(), 'meta', 'realtime');
    await setDoc(
      ref,
      { resource, ts: serverTimestamp(), ...stripUndefined(meta) },
      { merge: true },
    );
  } catch (e) {
    console.warn('[firestore] bumpRealtime:', e.message);
  }
}

export async function createDocument(collectionName, data, { resource } = {}) {
  const db = getFirebaseDb();
  const defaults =
    collectionName === 'studentRegistrations'
      ? { status: 'pending', read: false }
      : collectionName === 'contactSubmissions'
        ? { read: false }
        : {};
  const payload = stripUndefined({
    ...defaults,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const ref = await addDoc(collection(db, collectionName), payload);
  const snap = await getDoc(ref);
  const row = mapFirestoreDoc(snap);
  await bumpRealtime(resource || COLLECTION_RESOURCE_MAP[collectionName] || collectionName);
  return row;
}

export async function updateDocument(collectionName, id, patch, { resource } = {}) {
  const db = getFirebaseDb();
  const ref = doc(db, collectionName, String(id));
  const clean = stripUndefined({ ...patch });
  delete clean._id;
  delete clean.id;
  await updateDoc(ref, { ...clean, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  const row = mapFirestoreDoc(snap);
  await bumpRealtime(resource || COLLECTION_RESOURCE_MAP[collectionName] || collectionName);
  return row;
}

export async function deleteDocument(collectionName, id, { resource } = {}) {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, collectionName, String(id)));
  await bumpRealtime(resource || COLLECTION_RESOURCE_MAP[collectionName] || collectionName);
  return { success: true };
}

export async function listCollection(collectionName, { max = 200, orderField = 'createdAt' } = {}) {
  const db = getFirebaseDb();
  const snap = await getDocs(collection(db, collectionName));
  const rows = snap.docs.map((d) => mapFirestoreDoc(d)).filter(Boolean);
  return sortByDate(rows.slice(0, max), orderField);
}

/** Fast aggregate counts for admin dashboard (no full collection download). */
export async function countCollection(collectionName, ...constraints) {
  const coll = collection(getFirebaseDb(), collectionName);
  const q = constraints.length ? query(coll, ...constraints) : query(coll);
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function getDocument(collectionName, id) {
  const snap = await getDoc(doc(getFirebaseDb(), collectionName, String(id)));
  return mapFirestoreDoc(snap);
}

/** Resolve admin session from Firestore users/{uid} (works without backend). */
export async function getAdminUserProfile(uid) {
  const snap = await getDoc(doc(getFirebaseDb(), 'users', String(uid)));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.role !== 'admin') return null;
  return {
    id: uid,
    email: data.email,
    role: 'admin',
    name: data.name || 'Admin',
  };
}

/** Map POST /api/... path to Firestore collection for public submissions. */
export function collectionForApiPath(path) {
  const base = path.replace(/\?.*$/, '').replace(/\/$/, '');
  if (API_COLLECTION_MAP[base]) return API_COLLECTION_MAP[base];
  const m = base.match(/^\/scholarships\/([^/]+)\/applications$/);
  if (m) return 'scholarshipApplications';
  return null;
}

export function buildScholarshipApplication(body, scholarshipId) {
  const { documentFileNames: _dfn, ...rest } = body;
  return {
    scholarshipId: String(scholarshipId),
    scholarshipTitle: body.scholarshipTitle || '',
    ...rest,
    status: body.status || 'pending',
  };
}

/** Store uploaded files in Firestore subcollection (Spark plan — no Storage required). */
export async function saveScholarshipApplicationFiles(appId, sourceBody, fileNames = {}) {
  const db = getFirebaseDb();
  const results = [];

  for (const field of APPLICATION_DOC_FIELDS) {
    const raw = sourceBody[field];
    if (!isDataUrl(raw)) continue;

    const parsed = parseDataUrl(raw);
    const fileName = fileNames[field] || `${field}.pdf`;
    const ref = doc(db, 'scholarshipApplications', String(appId), 'files', field);

    if (!parsed?.bytes?.length) continue;

    if (parsed.bytes.length > MAX_FIRESTORE_ATTACHMENT_BYTES) {
      await setDoc(
        ref,
        stripUndefined({
          field,
          fileName,
          mimeType: parsed.mime,
          tooLarge: true,
          size: parsed.bytes.length,
          createdAt: serverTimestamp(),
        }),
      );
      results.push({ field, tooLarge: true, fileName });
      continue;
    }

    await setDoc(
      ref,
      stripUndefined({
        field,
        fileName,
        mimeType: parsed.mime,
        dataUrl: raw,
        size: parsed.bytes.length,
        createdAt: serverTimestamp(),
      }),
    );
    results.push({ field, stored: true, fileName });
  }

  return results;
}

export async function listScholarshipApplicationFiles(appId) {
  const snap = await getDocs(
    collection(getFirebaseDb(), 'scholarshipApplications', String(appId), 'files'),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Attach file data URLs / download URLs onto the application record for admin preview. */
export async function mergeApplicationWithFiles(app) {
  if (!app?._id && !app?.id) return app;
  const appId = app._id || app.id;
  const files = await listScholarshipApplicationFiles(appId);
  const merged = { ...app, _applicationFiles: files };

  for (const f of files) {
    const key = f.field || f.id;
    if (f.dataUrl) merged[key] = f.dataUrl;
    else if (f.downloadUrl) merged[key] = f.downloadUrl;
  }

  return merged;
}

/** Create scholarship application + store documents in Firestore (real-time, no Blaze Storage). */
export async function createScholarshipApplicationRecord(rawBody, scholarshipId) {
  const fileNames = rawBody.documentFileNames || {};
  let scholarshipTitle = rawBody.scholarshipTitle || '';
  if (!scholarshipTitle) {
    const sch = await getScholarshipById(scholarshipId);
    scholarshipTitle = sch?.title || '';
  }
  const bodyWithScholarship = buildScholarshipApplication(
    { ...rawBody, scholarshipTitle },
    scholarshipId,
  );
  const fsPayload = prepareFirestoreOnlyApplicationPayload(bodyWithScholarship, fileNames);

  const row = await createDocument('scholarshipApplications', fsPayload);
  const fileResults = await saveScholarshipApplicationFiles(row._id, rawBody, fileNames);
  const storedCount = fileResults.filter((r) => r.stored).length;

  if (fileResults.length > 0) {
    await updateDocument(
      'scholarshipApplications',
      row._id,
      {
        documentsStorage: storedCount > 0 ? 'firestore-files' : 'firestore-metadata',
        documentsPendingCollection: fileResults.some((r) => r.tooLarge),
        storedAttachmentsCount: storedCount,
      },
      { resource: 'scholarship-applications' },
    );
  }

  return mergeApplicationWithFiles({ ...row, ...fsPayload });
}

export function slugifyTitle(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || 'post';
}

function extractFirstImageFromHtml(html) {
  const m = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || '';
}

function normalizeBlogPayload(data) {
  const slug = (data.slug || slugifyTitle(data.title)).trim() || 'post';
  // Keep admin-uploaded cover; only infer from HTML when no explicit upload
  let featuredImage = String(data.featuredImage || '').trim();
  if (!featuredImage && data.content) {
    featuredImage = extractFirstImageFromHtml(data.content);
  }
  const out = stripUndefined({
    title: data.title,
    slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'News',
    featuredImage: featuredImage || '',
    hasFeaturedImage: !!featuredImage,
    author: data.author || 'Anmel Inc Team',
    published: !!data.published,
    views: data.views ?? 0,
  });
  if (out.published) out.publishedAt = data.publishedAt || new Date().toISOString();
  return out;
}

export async function createBlogPost(data) {
  return createDocument('blogPosts', normalizeBlogPayload(data));
}

export async function updateBlogPost(id, data) {
  const existing = (await getDocument('blogPosts', id)) || {};
  const patch = normalizeBlogPayload({ ...existing, ...data });
  if (patch.published) {
    patch.publishedAt = existing.publishedAt || patch.publishedAt || new Date().toISOString();
  } else {
    delete patch.publishedAt;
  }
  if (existing.views != null && data.views == null) patch.views = existing.views;
  return updateDocument('blogPosts', id, patch);
}

export async function getBlogById(id) {
  return getDocument('blogPosts', id);
}

export async function getBlogBySlug(slug) {
  const db = getFirebaseDb();
  const q = query(collection(db, 'blogPosts'), where('slug', '==', String(slug)));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return mapFirestoreDoc(snap.docs[0]);
}

function sortCaseStudies(rows) {
  return [...rows].sort((a, b) => {
    const oa = Number(a.order) || 0;
    const ob = Number(b.order) || 0;
    if (oa !== ob) return oa - ob;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

function normalizeCaseStudyPayload(data) {
  const slug = (data.slug || slugifyTitle(data.title)).trim() || 'case-study';
  const image = String(data.image || '').trim();
  return stripUndefined({
    title: data.title,
    slug,
    category: data.category || 'Security Assessment',
    client: data.client || '',
    clientSector: data.clientSector || '',
    duration: data.duration || '',
    accent: data.accent || '#0EA5E9',
    image: image || '',
    hasImage: !!image,
    excerpt: data.excerpt || '',
    resultSnippet: data.resultSnippet || '',
    challenge: data.challenge || '',
    solution: data.solution || '',
    results: data.results || '',
    metrics: Array.isArray(data.metrics) ? data.metrics : [],
    order: Number(data.order) || 0,
    published: !!data.published,
    views: data.views ?? 0,
  });
}

async function resolveUniqueCaseStudySlug(baseSlug, excludeId = null) {
  const all = await listCollection('caseStudies', { max: 500 });
  const root = (baseSlug || 'case-study').trim() || 'case-study';
  for (let n = 0; n < 100; n += 1) {
    const candidate = n === 0 ? root : `${root}-${n + 1}`;
    const taken = all.some((p) => p.slug === candidate && p._id !== excludeId);
    if (!taken) {
      return {
        slug: candidate,
        slugAdjusted: candidate !== root,
        requestedSlug: root,
      };
    }
  }
  return { slug: `${root}-${Date.now()}`, slugAdjusted: true, requestedSlug: root };
}

export async function createCaseStudy(data) {
  const baseSlug = (data.slug || slugifyTitle(data.title)).trim() || 'case-study';
  const { slug, slugAdjusted, requestedSlug } = await resolveUniqueCaseStudySlug(baseSlug);
  const row = await createDocument('caseStudies', normalizeCaseStudyPayload({ ...data, slug }));
  return { ...row, slugAdjusted, ...(slugAdjusted ? { requestedSlug } : {}) };
}

export async function updateCaseStudy(id, data) {
  const existing = (await getDocument('caseStudies', id)) || {};
  const patch = normalizeCaseStudyPayload({ ...existing, ...data });
  if (existing.views != null && data.views == null) patch.views = existing.views;
  return updateDocument('caseStudies', id, patch);
}

export async function getCaseStudyById(id) {
  return getDocument('caseStudies', id);
}

export async function getCaseStudyBySlug(slug) {
  const db = getFirebaseDb();
  const q = query(collection(db, 'caseStudies'), where('slug', '==', String(slug)));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return mapFirestoreDoc(snap.docs[0]);
}

export async function listCaseStudiesAdmin() {
  return sortCaseStudies(await listCollection('caseStudies', { max: 500 }));
}

// ─── Testimonials ───────────────────────────────────────────────────────────
export async function listTestimonialsAdmin() {
  return listCollection('testimonials');
}

export async function createTestimonial(data) {
  return createDocument('testimonials', {
    name: data.name,
    role: data.role || '',
    company: data.company || '',
    program: data.program || '',
    uni: data.uni || '',
    quote: data.quote,
    outcome: data.outcome || '',
    accent: data.accent || 'sky',
    avatar: data.avatar || data.image || '',
    image: data.image || data.avatar || '',
  });
}

// ─── Universities ───────────────────────────────────────────────────────────
function normalizeUniversityCourses(courses) {
  if (!Array.isArray(courses)) return [];
  return courses
    .map((c) => ({
      name: String(c?.name || '').trim(),
      level: String(c?.level || 'Undergraduate').trim(),
      duration: String(c?.duration || '').trim(),
    }))
    .filter((c) => c.name);
}

function normalizeUniversity(data) {
  const image = String(data.image || '').trim();
  return stripUndefined({
    name: data.name,
    country: data.country,
    city: data.city || '',
    website: data.website || '',
    description: data.description || '',
    ranking: data.ranking || '',
    founded: data.founded != null ? String(data.founded).trim() : '',
    students: data.students != null ? String(data.students).trim() : '',
    courses: normalizeUniversityCourses(data.courses),
    degreeLevels: Array.isArray(data.degreeLevels)
      ? data.degreeLevels.filter(Boolean)
      : [...new Set(normalizeUniversityCourses(data.courses).map((c) => c.level).filter(Boolean))],
    image,
    hasImage: !!image,
  });
}

export async function listUniversitiesAdmin() {
  return listCollection('universities', { max: 500 });
}

export async function createUniversity(data) {
  return createDocument('universities', normalizeUniversity(data));
}

export async function updateUniversity(id, data) {
  const existing = (await getDocument('universities', id)) || {};
  return updateDocument('universities', id, normalizeUniversity({ ...existing, ...data }));
}

export async function getUniversityById(id) {
  return getDocument('universities', id);
}

// ─── Scholarships ───────────────────────────────────────────────────────────
/** Matches backend default: published unless explicitly false. */
export function isScholarshipPublished(row) {
  if (!row) return false;
  return row.isPublished !== false && row.isPublished !== 'false';
}

function normalizeScholarship(data) {
  const thumbnail = String(data.thumbnail || '').trim();
  const programs = Array.isArray(data.programs)
    ? data.programs
        .map((p) => {
          if (typeof p === 'string') {
            const name = p.trim();
            return name ? { name, level: '' } : null;
          }
          const name = String(p?.name || '').trim();
          return name ? { name, level: String(p?.level || '').trim() } : null;
        })
        .filter(Boolean)
    : [];
  return stripUndefined({
    title: data.title,
    university: data.university,
    country: data.country,
    universityId: data.universityId || '',
    deadline: data.deadline,
    scholarshipType: data.scholarshipType || '',
    fundingStatus: data.fundingStatus || '',
    eligibility: data.eligibility || '',
    description: data.description || '',
    applicationLink: data.applicationLink || '',
    amount: data.amount || '',
    programs,
    thumbnail,
    isPublished: isScholarshipPublished(data),
  });
}

export async function listPublishedScholarshipsFromFirestore() {
  const { listPublishedScholarships } = await import('./firestorePublic.js');
  return listPublishedScholarships();
}

export async function listScholarshipsAdmin() {
  const rows = await listCollection('scholarships', { max: 500 });
  return sortByDate(rows);
}

export async function createScholarship(data) {
  return createDocument('scholarships', normalizeScholarship(data));
}

export async function updateScholarship(id, data) {
  const existing = (await getDocument('scholarships', id)) || {};
  return updateDocument('scholarships', id, normalizeScholarship({ ...existing, ...data }));
}

export async function getScholarshipById(id) {
  return getDocument('scholarships', id);
}

// ─── Pen test / security scan records (admin only) ────────────────────────
export function stripScanRecordForList(row) {
  if (!row) return row;
  const { result, rawHtml, screenshot, ...summary } = row;
  return summary;
}

export async function listSecurityScanRecords() {
  const rows = await listCollection('securityScanRecords', { max: 200 });
  return rows.map(stripScanRecordForList);
}

export async function getSecurityScanRecord(id) {
  return getDocument('securityScanRecords', id);
}

function mapAgentToDirectoryRow(agent) {
  return {
    _id: `agent-${agent.id || agent._id}`,
    sourceId: agent.id || agent._id,
    email: agent.email,
    name: agent.fullName || agent.name || agent.email,
    role: 'agent',
    status: agent.status || 'Pending',
    createdAt: agent.createdAt,
    agentCode: agent.agentCode || null,
    loginEnabled: agent.loginEnabled === true,
    pendingReview: agent.status === 'Pending',
  };
}

function mapUserToDirectoryRow(user) {
  return {
    _id: user.id || user._id,
    sourceId: user.id || user._id,
    email: user.email,
    name: user.name || user.email,
    role: user.role || 'admin',
    status: user.status || 'active',
    createdAt: user.createdAt,
    agentCode: user.agentCode || null,
    loginEnabled: user.loginEnabled !== false,
    pendingReview: false,
  };
}

/** Merge Firestore/API user accounts with agent applications (all statuses). */
export function mergeUsersDirectory(userRecords = [], agentRecords = []) {
  const byEmail = new Map();

  for (const a of agentRecords) {
    const email = String(a.email || '').toLowerCase();
    if (email) byEmail.set(email, mapAgentToDirectoryRow(a));
  }

  for (const u of userRecords) {
    const email = String(u.email || '').toLowerCase();
    if (!email) continue;
    const userRow = mapUserToDirectoryRow(u);
    if (u.role === 'admin' || u.role === 'student') {
      byEmail.set(email, userRow);
      continue;
    }
    const agentRow = byEmail.get(email);
    if (u.role === 'agent' && agentRow?.status === 'Approved') {
      byEmail.set(email, {
        ...userRow,
        status: 'Approved',
        pendingReview: false,
        sourceId: agentRow.sourceId || userRow.sourceId,
        agentCode: userRow.agentCode || agentRow.agentCode,
      });
    } else if (!agentRow) {
      byEmail.set(email, userRow);
    }
  }

  return [...byEmail.values()].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

/** Unified admin directory — users + all agent applications. */
export async function computeUsersDirectoryFromFirestore() {
  const [users, agents] = await Promise.all([
    listCollection('users', { max: 500 }),
    listCollection('agents', { max: 500 }),
  ]);
  return mergeUsersDirectory(users, agents);
}

/** Agent login ID — same format as backend (used as portal username). */
export function generateAgentCode() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
  return `AGT-${random}${timestamp}`;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const snap = await getDocs(
    query(collection(getFirebaseDb(), 'users'), where('email', '==', normalized)),
  );
  const row = snap.docs.map((d) => mapFirestoreDoc(d)).find(Boolean);
  return row || null;
}

async function upsertAgentLoginUser(agentId, userPatch) {
  const email = userPatch.email;
  let existingUser = null;
  try {
    existingUser = await findUserByEmail(email);
  } catch (e) {
    console.warn('[approve] user email lookup:', e.message);
  }

  if (existingUser && existingUser.role !== 'agent') {
    throw new Error('This email belongs to a non-agent account.');
  }

  const userDocId = existingUser?._id || `agent-${agentId}`;
  const ref = doc(getFirebaseDb(), 'users', userDocId);
  await setDoc(
    ref,
    {
      ...userPatch,
      updatedAt: serverTimestamp(),
      ...(existingUser ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

function formatFirestorePermissionError(err, action) {
  const msg = String(err?.message || err || '');
  if (msg.includes('permission') || msg.includes('PERMISSION_DENIED') || msg.includes('insufficient')) {
    return new Error(
      `${action} failed: missing Firestore permissions. Sign in as admin, ensure your account has role "admin" in users/{your uid}, then deploy rules: firebase deploy --only firestore:rules`,
    );
  }
  return err instanceof Error ? err : new Error(msg || `${action} failed`);
}

/** Approve agent when backend Firebase Admin is unavailable (signed-in admin + Firestore rules). */
export async function approveAgentInFirestore(agentId) {
  await ensureAdminFirestoreProfile();

  let agent;
  try {
    agent = await getDocument('agents', String(agentId));
  } catch (err) {
    throw formatFirestorePermissionError(err, 'Loading agent');
  }
  if (!agent) throw new Error('Agent not found');
  if (agent.status === 'Approved') throw new Error('Agent is already approved');

  const agentCode = agent.agentCode || generateAgentCode();
  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 12);
  const email = String(agent.email || '').trim().toLowerCase();
  const approvedBy = getFirebaseAuth().currentUser?.email || 'admin';

  try {
    await updateDocument(
      'agents',
      String(agentId),
      {
        agentCode,
        temporaryPassword: tempPassword,
        password: hashed,
        status: 'Approved',
        loginEnabled: true,
        approvedAt: new Date().toISOString(),
        approvedBy,
      },
      { resource: 'agents' },
    );
  } catch (err) {
    throw formatFirestorePermissionError(err, 'Approving agent');
  }

  try {
    await upsertAgentLoginUser(agentId, {
      email,
      name: agent.fullName || agent.name || email,
      password: hashed,
      role: 'agent',
      agentId: String(agentId),
      agentCode,
      loginEnabled: true,
      status: 'active',
    });
  } catch (err) {
    throw formatFirestorePermissionError(err, 'Creating agent login');
  }

  await bumpRealtime('users');

  const origin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    import.meta.env.VITE_CLIENT_URL ||
    'http://localhost:5173';
  const loginUrl = `${String(origin).replace(/\/$/, '')}/agent-login`;

  return {
    ok: true,
    agentCode,
    tempPassword,
    loginUrl,
    emailSent: false,
    emailError: 'SMTP requires backend service account — share login ID and password manually.',
    message: 'Agent approved. Email could not be sent — share credentials manually.',
  };
}

/** Reject agent when backend is unavailable. */
export async function rejectAgentInFirestore(agentId, notes = '') {
  await ensureAdminFirestoreProfile();

  const agent = await getDocument('agents', String(agentId));
  if (!agent) throw new Error('Agent not found');
  if (agent.status === 'Rejected') throw new Error('Agent is already rejected');

  await updateDocument(
    'agents',
    String(agentId),
    {
      status: 'Rejected',
      loginEnabled: false,
      adminNotes: String(notes || '').trim() || agent.adminNotes || '',
    },
    { resource: 'agents' },
  );
  await bumpRealtime('users');
  return { ok: true, message: 'Agent rejected.' };
}

/** Public agent application when API is unavailable. */
export async function createAgentApplication(payload) {
  const agentCode = generateAgentCode();
  const row = await createDocument('agents', {
    ...payload,
    email: String(payload.email || '').trim().toLowerCase(),
    status: 'Pending',
    agentCode,
    loginEnabled: false,
    agreedToTerms: !!payload.agreedToTerms,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth).toISOString() : payload.dateOfBirth,
    yearsOfExperience: Number(payload.yearsOfExperience) || 0,
    studentsPerYear: Number(payload.studentsPerYear) || 0,
    areasOfRecruitment: Array.isArray(payload.areasOfRecruitment)
      ? payload.areasOfRecruitment
      : [payload.areasOfRecruitment].filter(Boolean),
    targetCountries: Array.isArray(payload.targetCountries)
      ? payload.targetCountries
      : [payload.targetCountries].filter(Boolean),
  });
  await bumpRealtime('agents');
  await bumpRealtime('users');
  return {
    ok: true,
    agentId: row._id,
    agentCode,
    message: 'Application submitted successfully. You will be notified upon review.',
  };
}

/** Dashboard overview counts — used when the API cannot reach Firestore (no service account). */
export async function computeAdminStatsFromFirestore() {
  const [
    blogTotal,
    blogPublished,
    caseStudiesTotal,
    contactsTotal,
    contactsRead,
    studentsTotal,
    studentsPending,
    scholarshipsTotal,
    scholarshipsLive,
    universitiesTotal,
    agentsTotal,
    agentsPending,
    testimonialsTotal,
  ] = await Promise.all([
    countCollection('blogPosts'),
    countCollection('blogPosts', where('published', '==', true)),
    countCollection('caseStudies'),
    countCollection('contactSubmissions'),
    countCollection('contactSubmissions', where('read', '==', true)),
    countCollection('scholarshipApplications'),
    countCollection('scholarshipApplications', where('status', '==', 'pending')),
    countCollection('scholarships'),
    countCollection('scholarships', where('isPublished', '==', true)),
    countCollection('universities'),
    countCollection('agents'),
    countCollection('agents', where('status', '==', 'Pending')),
    countCollection('testimonials'),
  ]);

  return {
    blog: { total: blogTotal, published: blogPublished },
    caseStudies: { total: caseStudiesTotal },
    contacts: {
      total: contactsTotal,
      unread: Math.max(0, contactsTotal - contactsRead),
    },
    students: { total: studentsTotal, pending: studentsPending },
    scholarships: { total: scholarshipsTotal, live: scholarshipsLive },
    universities: { total: universitiesTotal },
    agents: { total: agentsTotal, pending: agentsPending },
    testimonials: { total: testimonialsTotal },
    updatedAt: Date.now(),
    source: 'firestore',
  };
}

export async function createSecurityScanRecord(data) {
  const result = data.result || data;
  const findings = result?.findings || [];
  const sev = { high: 0, medium: 0, low: 0 };
  findings.forEach((f) => {
    const s = String(f.severity || '').toLowerCase();
    if (s === 'high') sev.high += 1;
    else if (s === 'medium') sev.medium += 1;
    else sev.low += 1;
  });
  const payload = stripUndefined({
    targetUrl: data.targetUrl || result?.targetUrl || '',
    startedAt: data.startedAt || result?.startedAt || new Date().toISOString(),
    completedAt: data.completedAt || result?.completedAt || new Date().toISOString(),
    riskScore: data.riskScore ?? result?.riskScore ?? 0,
    posture: data.posture || result?.posture || '',
    executiveKeyMessage: data.executiveKeyMessage || result?.executiveKeyMessage || '',
    scanMode: data.scanMode || result?.scanMode || '',
    scanDepth: data.scanDepth || result?.scanDepth || '',
    findingsCount: findings.length,
    severityCounts: sev,
    result,
  });
  return createDocument('securityScanRecords', payload);
}
