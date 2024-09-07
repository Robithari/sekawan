document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Mencegah form submit default
  
    const email = document.getElementById('emailSignup').value;
    const password = document.getElementById('passwordSignup').value;
  
    // Validasi dan proses sign-up
    if (email && password) {
      // Simulasi proses sign-up berhasil
      alert('Sign-up berhasil!');
  
      // Tampilkan notifikasi berhasil selama 3 detik
      setTimeout(function () {
        alert('Mengalihkan ke halaman login...');
        window.location.href = 'login.html'; // Redirect ke halaman login
      }, 3000);
    } else {
      alert('Isi semua field yang diperlukan!');
    }
  });
  