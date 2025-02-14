// Mendeteksi perubahan orientasi layar
window.addEventListener('orientationchange', function() {
    // Jika orientasi layar adalah landscape, kembalikan ke mode portrait
    if (window.orientation === 90 || window.orientation === -90) {
        // Mengatur kembali orientasi ke portrait
        setTimeout(function() {
            if (window.orientation !== 0) {
                window.orientation = 0;
            }
        }, 0);
    }
});
