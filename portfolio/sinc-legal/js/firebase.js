import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// --- FIREBASE CONFIG & INITIALIZATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCqBlHjmayoGIvlLJD58yR6phsHzLtjAH4",
    authDomain: "sinc-c6b24.firebaseapp.com",
    projectId: "sinc-c6b24",
    storageBucket: "sinc-c6b24.appspot.com",
    appId: "1:547513001470:web:7c37b34318c0ee0709ccaf"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);