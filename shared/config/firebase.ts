import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCN0Krt-Ob6jvSMk4E7PNeKjjP_N4RSIJY',
  authDomain: 'vibe-four-cut.firebaseapp.com',
  projectId: 'vibe-four-cut',
  storageBucket: 'vibe-four-cut.firebasestorage.app',
  messagingSenderId: '36747452338',
  appId: '1:36747452338:web:0d72035a498efc9a644eab',
  measurementId: 'G-X3TDNB8X1D',
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Analytics (only for web)
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  
  // Initialize Firebase services
  // Expo 환경에서는 getAuth만 사용하면 자동으로 적절한 persistence가 설정됩니다
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
}

export { app, analytics, auth, firestore, storage, firebaseConfig };
