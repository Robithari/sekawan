document.addEventListener('DOMContentLoaded', function () {
  const isiHalamanElement = document.querySelector('.isi-halaman');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');

  let textContent = '';
  let voices = [];
  let utterance;
  let isPaused = false;
  let isStopped = true;

  const synth = window.speechSynthesis;

  // Fungsi untuk menghapus semua tag HTML dan karakter tidak terlihat dari teks
  function sanitizeText(text) {
    // Hapus tag HTML
    let cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
    // Hapus karakter BOM
    cleanText = cleanText.replace(/\uFEFF/g, '');
    return cleanText;
  }

  // Fungsi untuk memperbarui textContent dari isiHalamanElement
  function updateTextContent() {
    if (isiHalamanElement && isiHalamanElement.innerText.trim() !== '') {
      textContent = sanitizeText(isiHalamanElement.innerText);
      console.log('textContent updated:', textContent);
      checkTextContent();
    }
  }

  // Inisialisasi textContent dengan MutationObserver
  if (isiHalamanElement) {
    const observer = new MutationObserver(() => {
      if (isiHalamanElement.innerText.trim() !== '') {
        updateTextContent();
        observer.disconnect();
      }
    });
    observer.observe(isiHalamanElement, { childList: true, subtree: true, characterData: true });
  } else {
    console.warn('isiHalamanElement tidak ditemukan.');
  }

  // Fungsi untuk mengisi daftar suara
  function populateVoices() {
    voices = synth.getVoices();
    if (voices.length !== 0) {
      console.log('Daftar suara:', voices);
      checkVoicesReady();
    } else {
      console.warn('Daftar suara masih kosong.');
    }
  }

  synth.addEventListener('voiceschanged', populateVoices);
  populateVoices();

  let voicesReady = false;

  function checkVoicesReady() {
    if (voices.length > 0) {
      voicesReady = true;
      checkCanPlay();
    }
  }

  function checkCanPlay() {
    if (voicesReady && textContent && textContent.trim() !== '') {
      if (playBtn) {
        playBtn.disabled = false;
      }
    } else {
      if (playBtn) {
        playBtn.disabled = true;
      }
    }
  }

  // Fungsi untuk memulai ucapan
  function startSpeech() {
    if (!voicesReady) {
      console.warn('Voices belum siap. Silakan tunggu sebentar.');
      return;
    }

    if (!textContent || textContent.trim() === '') {
      console.warn('Tidak ada teks untuk dibacakan.');
      return;
    }

    if (isPaused && !isStopped) {
      synth.resume();
      isPaused = false;
      console.log('Ucapan dilanjutkan.');
    } else if (!synth.speaking || isStopped) {
      utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'id-ID';

      const idIDVoice = voices.find(voice => voice.lang === 'id-ID');
      if (idIDVoice) {
        utterance.voice = idIDVoice;
        console.log('Menggunakan suara:', idIDVoice.name);
      } else {
        console.warn("Voice 'id-ID' tidak tersedia. Menggunakan voice default.");
      }

      utterance.onpause = function () {
        console.log('Ucapan dijeda.');
        isPaused = true;
      };

      utterance.oncancel = function () {
        console.log('Ucapan dibatalkan.');
        isStopped = true;
      };

      utterance.onerror = function (event) {
        console.error('Terjadi kesalahan saat ucapan:', event.error);
        isStopped = true;
      };

      utterance.onend = function () {
        isStopped = true;
        console.log('Ucapan selesai.');
      };

      synth.speak(utterance);
      isStopped = false;
      isPaused = false;
      console.log('Ucapan dimulai.');
    }
  }

  // Fungsi untuk menjeda ucapan
  function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      isPaused = true;
      console.log('Ucapan dijeda.');
    }
  }

  // Fungsi untuk menghentikan ucapan
  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      isStopped = true;
      isPaused = false;
      console.log('Ucapan dihentikan.');
    }
  }

  // Fungsi untuk menonaktifkan atau mengaktifkan tombol Play
  function checkTextContent() {
    checkCanPlay();
  }

  // Event listener untuk tombol
  if (playBtn) {
    playBtn.disabled = true; // Awalnya dinonaktifkan hingga teks dan voices tersedia
    playBtn.addEventListener('click', startSpeech);
  } else {
    console.warn('Tombol play tidak ditemukan.');
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', pauseSpeech);
  } else {
    console.warn('Tombol pause tidak ditemukan.');
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopSpeech);
  } else {
    console.warn('Tombol stop tidak ditemukan.');
  }
});
