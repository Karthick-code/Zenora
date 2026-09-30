# Zenora — Workforce Management Platform

## Firebase-first deployment

Zenora no longer uses the Render/Express/SQLite backend. The architecture is:

```text
React + Vite (Netlify)
        |
        +-- Firebase Authentication
        +-- Cloud Firestore
        +-- Firebase Storage
        +-- Firebase Cloud Functions
                 |
                 +-- EmailJS REST API (password-reset email)
                 +-- Slack Incoming Webhook (notifications)
```

There is **no Render backend** in this version.

## 1. Create Firebase project

Enable:

- Authentication → Email/Password
- Firestore Database
- Storage
- Cloud Functions

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
VITE_FIREBASE_FUNCTIONS_REGION=asia-south1
```

## 3. Firebase project selection

Copy `.firebaserc.example` to `.firebaserc` and replace the project ID.

Install Firebase CLI if needed, then from the project root:

```bash
firebase login
firebase use YOUR_PROJECT_ID
```

Install dependencies:

```bash
cd frontend && npm install
cd ../functions && npm install
```

## 4. EmailJS password reset

Create an EmailJS email service and template. The template receives:

```text
to_email
to_name
reset_link
company_name
expires_minutes
```

Create Firebase Functions secrets:

```bash
firebase functions:secrets:set EMAILJS_SERVICE_ID
firebase functions:secrets:set EMAILJS_TEMPLATE_ID
firebase functions:secrets:set EMAILJS_PUBLIC_KEY
firebase functions:secrets:set EMAILJS_PRIVATE_KEY
firebase functions:secrets:set APP_BASE_URL
firebase functions:secrets:set SLACK_WEBHOOK_URL
```

`APP_BASE_URL` must be the deployed Netlify URL, for example:

```text
https://your-zenora-app.netlify.app
```

The browser never receives the EmailJS private key or Slack webhook URL.

## 5. Slack notifications

Create a Slack Incoming Webhook and store its URL only as the Firebase secret `SLACK_WEBHOOK_URL`.

The Firebase function can notify Slack for:

- New company registration
- Employee registration
- Password-reset requests
- Leave requests
- Company helpdesk tickets

## 6. Deploy Firebase

From the project root:

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Deploy Storage rules when Storage is enabled:

```bash
firebase deploy --only storage
```

## 7. Deploy React to Netlify

Build:

```bash
cd frontend
npm install
npm run build
```

Netlify settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

The included `netlify.toml` configures the Vite build and SPA fallback.

Add the same `VITE_FIREBASE_*` variables to Netlify → Site configuration → Environment variables.

## Authentication model

### Company users

- ORG_OWNER
- HR_ADMIN
- PAYROLL_ADMIN
- MANAGER
- EMPLOYEE

All company records are tenant-scoped by `organization_id`.

### Platform admin

`PLATFORM_OWNER` is intentionally isolated from company workforce data. The platform admin can access:

- Platform dashboard
- Registered companies
- Company helpdesk
- Password-reset request monitoring
- Platform settings

The platform admin cannot access company employee directories, employee profiles, payroll, attendance, leave, biometric logs, or other workforce records.

## Employee login

Employees can sign in using either:

- Registered email address
- Employee ID + company workspace/slug

Employee IDs are unique only within a company.

Therefore this is valid:

```text
Company A → Employee ID 123
Company B → Employee ID 123
```

Firebase Auth emails remain globally unique because Firebase Authentication identifies accounts by email/UID. The employee ID itself remains tenant-scoped in Firestore.

## Forgot password

The flow is:

```text
Employee
  ↓
Forgot password
  ↓
Firebase Cloud Function
  ↓
Firebase Admin generates secure reset code
  ↓
EmailJS sends the reset link
  ↓
Netlify reset-password page
  ↓
Firebase Auth confirmPasswordReset()
```

Reset links are single-use Firebase Auth reset codes. EmailJS is only the delivery mechanism; password credentials are never sent through Slack or stored in Firestore.

## Existing data migration

The old SQLite database is intentionally not used by the Firebase runtime. Existing records should be migrated into Firestore with a controlled migration script after the Firebase project is created. Do not upload production passwords or credential material into Firestore.
