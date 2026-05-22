import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  isS3Enabled,
  storagePathToKey,
  uploadObject,
  objectPublicUrl,
} from './s3Storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = path.resolve(
  process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
);

const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES) || 15 * 1024 * 1024;

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export function getStorageDriver() {
  return isS3Enabled() ? 's3' : 'local';
}

export function isRemoteUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

export function isStoredUploadPath(value) {
  return typeof value === 'string' && /^\/?uploads\//i.test(value.trim());
}

export function isDataUrl(value) {
  return typeof value === 'string' && value.trim().startsWith('data:');
}

export function getPublicBaseUrl(req) {
  const fromEnv = process.env.PUBLIC_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (req) return `${req.protocol}://${req.get('host')}`;
  return `http://localhost:${process.env.PORT || 5000}`;
}

/** Public URL for a stored path, remote URL, or legacy data URL. */
export function resolvePublicMediaUrl(req, value) {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (isRemoteUrl(v)) return v;
  if (isDataUrl(v)) return v;
  const rel = v.startsWith('/') ? v : `/${v}`;
  if (isStoredUploadPath(rel)) {
    const objectUrl = objectPublicUrl(rel);
    if (objectUrl) return objectUrl;
    if (!isS3Enabled()) {
      const cdn = process.env.PUBLIC_BASE_URL?.trim();
      if (cdn) return `${cdn.replace(/\/$/, '')}${rel}`;
      return rel;
    }
    return rel;
  }
  return v;
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.trim().match(/^data:([^;,]+)?(?:;base64)?,(.+)$/s);
  if (!match) return null;
  const mime = (match[1] || 'application/octet-stream').toLowerCase();
  try {
    const buffer = Buffer.from(match[2], 'base64');
    return { mime, buffer };
  } catch {
    return null;
  }
}

const EXT_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * Stream a stored media value as HTTP bytes (data URL, disk path, or remote redirect).
 * @returns {boolean} true if a response was sent
 */
export async function streamMediaValue(res, value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;

  if (isRemoteUrl(v)) {
    res.redirect(302, v);
    return true;
  }

  if (isDataUrl(v)) {
    const parsed = parseDataUrl(v);
    if (!parsed?.buffer?.length) return false;
    res.setHeader('Content-Type', parsed.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.send(parsed.buffer);
    return true;
  }

  if (isStoredUploadPath(v)) {
    const publicUrl = objectPublicUrl(v.startsWith('/') ? v : `/${v}`);
    if (publicUrl?.startsWith('http')) {
      res.redirect(302, publicUrl);
      return true;
    }
    const rel = v.replace(/^\//, '').replace(/^uploads\//, '');
    const diskPath = path.join(UPLOAD_ROOT, rel);
    try {
      await fs.access(diskPath);
      const ext = path.extname(diskPath).slice(1).toLowerCase();
      res.setHeader('Content-Type', EXT_MIME[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      await res.sendFile(path.resolve(diskPath));
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function extensionForMime(mime) {
  if (MIME_EXT[mime]) return MIME_EXT[mime];
  const part = mime.split('/')[1];
  if (!part) return 'bin';
  return part.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'bin';
}

async function writeLocal(category, filename, buffer) {
  const dir = path.join(UPLOAD_ROOT, category);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
}

/**
 * Persist a media field: keeps http(s) URLs, converts data URLs to stored files.
 * Returns DB path `/uploads/category/file.ext` (local disk or S3/R2).
 */
export async function persistMediaValue(value, { category, fileId }) {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (isRemoteUrl(raw)) return raw;
  if (isStoredUploadPath(raw)) return raw.startsWith('/') ? raw : `/${raw}`;
  if (!isDataUrl(raw)) return raw;

  const parsed = parseDataUrl(raw);
  if (!parsed?.buffer?.length) return '';

  if (parsed.buffer.length > MAX_BYTES) {
    const mb = Math.round(MAX_BYTES / 1024 / 1024);
    throw Object.assign(new Error(`Upload too large. Maximum size is ${mb}MB per file.`), { status: 413 });
  }

  const ext = extensionForMime(parsed.mime);
  const id = fileId || crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const storagePath = `/uploads/${category}/${filename}`;

  if (isS3Enabled()) {
    await uploadObject(storagePathToKey(storagePath), parsed.buffer, parsed.mime);
    if (process.env.STORAGE_LOCAL_MIRROR === 'true') {
      await writeLocal(category, filename, parsed.buffer);
    }
    return storagePath;
  }

  await writeLocal(category, filename, parsed.buffer);
  return storagePath;
}

export async function persistMediaFields(source, fieldNames, category) {
  const out = { ...source };
  const tasks = fieldNames.map(async (field) => {
    if (out[field] === undefined || out[field] === null || out[field] === '') return;
    out[field] = await persistMediaValue(out[field], {
      category,
      fileId: `${category}-${field}-${crypto.randomUUID()}`,
    });
  });
  await Promise.all(tasks);
  return out;
}

/** Upload an existing local file to S3 (migration helper). */
export async function mirrorLocalFileToS3(storagePath) {
  if (!isS3Enabled() || !isStoredUploadPath(storagePath)) return storagePath;
  const rel = storagePath.replace(/^\//, '');
  const diskPath = path.join(UPLOAD_ROOT, rel.replace(/^uploads\//, ''));
  try {
    const buffer = await fs.readFile(diskPath);
    const ext = path.extname(diskPath).slice(1).toLowerCase();
    const mime =
      ext === 'pdf' ? 'application/pdf'
      : ext === 'png' ? 'image/png'
      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'webp' ? 'image/webp'
      : 'application/octet-stream';
    await uploadObject(storagePathToKey(storagePath), buffer, mime);
    return storagePath;
  } catch (err) {
    if (err.code === 'ENOENT') return storagePath;
    throw err;
  }
}

export async function ensureUploadDirs() {
  if (isS3Enabled() && process.env.STORAGE_LOCAL_MIRROR !== 'true') {
    console.log(`[storage] driver=s3 bucket=${process.env.S3_BUCKET}`);
    return;
  }
  const categories = [
    'universities',
    'scholarships',
    'students',
    'agents',
    'scholarship-applications',
    'blog',
    'case-studies',
    'services',
  ];
  await Promise.all(
    categories.map((c) => fs.mkdir(path.join(UPLOAD_ROOT, c), { recursive: true })),
  );
  console.log(`[storage] driver=local path=${UPLOAD_ROOT}`);
}
