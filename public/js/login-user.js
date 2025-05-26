document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const goToSignupLink = document.getElementById('goToSignup');
  const goToLoginLink = document.getElementById('goToLogin');
  const successMessage = document.getElementById('success-message');
  const loginSuccessMessage = document.getElementById('login-success-message');
  const loadingSpinner = document.getElementById('loadingSpinner');

  // Inisialisasi Firebase Auth
  let firebaseApp;
  let firebaseAuth;

  // Memuat konfigurasi Firebase dan modul auth secara dinamis
  import('/firebase-config.js')
    .then(module => {
      firebaseApp = module.app;
      return import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    })
    .then(authModule => {
      firebaseAuth = authModule.getAuth(firebaseApp);
    })
    .catch(error => {
      console.error("Error loading Firebase modules: ", error);
    });

  // Fungsi untuk menampilkan form signup dan menyembunyikan form login
  function showSignupForm() {
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    successMessage.style.display = 'none';
    loginSuccessMessage.style.display = 'none';
  }

  // Fungsi untuk menampilkan form login dan menyembunyikan form signup
  function showLoginForm() {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    successMessage.style.display = 'none';
    loginSuccessMessage.style.display = 'none';
  }

  // Fungsi untuk menampilkan loading spinner (saat ini dinonaktifkan)
  function showLoading() {
    // Untuk mengaktifkan spinner, hilangkan komentar baris di bawah:
    // loadingSpinner.style.display = 'block';
  }

  // Fungsi untuk menyembunyikan loading spinner (saat ini dinonaktifkan)
  function hideLoading() {
    // Untuk mengaktifkan spinner, hilangkan komentar baris di bawah:
    // loadingSpinner.style.display = 'none';
  }

  // Event listener untuk link Sign Up
  goToSignupLink.addEventListener('click', function (e) {
    e.preventDefault();
    showSignupForm();
  });

  // Event listener untuk link Back to Login
  goToLoginLink.addEventListener('click', function (e) {
    e.preventDefault();
    showLoginForm();
  });

  // Event listener untuk submit form signup
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const phone = document.getElementById('signupPhone').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const membershipCode = document.getElementById('signupMembershipCode').value;

    if (!name || !phone || !email || !password || !membershipCode) {
      alert('Semua field harus diisi!');
      hideLoading();
      return;
    }

    try {
      showLoading();
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          phoneNumber: phone,
          email: email,
          password: password,
          membershipCode: membershipCode,
        }),
      });

      const result = await response.json();
      hideLoading();

      if (response.ok) {
        successMessage.style.display = 'block';
        showLoginForm();
      } else {
        alert('Signup gagal: ' + result.message);
      }
    } catch (error) {
      hideLoading();
      alert('Terjadi kesalahan saat signup: ' + error.message);
    }
  });

  // Event listener untuk submit form login
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('Email dan password harus diisi!');
      hideLoading();
      return;
    }

    try {
      showLoading();

      if (!firebaseAuth) {
        alert('Firebase Auth belum siap, coba lagi sebentar.');
        hideLoading();
        return;
      }

      const { signInWithEmailAndPassword } = await import(
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
      );
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);

      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const result = await response.json();
      hideLoading();

      if (response.ok) {
        loginSuccessMessage.style.display = 'block';
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        alert('Login gagal: ' + result.message);
      }
    } catch (error) {
      hideLoading();
      alert('Login gagal: ' + error.message);
    }
  });
});
