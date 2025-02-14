document.addEventListener('DOMContentLoaded', function () {
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const isiHalamanElement = document.querySelector('.isi-halaman');

  let synth = window.speechSynthesis;
  let voices = [];
  let utterance;
  let isPaused = false;
  let isStopped = true;

  function loadVoices() {
    voices = synth.getVoices();
    console.log("Daftar suara yang tersedia:", voices);

    if (voices.length === 0) {
      setTimeout(loadVoices, 1000);
    } else {
      playBtn.disabled = false;
    }
  }

  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  setTimeout(loadVoices, 500); // Pastikan suara tersedia

  function startSpeech() {
    if (!synth.speaking || isStopped) {
      isStopped = false;
      let text = isiHalamanElement ? isiHalamanElement.innerText : "Tidak ada teks";
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';

      let selectedVoice = voices.find(v => v.lang === 'id-ID');
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.warn("Suara 'id-ID' tidak ditemukan, menggunakan default.");
      }

      utterance.onerror = function (event) {
        console.error("Error Speech Synthesis:", event.error);
      };

      utterance.onend = function () {
        console.log("Ucapan selesai.");
      };

      console.log("Memulai ucapan:", text);
      synth.speak(utterance);
    } else if (isPaused) {
      synth.resume();
      isPaused = false;
      console.log("Ucapan dilanjutkan.");
    }
  }

  function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      isPaused = true;
      console.log("Ucapan dijeda.");
    }
  }

  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      isStopped = true;
      isPaused = false;
      console.log("Ucapan dihentikan.");
    }
  }

  playBtn.addEventListener('click', startSpeech);
  pauseBtn.addEventListener('click', pauseSpeech);
  stopBtn.addEventListener('click', stopSpeech);
});
