# Firebase Hosting + Auth + Firestore

Project: **anmelwebsitpro**

| Service | URL |
|---------|-----|
| Hosting | https://anmelwebsitpro.web.app |
| Auth | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore |

## One-time setup

### 1. Service account (required for admin API)

1. [Firebase Console](https://console.firebase.google.com/project/anmelwebsitpro/settings/serviceaccounts/adminsdk) → **Generate new private key**
2. Save as `backend/firebase-service-account.json`

### 2. Seed Firestore + demo admin

```bash
cd backend
npm run seed
```

Creates Firebase Auth user: `demo.admin@anmelinc.com` / `DemoAdmin@123`

### 3. Deploy Firestore rules & indexes

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore
```

## Local development

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000  
- Uses Firestore + Auth from project **anmelwebsitpro**

## Deploy to Firebase Hosting

```bash
npm run firebase:deploy:hosting
```

Live site: **https://anmelwebsitpro.web.app**

Public pages (courses, blog, case studies, testimonials) load from **Firestore** when the API is offline.

## Admin panel

1. Open https://anmelwebsitpro.web.app/control-center-9x/login (or localhost in dev)
2. Sign in with Firebase Auth (`demo.admin@anmelinc.com` after seed)
3. Admin API writes need the **backend** running with `firebase-service-account.json`

For production admin API you can:

- Run the backend on a VPS/Render and set `VITE_API_URL=https://your-server.com/api` in `frontend/.env.production`, then rebuild and redeploy hosting, or  
- Use `npm run start:prod` on a server with `SERVE_FRONTEND=true` (Node serves both API and built frontend)

## Deploy everything

```bash
npm run firebase:deploy
```

Deploys Firestore rules + Hosting (after `npm run build`).
