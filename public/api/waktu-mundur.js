        // Fungsi untuk mengambil data dari Google Apps Script
        async function fetchData() {
            const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=Jy7cdMmNfwEFxSc3IgzYlHPQlBEeIMRdXYeYRm2LIxCRFo8mC-aVo9lCGFZ0OWI0CjBtn8r09zhobTBBH6L1OKPOv78Dwe9Mm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnB1OKDULx6nLAS16ZoChuq7MuAWqOwWaajb5omIYPwG_up3jG3UveUFaggU61UwU8sEsHBlM7tsxOclWusrXQgHacrY_wOGqBA&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV'); // Ganti dengan URL deploy script Anda
            const data = await response.json();
            return new Date(data.date);
        }

        // Fungsi untuk memperbarui hitungan mundur
        const updateCountdown = async () => {
            const weddingDate = await fetchData(); // Ambil tanggal dari Google Sheets
            const endMatchDate = new Date(weddingDate.getTime() + 1.5 * 60 * 60 * 1000);

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