# Firebase setup (replaces MongoDB Atlas)

This project uses **Firebase Authentication** and **Cloud Firestore** instead of MongoDB.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use an existing one)
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Create **Firestore Database** (production mode; deploy rules from `firestore.rules`)

## 2. Real-time sync (browser ↔ Firestore)

Public forms and admin CMS write directly to Firestore when the API returns 503. Dashboards use live `onSnapshot` listeners.

Deploy security rules after any change:

```bash
firebase deploy --only firestore:rules,storage
```

Student and scholarship applications upload documents to **Firebase Storage** (not inside Firestore documents). Storage rules live in `storage.rules`.

Admin writes work when signed in with a whitelisted email (`demo.admin@anmelinc.com`, `admin@anmelinc.com`, `admin@intelera.com`) or Firebase custom claim `role: admin`.

## 3. Service account (backend) — recommended for full API features

Project: **anmelwebsitpro**

1. [Firebase Console](https://console.firebase.google.com/) → **anmelwebsitpro** → Project settings → Service accounts
2. Click **Generate new private key** and save as:

   `backend/firebase-service-account.json`

   (Do not commit this file to git.)

3. `backend/.env` is already set with:

```env
FIREBASE_PROJECT_ID=anmelwebsitpro
FIREBASE_WEB_API_KEY=AIzaSyCa3YI0R2o1DzQFpucYj6xW55d-x4lqBOU
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Or set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` instead of the file path.

`FIREBASE_WEB_API_KEY` is the **Web API Key** from Project settings → General (same as frontend).

## 4. Frontend config

Project settings → General → Your apps → Web app → copy config into `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 4. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## 5. Seed demo admin & sample data

```bash
cd backend
npm run seed
```

Default admin (also created in Firebase Auth):

- Email: `demo.admin@anmelinc.com`
- Password: `DemoAdmin@123`

## 6. Run locally

```bash
npm run dev
```

Admin login uses Firebase Auth. Real-time updates use **Firestore** `meta/realtime` (and optional SSE fallback).

## Removed

- `MONGODB_URI` / `DATABASE_URL` — no longer used
- Mongoose models — replaced by Firestore collections in `backend/lib/firestoreDb.js`
