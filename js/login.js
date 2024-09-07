document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Mencegah form submit default
  
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;
  
    // Validasi dan proses login
    if (email && password) {
      // Proses login dengan API atau database
      alert('Login berhasil!');
      window.location.href = 'dashboard.html'; // Redirect ke halaman dashboard atau tujuan
    } else {
      alert('Email atau password salah!');
    }
  });
  