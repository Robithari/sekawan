// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js sudah di-load di index.ejs
// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-auth.js, firebase-firestore.js, dan firebase-config.js sudah di-load
const db = window.firebase.firestore();
const auth = window.firebase.auth();
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
        const adminQuery = db.collection("DataAdmin").where("email", "==", email);
        const adminSnapshot = await adminQuery.get();

        if (adminSnapshot.empty) {
            alert("Login ditolak. Anda bukan admin.");
        } else {
            // Proceed with login if the email is found in DataAdmin
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
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
        const adminCodeQuery = db.collection("adminCodes").where("code", "==", adminCode);
        const adminCodeSnapshot = await adminCodeQuery.get();

        if (adminCodeSnapshot.empty) {
            alert("Kode admin tidak valid.");
        } else {
            // Proceed with sign up if admin code is valid
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save user data to Firestore in DataAdmin collection
            await db.collection("DataAdmin").doc(user.uid).set({
                name: name,
                email: email,
                adminCode: adminCode
            });
            // JUGA simpan ke koleksi cmsUsers agar backend login CMS selalu valid
            await db.collection("cmsUsers").doc(user.uid).set({
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

// Handle Forgot Password dengan email validation
forgotPasswordLink.addEventListener("click", async () => {
    const email = prompt("Masukkan email Anda untuk reset password:");
    if (email) {
        try {
            // Check if the email is registered in Firestore
            const usersQuery = db.collection("DataAdmin").where("email", "==", email);
            const querySnapshot = await usersQuery.get();

            if (querySnapshot.empty) {
                alert("Email tidak terdaftar.");
            } else {
                // Email exists, proceed with sending the reset password email
                await auth.sendPasswordResetEmail(email);
                alert("Link reset password telah dikirim ke email Anda!");
            }
        } catch (error) {
            alert("Gagal mengirim email reset password: " + error.message);
        }
    }
});
