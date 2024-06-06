document.addEventListener('DOMContentLoaded', function () {
    // Cek apakah halaman sedang dimuat pertama kali atau di-refresh
    if (performance.navigation.type === 1) {
      // Halaman dimuat pertama kali, tampilkan loading screen
      document.getElementById('loading-screen').style.display = 'flex';
      setTimeout(function () {
        document.getElementById('loading-screen').style.opacity = 0;
        setTimeout(function () {
          document.getElementById('loading-screen').style.display = 'none';
        }, 500); // Waktu untuk menunggu transisi selesai (0,5 detik)
      }, 3000); // Waktu tampilan loading screen (3 detik)
    } else {
      // Halaman di-refresh, tidak perlu tampilkan loading screen
      document.getElementById('loading-screen').style.display = 'none';
    }
  });