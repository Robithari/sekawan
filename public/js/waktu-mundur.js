// Pertandingan Terdekat Countdown Logic
(function() {
    // Parse data dari server
    const matchDateStr = "<%= matchData ? matchData.tanggal : '' %>";
    const matchTimeStr = "<%= matchData ? matchData.waktu.replace('.', ':') : '' %>";
    
    if (!matchDateStr || !matchTimeStr) {
        console.error('Data pertandingan tidak tersedia');
        return;
    }

    // Konfigurasi waktu pertandingan
    const matchDateTime = new Date(matchDateStr);
    const [hours, minutes] = matchTimeStr.split(':').map(Number);
    matchDateTime.setHours(hours, minutes, 0, 0);
    
    const matchEndTime = new Date(matchDateTime.getTime() + 90 * 60 * 1000);
    const countdownElement = document.getElementById('countdown');
    let timerInterval;

    // Fungsi utama update countdown
    function updateCountdown() {
        const now = new Date();
        
        // Handle kondisi setelah pertandingan
        if (now >= matchEndTime) {
            countdownElement.textContent = 'Pertandingan Sudah Selesai';
            clearInterval(timerInterval);
            return;
        }

        // Handle kondisi saat pertandingan berlangsung
        if (now >= matchDateTime) {
            countdownElement.textContent = 'Pertandingan Sedang Dimulai';
            return;
        }

        // Hitung waktu tersisa
        const diff = matchDateTime - now;
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        // Update tampilan
        countdownElement.textContent = 
            `${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik`;
    }

    // Inisialisasi
    try {
        updateCountdown();
        timerInterval = setInterval(updateCountdown, 1000);
    } catch (error) {
        console.error('Error dalam countdown:', error);
        countdownElement.textContent = 'Error menghitung waktu';
    }
})();