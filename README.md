# Intelera — Cybersecurity & Secure Web Engineering

Enterprise-level marketing site for **Intelera** (Monrovia, Liberia): cybersecurity and secure web engineering. Built to feel like a premium, custom enterprise site with strong UX and lead generation.

## Stack

- **Frontend:** React (Vite), Tailwind CSS v4, Framer Motion, React Router
- **Backend:** Node.js, Express.js, MongoDB, JWT, bcrypt, Helmet, rate limiting, express-validator

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, optional ADMIN_EMAIL/ADMIN_PASSWORD
npm install
npm run seed    # Create admin user (default admin@intelera.com / admin123)
npm run dev     # http://localhost:5000
```

If you see **"Failed running 'server.js'"** or **"Port 5000 is already in use"**: another process is using that port (often a previous server run). Close the other terminal, or run `netstat -ano | findstr :5000` (Windows) to find the process and stop it, or set `PORT=5001` in `backend/.env` and use that port for the API.

Ensure MongoDB is running (local or set `MONGODB_URI` in `.env`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

The client proxies `/api` to the backend when running in dev.

### Seeing your changes (important)

**Your edits will only show up if you are running the frontend dev server and opening the app from it.**

1. **Run the dev server** (from project root):
   ```bash
   npm install   # once, to install concurrently
   npm run dev   # starts both frontend and backend
   ```
   Or run frontend and backend separately:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Open the app in your browser:**  
   **http://localhost:5173**  
   Do not open `frontend/dist/index.html` or a file path — that is the built output and only updates when you run `npm run build`.

3. **If changes still don’t appear:**
   - Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac).
   - Or open DevTools (F12) → Network tab → check “Disable cache”, then refresh.
   - Restart the frontend dev server: stop it (Ctrl+C) and run `npm run dev` again from `frontend` (or `npm run dev` from root).

The Vite config uses file polling so edits are detected on Windows. If you were opening the built site or a different URL, switching to **http://localhost:5173** with the dev server running will show your changes.

### 3. Admin

- Open http://localhost:5173/control-center-9x/login
- Log in with the seed admin (e.g. `admin@intelera.com` / `admin123`)
- Manage Blog, Case Studies, Services, Contact Submissions, Users, Settings

## Project structure

```
frontend/
  src/
    components/   # layout, home sections, lead gen, auth
    context/      # Theme, Auth
    lib/          # api client
    pages/        # Home, About, Services, Case Studies, Blog, Contact, Admin*
backend/
  config/         # db
  middleware/     # auth (JWT, adminOnly, optionalAuth)
  models/        # User, BlogPost, CaseStudy, Service, ContactSubmission, NewsletterSubscriber
  routes/        # auth, blog, case-studies, services, contact, newsletter, users
  scripts/       # seed.js
```

## Design system

- **Primary:** Deep Navy `#0B1C2D`
- **Accent:** Electric Cyan `#00D4FF`
- **Typography:** Syne (display), DM Sans (body)
- **Effects:** Glassmorphism, gradients, scroll progress, Framer Motion animations

## Lead generation

- Sticky “Free Security Consultation” CTA
- Exit-intent popup (consultation CTA)
- Newsletter signup (footer + API)
- Free downloadable cybersecurity checklist (footer)

## Security

- Admin: JWT, role-based access (admin only), token expiry
- API: Helmet, CORS, rate limiting, input validation (express-validator), bcrypt for passwords

## Production deployment

### 1. Build the frontend

```bash
cd frontend
npm run build
```

### 2. Configure backend `.env`

```env
NODE_ENV=production
SERVE_FRONTEND=true
PUBLIC_BASE_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
MONGODB_URI=...
```

Optional: point `PUBLIC_BASE_URL` at a CDN origin that proxies `/uploads` to your server.

### 3. Run the API (serves site + uploads + gzip)

```powershell
cd backend
$env:NODE_ENV="production"
$env:SERVE_FRONTEND="true"
npm start
```

Uploaded images and documents are stored under `backend/uploads/` (not in MongoDB). Migrate existing base64 records once:

```bash
cd backend
npm run migrate:media
```

### Performance notes

- **Gzip/Brotli:** `compression` middleware enabled on all responses
- **Static caching:** hashed frontend assets cache 1 year; `/uploads` cache 7 days
- **Security scans:** max concurrent scans controlled by `SCAN_QUEUE_CONCURRENCY` (default 2)

### Cloudflare R2 + CDN (object storage)

For production media at scale, use S3-compatible storage instead of disk:

1. Follow **[docs/CLOUDFLARE-R2-CDN.md](docs/CLOUDFLARE-R2-CDN.md)** to create an R2 bucket and API token.
2. Set `STORAGE_DRIVER=s3` and the `S3_*` variables in `backend/.env`.
3. Set `S3_PUBLIC_URL_BASE` to your R2 public URL or custom CDN domain (e.g. `https://cdn.anmel.com`).
4. Run `npm run migrate:media` to move existing base64/local files into the bucket.

Check storage status: `GET /api/health` → `storage.driver` and `storage.s3`.

## Future scalability

Architecture is prepared for: client portal, appointment scheduling, payments, security report downloads, multi-admin roles.

## License

Proprietary — Intelera.
