import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName],
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required Firebase environment variables: ${missingEnvVars.join(
      ', ',
    )}`,
  );
  throw new Error('Firebase configuration incomplete. Check .env file.');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const projectFirestore = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

const projectAuth = getAuth(app);

setPersistence(projectAuth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export { projectFirestore, projectAuth };
