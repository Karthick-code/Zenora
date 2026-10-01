# Zenora — Workforce Management Platform

## Firebase Spark / no-Cloud-Functions architecture

Zenora uses only browser-safe Firebase services in this version:

```text
React + Vite (Netlify)
        |
        +-- Firebase Authentication
        +-- Cloud Firestore
        +-- Firebase Storage
        +-- Firebase Security Rules
```

There is **no Express server, Render backend, Firebase Cloud Function, or `zenoraApi`**.

## 1. Create Firebase project

Enable:

- Authentication → Email/Password
- Firestore Database
- Storage (only if you use document/asset uploads)

Add your Netlify domain to Firebase Authentication → Settings → Authorized domains.

## 2. Frontend environment

Copy `frontend/.env.example` to `frontend/.env` and set:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Do not add `VITE_FIREBASE_FUNCTIONS_REGION`: Cloud Functions are not used.

## 3. Firebase CLI is optional for development

You do **not** need Firebase CLI to run the React app locally or deploy the frontend through Netlify.

If you later want to deploy Firestore/Storage rules from your own computer, install the Firebase CLI and run:

```bash
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Company registration

Registration is now a single Firestore batch:

1. Firebase Authentication creates the owner account.
2. Firestore creates `organizations/{orgId}`.
3. Firestore creates `users/{uid}` with `ORG_OWNER`.
4. Firestore Security Rules verify the two writes belong together.

No Cloud Function is required.

## 5. Password reset

Password reset uses Firebase Authentication's browser SDK. The reset page is already implemented with `verifyPasswordResetCode` and `confirmPasswordReset`.

No EmailJS private key or Firebase Functions secret is required.

## 6. Netlify

The included `netlify.toml` uses:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Add the six `VITE_FIREBASE_*` values to Netlify environment variables.
