// splas-screen-start.js

document.addEventListener("DOMContentLoaded", function () {
  const splashScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");

  // Pastikan splash screen ditampilkan saat pertama kali dimuat
  splashScreen.style.display = "block";
  mainContent.style.display = "none";

  // Menunggu halaman sepenuhnya dimuat sebelum menghilangkan splash screen
  window.onload = function () {
    setTimeout(() => {
      hideSplashScreen();
    }, 1500); // Buffer waktu tambahan agar halaman benar-benar siap
  };

  function hideSplashScreen() {
    splashScreen.style.opacity = "0"; // Tambahkan efek transisi untuk smooth effect
    setTimeout(() => {
      splashScreen.style.display = "none";
      mainContent.style.display = "block";

      // Animasi smooth saat konten muncul
      setTimeout(() => {
        mainContent.classList.add("show");
      }, 10);
    }, 500); // Sesuaikan dengan durasi transisi CSS
  }
});
