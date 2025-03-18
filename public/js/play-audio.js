document.addEventListener('DOMContentLoaded', function() {
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const audioStatus = document.getElementById('audio-status');
  const isiHalamanElement = document.querySelector('.isi-halaman');
  const profilContentElement = document.querySelector('.profil-content');

  let synth = window.speechSynthesis;
  let voices = [];
  let utterance;
  let isPaused = false;
  let isStopped = true;
  let currentText = '';
  let currentIndex = 0;

  function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) {
      setTimeout(loadVoices, 1000);
    } else {
      playBtn.disabled = false;
    }
  }

  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices;
  }

  setTimeout(loadVoices, 500);

  function updateAudioStatus(status) {
    audioStatus.textContent = status;
    audioStatus.className = 'audio-status ' + status.toLowerCase();
  }

  function startSpeech() {
    let text = '';
    if (isiHalamanElement) {
      text += isiHalamanElement.innerText;
    }
    if (profilContentElement) {
      text += '\n' + profilContentElement.innerText;
    }

    if (text.trim() === '') {
      text = "Tidak ada teks";
    }

    currentText = text;
    currentIndex = isStopped ? 0 : currentIndex;

    if (!synth.speaking || isStopped) {
      isStopped = false;
      updateAudioStatus('Playing...');
      speakNextPart();
    } else if (isPaused) {
      resumeSpeech();
    }
  }

  function resumeSpeech() {
    if (isPaused) {
      isPaused = false;
      updateAudioStatus('Playing...');
      synth.resume();
    }
  }

  function speakNextPart() {
    let textToRead = currentText.slice(currentIndex, currentIndex + 500);
    if (textToRead.length > 0) {
      utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';

      let selectedVoice = voices.find(v => v.lang === 'id-ID');
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.voice = voices[0] || null;
      }

      utterance.onerror = function(event) {
        console.error("Error Speech Synthesis:", event.error);
      };

      utterance.onend = function() {
        currentIndex += 500;
        if (currentIndex < currentText.length) {
          speakNextPart();
        } else {
          console.log("Ucapan selesai.");
          isStopped = true;
          updateAudioStatus('Stopped');
        }
      };

      synth.speak(utterance);
    }
  }

  function pauseSpeech() {
    if (synth.speaking) {
      synth.pause();
      isPaused = true;
      updateAudioStatus('Paused');
      console.log("Ucapan dijeda.");
    }
  }

  function stopSpeech() {
    if (synth.speaking || synth.paused) {
      synth.cancel();
      isStopped = true;
      isPaused = false;
      currentIndex = 0;
      updateAudioStatus('Stopped');
      console.log("Ucapan dihentikan.");
    }
  }

  playBtn.addEventListener('click', startSpeech);
  pauseBtn.addEventListener('click', pauseSpeech);
  stopBtn.addEventListener('click', stopSpeech);

  window.addEventListener('beforeunload', function(event) {
    synth.cancel();
  });

  window.addEventListener('pagehide', function(event) {
    synth.cancel();
  });
});