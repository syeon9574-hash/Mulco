import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5cpyFXkiT2JZg4r8rj6sPzgfDs97cC4c",
  authDomain: "mulco-6ffa0.firebaseapp.com",
  projectId: "mulco-6ffa0",
  storageBucket: "mulco-6ffa0.firebasestorage.app",
  messagingSenderId: "683668241185",
  appId: "1:683668241185:web:554dcb23b6c15c4dfddc60",
  measurementId: "G-WYEVVJNCJY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
