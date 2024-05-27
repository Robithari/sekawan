// Tetapkan tanggal pernikahan
const weddingDate = new Date("2024-05-29T14:20:00");
const endMatchDate = new Date(weddingDate.getTime() + 1.5 * 60 * 60 * 1000);

// Perbarui hitungan mundur setiap detik
const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = weddingDate - now;
    const endDistance = endMatchDate - now;

    if (distance > 0) {
        // Jika waktu sekarang sebelum tanggal pernikahan
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let countdownText = '';
        if (days > 0) countdownText += `${days} hari `;
        if (days > 0 || hours > 0) countdownText += `${hours} jam `;
        countdownText += `${minutes} menit ${seconds} detik`;

        document.getElementById("countdown").innerHTML = countdownText;
    } else if (distance <= 0 && endDistance > 0) {
        // Jika waktu sekarang setelah tanggal pernikahan tetapi belum mencapai 1,5 jam
        document.getElementById("countdown").innerHTML = "Pertandingan sedang dimulai";
    } else if (endDistance <= 0) {
        // Jika sudah lebih dari 1,5 jam setelah tanggal pernikahan
        document.getElementById("countdown").innerHTML = "Pertandingan sudah berakhir";
        clearInterval(updateInterval);
    }
};

// Panggilan awal untuk memperbarui hitungan mundur
updateCountdown();

// Perbarui hitungan mundur setiap detik
const updateInterval = setInterval(updateCountdown, 1000);
