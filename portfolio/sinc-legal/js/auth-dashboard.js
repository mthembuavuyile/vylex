import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { setCurrentUserId } from './state.js';
import { updateUserInfoUI } from './profile.js';
import { DOMElements } from './dom.js';

let initDashboardCallback = null;
let logoutCallback = null;

export function setInitDashboardCallback(cb) {
    initDashboardCallback = cb;
}

export function setLogoutCallback(cb) {
    logoutCallback = cb;
}

export function initAuthListener() {
    onAuthStateChanged(auth, user => {
        if (user) {
            handleUserAuthenticated(user);
        } else {
            window.location.href = 'index.html';
        }
    });
}

async function handleUserAuthenticated(user) {
    setCurrentUserId(user.uid);
    document.body.style.display = '';
  
    const userDocRef = doc(db, "users", user.uid);
    const userProfile = {
        email: user.email,
        lastLogin: Timestamp.fromDate(new Date()),
        ...(user.displayName && { name: user.displayName }),
        ...(user.photoURL && { photoURL: user.photoURL })
    };
    await setDoc(userDocRef, userProfile, { merge: true });
  
    const finalProfileSnap = await getDoc(userDocRef);
    const finalProfile = finalProfileSnap.data() || {};
  
    updateUserInfoUI(finalProfile.name || 'New User', user.email, finalProfile.photoURL);
  
    if (finalProfile.defaultHourlyRate && DOMElements.defaultHourlyRate) {
        DOMElements.defaultHourlyRate.value = finalProfile.defaultHourlyRate;
    }
  
    if (initDashboardCallback) {
        initDashboardCallback(user.uid);
    }
}

export function handleLogout() {
    if (logoutCallback) logoutCallback();
    signOut(auth).catch(error => console.error("Logout Error:", error));
}
