document.addEventListener('DOMContentLoaded', function () {
  // Cek apakah ini adalah kunjungan pertama ke halaman
  var isFirstVisit = !sessionStorage.getItem('visited');

  if (isFirstVisit) {
    // Kunjungan pertama, tampilkan loading screen
    document.getElementById('loading-screen').style.display = 'flex';
    
    // Tandai bahwa halaman telah dikunjungi
    sessionStorage.setItem('visited', 'true');

    // Setelah semua konten dimuat, mulai transisi loading screen
    window.addEventListener('load', function () {
      setTimeout(function () {
        document.getElementById('loading-screen').style.opacity = 0;
        setTimeout(function () {
          document.getElementById('loading-screen').style.display = 'none';
        }, 2000); // Waktu untuk menunggu transisi selesai (0.9 detik, sesuai dengan CSS)
      }, 2700); // Waktu tampilan loading screen setelah semua konten dimuat
    });
  } else {
    // Bukan kunjungan pertama (refresh atau navigasi kembali), sembunyikan loading screen
    document.getElementById('loading-screen').style.display = 'none';
  }
});