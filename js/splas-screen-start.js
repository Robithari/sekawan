document.addEventListener('DOMContentLoaded', function () {
  const splashScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');

  splashScreen.style.display = 'block'; // Menampilkan splash screen saat halaman dimuat

  // Ambil URL API dari elemen data atau variabel global
  const apiUrl = window.splashScreenApiUrl || '';

  // Simpan referensi asli dari console.log
  const originalConsoleLog = console.log;

  // Modifikasi console.log untuk menyembunyikan pesan tertentu
  console.log = function (...args) {
    if (!args[0] || !args[0].includes('API Response:')) {
      originalConsoleLog.apply(console, args);
    }
  };

  // === Tambahkan Kode Pengujian di Sini ===
  console.log('Test log'); // Ini harus terlihat di konsol
  console.log('API Response: Test'); // Ini harus disembunyikan di konsol jika modifikasi berhasil
  // =====================================

  // Fungsi untuk memeriksa apakah API siap
  function checkAPIStatus() {
    if (!apiUrl) {
      console.error('API URL is not defined.');
      hideSplashScreen(); // Langsung sembunyikan splash screen jika URL API tidak ada
      return;
    }

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Log data untuk debugging
        console.log('API Response:', data); // Pesan ini akan disembunyikan

        // Validasi respons API
        if (data && Object.keys(data).length > 0) {
          hideSplashScreen();
        } else {
          setTimeout(checkAPIStatus, 2000); // Cek setiap 2 detik
        }
      })
      .catch(error => {
        console.error('API Error:', error); // Log error untuk debugging
        setTimeout(checkAPIStatus, 2000); // Cek setiap 2 detik
      });
  }

  function hideSplashScreen() {
    splashScreen.style.opacity = '0'; // Mulai transisi

    // Menunggu transisi selesai sebelum menyembunyikan splash screen dan menampilkan konten utama
    setTimeout(() => {
      splashScreen.style.display = 'none';
      mainContent.style.display = 'block';
      // Menambahkan kelas untuk animasi pada konten utama
      setTimeout(() => {
        mainContent.classList.add('show');
      }, 10); // Delay kecil untuk memastikan transisi diterapkan
    }, 500); // Durasi transisi harus sesuai dengan durasi CSS
  }

  // Mulai memeriksa status API jika URL API ada
  if (apiUrl) {
    checkAPIStatus();
  } else {
    hideSplashScreen(); // Langsung sembunyikan splash screen jika tidak ada API
  }
});
