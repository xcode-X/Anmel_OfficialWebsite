import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

function mapDocs(snap) {
  return snap.docs.map((d) => {
    const data = d.data();
    const row = { id: d.id, _id: d.id, ...data };
    if (data.createdAt?.toDate) row.createdAt = data.createdAt.toDate().toISOString();
    if (data.updatedAt?.toDate) row.updatedAt = data.updatedAt.toDate().toISOString();
    if (data.publishedAt?.toDate) row.publishedAt = data.publishedAt.toDate().toISOString();
    return row;
  });
}

function sortByDate(rows, field = 'createdAt') {
  return [...rows].sort((a, b) => {
    const ta = a[field] ? new Date(a[field]).getTime() : 0;
    const tb = b[field] ? new Date(b[field]).getTime() : 0;
    return tb - ta;
  });
}

export async function listPublished(
  collectionName,
  { orderField = 'createdAt', orderDir = 'desc', publishedField = 'published', max = 100 } = {},
) {
  const db = getFirebaseDb();
  const q = query(
    collection(db, collectionName),
    where(publishedField, '==', true),
    orderBy(orderField, orderDir),
    fsLimit(max),
  );
  const snap = await getDocs(q);
  return mapDocs(snap);
}

export async function listPublishedScholarships() {
  const db = getFirebaseDb();
  try {
    const q = query(
      collection(db, 'scholarships'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc'),
      fsLimit(100),
    );
    const snap = await getDocs(q);
    const rows = mapDocs(snap);
    if (rows.length > 0) return rows;
  } catch (e) {
    console.warn('[firestore] listPublishedScholarships query:', e.message);
  }
  const all = await listAll('scholarships', { max: 500 });
  return all.filter((s) => s.isPublished !== false && s.isPublished !== 'false');
}

export async function listAll(collectionName, { orderField = 'createdAt', max = 100 } = {}) {
  const db = getFirebaseDb();
  try {
    const q = query(collection(db, collectionName), orderBy(orderField, 'desc'), fsLimit(max));
    const snap = await getDocs(q);
    return mapDocs(snap);
  } catch {
    const snap = await getDocs(collection(db, collectionName));
    return sortByDate(mapDocs(snap).slice(0, max), orderField);
  }
}

/** Published blog posts for the public site (Firestore-first). */
export async function listPublishedCaseStudies(category = '') {
  try {
    let rows = await listPublished('caseStudies', {
      orderField: 'order',
      orderDir: 'asc',
      publishedField: 'published',
    });
    if (category) rows = rows.filter((p) => p.category === category);
    return rows.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  } catch (e) {
    console.warn('[firestore] listPublishedCaseStudies:', e.message);
    const all = await listAll('caseStudies', { orderField: 'order' });
    return all
      .filter((p) => p.published === true && (!category || p.category === category))
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }
}

export async function listPublishedBlog(category = '') {
  try {
    let rows = await listPublished('blogPosts', {
      orderField: 'createdAt',
      orderDir: 'desc',
      publishedField: 'published',
    });
    if (category) rows = rows.filter((p) => p.category === category);
    return rows;
  } catch (e) {
    console.warn('[firestore] listPublishedBlog query, using client filter:', e.message);
    const all = await listAll('blogPosts');
    return all.filter(
      (p) => p.published === true && (!category || p.category === category),
    );
  }
}
