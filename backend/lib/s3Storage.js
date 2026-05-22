import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

let s3Client = null;

/** True when STORAGE_DRIVER=s3 and required bucket credentials are set. */
export function isS3Enabled() {
  if (process.env.STORAGE_DRIVER?.trim().toLowerCase() !== 's3') return false;
  return Boolean(
    process.env.S3_BUCKET?.trim() &&
      process.env.S3_ACCESS_KEY_ID?.trim() &&
      process.env.S3_SECRET_ACCESS_KEY?.trim(),
  );
}

export function getS3Client() {
  if (!isS3Enabled()) return null;
  if (s3Client) return s3Client;

  const endpoint = process.env.S3_ENDPOINT?.trim() || undefined;
  const region = process.env.S3_REGION?.trim() || 'auto';

  s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID.trim(),
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY.trim(),
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  return s3Client;
}

/** S3 object key from DB path `/uploads/category/file.ext` → `uploads/category/file.ext` */
export function storagePathToKey(storagePath) {
  return storagePath.replace(/^\//, '');
}

/**
 * Public URL for an object. Prefer S3_PUBLIC_URL_BASE (R2 public bucket or custom domain),
 * then PUBLIC_BASE_URL (Cloudflare CDN in front of origin).
 */
export function objectPublicUrl(storagePath) {
  if (!storagePath) return null;
  const rel = storagePath.startsWith('/') ? storagePath : `/${storagePath}`;
  const base =
    process.env.S3_PUBLIC_URL_BASE?.trim() ||
    process.env.PUBLIC_BASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}${rel}`;
}

export async function uploadObject(key, buffer, contentType) {
  const client = getS3Client();
  if (!client) throw new Error('S3 storage is not configured');

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET.trim(),
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      CacheControl: process.env.S3_CACHE_CONTROL || 'public, max-age=604800, immutable',
    }),
  );
}

export async function verifyS3Connection() {
  if (!isS3Enabled()) return { ok: false, reason: 'not_configured' };
  try {
    const client = getS3Client();
    await client.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET.trim() }));
    return { ok: true, bucket: process.env.S3_BUCKET.trim() };
  } catch (err) {
    return { ok: false, reason: err.message || String(err) };
  }
}
