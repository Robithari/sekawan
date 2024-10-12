const isiHalamanElement = document.querySelector('.isi-halaman');  // Ambil elemen dengan class "isi-halaman"
const profilContentElement = document.getElementById('profil-content');  // Ambil elemen dengan id "profil-content"

// Gabungkan konten dari kedua elemen jika keduanya ada
let textContent = '';
if (isiHalamanElement && isiHalamanElement.innerText.trim() !== '') {
  textContent += isiHalamanElement.innerText + ' ';  // Tambahkan teks dari class "isi-halaman"
}

if (profilContentElement && profilContentElement.innerText.trim() === '') {
  // Jika profil-content belum ada teksnya, kita awasi dengan MutationObserver
  const observer = new MutationObserver(() => {
    if (profilContentElement.innerText.trim() !== '') {
      textContent += profilContentElement.innerText;
      observer.disconnect();  // Setelah teks dimuat, kita hentikan pengamatan
      console.log("Teks dari profil-content telah dimuat:", profilContentElement.innerText);
    }
  });
  observer.observe(profilContentElement, { childList: true, subtree: true });
} else if (profilContentElement && profilContentElement.innerText.trim() !== '') {
  textContent += profilContentElement.innerText;  // Jika teks sudah ada, langsung tambahkan
}

// Pastikan teks diambil setelah API dimuat (jika profil-content menggunakan API)
if (textContent.trim() === '') {
  console.error("Tidak ada teks yang dapat dibacakan.");
} else {
  console.log("Teks yang akan dibacakan:", textContent);  // Tambahkan log untuk melihat teks yang akan dibacakan
}

const synth = window.speechSynthesis;  // Inisialisasi Speech Synthesis
let utterance;  // Objek untuk menyimpan ucapan
let isPaused = false;  // Status untuk mengecek apakah ucapan dalam kondisi jeda
let isStopped = true;  // Status untuk mengecek apakah ucapan dalam kondisi berhenti
let resumeIndex = 0;  // Index untuk melanjutkan ucapan yang dijeda
let wakeLock = null;  // Objek untuk menangani Wake Lock

const playBtn = document.getElementById('play-btn');  // Tombol Play
const pauseBtn = document.getElementById('pause-btn');  // Tombol Pause
const stopBtn = document.getElementById('stop-btn');  // Tombol Stop

let audioContext;  // Deklarasi audioContext di luar scope agar dapat digunakan setelah interaksi

// Fungsi untuk memeriksa apakah perangkat adalah perangkat mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Fungsi untuk meminta Wake Lock (agar layar tidak mati selama ucapan)
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock released');
    });
    console.log('Wake Lock is active');
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// Fungsi untuk melepas Wake Lock ketika tidak lagi dibutuhkan
async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// Fungsi untuk memulai ucapan
function startSpeech() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();  // Inisialisasi AudioContext setelah interaksi
  }

  if (isMobileDevice()) {
    requestWakeLock();  // Meminta Wake Lock untuk perangkat mobile
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();  // Memulihkan AudioContext jika ter-suspend
  }

  if (isPaused && !isStopped) {
    synth.resume();  // Melanjutkan ucapan yang dijeda
    isPaused = false;
  } else if (!synth.speaking || isStopped) {
    // Inisialisasi ucapan baru dari posisi yang dijeda (resumeIndex)
    utterance = new SpeechSynthesisUtterance(textContent.split(' ').slice(resumeIndex).join(' '));
    utterance.lang = 'id-ID';  // Bahasa ucapan diatur ke bahasa Indonesia

    // Menyimpan posisi terakhir kata yang diucapkan
    utterance.onboundary = function (event) {
      if (event.name === 'word') {
        resumeIndex += 1;  // Menambahkan index kata untuk melanjutkan jika dijeda
      }
    };

    // Reset ketika ucapan selesai
    utterance.onend = function () {
      isStopped = true;
      resumeIndex = 0;
      if (isMobileDevice()) {
        releaseWakeLock();  // Melepas Wake Lock saat ucapan selesai
      }
    };

    // Mulai mengucapkan teks
    synth.speak(utterance);
    isStopped = false;
    isPaused = false;
  }
}

// Fungsi untuk menjeda ucapan
function pauseSpeech() {
  if (synth.speaking && !synth.paused) {
    synth.pause();  // Menjeda ucapan
    isPaused = true;
  }
}

// Fungsi untuk menghentikan ucapan
function stopSpeech() {
  if (synth.speaking || synth.paused) {
    synth.cancel();  // Menghentikan ucapan dan membatalkan sisa teks yang belum diucapkan
    isStopped = true;
    isPaused = false;
    resumeIndex = 0;  // Reset posisi ucapan
    releaseWakeLock();  // Melepas Wake Lock saat ucapan dihentikan
  }
}

// Event listener untuk tombol Play
playBtn.addEventListener('click', () => {
  // Inisialisasi dan resume AudioContext hanya setelah tombol play diklik
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();  // Inisialisasi AudioContext
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      startSpeech();  // Memulai atau melanjutkan ucapan setelah AudioContext resume
    });
  } else {
    startSpeech();  // Memulai ucapan langsung jika AudioContext tidak suspended
  }
});

// Event listener untuk tombol Pause
pauseBtn.addEventListener('click', pauseSpeech);

// Event listener untuk tombol Stop
stopBtn.addEventListener('click', stopSpeech);

// Menghentikan ucapan jika pengguna keluar dari halaman
window.addEventListener('beforeunload', stopSpeech);

// Suspend AudioContext jika halaman tidak aktif (misalnya pengguna berpindah tab)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && audioContext) {
    audioContext.suspend();  // Suspend AudioContext saat halaman tidak terlihat
  } else if (audioContext) {
    audioContext.resume();  // Memulihkan AudioContext saat halaman aktif kembali
  }
});
