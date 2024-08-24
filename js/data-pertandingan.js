function fetchData() {
  const loadingMessage = document.getElementById('loading-message');
  const eventDataElement = document.getElementById('event-data');
  const teamsElement = document.getElementById('teams');
  const countdownElement = document.getElementById('countdown');

  // Tampilkan pesan loading
  loadingMessage.style.display = 'block';
  eventDataElement.style.display = 'none';
  teamsElement.style.display = 'none';
  countdownElement.style.display = 'none';

  fetch('https://script.google.com/macros/s/AKfycbwtXuhClIYxe5ayLZ6NllNrW14fmYQvM21122XQ4v3EgzWetwygr9g0ToiEgcM1wyY/exec')
    .then(response => response.json())
    .then(data => {
      loadingMessage.style.display = 'none'; // Sembunyikan pesan loading
      eventDataElement.style.display = 'block'; // Tampilkan data event
      teamsElement.style.display = 'block'; // Tampilkan nama tim
      countdownElement.style.display = 'block'; // Tampilkan hitung mundur

      // Data dari API
      const apiData = data;

      // Ambil data yang diperlukan
      const dateTime = new Date(apiData[1][2]);
      const time = apiData[1][3];
      const teams = apiData[1][0];

      // Format tanggal
      const formattedDate = new Date(dateTime).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Update elemen <p> dengan data
      eventDataElement.innerHTML =
        `<span id="date">${formattedDate}</span>. 
       <span id="time">${time} WIB</span>`;

      teamsElement.textContent = teams;

      // Atur ukuran font menggunakan JavaScript
      document.getElementById('date').style.fontSize = '9px';
      document.getElementById('time').style.fontSize = '9px';
      teamsElement.style.fontSize = '12px';

      // Fungsi untuk menghitung waktu mundur
      function updateCountdown() {
        const now = new Date();
        const [hours, minutes] = time.split('.').map(Number);
        const targetDate = new Date(dateTime);
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
    })
    .catch(error => {
      console.error('Kesalahan saat mengambil data:', error);
      loadingMessage.textContent = 'Kesalahan saat mengambil data';
      loadingMessage.style.color = 'red';
    });
}

fetchData();