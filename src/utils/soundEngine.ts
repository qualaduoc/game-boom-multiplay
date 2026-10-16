class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public bgmEnabled: boolean = true;
  private bgmInterval: number | null = null;
  private noteIndex: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.12,
    slideToFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playPlaceBomb(): void {
    this.playTone(220, 0.09, 'square', 0.14, 440);
    setTimeout(() => this.playTone(520, 0.07, 'triangle', 0.1), 50);
  }

  public playThrowBomb(): void {
    this.playTone(280, 0.18, 'triangle', 0.16, 780);
    setTimeout(() => this.playTone(620, 0.12, 'square', 0.1, 340), 120);
  }

  public playTeleport(): void {
    const notes = [440, 660, 880, 1320];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 0.07, 'sine', 0.13, f * 1.25), idx * 40);
    });
  }

  public playSpikeTrap(): void {
    this.playTone(580, 0.06, 'sawtooth', 0.08, 190);
  }

  public playExplosion(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const duration = 0.42;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.6);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    this.playTone(110, 0.35, 'sawtooth', 0.2, 32);
  }

  public playPickupItem(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.09, 'square', 0.12), idx * 55);
    });
  }

  public playChestOpen(): void {
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.11, 'triangle', 0.16), idx * 60);
    });
  }

  public playEnemyDefeat(): void {
    this.playTone(360, 0.08, 'square', 0.13, 680);
    setTimeout(() => this.playTone(760, 0.14, 'square', 0.12, 980), 75);
  }

  public playPlayerHurt(): void {
    this.playTone(280, 0.15, 'sawtooth', 0.18, 110);
    setTimeout(() => this.playTone(180, 0.22, 'sawtooth', 0.18, 75), 110);
  }

  public playVictory(): void {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const durations = [0.12, 0.12, 0.12, 0.24, 0.12, 0.38];
    let delay = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, durations[i], 'square', 0.14), delay * 1000);
      delay += durations[i] * 0.9;
    });
  }

  public playGameOver(): void {
    const melody = [392.0, 369.99, 349.23, 329.63, 261.63];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.22, 'sawtooth', 0.13), i * 190);
    });
  }

  public startBgm(): void {
    if (this.bgmInterval !== null) return;
    const bassline = [
      261.63, 329.63, 392.0, 329.63,
      293.66, 369.99, 440.0, 369.99,
      246.94, 329.63, 392.0, 329.63,
      261.63, 392.0, 523.25, 392.0,
    ];
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.bgmEnabled) return;
      const note = bassline[this.noteIndex % bassline.length];
      this.playTone(note, 0.16, 'triangle', 0.045);
      this.noteIndex++;
    }, 240);
  }

  public stopBgm(): void {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
