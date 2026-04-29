/**
 * SoundEngine — synthesized UI sounds via Web Audio API + a lightweight
 * music player. All synthesized tones use sine/triangle waves with smooth
 * attack/release envelopes for a clean, modern, comforting feel.
 */

type ToneOptions = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  release?: number;
  freqEnd?: number;
  filterFreq?: number;
  delay?: number;
};

const NOTES = {
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
  C6: 1046.5,
  E6: 1318.51,
  G6: 1567.98,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private musicTargetVol = 0.35;
  private musicFadeRaf: number | null = null;
  private muted = false;
  private listeners = new Set<() => void>();

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  private resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  private tone(opts: ToneOptions) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    this.resume();

    const {
      freq,
      duration,
      type = "sine",
      volume = 0.2,
      attack = 0.005,
      release = 0.1,
      freqEnd,
      filterFreq,
      delay = 0,
    } = opts;

    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(0.01, freqEnd),
        t + duration,
      );
    }

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + release);

    osc.connect(gain);
    let last: AudioNode = gain;

    if (filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = filterFreq;
      gain.connect(filter);
      last = filter;
    }

    last.connect(this.master);
    osc.start(t);
    osc.stop(t + duration + release + 0.05);
  }

  // --- Public SFX --------------------------------------------------------

  click() {
    this.tone({
      freq: 660,
      duration: 0.04,
      type: "sine",
      volume: 0.12,
      attack: 0.002,
      release: 0.05,
      filterFreq: 4000,
    });
  }

  tick() {
    // Soft, high, very short — like a satisfying mechanical detent.
    this.tone({
      freq: 1400,
      duration: 0.015,
      type: "triangle",
      volume: 0.06,
      attack: 0.001,
      release: 0.02,
      filterFreq: 6000,
    });
  }

  reelStop() {
    // Bass thunk + gentle high blip together for a satisfying landing.
    this.tone({
      freq: 90,
      duration: 0.18,
      type: "sine",
      volume: 0.22,
      attack: 0.001,
      release: 0.18,
    });
    this.tone({
      freq: 520,
      freqEnd: 260,
      duration: 0.1,
      type: "sine",
      volume: 0.16,
      attack: 0.003,
      release: 0.15,
      filterFreq: 3000,
    });
  }

  spin() {
    // Lever-pull: short downward sweep.
    this.tone({
      freq: 540,
      freqEnd: 180,
      duration: 0.22,
      type: "sine",
      volume: 0.22,
      attack: 0.005,
      release: 0.15,
      filterFreq: 3500,
    });
  }

  hover() {
    this.tone({
      freq: 880,
      duration: 0.03,
      type: "sine",
      volume: 0.05,
      attack: 0.002,
      release: 0.04,
      filterFreq: 5000,
    });
  }

  win() {
    // Pleasant ascending major arpeggio (C-E-G-C) with a soft fifth halo.
    const arp = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];
    arp.forEach((freq, i) => {
      const d = i * 0.09;
      this.tone({
        freq,
        duration: 0.28,
        type: "sine",
        volume: 0.22,
        attack: 0.005,
        release: 0.45,
        delay: d,
      });
      this.tone({
        freq: freq * 1.5,
        duration: 0.28,
        type: "sine",
        volume: 0.08,
        attack: 0.005,
        release: 0.45,
        delay: d,
      });
    });
    // Final shimmer
    this.tone({
      freq: NOTES.E6,
      duration: 0.6,
      type: "sine",
      volume: 0.1,
      attack: 0.01,
      release: 0.7,
      delay: 0.36,
    });
    this.tone({
      freq: NOTES.G6,
      duration: 0.6,
      type: "sine",
      volume: 0.07,
      attack: 0.01,
      release: 0.7,
      delay: 0.42,
    });
  }

  nearMiss() {
    // Gentle "almost" — major-second descending, soft.
    this.tone({
      freq: NOTES.E5,
      duration: 0.18,
      type: "sine",
      volume: 0.16,
      attack: 0.005,
      release: 0.18,
      delay: 0,
    });
    this.tone({
      freq: NOTES.D5,
      duration: 0.32,
      type: "sine",
      volume: 0.16,
      attack: 0.005,
      release: 0.3,
      delay: 0.13,
    });
  }

  // --- Music -------------------------------------------------------------

  setMusic(url: string, targetVolume = 0.35) {
    this.musicTargetVol = targetVolume;
    if (this.musicEl && this.musicEl.dataset.src === url) return;
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl = null;
    }
    const audio = new Audio(url);
    audio.dataset.src = url;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    this.musicEl = audio;
  }

  async startMusic(fadeMs = 1500) {
    if (!this.musicEl) return;
    try {
      await this.musicEl.play();
    } catch {
      return; // autoplay blocked — caller should retry on user gesture
    }
    this.fadeMusicTo(this.muted ? 0 : this.musicTargetVol, fadeMs);
  }

  stopMusic(fadeMs = 800) {
    if (!this.musicEl) return;
    const audio = this.musicEl;
    this.fadeMusicTo(0, fadeMs, () => audio.pause());
  }

  isMusicLoaded() {
    return !!this.musicEl;
  }

  isMusicPlaying() {
    return !!this.musicEl && !this.musicEl.paused;
  }

  private fadeMusicTo(target: number, ms: number, onDone?: () => void) {
    if (!this.musicEl) return;
    const audio = this.musicEl;
    if (this.musicFadeRaf !== null) cancelAnimationFrame(this.musicFadeRaf);
    const start = audio.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));
      if (t < 1) {
        this.musicFadeRaf = requestAnimationFrame(step);
      } else {
        this.musicFadeRaf = null;
        onDone?.();
      }
    };
    this.musicFadeRaf = requestAnimationFrame(step);
  }

  // --- Mute --------------------------------------------------------------

  setMuted(m: boolean) {
    this.muted = m;
    const ctx = this.ensure();
    if (this.master && ctx) {
      const t = ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.linearRampToValueAtTime(m ? 0 : 1, t + 0.08);
    }
    if (this.musicEl) {
      this.fadeMusicTo(m ? 0 : this.musicTargetVol, m ? 200 : 500);
    }
    this.listeners.forEach((l) => l());
  }

  isMuted() {
    return this.muted;
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  subscribe(l: () => void) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
}

export const sound = new SoundEngine();
