import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';
import { APPLICATION_DOC_FIELDS, enrichApplicationRecord } from './applicationDocFields';

const MAX_BYTES = 15 * 1024 * 1024;

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function isDataUrl(value) {
  return typeof value === 'string' && value.trim().startsWith('data:');
}

/** Remove embedded file bytes so Firestore can store the application when Storage is offline. */
export function stripDataUrlFields(body) {
  const out = { ...body };
  for (const field of APPLICATION_DOC_FIELDS) {
    if (isDataUrl(out[field])) delete out[field];
  }
  return out;
}

/** Production default: Firestore only (Spark plan). Set VITE_USE_FIREBASE_STORAGE=true to use Storage (Blaze). */
export const USE_FIREBASE_STORAGE = import.meta.env.VITE_USE_FIREBASE_STORAGE === 'true';

/**
 * Save application to Firestore without Storage — stores form data + document file names only.
 * Firestore has a 1MB/doc limit, so PDF bytes cannot be stored inside documents.
 */
export function prepareFirestoreOnlyApplicationPayload(body, fileNames = {}) {
  const stripped = stripDataUrlFields(body);
  delete stripped.documentFileNames;

  const documentFileNames = {};
  for (const field of APPLICATION_DOC_FIELDS) {
    if (fileNames[field]) documentFileNames[field] = String(fileNames[field]);
  }

  const submittedDocFields = APPLICATION_DOC_FIELDS.filter((f) => documentFileNames[f]);

  return enrichApplicationRecord(
    {
      ...stripped,
      documentFileNames,
      documentsStorage: 'firestore',
      documentsPendingCollection: false,
    },
    { submittedDocFields },
  );
}

export function isStorageUnavailableError(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    code.startsWith('storage/') ||
    msg.includes('cors') ||
    msg.includes('err_failed') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('storage is not permitted') ||
    msg.includes('firebase storage')
  );
}

// 3 MB inline limit — covers typical scanned PDFs without needing Firebase Storage CORS
export const MAX_FIRESTORE_ATTACHMENT_BYTES = 3_000_000;

export function parseDataUrl(dataUrl) {
  const match = dataUrl.trim().match(/^data:([^;,]+)?(?:;base64)?,(.+)$/s);
  if (!match) return null;
  const mime = (match[1] || 'application/octet-stream').toLowerCase();
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { mime, bytes };
  } catch {
    return null;
  }
}

export function extensionForMime(mime) {
  if (MIME_EXT[mime]) return MIME_EXT[mime];
  const part = mime.split('/')[1];
  if (!part) return 'bin';
  return part.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'bin';
}

async function uploadDataUrl(dataUrl, storagePath) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed?.bytes?.length) {
    throw new Error('Invalid file data. Please re-upload your documents and try again.');
  }
  if (parsed.bytes.length > MAX_BYTES) {
    throw new Error('One or more files exceed the 15MB limit. Please use smaller files.');
  }
  const storageRef = ref(getFirebaseStorage(), storagePath);
  await uploadBytes(storageRef, parsed.bytes, { contentType: parsed.mime });
  return getDownloadURL(storageRef);
}

/**
 * Upload base64 application documents to Firebase Storage; store download URLs in the payload.
 * Firestore documents must stay under 1MB — never embed file bytes in Firestore.
 */
export async function persistApplicationMediaFields(body, category) {
  const submissionId = crypto.randomUUID();
  const out = { ...body };

  try {
    await Promise.all(
      APPLICATION_DOC_FIELDS.map(async (field) => {
        const value = out[field];
        if (!isDataUrl(value)) return;
        const parsed = parseDataUrl(value);
        const ext = extensionForMime(parsed?.mime || 'application/octet-stream');
        const path = `${category}/${submissionId}/${field}.${ext}`;
        out[field] = await uploadDataUrl(value, path);
      }),
    );
  } catch (err) {
    if (isStorageUnavailableError(err)) throw err;
    const code = err?.code || '';
    if (code === 'storage/unauthorized' || code === 'storage/unauthenticated') {
      throw new Error(
        'File upload is not permitted yet. Enable Firebase Storage in the Firebase Console, then deploy storage rules.',
      );
    }
    throw err;
  }

  return enrichApplicationRecord(out);
}

export function isApplicationSubmitPath(path) {
  const base = String(path || '').replace(/\?.*$/, '').replace(/\/$/, '');
  if (base === '/student-registrations') return true;
  return /^\/scholarships\/[^/]+\/applications$/.test(base);
}

export function storageCategoryForPath(path) {
  const base = String(path || '').replace(/\?.*$/, '').replace(/\/$/, '');
  if (base === '/student-registrations') return 'students';
  if (/^\/scholarships\/[^/]+\/applications$/.test(base)) return 'scholarship-applications';
  return 'applications';
}
