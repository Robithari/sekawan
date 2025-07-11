
// Firebase v8 assumed loaded in <head>
// Show/hide login/signup form logic
document.addEventListener('DOMContentLoaded', function () {
  // Firebase config is loaded from firebase-config.js if needed, but here we use global firebase
  // Show/hide form logic
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const goToSignup = document.getElementById('goToSignup');
  const goToLogin = document.getElementById('goToLogin');
  const goToLoginBtn = document.getElementById('goToLoginBtn');
  const successMessage = document.getElementById('success-message');
  const loginSuccessMessage = document.getElementById('login-success-message');
  const formTitle = document.getElementById('form-title');

  function showSignupForm() {
    if (signupForm) signupForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';
    if (formTitle) formTitle.textContent = 'Sign Up';
    if (successMessage) successMessage.style.display = 'none';
    if (loginSuccessMessage) loginSuccessMessage.style.display = 'none';
  }
  function showLoginForm() {
    if (signupForm) signupForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
    if (formTitle) formTitle.textContent = 'Login';
    if (successMessage) successMessage.style.display = 'none';
    if (loginSuccessMessage) loginSuccessMessage.style.display = 'none';
  }
  if (goToSignup) goToSignup.addEventListener('click', function (e) { e.preventDefault(); showSignupForm(); });
  if (goToLogin) goToLogin.addEventListener('click', function (e) { e.preventDefault(); showLoginForm(); });
  if (goToLoginBtn) goToLoginBtn.addEventListener('click', function (e) { e.preventDefault(); showLoginForm(); });

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value;
      var password = document.getElementById('loginPassword').value;
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (userCredential) {
          userCredential.user.getIdToken().then(function (idToken) {
            document.cookie = `__session=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
            if (loginSuccessMessage) loginSuccessMessage.style.display = 'block';
            setTimeout(function () { window.location.href = '/'; }, 1200);
          });
        })
        .catch(function (error) {
          alert('Login gagal: ' + error.message);
        });
    });
  }

  // Signup
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('signupName').value;
      var phone = document.getElementById('signupPhone').value;
      var email = document.getElementById('signupEmail').value;
      var password = document.getElementById('signupPassword').value;
      var membershipCode = document.getElementById('signupMembershipCode').value;
      // No confirmPassword field in form, so skip that check
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (userCredential) {
          var user = userCredential.user;
      // Simpan data user ke Firestore collection 'users' sesuai field yang benar
      if (firebase.firestore) {
        firebase.firestore().collection('users').doc(user.uid).set({
          name: name,
          phoneNumber: phone,
          email: email,
          membershipCode: membershipCode,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          fcmToken: '' // default kosong, bisa diupdate setelah login jika ada FCM
        });
      }
          user.getIdToken().then(function (idToken) {
            document.cookie = `__session=${idToken}; path=/; max-age=3600; secure; samesite=strict`;
            if (successMessage) successMessage.style.display = 'block';
            showLoginForm();
          });
        })
        .catch(function (error) {
          alert('Sign up gagal: ' + error.message);
        });
    });
  }
});
