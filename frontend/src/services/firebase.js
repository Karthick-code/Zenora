import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Zenora Firebase configuration is incomplete. Add the VITE_FIREBASE_* variables.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app,firebaseConfig.projectId);
export const storage = getStorage(app);

// Used only when an HR/admin creates an employee login. This keeps the currently
// signed-in administrator logged in while the new employee account is created.
export const createSecondaryAuth = () => {
  const name = 'zenora-secondary-auth';
  const secondaryApp = getApps().find((item) => item.name === name) || initializeApp(firebaseConfig, name);
  return getAuth(secondaryApp);
};

export default app;
