document.addEventListener('DOMContentLoaded', function() {
    // Menunggu data pertandingan yang dikirim dari server
    const matchData = window.matchData;  // Data pertandingan yang dikirim dari server

    const loadingMessage = document.getElementById('loading-message');
    const eventDataElement = document.getElementById('event-data');
    const teamsElement = document.getElementById('teams');
    const countdownElement = document.getElementById('countdown');

    if (matchData) {
        const { timKita, timLawan, tanggal, waktu, hari } = matchData;
        const matchDate = new Date(tanggal);

        // Format tanggal
        const formattedDate = matchDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Menampilkan data pertandingan
        eventDataElement.innerHTML = `<span id="date">${hari}, ${formattedDate}</span>. <span id="time">${waktu} WIB</span>`;
        teamsElement.innerHTML = `
            <div style="text-align: center;">
                <div id="ourTeam" style="font-size: 12px; margin-bottom: -3px; color: purple;">${timKita}</div>
                <div id="vs" style="font-size: 9px; font-weight: bold; color: red;">vs</div>
                <div id="opponentTeam" style="font-size: 12px; margin-top: -2px; color: purple;">${timLawan}</div>
            </div>
        `;

        // Fungsi countdown
        function updateCountdown() {
            const now = new Date();
            const [hours, minutes] = waktu.split('.').map(Number);
            const targetDate = new Date(matchDate);
            targetDate.setHours(hours);
            targetDate.setMinutes(minutes);
            targetDate.setSeconds(0);
            targetDate.setMilliseconds(0);

            const timeDiff = targetDate - now;
            const timeDiffEnd = targetDate.getTime() + 1.5 * 60 * 60 * 1000 - now.getTime();

            if (timeDiffEnd <= 0) {
                countdownElement.textContent = 'Pertandingan Ini Telah Selesai';
                countdownElement.style.color = 'red';
                return;
            }

            if (timeDiff <= 0 && timeDiffEnd > 0) {
                countdownElement.textContent = 'Pertandingan Sedang Dimulai';
                countdownElement.style.color = 'green';
                return;
            }

            const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000);

            let countdownText = `${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik`;

            countdownElement.textContent = countdownText;
            countdownElement.style.color = 'red';
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    } else {
        loadingMessage.textContent = 'Tidak ada jadwal pertandingan yang tersedia';
        loadingMessage.style.color = 'red';
    }
});
