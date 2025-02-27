// splas-screen-start.js

document.addEventListener('DOMContentLoaded', function () {
  const splashScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');

  splashScreen.style.display = 'block'; // Menampilkan splash screen saat halaman dimuat
  mainContent.style.display = 'none'; // Sembunyikan konten utama sementara

  // Ambil URL API dari elemen data atau variabel global
  const apiUrl = window.splashScreenApiUrl || '';

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
        console.log('API Response:', data);

        // Validasi respons API
        if (data && Object.keys(data).length > 0) {
          hideSplashScreen();
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
        if (data && Object.keys(data).length > 0) {
          // Tambahkan buffer waktu minimal untuk memastikan data siap
          setTimeout(() => {
            hideSplashScreen();
          }, 500); // Buffer dikurangi untuk mempercepat loading
        } else {
          let retryCount = 0;
          const maxRetries = 3;
          if (retryCount < maxRetries) {
            retryCount++;
            console.warn(`Data dari API belum siap, coba lagi (${retryCount}/${maxRetries})`);
            setTimeout(checkAPIStatus, 1000); // Cek setiap 1 detik dengan batasan retry
          } else {
            console.warn('API tidak merespon setelah beberapa percobaan');
            hideSplashScreen(); // Tetap tampilkan konten utama meskipun API error
          }
        }
      })
      .catch(error => {
        console.error('API Error:', error); // Log error untuk debugging
        hideSplashScreen(); // Tetap tampilkan konten utama meskipun terjadi error
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
