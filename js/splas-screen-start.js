// splas-screen-start.js

document.addEventListener('DOMContentLoaded', function () {
  const splashScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');

  splashScreen.style.display = 'block'; // Menampilkan splash screen saat halaman dimuat
  mainContent.style.display = 'none'; // Sembunyikan konten utama sementara

  // Ambil URL API dari elemen data atau variabel global
  const apiUrl = window.splashScreenApiUrl || '';

  // **Menghapus atau Mengomentari Semua console.log**
  // Jika Anda masih ingin mengatur ulang console.log untuk tujuan tertentu, Anda dapat melakukannya di sini.
  // Namun, dalam kasus ini, kita akan menghapus semua console.log untuk mencegah pesan muncul di konsol.

  /*
  // Simpan referensi asli dari console.log (Opsional)
  const originalConsoleLog = console.log;

  // Modifikasi console.log untuk menyembunyikan pesan tertentu (Opsional)
  console.log = function (...args) {
    if (!args[0] || typeof args[0] !== 'string' || !args[0].includes('API Response:')) {
      originalConsoleLog.apply(console, args);
    }
  };
  */

  // **Menghapus Semua console.log**
  // Pastikan untuk menghapus atau mengomentari semua pernyataan console.log berikut ini.

  // Fungsi untuk memeriksa apakah API siap
  function checkAPIStatus() {
    if (!apiUrl) {
      console.error('API URL is not defined.');
      hideSplashScreen(); // Langsung sembunyikan splash screen jika URL API tidak ada
      return;
    }

    fetch(apiUrl)
      .then(response => {
        // Pastikan responsnya 200 OK
        if (!response.ok) {
          throw new Error('API response not OK');
        }
        return response.json();
      })
      .then(data => {
        // **Hapus atau Komentari Baris Ini**
        // console.log('API Response:', data); // Pesan ini akan disembunyikan jika modifikasi berhasil

        // Validasi respons API
        if (data && Object.keys(data).length > 0) {
          // Tambahkan buffer waktu 1 detik untuk memastikan data benar-benar siap
          setTimeout(() => {
            hideSplashScreen();
          }, 1500); // Buffer tambahan untuk memastikan data siap
        } else {
          console.warn('Data dari API belum siap, cek ulang dalam 2 detik');
          setTimeout(checkAPIStatus, 2000); // Cek setiap 2 detik
        }
      })
      .catch(error => {
        console.error('API Error:', error); // Log error untuk debugging
        setTimeout(checkAPIStatus, 2000); // Cek setiap 2 detik jika terjadi error
      });
  }

  function hideSplashScreen() {
    splashScreen.style.opacity = '0'; // Mulai transisi menghilangkan splash screen

    // Menunggu transisi selesai sebelum menyembunyikan splash screen dan menampilkan konten utama
    setTimeout(() => {
      splashScreen.style.display = 'none'; // Sembunyikan splash screen
      mainContent.style.display = 'block'; // Tampilkan konten utama
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
