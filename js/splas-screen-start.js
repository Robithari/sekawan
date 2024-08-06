document.addEventListener('DOMContentLoaded', function () {
  const splashScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');

  splashScreen.style.display = 'block'; // Menampilkan loading screen saat halaman dimuat

  // Fungsi untuk memeriksa apakah API siap
  function checkAPIStatus() {
      fetch('https://script.googleusercontent.com/macros/echo?user_content_key=Ug4_RY3Q1GjQImtwch8hiiU37tiqDCIMi8bTKHj97_WxEAvt8cdY5oa_0Y6dp_E2w5y237mVYqBpQaI3A6pP_BXAylj9M2Ilm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFnDUwtuW5IHw5CPwpfhqpJZUQvB1wU_QDcMWPm2k5WgJ9OtqX5w07gpJuDy0PbvOMRplWdFUiYiu_oV8kxVeaRFvnZ3JX3SHg&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV')
          .then(response => response.json())
          .then(data => {
              // Log data untuk debugging jika tidak di produksi
              console.log('API Response:', data);

              // Validasi respons API
              if (Array.isArray(data) && data.length > 0) {
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
      // Menyembunyikan loading screen dengan animasi
      splashScreen.style.opacity = '0';
      
      // Menunggu transisi selesai sebelum menyembunyikan loading screen dan menampilkan konten utama
      setTimeout(() => {
          splashScreen.style.display = 'none';
          mainContent.style.display = 'block';
          // Menampilkan konten utama dengan animasi
          setTimeout(() => {
              mainContent.classList.add('show');
          }, 10); // Menambahkan delay kecil untuk memastikan transisi diterapkan
      }, 500); // Durasi transisi harus sesuai dengan durasi CSS
  }

  // Mulai memeriksa status API
  checkAPIStatus();
});
