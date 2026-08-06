import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase.js';
import { isFirebaseConnected, withDbQuery } from './dbReady.js';
import { localStore } from './localDbStore.js';

export const COLLECTIONS = {
  users: 'users',
  agents: 'agents',
  blogPosts: 'blogPosts',
  caseStudies: 'caseStudies',
  contactSubmissions: 'contactSubmissions',
  courses: 'courses',
  lmsContent: 'lmsContent',
  newsletterSubscribers: 'newsletterSubscribers',
  scholarships: 'scholarships',
  scholarshipApplications: 'scholarshipApplications',
  securityScanRecords: 'securityScanRecords',
  services: 'services',
  studentRegistrations: 'studentRegistrations',
  testimonials: 'testimonials',
  universities: 'universities',
  meta: 'meta',
};

const META_REALTIME_DOC = 'realtime';

function col(name) {
  return getFirestore().collection(name);
}

function serializeValue(v) {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v && typeof v.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(serializeValue);
  if (v && typeof v === 'object' && !(v instanceof Buffer)) {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = serializeValue(val);
    return out;
  }
  return v;
}

export function toApiDoc(snap) {
  if (!snap?.exists) return null;
  const data = serializeValue(snap.data() || {});
  return { _id: snap.id, id: snap.id, ...data };
}

export function toApiDocs(snaps) {
  return snaps.map((s) => toApiDoc(s)).filter(Boolean);
}

function applyProjection(doc, { exclude = [], includeOnly = null }) {
  if (!doc) return doc;
  if (includeOnly?.length) {
    const out = { _id: doc._id, id: doc.id };
    for (const k of includeOnly) if (doc[k] !== undefined) out[k] = doc[k];
    return out;
  }
  if (!exclude.length) return doc;
  const copy = { ...doc };
  for (const k of exclude) delete copy[k];
  return copy;
}

function parseFilter(filter = {}) {
  const where = [];
  for (const [field, value] of Object.entries(filter)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$ne' in value) where.push([field, '!=', value.$ne]);
      else if ('$nin' in value) where.push([field, 'not-in', value.$nin.slice(0, 10)]);
      else if ('$exists' in value) {
        if (value.$exists) where.push([field, '!=', null]);
      } else if ('$regex' in value) {
        /* regex filters handled client-side after fetch */
      } else if ('$gt' in value) where.push([field, '>', value.$gt]);
      else where.push([field, '==', value]);
    } else {
      where.push([field, '==', value]);
    }
  }
  return where;
}

class FirestoreQuery {
  constructor(collectionName, { filter = {}, id = null } = {}) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.id = id;
    this._sort = [];
    this._limit = null;
    this._exclude = [];
    this._includeOnly = null;
    this._timeout = 15000;
    this._regexFilters = [];
    for (const [field, value] of Object.entries(filter)) {
      if (value?.$regex) this._regexFilters.push([field, value.$regex]);
    }
  }

  sort(spec) {
    if (typeof spec === 'object') {
      for (const [field, dir] of Object.entries(spec)) {
        this._sort.push([field, dir === -1 || dir === 'desc' ? 'desc' : 'asc']);
      }
    }
    return this;
  }

  select(spec) {
    if (!spec) return this;
    const s = String(spec);
    if (typeof spec === 'object' && !Array.isArray(spec)) {
      this._includeOnly = Object.entries(spec).filter(([, v]) => v).map(([k]) => k);
      return this;
    }
    if (s.startsWith('-')) {
      this._exclude = s.split(/\s+/).map((x) => x.replace(/^-/, '')).filter(Boolean);
    } else {
      this._includeOnly = s.split(/\s+/).filter(Boolean);
    }
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  maxTimeMS(ms) {
    this._timeout = ms;
    return this;
  }

  lean() {
    return this;
  }

  async _run() {
    if (!isFirebaseConnected()) {
      if (this.id) {
        const found = localStore.findById(this.collectionName, this.id);
        const doc = applyProjection(found, { exclude: this._exclude, includeOnly: this._includeOnly });
        return doc ? [doc] : [];
      }
      let docs = localStore.find(this.collectionName, this.filter);
      if (this._sort.length && docs.length > 1) {
        const [field, dir] = this._sort[0];
        docs.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av < bv) return dir === 'desc' ? 1 : -1;
          if (av > bv) return dir === 'desc' ? -1 : 1;
          return 0;
        });
      }
      if (this._limit && docs.length > this._limit) docs = docs.slice(0, this._limit);
      return docs.map((d) => applyProjection(d, { exclude: this._exclude, includeOnly: this._includeOnly }));
    }

    if (this.id) {
      const snap = await col(this.collectionName).doc(String(this.id)).get();
      let doc = toApiDoc(snap);
      doc = applyProjection(doc, { exclude: this._exclude, includeOnly: this._includeOnly });
      return doc ? [doc] : [];
    }

    let q = col(this.collectionName);
    const where = parseFilter(this.filter);
    for (const [field, op, value] of where) {
      try {
        q = q.where(field, op, value);
      } catch {
        /* composite index may be missing — fetch all and filter client-side */
      }
    }
    for (const [field, dir] of this._sort) {
      try {
        q = q.orderBy(field, dir);
      } catch {
        /* ignore */
      }
    }
    if (this._limit) q = q.limit(this._limit);

    const snap = await q.get();
    let docs = toApiDocs(snap.docs);

    for (const [field, regex] of this._regexFilters) {
      const re = regex instanceof RegExp ? regex : new RegExp(regex, regex.flags || 'i');
      docs = docs.filter((d) => re.test(String(d[field] || '')));
    }

    if (this._sort.length && docs.length > 1) {
      const [field, dir] = this._sort[0];
      docs.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av < bv) return dir === 'desc' ? 1 : -1;
        if (av > bv) return dir === 'desc' ? -1 : 1;
        return 0;
      });
    }

    if (this._limit && docs.length > this._limit) docs = docs.slice(0, this._limit);

    return docs.map((d) => applyProjection(d, { exclude: this._exclude, includeOnly: this._includeOnly }));
  }

  then(resolve, reject) {
    return withDbQuery(() => this._run(), { fallback: [], timeoutMs: this._timeout, label: this.collectionName })
      .then((rows) => {
        if (!this._single) return resolve(rows);
        const row = rows[0] ?? null;
        return resolve(this._mutable && row ? wrapMutable(row, this.collectionName) : row);
      })
      .catch(reject);
  }
}

export function wrapMutable(doc, collectionName) {
  if (!doc) return null;
  const state = { ...doc };
  return {
    ...state,
    _id: state.id,
    set(data) {
      Object.assign(state, data);
    },
    async save() {
      const updated = await updateDoc(collectionName, state.id, state);
      Object.assign(state, updated);
      return wrapMutable(state, collectionName);
    },
  };
}

export async function bumpRealtime(resource, meta = {}) {
  if (!isFirebaseConnected()) return;
  try {
    await col(COLLECTIONS.meta).doc(META_REALTIME_DOC).set(
      { ts: FieldValue.serverTimestamp(), resource, ...meta },
      { merge: true },
    );
  } catch (e) {
    console.warn('[firestore] bumpRealtime failed:', e.message);
  }
}

export async function listAll(collectionName, opts = {}) {
  if (!isFirebaseConnected()) {
    return localStore.find(collectionName, opts.filter || {});
  }
  const q = new FirestoreQuery(collectionName, { filter: opts.filter || {} });
  if (opts.orderBy) q.sort(Object.fromEntries(opts.orderBy));
  if (opts.limit) q.limit(opts.limit);
  if (opts.select?.exclude) q._exclude = opts.select.exclude;
  return q._run();
}

export async function getById(collectionName, id) {
  if (!isFirebaseConnected()) {
    return localStore.findById(collectionName, id);
  }
  const snap = await col(collectionName).doc(String(id)).get();
  return toApiDoc(snap);
}

export async function findOne(collectionName, filter = {}) {
  if (!isFirebaseConnected()) {
    const list = localStore.find(collectionName, filter);
    return list[0] || null;
  }
  const q = new FirestoreQuery(collectionName, { filter });
  q._single = true;
  q._limit = 1;
  return q.then((r) => r);
}

export async function createDoc(collectionName, data, id) {
  if (!isFirebaseConnected()) {
    return localStore.create(collectionName, { ...data, id });
  }
  const now = FieldValue.serverTimestamp();
  const payload = { ...data, createdAt: data.createdAt || now, updatedAt: data.updatedAt || now };
  const ref = id ? col(collectionName).doc(String(id)) : col(collectionName).doc();
  await ref.set(payload);
  const snap = await ref.get();
  return toApiDoc(snap);
}

export async function updateDoc(collectionName, id, patch) {
  if (!isFirebaseConnected()) {
    return localStore.update(collectionName, id, patch);
  }
  const ref = col(collectionName).doc(String(id));
  const clean = { ...patch };
  delete clean._id;
  delete clean.id;
  await ref.update({ ...clean, updatedAt: FieldValue.serverTimestamp() });
  const snap = await ref.get();
  return toApiDoc(snap);
}

export async function deleteDoc(collectionName, id) {
  if (!isFirebaseConnected()) {
    return localStore.delete(collectionName, id);
  }
  const before = await getById(collectionName, id);
  await col(collectionName).doc(String(id)).delete();
  return before;
}

export async function countDocs(collectionName, filter = {}) {
  if (!isFirebaseConnected()) {
    return localStore.find(collectionName, filter).length;
  }
  const rows = await listAll(collectionName, { filter });
  return rows.length;
}

export function db(collectionName) {
  return {
    find(filter = {}) {
      return new FirestoreQuery(collectionName, { filter });
    },
    findOne(filter = {}) {
      const q = new FirestoreQuery(collectionName, { filter });
      q._single = true;
      q._limit = 1;
      return q;
    },
    findById(id, projection) {
      const q = new FirestoreQuery(collectionName, { id });
      if (projection) q.select(projection);
      q._single = true;
      q._mutable = true;
      return q;
    },
    async create(data) {
      const doc = await createDoc(collectionName, data);
      return wrapMutable(doc, collectionName);
    },
    findByIdAndUpdate(id, patch, opts = {}) {
      return updateDoc(collectionName, id, patch.$set || patch).then((doc) => (opts.new === false ? null : doc));
    },
    findByIdAndDelete(id) {
      return deleteDoc(collectionName, id);
    },
    findOneAndUpdate(filter, patch, opts = {}) {
      return findOne(collectionName, filter).then((one) => {
        if (!one) return null;
        return updateDoc(collectionName, one.id, patch.$set || patch);
      });
    },
    countDocuments(filter = {}) {
      return countDocs(collectionName, filter);
    },
    updateMany(filter, patch) {
      return db(collectionName).find(filter).then((rows) => {
        return Promise.all(rows.map((r) => updateDoc(collectionName, r.id, patch.$set || patch))).then((results) => ({
          modifiedCount: results.length,
        }));
      });
    },
  };
}
