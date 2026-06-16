// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "intervuai-df7c2.firebaseapp.com",
  projectId: "intervuai-df7c2",
  storageBucket: "intervuai-df7c2.firebasestorage.app",
  messagingSenderId: "1088823560989",
  appId: "1:1088823560989:web:f0f69243e5a0e9ac3b6ff4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export { auth, provider };