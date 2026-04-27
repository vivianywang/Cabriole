import { initializeApp } from '@firebase/app';
import { getReactNativePersistence, initializeAuth } from '@firebase/auth/react-native';
import { getFirestore } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDN2NaHsWKHo9l4wvwpbvPnCRib0SM4GUw",
  authDomain: "cabriole-1b833.firebaseapp.com",
  projectId: "cabriole-1b833",
  storageBucket: "cabriole-1b833.firebasestorage.app",
  messagingSenderId: "805155416360",
  appId: "1:805155416360:web:722e237291d8c3fe6e481d",
  measurementId: "G-VRCXCQLD0H"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;