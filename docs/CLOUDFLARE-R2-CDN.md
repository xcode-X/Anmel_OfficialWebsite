# Cloudflare R2 + CDN setup (Anmel uploads)

This project stores uploads on **local disk** by default, or on **S3-compatible object storage** (AWS S3, **Cloudflare R2**, MinIO) when configured.

Database fields keep paths like `/uploads/scholarships/abc.webp`. The API turns those into public CDN URLs using `S3_PUBLIC_URL_BASE` or `PUBLIC_BASE_URL`.

---

## 1. Create a Cloudflare R2 bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **Create bucket**.
2. Name it e.g. `anmel-uploads`.
3. Under **Settings** → enable **Public access** *or* plan to use a **custom domain** (recommended for CDN).

### R2 API credentials

1. **R2** → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write** on your bucket.
3. Note:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (format: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

---

## 2. Backend environment variables

Add to `backend/.env`:

```env
STORAGE_DRIVER=s3
S3_BUCKET=anmel-uploads
S3_REGION=auto
S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# Public URL for uploaded files (pick ONE approach below)
```

### Option A — R2 public bucket URL (quick test)

If you enabled R2 public access, use the `r2.dev` URL:

```env
S3_PUBLIC_URL_BASE=https://pub-xxxx.r2.dev
```

### Option B — Custom domain + Cloudflare CDN (recommended)

1. R2 bucket → **Settings** → **Custom Domains** → connect e.g. `cdn.anmel.com`.
2. Cloudflare DNS will proxy traffic (orange cloud) — caching applies automatically.

```env
S3_PUBLIC_URL_BASE=https://cdn.anmel.com
PUBLIC_BASE_URL=https://cdn.anmel.com
```

### Option C — AWS S3

```env
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
# Leave S3_ENDPOINT empty for AWS
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL_BASE=https://your-bucket.s3.amazonaws.com
# Or CloudFront:
# PUBLIC_BASE_URL=https://d123.cloudfront.net
```

---

## 3. Migrate existing uploads

```bash
cd backend
npm run migrate:media
```

This will:

- Convert MongoDB **base64** fields → stored files (S3 or disk).
- Copy existing **local** `/uploads/*` files to R2 when `STORAGE_DRIVER=s3`.

---

## 4. Verify

Restart the API, then open:

```
GET http://localhost:5000/api/health
```

Example response:

```json
{
  "ok": true,
  "storage": {
    "driver": "s3",
    "s3": { "ok": true, "bucket": "anmel-uploads" },
    "publicUrlExample": "https://cdn.anmel.com/uploads/example.webp"
  }
}
```

Upload a university image in admin — the API should return paths like `/uploads/universities/...` and the browser should load `https://cdn.anmel.com/uploads/...`.

---

## 5. Production checklist

| Item | Action |
|------|--------|
| CORS | R2/custom domain must allow your site origin if loading images cross-origin |
| Cache | Cloudflare: Cache Rule for `/uploads/*` → Edge TTL 7 days |
| Secrets | Never commit `.env`; rotate R2 API tokens periodically |
| Backups | Enable R2 lifecycle or replicate bucket to second region |
| Local mirror | Optional `STORAGE_LOCAL_MIRROR=true` keeps a disk copy while using S3 |

---

## 6. Development without R2

Leave `STORAGE_DRIVER` unset (defaults to **local**). Vite proxies `/uploads` to the API — no R2 account required.

```env
PUBLIC_BASE_URL=http://localhost:5000
```
