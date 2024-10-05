const textContent = document.querySelector('.isi-halaman').innerText;
const synth = window.speechSynthesis;
let utterance;
let isPaused = false;
let isStopped = true;
let resumeIndex = 0;
let wakeLock = null;

const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

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

async function releaseWakeLock() {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

function startSpeech() {
  if (isMobileDevice()) {
    requestWakeLock();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (isPaused && !isStopped) {
    synth.resume();
    isPaused = false;
  } else if (!synth.speaking || isStopped) {
    utterance = new SpeechSynthesisUtterance(textContent.split(' ').slice(resumeIndex).join(' '));
    utterance.lang = 'id-ID';

    utterance.onboundary = function (event) {
      if (event.name === 'word') {
        resumeIndex += 1;
      }
    };

    utterance.onend = function () {
      isStopped = true;
      resumeIndex = 0;
      if (isMobileDevice()) {
        releaseWakeLock();
      }
    };

    synth.speak(utterance);
    isStopped = false;
    isPaused = false;
  }
}

function pauseSpeech() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
    isPaused = true;
  }
}

function stopSpeech() {
  if (synth.speaking || synth.paused) {
    synth.cancel();
    isStopped = true;
    isPaused = false;
    resumeIndex = 0;
    releaseWakeLock();
  }
}

playBtn.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  startSpeech();
});

pauseBtn.addEventListener('click', pauseSpeech);
stopBtn.addEventListener('click', stopSpeech);

window.addEventListener('beforeunload', stopSpeech);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    audioContext.suspend();
  } else {
    audioContext.resume();
  }
});