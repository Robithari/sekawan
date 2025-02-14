document.getElementById('signupForm').addEventListener('submit', function (event) {
  event.preventDefault();
  
  const email = document.getElementById('emailSignup').value;
  const password = document.getElementById('passwordSignup').value;
  const name = document.getElementById('nameSignup').value;
  const phoneNumber = document.getElementById('phoneSignup').value;

  if (email && password && name && phoneNumber) {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Update user profile with name
        updateProfile(user, {
          displayName: name
        }).then(() => {
          console.log("Nama berhasil disimpan:", user.displayName); // Verifikasi apakah nama berhasil disimpan

          // Simpan nomor telepon di Firestore
          return setDoc(doc(db, "users", user.uid), {
            phoneNumber: phoneNumber
          });
        }).then(() => {
          console.log("Nomor telepon berhasil disimpan:", phoneNumber); // Verifikasi apakah nomor telepon berhasil disimpan
          alert('Sign-up berhasil! Redirecting to login...');
          window.location.href = 'login.html';
        }).catch((error) => {
          console.error('Error updating profile:', error.message);
        });
      })
      .catch((error) => {
        console.error('Error during sign-up:', error.message);
        alert('Error: ' + error.message);
      });
  } else {
    alert('Silakan isi semua field!');
  }
});
