// Web Audio API Synthesizer with rich tactile, acoustic and mechanical sounds
class TactileAudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.noteListeners = [];
    this.keyFrequencies = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5
      587.33, // D5
      659.25  // E5
    ];
    this.blackKeyFrequencies = [
      277.18, // C#4
      311.13, // D#4
      369.99, // F#4
      415.30, // G#4
      466.16  // A#4
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  onNote(callback) {
    this.noteListeners.push(callback);
  }

  notifyNotePlayed(freq, isBlack) {
    this.noteListeners.forEach(cb => cb({ freq, isBlack }));
  }

  playPianoKey(index, isBlack = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const freqs = isBlack ? this.blackKeyFrequencies : this.keyFrequencies;
    const freq = freqs[index % freqs.length] || 440;
    const now = this.ctx.currentTime;

    this.notifyNotePlayed(freq, isBlack);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.4, now);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    noteGain.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.connect(noteGain);
    osc1.start(now);
    osc1.stop(now + 1.6);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 1.1);

    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, now);
    const gain3 = this.ctx.createGain();
    gain3.gain.setValueAtTime(0.07, now);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc3.connect(gain3);
    gain3.connect(this.ctx.destination);
    osc3.start(now);
    osc3.stop(now + 0.5);

    this.playHammerTransient(now);
  }

  playHammerTransient(time) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.018);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }

  playTactileClick(pitch = 1200) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.3, now + 0.035);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  // Satisfying Custom Mechanical Keyboard Switch Sound (Thocky Switch)
  playMechanicalThock(pitch = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. High transient switch contact click
    const oscClick = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(1600 * pitch, now);
    oscClick.frequency.exponentialRampToValueAtTime(320, now + 0.02);
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    oscClick.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    oscClick.start(now);
    oscClick.stop(now + 0.02);

    // 2. Warm acoustic bottom-out "thock"
    const oscThock = this.ctx.createOscillator();
    const thockGain = this.ctx.createGain();
    oscThock.type = 'sine';
    const baseFreq = 260 + (Math.random() - 0.5) * 35;
    oscThock.frequency.setValueAtTime(baseFreq * pitch, now);
    oscThock.frequency.exponentialRampToValueAtTime(95, now + 0.055);
    thockGain.gain.setValueAtTime(0.24, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    oscThock.connect(thockGain);
    thockGain.connect(this.ctx.destination);
    oscThock.start(now);
    oscThock.stop(now + 0.055);

    // Notify listeners for live equalizer animation
    this.notifyNote(Math.floor(baseFreq));
  }

  // Vintage Phone / Intercom Chime
  playPhoneBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [784, 1046.5]; // G5 and C6 harmonic chime
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.08);

      gain.gain.setValueAtTime(0.2, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.2);
    });
  }

  // Holographic Cloud Gyroscope Shimmer
  playHologramPulse() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Leather Folder Opening Sound (Soft filter transient)
  playFolderOpen() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(550, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Wooden Ball Elastic Bounce
  playWoodBounce() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Nostalgic Radio Frequency Tuning & Dial Click
  playRadioTune() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.12);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // Warm retro radio static burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(3.2, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const synth = new TactileAudioSynth();
