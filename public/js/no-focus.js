// Menghapus fokus setelah tombol custom-btn atau custom-col diklik
document.querySelectorAll('.custom-btn, .custom-col').forEach(element => {
    element.addEventListener('click', function() {
        this.blur(); // Menghapus fokus setelah elemen diklik
    });
});
