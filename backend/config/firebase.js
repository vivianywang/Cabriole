import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDN2NaHsWKHo9l4wvwpbvPnCRib0SM4GUw",
  authDomain: "cabriole-1b833.firebaseapp.com",
  projectId: "cabriole-1b833",
  storageBucket: "cabriole-1b833.firebasestorage.app",
  messagingSenderId: "805155416360",
  appId: "1:805155416360:web:722e237291d8c3fe6e481d",
  measurementId: "G-VRCXCQLD0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;