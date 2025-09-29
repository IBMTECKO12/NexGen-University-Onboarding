
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDSIni_ZcnTf6bi7vPPIn46X_48FqsXQdg",
  authDomain: "nexgen-university-001.firebaseapp.com",
  projectId: "nexgen-university-001",
  storageBucket: "nexgen-university-001.firebasestorage.app",
  messagingSenderId: "915019721663",
  appId: "1:915019721663:web:4ab2b67747d4f1498dcf0a",
  measurementId: "G-B5VHDW8NLF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Helper for social login
export const signInWithSocial = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};