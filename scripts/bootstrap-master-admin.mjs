import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const ask = async (rl, label, fallback = '') => {
  const value = (await rl.question(`${label}${fallback ? ` [${fallback}]` : ''}: `)).trim();
  return value || fallback;
};

const askSecret = async (rl, label) => {
  // readline cannot mask input portably; this is intentionally local-only.
  return (await rl.question(`${label}: `)).trim();
};

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error('\nMissing GOOGLE_APPLICATION_CREDENTIALS.');
  console.error('Download a Firebase service-account JSON from Firebase Console → Project settings → Service accounts,');
  console.error('save it somewhere outside the frontend, then set GOOGLE_APPLICATION_CREDENTIALS to that file.');
  process.exit(1);
}

const absoluteKeyPath = path.resolve(keyPath);
if (!fs.existsSync(absoluteKeyPath)) {
  console.error(`Service-account file not found: ${absoluteKeyPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(absoluteKeyPath, 'utf8'));
const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount) });
const adminAuth = getAuth(app);
const db = getFirestore(app);
const rl = readline.createInterface({ input, output });

try {
  console.log('\nZENORA — First Master Admin Bootstrap');
  console.log('This runs locally. It does NOT deploy a Cloud Function and does NOT require Blaze.\n');

  const email = (await ask(rl, 'Master admin email')).toLowerCase();
  const password = await askSecret(rl, 'Master admin password');
  const firstName = await ask(rl, 'First name', 'Zenora');
  const lastName = await ask(rl, 'Last name', 'Master Admin');

  if (!email || !email.includes('@')) throw new Error('A valid email is required.');
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');

  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(email);
    console.log(`Existing Firebase Auth user found: ${userRecord.uid}`);
    userRecord = await adminAuth.updateUser(userRecord.uid, { password, displayName: `${firstName} ${lastName}`.trim(), disabled: false });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    userRecord = await adminAuth.createUser({ email, password, displayName: `${firstName} ${lastName}`.trim(), disabled: false });
    console.log(`Created Firebase Auth user: ${userRecord.uid}`);
  }

  const timestamp = new Date().toISOString();
  await db.collection('users').doc(userRecord.uid).set({
    email,
    role: 'PLATFORM_OWNER',
    organization_id: null,
    first_name: firstName,
    last_name: lastName,
    is_active: true,
    bootstrap_source: 'local-admin-script',
    created_at: timestamp,
    updated_at: timestamp,
  }, { merge: true });

  console.log('\nMaster admin bootstrap completed.');
  console.log(`Email: ${email}`);
  console.log(`UID: ${userRecord.uid}`);
  console.log('Role: PLATFORM_OWNER');
  console.log('Login URL: /master-admin');
  console.log('\nSecurity: delete the service-account JSON from your computer when you no longer need it. Never put it in frontend/, .env, Git, or Netlify.');
} finally {
  rl.close();
}
