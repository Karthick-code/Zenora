# Zenora Master Admin Bootstrap

This is a one-time local bootstrap utility. It uses the Firebase Admin SDK locally to create/update the first Zenora platform owner. It does **not** deploy a Cloud Function and does **not** require the Firebase Blaze plan.

## 1. Get a service-account JSON

Firebase Console → Project settings → Service accounts → Firebase Admin SDK → Generate new private key.

Save the JSON outside the frontend and never commit it.

## 2. Install dependencies

From this directory:

```bash
npm install
```

## 3. Set the credential path

Windows PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account.json"
```

Windows CMD:

```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account.json
```

macOS/Linux:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"
```

## 4. Run the bootstrap

```bash
npm run bootstrap
```

It creates/updates:

- Firebase Authentication account
- `users/{uid}` Firestore profile
- `role: PLATFORM_OWNER`
- `organization_id: null`

Then use `/master-admin` in the Zenora frontend.

## 5. Remove the credential

After the bootstrap succeeds, delete the service-account JSON or store it securely offline. Never put it in `frontend/`, Netlify environment variables, Git, or the deployed site.
