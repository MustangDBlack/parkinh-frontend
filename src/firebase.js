// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDOKM1lrQ6brpD1HkMOawBTNiY5f7eKzMo",
  authDomain: "parquiesnh.firebaseapp.com",
  projectId: "parquiesnh",
  storageBucket: "parquiesnh.firebasestorage.app",
  messagingSenderId: "363186800739",
  appId: "1:363186800739:web:aacf3105f668b9f62f1056"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializamos el servicio de mensajería (Push)
const messaging = getMessaging(app);

// Función para pedir permiso al navegador y generar el Token único
export const solicitarPermisoNotificaciones = async () => {
  try {
    console.log('Solicitando permisos de notificación...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Llave VAPID correcta insertada
      const token = await getToken(messaging, { 
        vapidKey: 'BD6CI0o8-GyVlus7G5HFU072ZeOJ6FAue41jCtJuvnF0OfWfTLisYlsMCcwgWWk8nrC4GfI1g6yvX27J41HUL_M' 
      });
      
      console.log('✅ Token del dispositivo generado:', token);
      return token;
    } else {
      console.log('❌ Permiso de notificaciones denegado por el usuario.');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener el token de FCM:', error);
    return null;
  }
};

// Exportamos las herramientas para usarlas en App.jsx
export { messaging, onMessage };