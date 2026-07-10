import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';

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

// Initialize messaging only in browser environments (SSR/Prerender safe)
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Helper to request permission and retrieve FCM device token
export const requestNotificationPermission = async (vapidKey: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('Notification permission was not granted by user.');
      return null;
    }
    
    // Fetch registration token
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (err) {
    console.warn('Failed to retrieve FCM push token:', err);
    return null;
  }
};
