// Import and configure the Firebase SDK
// These scripts are required to show notifications in the background
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: These credentials are standard public identifiers for your Firebase project
firebase.initializeApp({
  apiKey: "AIzaSyC5cpyFXkiT2JZg4r8rj6sPzgfDs97cC4c",
  authDomain: "mulco-6ffa0.firebaseapp.com",
  projectId: "mulco-6ffa0",
  storageBucket: "mulco-6ffa0.firebasestorage.app",
  messagingSenderId: "683668241185",
  appId: "1:683668241185:web:554dcb23b6c15c4dfddc60"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  if (payload.notification) {
    const notificationTitle = payload.notification.title || '물꼬 알림';
    const notificationOptions = {
      body: payload.notification.body || '',
      icon: '/images/app-icon.png', // Fallback icon path (PWA app icon)
      badge: '/images/app-icon.png',
      data: payload.data || {} // Optional data payload (e.g., room information)
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
