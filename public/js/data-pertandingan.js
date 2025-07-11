// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js, dan firebase-config.js sudah di-load di index.ejs

// Referensi Firestore v8
const db = firebase.firestore();

// Function to fetch data from Firestore
async function fetchData() {
  const loadingMessage = document.getElementById('loading-message');
  const eventDataElement = document.getElementById('event-data');
  const teamsElement = document.getElementById('teams');
  const countdownElement = document.getElementById('countdown');

  // Display loading message
  loadingMessage.style.display = 'block';
  eventDataElement.style.display = 'none';
  teamsElement.style.display = 'none';
  countdownElement.style.display = 'none';

  try {
      // Access Firestore collection "jadwalPertandingan"
      const pertandinganSnapshot = await getDocs(collection(db, "jadwalPertandingan"));
      let matchFound = false;

      pertandinganSnapshot.forEach((docSnapshot) => {
          const pertandingan = docSnapshot.data();
          if (matchFound) return; // If a match has been found, skip further processing

          // Extract and display data from Firestore
          const { timKita, timLawan, hari, tanggal, waktu } = pertandingan;
          const matchDate = new Date(tanggal);

          // Format date for display
          const formattedDate = matchDate.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
          });

          // Display data in HTML
          eventDataElement.innerHTML = `<span id="date">${hari}, ${formattedDate}</span>. <span id="time">${waktu} WIB</span>`;
          teamsElement.innerHTML = `
              <div style="text-align: center;">
                  <div id="ourTeam" style="font-size: 12px; margin-bottom: -3px; color: purple; ">${timKita}</div>
                  <div id="vs" style="font-size: 9px; font-weight: bold; color: red;">vs</div>
                  <div id="opponentTeam" style="font-size: 12px; margin-top: -2px; color: purple;">${timLawan}</div>
              </div>
          `;

          // Set element visibility
          loadingMessage.style.display = 'none';
          eventDataElement.style.display = 'block';
          eventDataElement.style.color = 'green';
          eventDataElement.style.fontSize = '9px';
          eventDataElement.style.marginBottom = '1px';
          teamsElement.style.display = 'block';
          countdownElement.style.display = 'block';
          
          // Countdown timer function
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
          matchFound = true; // Stop loop after first match found
      });

      if (!matchFound) {
          loadingMessage.textContent = 'Tidak ada jadwal pertandingan yang tersedia';
          loadingMessage.style.color = 'red';
      }
  } catch (error) {
      console.error('Kesalahan saat mengambil data:', error);
      loadingMessage.textContent = 'Kesalahan saat mengambil data';
      loadingMessage.style.color = 'red';
  }
}

// Fetch data on page load
fetchData();
