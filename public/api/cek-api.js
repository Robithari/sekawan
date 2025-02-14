document.addEventListener('DOMContentLoaded', function () {
    // Cek status autentikasi pengguna
    firebase.auth().onAuthStateChanged(function (user) {
       if (user) {
          // Tampilkan loading screen saat mengambil data dari API
          document.getElementById('loading-screen').style.display = 'block';
          document.getElementById('main-content').style.display = 'none';
 
          // Simulasi pemanggilan API atau data fetching
          fetchDataFromAPI().then(function () {
             // Setelah data selesai dimuat, tampilkan konten utama dan sembunyikan splash screen
             document.getElementById('main-content').style.display = 'block';
             document.getElementById('loading-screen').style.display = 'none';
          }).catch(function (error) {
             console.error('Error fetching data: ', error);
          });
       } else {
          // Jika belum login, arahkan ke halaman login
          window.location.href = 'login.html';
       }
    });
 
    function fetchDataFromAPI() {
       // Fungsi ini bisa berisi pemanggilan API yang Anda butuhkan
       return new Promise(function (resolve, reject) {
          // Misal kita set timeout untuk simulasi pemanggilan API
          setTimeout(function () {
             resolve(); // Panggil resolve ketika data selesai diambil
          }, 3000); // Simulasi loading data selama 3 detik
       });
    }
 });
 