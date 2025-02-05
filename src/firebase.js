import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCEUO3Ohj1xgMWtJcTB81Vi1hUYX1QQoiw",
  authDomain: "o-mago-da-ponte.firebaseapp.com",
  projectId: "o-mago-da-ponte",
  storageBucket: "o-mago-da-ponte.firebasestorage.app",
  messagingSenderId: "54491763224",
  appId: "1:54491763224:web:6de246f38b940a2f4ba96d",
  measurementId: "G-CHEH81DMCG"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços que vamos usar
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }; 