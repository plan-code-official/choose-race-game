/** Text-to-Speech utility using Web Speech API */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, lang = 'en-US'): void {
  // Cancel any ongoing speech
  if (currentUtterance) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

/** Play a short beep sound using Web Audio API */
export function playBeep(
  frequency = 440,
  duration = 0.15,
  type: OscillatorType = 'sine',
  volume = 0.3
): void {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available, silently ignore
  }
}

export function playCorrectSound(): void {
  playBeep(523, 0.1, 'sine', 0.3);
  setTimeout(() => playBeep(659, 0.1, 'sine', 0.3), 100);
  setTimeout(() => playBeep(784, 0.2, 'sine', 0.3), 200);
}

export function playWrongSound(): void {
  playBeep(300, 0.15, 'sawtooth', 0.25);
  setTimeout(() => playBeep(200, 0.25, 'sawtooth', 0.25), 150);
}

export function playTimerTickSound(): void {
  playBeep(800, 0.05, 'square', 0.1);
}

export function playWinSound(): void {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.2, 'sine', 0.4), i * 150);
  });
}

export function playLoseSound(): void {
  [400, 350, 300, 250].forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.25, 'sawtooth', 0.3), i * 150);
  });
}
