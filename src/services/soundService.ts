import { HapticStrength, SoundType } from '../types';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private tanpuraInterval: number | null = null;
  private tanpuraGain: GainNode | null = null;
  private isTanpuraActive: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a single tap sound based on selected sound type
  playTapSound(soundType: SoundType, volume: number = 0.8): void {
    if (volume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      switch (soundType) {
        case 'wood_click':
          this.playWoodBeadClick(ctx, volume);
          break;
        case 'shankh':
          this.playMiniShankh(ctx, volume);
          break;
        case 'om_tone':
          this.playOmTone(ctx, volume);
          break;
        case 'bell':
        default:
          this.playTempleBell(ctx, 880, 0.9, volume);
          break;
      }
    } catch (e) {
      console.warn('Audio playback not permitted yet:', e);
    }
  }

  // Celebratory Temple Ghanti for completing 108 Mala
  playMalaCompletionBell(volume: number = 1.0): void {
    if (volume <= 0) return;
    try {
      const ctx = this.getAudioContext();
      // Rich dual harmonic chime sequence representing sacred temple gong
      this.playTempleBell(ctx, 523.25, 2.8, volume * 1.0); // C5
      setTimeout(() => {
        this.playTempleBell(ctx, 783.99, 2.5, volume * 0.85); // G5
      }, 160);
      setTimeout(() => {
        this.playTempleBell(ctx, 1046.5, 3.2, volume * 0.9); // C6
      }, 340);
    } catch (e) {
      console.warn('Audio error on mala completion:', e);
    }
  }

  // Resonant brass temple bell with multiple inharmonic partials
  private playTempleBell(ctx: AudioContext, baseFreq: number = 880, duration: number = 1.2, volume: number = 0.8): void {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.6, now);
    masterGain.connect(ctx.destination);

    // Temple bells have prominent physical partial ratios: 1.0, 1.48, 2.05, 3.12, 4.2
    const partials = [
      { ratio: 1.0, gain: 0.8, decay: duration },
      { ratio: 1.48, gain: 0.5, decay: duration * 0.8 },
      { ratio: 2.05, gain: 0.35, decay: duration * 0.6 },
      { ratio: 3.12, gain: 0.2, decay: duration * 0.4 },
      { ratio: 4.8, gain: 0.15, decay: duration * 0.25 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + p.decay);
    });
  }

  // Wooden bead acoustic knock (sounds like real sacred Rudraksha beads)
  private playWoodBeadClick(ctx: AudioContext, volume: number = 0.8): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

    gain.gain.setValueAtTime(volume * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Mini Shankh (conch horn) resonance
  private playMiniShankh(ctx: AudioContext, volume: number = 0.8): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Shankh fundamental note with subtle breath rise
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(349.23, now + 0.08); // F4
    osc.frequency.linearRampToValueAtTime(345, now + 0.25);

    // Warm lowpass filter to emulate acoustic horn
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Sacred Om tone (Cosmic 136.1 Hz frequency)
  private playOmTone(ctx: AudioContext, volume: number = 0.8): void {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // 136.1 Hz is the traditional meditative Earth Om frequency
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(136.1, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(272.2, now); // 1st octave harmonic

    gain.gain.setValueAtTime(volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.72);
    osc2.stop(now + 0.72);
  }

  // Continuous synthesized Tanpura meditation drone
  startTanpuraDrone(volume: number = 0.4): void {
    if (this.isTanpuraActive) return;
    try {
      const ctx = this.getAudioContext();
      this.isTanpuraActive = true;

      // 4 strings of Tanpura: Pa (G#3 - 207.65 Hz), Sa (C#4 - 277.18 Hz), Sa (C#4), Kharaj Sa (C#3 - 138.59 Hz)
      const notes = [207.65, 277.18, 277.18, 138.59];
      let stringIdx = 0;

      const playString = () => {
        if (!this.isTanpuraActive) return;
        const now = ctx.currentTime;
        const freq = notes[stringIdx];
        stringIdx = (stringIdx + 1) % notes.length;

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now); // Javari sparkle

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 2.5, now);
        filter.Q.setValueAtTime(2.0, now);

        const stringVol = (stringIdx === 3 ? 0.35 : 0.25) * volume;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(stringVol, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 2.9);
        osc2.stop(now + 2.9);
      };

      // Play first string immediately, then cycle every 1.1 seconds
      playString();
      this.tanpuraInterval = window.setInterval(playString, 1100);
    } catch (e) {
      console.warn('Tanpura drone could not be started:', e);
    }
  }

  stopTanpuraDrone(): void {
    this.isTanpuraActive = false;
    if (this.tanpuraInterval !== null) {
      clearInterval(this.tanpuraInterval);
      this.tanpuraInterval = null;
    }
  }

  toggleTanpuraDrone(volume: number = 0.4): boolean {
    if (this.isTanpuraActive) {
      this.stopTanpuraDrone();
      return false;
    } else {
      this.startTanpuraDrone(volume);
      return true;
    }
  }

  getTanpuraStatus(): boolean {
    return this.isTanpuraActive;
  }

  // Tactile Vibration Haptic Feedback
  triggerHaptic(strength: HapticStrength, isMalaComplete: boolean = false): void {
    if (strength === 'off' || typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      if (isMalaComplete) {
        // Joyful multi-stage celebratory pulse
        navigator.vibrate([40, 60, 40, 60, 120]);
        return;
      }

      switch (strength) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(22);
          break;
        case 'strong':
          navigator.vibrate(40);
          break;
      }
    } catch {
      // Haptics may be blocked or unsupported on desktop; silently ignore
    }
  }
}

export const soundService = new SoundService();
