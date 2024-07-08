// Mendeteksi perubahan orientasi layar
window.addEventListener('orientationchange', function() {
    // Jika orientasi layar adalah landscape, kunci ke mode portrait
    if (screen.orientation.angle !== 0) {
        screen.orientation.lock('portrait');
    }
});

// Kunci orientasi saat halaman dimuat pertama kali
if (screen.orientation.angle !== 0) {
    screen.orientation.lock('portrait');
}
