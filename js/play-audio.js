document.addEventListener('DOMContentLoaded', function() {
  const isiHalamanElement = document.querySelector('.isi-halaman');  // Ambil elemen dengan class "isi-halaman"
  const profilContentElement = document.getElementById('profil-content');  // Ambil elemen dengan id "profil-content"

  /**
   * Fungsi untuk membersihkan teks dari tag HTML, entitas, dan simbol lainnya.
   * @param {string} text - Teks yang mungkin mengandung tag HTML atau simbol.
   * @returns {string} - Teks yang telah dibersihkan.
   */
  function cleanText(text) {
    // 1. Dekode entitas HTML
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;

    // 2. Hapus tag HTML dan kontennya jika ada (misalnya, <p>makan</p> menjadi makan)
    text = text.replace(/<[^>]*>/g, '');

    // 3. Hapus simbol atau karakter khusus yang tidak diinginkan
    //    Misalnya, menghapus karakter selain huruf, angka, spasi, dan tanda baca dasar
    text = text.replace(/[^\w\s.,!?'"-]/g, '');

    // 4. Menghapus spasi berlebih
    return text.replace(/\s+/g, ' ').trim();
  }

  // Gabungkan konten dari kedua elemen jika keduanya ada
  let textContent = '';
  if (isiHalamanElement && isiHalamanElement.textContent.trim() !== '') {
    textContent += cleanText(isiHalamanElement.textContent) + ' ';  // Tambahkan teks bersih dari class "isi-halaman"
  }

  if (profilContentElement && profilContentElement.textContent.trim() === '') {
    // Jika profil-content belum ada teksnya, kita awasi dengan MutationObserver
    const observer = new MutationObserver(() => {
      if (profilContentElement.textContent.trim() !== '') {
        textContent += cleanText(profilContentElement.textContent);
        observer.disconnect();  // Setelah teks dimuat, kita hentikan pengamatan
        console.log("Teks dari profil-content telah dimuat:", textContent);
      }
    });
    observer.observe(profilContentElement, { childList: true, subtree: true });
  } else if (profilContentElement && profilContentElement.textContent.trim() !== '') {
    textContent += cleanText(profilContentElement.textContent);  // Jika teks sudah ada, langsung tambahkan
  }

  // Pastikan teks diambil setelah API dimuat (jika profil-content menggunakan API)
  const checkTextContent = () => {
    if (textContent.trim() === '') {
      console.error("Tidak ada teks yang dapat dibacakan.");
    } else {
      console.log("Teks yang akan dibacakan:", textContent);  // Log untuk melihat teks yang akan dibacakan
    }
  };

  // Tambahkan delay untuk memastikan observer selesai bekerja sebelum memeriksa textContent
  setTimeout(checkTextContent, 1000);

  const synth = window.speechSynthesis;  // Inisialisasi Speech Synthesis
  let utterance;  // Objek untuk menyimpan ucapan
  let isPaused = false;  // Status untuk mengecek apakah ucapan dalam kondisi jeda
  let isStopped = true;  // Status untuk mengecek apakah ucapan dalam kondisi berhenti
  let resumeIndex = 0;  // Index untuk melanjutkan ucapan yang dijeda

  const playBtn = document.getElementById('play-btn');  // Tombol Play
  const pauseBtn = document.getElementById('pause-btn');  // Tombol Pause
  const stopBtn = document.getElementById('stop-btn');  // Tombol Stop

  let voices = [];

  // Fungsi untuk memeriksa apakah perangkat adalah perangkat mobile
  function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  // Fungsi untuk memastikan Speech Synthesis bekerja di perangkat mobile
  document.addEventListener('click', () => {
    if (isMobileDevice() && synth && synth.paused && !synth.speaking) {
      synth.resume();
    }
  }, { once: true });

  /**
   * Fungsi untuk memulai atau melanjutkan ucapan.
   */
  function startSpeech() {
    if (isPaused && !isStopped) {
      synth.resume();  // Melanjutkan ucapan yang dijeda
      isPaused = false;
    } else if (!synth.speaking || isStopped) {
      // Pastikan textContent sudah dibersihkan sebelum diucapkan
      const cleanSpeechText = textContent.split(' ').slice(resumeIndex).join(' ');
      if (cleanSpeechText.trim() === '') {
        console.error("Tidak ada teks yang dapat dibacakan setelah pembersihan.");
        return;
      }

      utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      utterance.lang = 'id-ID';  // Bahasa ucapan diatur ke bahasa Indonesia

      // Menentukan voice secara eksplisit
      const idIDVoice = voices.find(voice => voice.lang === 'id-ID');
      if (idIDVoice) {
        utterance.voice = idIDVoice;
      } else {
        console.warn("Voice 'id-ID' tidak tersedia. Menggunakan voice default.");
      }

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
        console.log("Ucapan selesai.");
      };

      // Mulai mengucapkan teks
      synth.speak(utterance);
      isStopped = false;
      isPaused = false;
    }
  }

  /**
   * Fungsi untuk menjeda ucapan.
   */
  function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
      synth.pause();  // Menjeda ucapan
      isPaused = true;
    }
  }

  /**
   * Fungsi untuk menghentikan ucapan.
   */
  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();  // Menghentikan ucapan dan membatalkan sisa teks yang belum diucapkan
      isStopped = true;
      isPaused = false;
      resumeIndex = 0;  // Reset posisi ucapan
      console.log("Ucapan dihentikan.");
    }
  }

  // Event listener untuk tombol Play
  playBtn.addEventListener('click', () => {
    startSpeech();  // Mulai atau melanjutkan ucapan setelah interaksi pengguna
  });

  // Event listener untuk tombol Pause
  pauseBtn.addEventListener('click', pauseSpeech);

  // Event listener untuk tombol Stop
  stopBtn.addEventListener('click', stopSpeech);

  // Menghentikan ucapan jika pengguna keluar dari halaman
  window.addEventListener('beforeunload', stopSpeech);

  // Event untuk memuat voices setelah tersedia
  synth.onvoiceschanged = () => {
    voices = synth.getVoices();
    console.log("Daftar suara:", voices);
  };

  /**
   * Contoh penambahan konten dinamis setelah 3 detik
   * Anda dapat menghapus atau menyesuaikan bagian ini sesuai kebutuhan
   */
  setTimeout(() => {
    const profilContent = document.getElementById('profil-content');
    profilContent.innerHTML = '<p><em>Profil pengguna telah dimuat secara dinamis!</em></p>';
    console.log("Konten dinamis ditambahkan ke profil-content.");
  }, 3000);
});