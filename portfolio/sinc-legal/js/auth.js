// --- FIREBASE SDK IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCqBlHjmayoGIvlLJD58yR6phsHzLtjAH4", // Use environment variables in production
    authDomain: "sinc-c6b24.firebaseapp.com",
    projectId: "sinc-c6b24",
    storageBucket: "sinc-c6b24.appspot.com",
    messagingSenderId: "547513001470",
    appId: "1:547513001470:web:7c37b34318c0ee0709ccaf",
};

// --- FIREBASE INITIALIZATION ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- DOM ELEMENTS ---
const authTitleEl = document.getElementById('auth-title');
const loginFormEl = document.getElementById('login-form');
const signupFormEl = document.getElementById('signup-form');
const passwordResetFormEl = document.getElementById('password-reset-form');
const showLoginContainerEl = document.getElementById('show-login-container');
const showSignupContainerEl = document.getElementById('show-signup-container');
const infoMessageEl = document.getElementById('info-message');
const loginErrorEl = document.getElementById('login-error');
const signupErrorEl = document.getElementById('signup-error');
const resetErrorEl = document.getElementById('reset-error');
const loginSubmitButton = document.getElementById('login-submit-button');

// --- FRONTEND RATE LIMITER (Exponential Backoff) ---
const RateLimiter = {
    ATTEMPT_KEY: 'login_attempts',
    LOCKOUT_KEY: 'login_lockout_until',
    ATTEMPTS_BEFORE_LOCKOUT: 3,

    check: function () {
        const lockoutUntil = parseInt(localStorage.getItem(this.LOCKOUT_KEY) || '0');
        if (Date.now() < lockoutUntil) {
            const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
            const message = `Too many failed attempts. Please wait ${remainingSeconds}s.`;
            showError(loginErrorEl, message);
            this.disableLoginButton(remainingSeconds);
            return true; // Is locked
        }
        return false; // Is not locked
    },

    recordFailure: function () {
        let attempts = parseInt(localStorage.getItem(this.ATTEMPT_KEY) || '0') + 1;
        localStorage.setItem(this.ATTEMPT_KEY, attempts);

        if (attempts % this.ATTEMPTS_BEFORE_LOCKOUT === 0) {
            const lockoutRound = attempts / this.ATTEMPTS_BEFORE_LOCKOUT;
            const delaySeconds = 10 * Math.pow(2, lockoutRound - 1);
            const lockoutUntil = Date.now() + delaySeconds * 1000;
            localStorage.setItem(this.LOCKOUT_KEY, lockoutUntil);
            this.disableLoginButton(delaySeconds);
        }
    },

    recordSuccess: function () {
        localStorage.removeItem(this.ATTEMPT_KEY);
        localStorage.removeItem(this.LOCKOUT_KEY);
    },

    disableLoginButton: function (seconds) {
        loginSubmitButton.disabled = true;
        let countdown = seconds;
        loginSubmitButton.textContent = `Try again in ${countdown}s`;

        const interval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                loginSubmitButton.textContent = `Try again in ${countdown}s`;
            } else {
                clearInterval(interval);
                loginSubmitButton.disabled = false;
                loginSubmitButton.textContent = 'Sign in';
                hideMessage(loginErrorEl);
            }
        }, 1000);
    }
};

// --- AUTH STATE OBSERVER ---
onAuthStateChanged(auth, user => {
    if (user && user.emailVerified) {
        console.log("✅ Verified user logged in, redirecting to dashboard...");
        window.location.href = 'dashboard.html'; // Or your target page
    } else {
        // This case covers: No user, or a user who just signed up/failed login
        // and has been signed out. We ensure the UI is visible.
        console.log("👤 No authenticated user session active. Showing auth page.");
        document.body.style.display = 'block';
    }
});

// Hide body initially to prevent flash of unstyled content if user is logged in
document.body.style.display = 'none';

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial check for rate limit on page load
    RateLimiter.check();

    signupFormEl.addEventListener('submit', handleSignup);
    loginFormEl.addEventListener('submit', handleLogin);
    passwordResetFormEl.addEventListener('submit', handlePasswordReset);

    document.getElementById('google-signin-button').addEventListener('click', handleGoogleSignIn);
    document.getElementById('show-signup-form').addEventListener('click', () => switchAuthView('signup'));
    document.getElementById('show-login-form').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthView('login');
    });
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthView('reset');
    });

    // Password visibility toggles
    document.getElementById('toggle-login-password').addEventListener('click', () => togglePasswordVisibility('login-password', 'eye-open-login', 'eye-closed-login'));
    document.getElementById('toggle-signup-password').addEventListener('click', () => togglePasswordVisibility('signup-password', 'eye-open-signup', 'eye-closed-signup'));
});

// --- HANDLER FUNCTIONS ---
async function handleSignup(e) {
    e.preventDefault();
    const name = signupFormEl.querySelector('#signup-name').value;
    const email = signupFormEl.querySelector('#signup-email').value;
    const password = signupFormEl.querySelector('#signup-password').value;

    clearAllMessages();

    const passwordError = validatePassword(password);
    if (passwordError) {
        showError(signupErrorEl, passwordError);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);
        await setDoc(doc(db, "users", user.uid), { name, email, createdAt: new Date() });

        // Critical step: Sign out to force email verification before first login
        await signOut(auth);

        // 1. First-time signup: Switch to login and show verification message
        switchAuthView('login');
        showInfo("Please check your email and click the verification link to activate your account. Don't forget to check your spam folder.");

    } catch (error) {
        // 2. Email already exists
        showError(signupErrorEl, mapFirebaseErrorToMessage(error));
    }
}

async function handleLogin(e) {
    e.preventDefault();
    clearAllMessages();

    if (RateLimiter.check()) {
        return;
    }

    const email = loginFormEl.querySelector('#login-email').value;
    const password = loginFormEl.querySelector('#login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            // 3. Email verification (on login attempt)
            await sendEmailVerification(user);
            await signOut(auth);
            showInfo("Your email hasn't been verified yet. A new verification email has been sent. Please check your email (and spam folder) and click the link to verify your account.");
            return;
        }

        // On successful login, reset the rate limiter
        RateLimiter.recordSuccess();
        // The onAuthStateChanged observer will handle the successful redirect.

    } catch (error) {
        // 2. Incorrect email or password
        RateLimiter.recordFailure(); // Record the failed attempt
        showError(loginErrorEl, mapFirebaseErrorToMessage(error));
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();
    clearAllMessages();
    const email = passwordResetFormEl.querySelector('#reset-email').value;

    try {
        await sendPasswordResetEmail(auth, email);
        // 1 & 2. Existing and Non-existent email
        switchAuthView('login'); // Switch back to login for better UX
        showInfo("If this email is associated with an account, a password reset link will be sent. Please check your email (and spam folder).");
    } catch (error) {
        // This usually only catches `auth/invalid-email`
        showError(resetErrorEl, mapFirebaseErrorToMessage(error));
    }
}

async function handleGoogleSignIn() {
    clearAllMessages();
    try {
        await signInWithPopup(auth, googleProvider);
        // The onAuthStateChanged will handle the successful redirect.
        // Google-verified emails are considered trusted, so no extra check is needed.
    } catch (error) {
        showError(loginErrorEl, mapFirebaseErrorToMessage(error));
    }
}

// --- HELPER FUNCTIONS ---

function mapFirebaseErrorToMessage(error) {
    console.error("Firebase Auth Error:", error.code, error.message);
    switch (error.code) {
        case 'auth/email-already-in-use':
            return "This email is already registered. Please sign in or use 'Forgot your password?'.";
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return "Incorrect email or password. Please try again.";
        case 'auth/weak-password':
            return 'The password is too weak. Please choose a stronger one.';
        case 'auth/user-disabled':
            return "Your account has been suspended. Please contact support for assistance.";
        default:
            return 'An unexpected error occurred. Please try again later.';
    }
}

/**
* Validates a password against defined security rules.
* 
* Returns:
*  - A string with the validation error message if invalid
*  - null if the password passes all checks
*/
function validatePassword(password) {

    // Ensure password meets minimum length requirement
    // NOTE: 6 characters is relatively weak for production systems.
    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }

    // Prevent extremely long input (basic input hardening)
    // Helps avoid potential abuse or unnecessary processing.
    if (password.length > 128) {
        return "Password too long.";
    }

    // Require at least one uppercase letter (A–Z)
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    // Require at least one lowercase letter (a–z)
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }

    /*
     * OLD APPROACH (Explicit Special Character Whitelist)
     * ----------------------------------------------------
     * This limits users to only specific special characters.
     * It may unintentionally block valid symbols like _ - + = etc.
     *
     * if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
     *     return "Password must contain at least one special character.";
     * }
     */

    /*
     * IMPROVED APPROACH
     * -----------------
     * This regex checks for ANY non-alphanumeric, non-whitespace character.
     * Meaning: if it's not a letter, digit, or space → it's considered special.
     *
     * More flexible and future-proof than maintaining a whitelist.
     */
    if (!/[^\w\s]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    // If all checks pass, return null (indicates valid password)
    return null;
}

function togglePasswordVisibility(inputId, openEyeId, closedEyeId) {
    const passwordInput = document.getElementById(inputId);
    const eyeOpen = document.getElementById(openEyeId);
    const eyeClosed = document.getElementById(closedEyeId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
    } else {
        passwordInput.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
    }
}

function switchAuthView(view) {
    clearAllMessages();
    loginFormEl.classList.add('hidden');
    signupFormEl.classList.add('hidden');
    passwordResetFormEl.classList.add('hidden');

    switch (view) {
        case 'signup':
            signupFormEl.classList.remove('hidden');
            authTitleEl.textContent = "Create an Account";
            showLoginContainerEl.classList.remove('hidden');
            showSignupContainerEl.classList.add('hidden');
            break;
        case 'reset':
            passwordResetFormEl.classList.remove('hidden');
            authTitleEl.textContent = "Reset Your Password";
            showLoginContainerEl.classList.remove('hidden');
            showSignupContainerEl.classList.add('hidden');
            break;
        default: // 'login'
            loginFormEl.classList.remove('hidden');
            authTitleEl.textContent = "Sign in to Your Account";
            showLoginContainerEl.classList.add('hidden');
            showSignupContainerEl.classList.remove('hidden');
            break;
    }
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

function showInfo(message) {
    infoMessageEl.textContent = message;
    infoMessageEl.classList.remove('hidden');
}

function hideMessage(element) {
    if (element) {
        element.textContent = '';
        element.classList.add('hidden');
    }
}

function clearAllMessages() {
    hideMessage(infoMessageEl);
    hideMessage(loginErrorEl);
    hideMessage(signupErrorEl);
    hideMessage(resetErrorEl);
}