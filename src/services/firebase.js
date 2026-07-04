import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project config keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDYoKlThduIYxnh2X8D6dG5bSqQg31ORlI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mnova1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mnova1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mnova1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '154099531972',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:154099531972:web:4690ae37d04f1eb59e0991',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WW2BLQYE0B',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
