import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../firebase-config.js"; // Impor konfigurasi Firebase Anda

// Initialize Firebase Auth dan Firestore sudah diinisialisasi di firebase-config.js
const auth = getAuth();
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// Switch between login and signup forms
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const goToSignup = document.getElementById('goToSignup');
const goToLogin = document.getElementById('goToLogin');

goToSignup.addEventListener('click', () => {
    loginContainer.classList.add('d-none');
    signupContainer.classList.remove('d-none');
});

goToLogin.addEventListener('click', () => {
    signupContainer.classList.add('d-none');
    loginContainer.classList.remove('d-none');
});

// Handle Login Form with Admin Verification
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        // Check if the email is present in DataAdmin
        const adminQuery = query(collection(db, "DataAdmin"), where("email", "==", email));
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.empty) {
            alert("Login ditolak. Anda bukan admin.");
        } else {
            // Proceed with login if the email is found in DataAdmin
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Simpan token ke cookie dengan path '/' dan HttpOnly false (karena JS tidak bisa set HttpOnly)
            document.cookie = `__session=${idToken}; path=/; max-age=3600; secure; samesite=strict`;

            alert("Login sukses!");
            window.location.href = "/cms";  // Redirect to CMS after successful login
        }
    } catch (error) {
        alert("Login gagal: " + error.message);
    }
});

// Handle Sign Up Form
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const adminCode = document.getElementById("adminCode").value;

    try {
        // Check if the admin code is valid
        const adminCodeQuery = query(collection(db, "adminCodes"), where("code", "==", adminCode));
        const adminCodeSnapshot = await getDocs(adminCodeQuery);

        if (adminCodeSnapshot.empty) {
            alert("Kode admin tidak valid.");
        } else {
            // Proceed with sign up if admin code is valid
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user data to Firestore in DataAdmin collection
            await setDoc(doc(db, "DataAdmin", user.uid), {
                name: name,
                email: email,
                adminCode: adminCode
            });

            alert("Sign up sukses! Selamat datang di Sekawan FC");
            window.location.href = "/cms"; // Redirect to CMS after successful sign up
        }
    } catch (error) {
        alert("Sign up gagal: " + error.message);
    }
});

// Handle Forgot Password with email validation
forgotPasswordLink.addEventListener("click", async () => {
    const email = prompt("Masukkan email Anda untuk reset password:");
    if (email) {
        try {
            // Check if the email is registered in Firestore
            const usersQuery = query(collection(db, "DataAdmin"), where("email", "==", email));
            const querySnapshot = await getDocs(usersQuery);

            if (querySnapshot.empty) {
                alert("Email tidak terdaftar.");
            } else {
                // Email exists, proceed with sending the reset password email
                await sendPasswordResetEmail(auth, email);
                alert("Link reset password telah dikirim ke email Anda!");
            }
        } catch (error) {
            alert("Gagal mengirim email reset password: " + error.message);
        }
    }
});
