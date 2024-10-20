document.addEventListener('DOMContentLoaded', function() {
  const isiHalamanElement = document.querySelector('.isi-halaman');  // Ambil elemen dengan class "isi-halaman"
  const profilContentElement = document.getElementById('profil-content');  // Ambil elemen dengan id "profil-content"

  // Daftar tag blok yang ingin kita tambahkan jeda setelahnya
  const blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'div', 'section'];

  // Fungsi untuk mengekstrak teks dari elemen dan memisahkan berdasarkan tag blok
  function extractTextSegments(element) {
    const segments = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    
    let node = walker.nextNode();
    let currentSegment = '';

    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        currentSegment += node.textContent.trim() + ' ';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (blockTags.includes(node.tagName.toLowerCase())) {
          // Jika sudah ada teks sebelumnya, tambahkan sebagai segmen
          if (currentSegment.trim() !== '') {
            segments.push(currentSegment.trim());
            currentSegment = '';
          }
          // Tambahkan teks dari elemen blok sebagai segmen baru
          const text = node.textContent.trim();
          if (text !== '') {
            segments.push(text);
          }
        }
      }
      node = walker.nextNode();
    }

    // Tambahkan segmen terakhir jika ada
    if (currentSegment.trim() !== '') {
      segments.push(currentSegment.trim());
    }

    return segments;
  }

  // Fungsi untuk menghapus semua tag HTML dari teks (untuk elemen yang tidak termasuk blockTags)
  function sanitizeText(text) {
    return text.replace(/<\/?[^>]+(>|$)/g, ""); // Menghapus semua tag HTML
  }

  // Gabungkan konten dari kedua elemen jika keduanya ada
  let textSegments = [];

  if (isiHalamanElement && isiHalamanElement.textContent.trim() !== '') {
    const segments = extractTextSegments(isiHalamanElement);
    textSegments = textSegments.concat(segments);
  }

  if (profilContentElement) {
    if (profilContentElement.textContent.trim() === '') {
      // Jika profil-content belum ada teksnya, awasi dengan MutationObserver
      const observer = new MutationObserver(() => {
        if (profilContentElement.textContent.trim() !== '') {
          const sanitizedText = sanitizeText(profilContentElement.textContent.trim());
          if (sanitizedText !== '') {
            textSegments.push(sanitizedText);
          }
          observer.disconnect();  // Setelah teks dimuat, hentikan pengamatan
          console.log("Teks dari profil-content telah dimuat:", profilContentElement.textContent);
        }
      });
      observer.observe(profilContentElement, { childList: true, subtree: true });
    } else {
      // Jika teks sudah ada, langsung tambahkan
      const sanitizedText = sanitizeText(profilContentElement.textContent.trim());
      if (sanitizedText !== '') {
        textSegments.push(sanitizedText);
      }
    }
  }

  // Fungsi untuk memastikan teks diambil setelah API dimuat (jika profil-content menggunakan API)
  const checkTextSegments = () => {
    if (textSegments.length === 0) {
      console.error("Tidak ada teks yang dapat dibacakan.");
    } else {
      console.log("Teks yang akan dibacakan:", textSegments);  // Log teks untuk debugging
    }
  };

  // Tambahkan delay untuk memastikan observer selesai bekerja sebelum memeriksa textSegments
  setTimeout(checkTextSegments, 1000);

  const synth = window.speechSynthesis;  // Inisialisasi Speech Synthesis
  let utteranceQueue = [];  // Queue untuk menyimpan utterance
  let isSpeaking = false;  // Status untuk mengecek apakah sedang berbicara

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
    if (synth.paused && !synth.speaking) {
      synth.resume();  // Melanjutkan ucapan yang dijeda
    } else if (!isSpeaking && utteranceQueue.length > 0) {
      isSpeaking = true;
      speakNextUtterance();
    }
  }

  // Fungsi untuk berbicara setiap utterance dalam queue
  function speakNextUtterance() {
    if (utteranceQueue.length === 0) {
      isSpeaking = false;
      return;
    }

    const text = utteranceQueue.shift();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';  // Bahasa ucapan diatur ke bahasa Indonesia

    // Menentukan voice secara eksplisit
    const idIDVoice = voices.find(voice => voice.lang === 'id-ID');
    if (idIDVoice) {
      utterance.voice = idIDVoice;
    } else {
      console.warn("Voice 'id-ID' tidak tersedia. Menggunakan voice default.");
    }

    // Event saat utterance selesai
    utterance.onend = function() {
      // Tambahkan delay sebelum utterance berikutnya
      setTimeout(speakNextUtterance, 500);  // Delay 500ms
    };

    // Mulai mengucapkan teks
    synth.speak(utterance);
  }

  // Fungsi untuk mengumpulkan semua teks ke dalam queue
  function prepareUtteranceQueue() {
    utteranceQueue = [...textSegments];
  }

  // Fungsi untuk menjeda ucapan
  function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
      synth.pause();  // Menjeda ucapan
    }
  }

  // Fungsi untuk menghentikan ucapan
  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();  // Menghentikan ucapan dan membatalkan sisa teks yang belum diucapkan
      isSpeaking = false;
      utteranceQueue = [];
    }
  }

  // Event listener untuk tombol Play
  playBtn.addEventListener('click', () => {
    prepareUtteranceQueue();  // Siapkan queue sebelum memulai
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
