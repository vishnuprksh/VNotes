import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "vnotes-app-20260426",
  appId: "1:432875162603:web:f24a8ba25110f37e1d27ae",
  storageBucket: "vnotes-app-20260426.firebasestorage.app",
  apiKey: "AIzaSyDNZdq0IUMN4VSd-WDMOKBa_sRa9XBumag",
  authDomain: "vnotes-app-20260426.firebaseapp.com",
  messagingSenderId: "432875162603"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
