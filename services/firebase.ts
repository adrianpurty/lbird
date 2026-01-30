
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDv3KgEHMHjIn-uT7jF69Bhic0kbvwgcCU",
  authDomain: "leadbid-22919.firebaseapp.com",
  projectId: "leadbid-22919",
  storageBucket: "leadbid-22919.firebasestorage.app",
  messagingSenderId: "14317335416",
  appId: "1:14317335416:web:6e72b262932fcfd9970e8d",
  measurementId: "G-245NG2JFZY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
