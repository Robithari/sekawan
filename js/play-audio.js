document.addEventListener('DOMContentLoaded', function() {
  const articlesElement = document.getElementById('articles');  // Ambil elemen dengan id "articles"
  const profilContentElement = document.getElementById('profil-content');  // Ambil elemen dengan id "profil-content"

  // Fungsi untuk menghapus semua tag HTML dari teks
  function sanitizeText(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, ""); // Menghapus semua tag HTML
  }

  // Fungsi untuk mendapatkan teks terstruktur dengan jeda setelah elemen blok
  function getStructuredText(element) {
    let text = '';
    element.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        // Daftar tag blok yang ingin kita tambahkan jeda setelahnya
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'div', 'section'].includes(tag)) {
          // Tambahkan teks dari elemen dan akhiri dengan tiga titik untuk jeda
          text += node.textContent.trim() + '... ';
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        // Tambahkan teks biasa
        text += node.textContent.trim() + ' ';
      }
    });
    return text;
  }

  // Gabungkan konten dari kedua elemen jika keduanya ada
  let textContent = '';
  if (articlesElement && articlesElement.textContent.trim() !== '') {
    textContent += getStructuredText(articlesElement);
  }

  if (profilContentElement) {
    if (profilContentElement.textContent.trim() === '') {
      // Jika profil-content belum ada teksnya, awasi dengan MutationObserver
      const observer = new MutationObserver(() => {
        if (profilContentElement.textContent.trim() !== '') {
          textContent += sanitizeText(profilContentElement.textContent) + '... ';
          observer.disconnect();  // Setelah teks dimuat, hentikan pengamatan
          console.log("Teks dari profil-content telah dimuat:", profilContentElement.textContent);
        }
      });
      observer.observe(profilContentElement, { childList: true, subtree: true });
    } else {
      // Jika teks sudah ada, langsung tambahkan dengan jeda
      textContent += sanitizeText(profilContentElement.textContent) + '... ';
    }
  }

  // Fungsi untuk memastikan teks diambil setelah API dimuat (jika profil-content menggunakan API)
  const checkTextContent = () => {
    if (textContent.trim() === '') {
      console.error("Tidak ada teks yang dapat dibacakan.");
    } else {
      console.log("Teks yang akan dibacakan:", textContent);  // Log teks untuk debugging
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

  // Fungsi untuk memulai ucapan
  function startSpeech() {
    if (isPaused && !isStopped) {
      synth.resume();  // Melanjutkan ucapan yang dijeda
      isPaused = false;
    } else if (!synth.speaking || isStopped) {
      // Ucapan baru dimulai dari resumeIndex
      const textToSpeak = textContent.split(' ').slice(resumeIndex).join(' ');
      utterance = new SpeechSynthesisUtterance(textToSpeak);
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
});
