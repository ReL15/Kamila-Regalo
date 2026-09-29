export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private unlocked: boolean = false;

  // Synthesizer nodes for road/ambient
  private ambientGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc: OscillatorNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientTimer: number | null = null;

  private currentTrackTheme: string = "peaceful";

  private constructor() {
    // Lazy init
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public unlock(): void {
    if (this.unlocked) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        this.unlocked = true;
        this.startAmbientMusic();
      }
    } catch {
      // Audio not supported or blocked
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.value = muted ? 0 : 0.08;
    }
    if (this.engineGain) {
      this.engineGain.gain.value = muted ? 0 : 0.03;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setSceneAtmosphere(theme: "mountain" | "forest" | "lake" | "city" | "night" | "peaceful" | "celebration"): void {
    this.currentTrackTheme = theme;
    if (!this.unlocked || !this.ctx || this.isMuted) return;
    // Adapt ambient chord progression slightly
  }

  public updateEnginePitch(speedRatio: number): void {
    if (!this.unlocked || !this.ctx || this.isMuted || !this.engineOsc) return;
    const baseFreq = 55; // A1
    const targetFreq = baseFreq + Math.abs(speedRatio) * 65;
    try {
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      if (this.engineGain) {
        const targetVol = 0.015 + Math.abs(speedRatio) * 0.035;
        this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
      }
    } catch {
      // ignore
    }
  }

  private startAmbientMusic(): void {
    if (!this.ctx) return;

    try {
      // Engine continuous hum
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = "triangle";
      this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);

      const engineFilter = this.ctx.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.02, this.ctx.currentTime);

      this.engineOsc.connect(engineFilter);
      engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      // Atmospheric ambient music master gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      this.playAtmosphericChords();
    } catch {
      // audio error handling
    }
  }

  private playAtmosphericChords(): void {
    if (!this.ctx || !this.ambientGain) return;

    // Ambient dreamy indie chords: D maj9, G maj7, Bm7, A add9
    const chordProgressions = [
      [146.83, 220.00, 277.18, 329.63, 440.00], // D, A, C#, E, A
      [196.00, 246.94, 293.66, 369.99, 440.00], // G, B, D, F#, A
      [123.47, 185.00, 220.00, 293.66, 369.99], // B, F#, A, D, F#
      [220.00, 277.18, 329.63, 440.00, 554.37], // A, C#, E, A, C#
    ];

    let step = 0;

    const scheduleChord = () => {
      if (!this.ctx || !this.ambientGain || this.isMuted) {
        this.ambientTimer = window.setTimeout(scheduleChord, 4000);
        return;
      }

      const notes = chordProgressions[step % chordProgressions.length];
      step++;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.ambientGain) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          const duration = 4.2;

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.02 / (idx + 1), now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          osc.connect(gain);
          gain.connect(this.ambientGain);

          osc.start(now);
          osc.stop(now + duration + 0.1);
        } catch {
          // ignore
        }
      });

      this.ambientTimer = window.setTimeout(scheduleChord, 3800);
    };

    scheduleChord();
  }

  // SFX: Raccoon found melodic chime
  public playRaccoonFound(): void {
    if (!this.unlocked || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Bright sparkling arpeggio: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.7);
      });
    } catch {
      // ignore
    }
  }

  // SFX: 7/7 All raccoons celebration fanfare
  public playCelebration(): void {
    if (!this.unlocked || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.15, t: 0 },
        { f: 659.25, d: 0.15, t: 0.15 },
        { f: 783.99, d: 0.15, t: 0.3 },
        { f: 1046.5, d: 0.45, t: 0.45 },
        { f: 880.00, d: 0.2, t: 0.8 },
        { f: 1046.5, d: 0.8, t: 1.0 },
      ];

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.001, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.15, now + n.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.1);
      });
    } catch {
      // ignore
    }
  }

  // SFX: Box open mystical sparkle
  public playBoxOpen(): void {
    if (!this.unlocked || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        const freq = 400 + i * 150 + Math.random() * 50;
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.0001, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.05 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.6);
      }
    } catch {
      // ignore
    }
  }

  // SFX: Memory interactive open
  public playMemoryOpen(): void {
    if (!this.unlocked || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  // SFX: Horn honk easter egg / fun interaction
  public playHorn(): void {
    if (!this.unlocked || !this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      [220, 277].forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      });
    } catch {
      // ignore
    }
  }

  public destroy(): void {
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
    }
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
  }
}
