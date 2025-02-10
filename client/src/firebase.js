import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHnQiDlMjiBiDeTAIgXnpGNYiZn6t6_vQ",
  authDomain: "bucksdogtraining-82a35.firebaseapp.com",
  projectId: "bucksdogtraining-82a35",
  storageBucket: "bucksdogtraining-82a35.firebasestorage.app",
  messagingSenderId: "567950529931",
  appId: "1:567950529931:web:0f8f4984948383489d0b8e",
  measurementId: "G-QP7QXCV4K5"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth, app };
