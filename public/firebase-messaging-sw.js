// public/firebase-messaging-sw.js

// Importamos los scripts de Firebase para el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuración REAL de tu proyecto parquiesnh
const firebaseConfig = {
  apiKey: "AIzaSyDOKM1lrQ6brpD1HkMOawBTNiY5f7eKzMo",
  authDomain: "parquiesnh.firebaseapp.com",
  projectId: "parquiesnh",
  storageBucket: "parquiesnh.firebasestorage.app",
  messagingSenderId: "363186800739",
  appId: "1:363186800739:web:aacf3105f668b9f62f1056"
};

// Inicializamos Firebase en segundo plano
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Escuchamos mensajes cuando la app está en segundo plano (cerrada o minimizada)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Pon aquí el logo de NH o BLACKKODE que tengas en public/
    badge: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});