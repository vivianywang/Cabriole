import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your existing Firebase API key
const firebaseConfig = {
  apiKey: "AIzaSyDN2NaHsWKHo9l4wvwpbvPnCRib0SM4GUw",
  authDomain: "your-project.firebaseapp.com", // Update this
  projectId: "your-project-id", // Update this
  storageBucket: "your-project.appspot.com", // Update this
  messagingSenderId: "123456789", // Update this
  appId: "your-app-id" // Update this
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;