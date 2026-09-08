/**
 * src/utils/sound/uiSeasonSfx.ts
 * Mixin SFX UI, Hanabi, Shoji/Sensu & pergantian musim untuk HagumiAudioEngine.
 *
 * Metode-metode di sini digabung ke prototype engine via Object.assign di
 * soundEngine.ts (facade), sehingga pemanggil `soundEngine.playXxx()` tidak
 * berubah sama sekali. Tipe `this` di dalam metode = HagumiAudioEngine & UiSeasonSfx.
 */

import type { HagumiAudioEngine } from '../soundEngine';

export interface UiSeasonSfx {
  playLevelUp(): void;
  playMiss(): void;
  playFireworksWhistle(): void;
  playFireworksBurst(): void;
  playShojiSlide(): void;
  playShojiClose(): void;
  playShojiOpen(): void;
  playSensuOpen(): void;
  playSensuClose(): void;
  playSensuRibHover(): void;
  playSeasonHaru(): void;
  playSeasonNatsu(): void;
  playSeasonAki(): void;
  playSeasonFuyu(): void;
  playSeasonTransition(season: 'spring' | 'summer' | 'autumn' | 'winter'): void;
}

export const uiSeasonSfx: UiSeasonSfx & ThisType<HagumiAudioEngine & UiSeasonSfx> = {
  // Level up fanfare sound
  playLevelUp() {
    this.playEvolutionFanfare();
  },

  // Action miss or cannot afford sound
  playMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // safe audio
    }
  },

  // Hanabi launch whistle sound
  playFireworksWhistle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.7);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // safe audio
    }
  },

  // Hanabi deep booming burst & crackle
  playFireworksBurst() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Low Thud Boom
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'triangle';
      boomOsc.frequency.setValueAtTime(120, now);
      boomOsc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

      boomGain.gain.setValueAtTime(0.35, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      boomOsc.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 0.6);

      // 2. Sparkling crackle noise
      const bufferSize = this.ctx.sampleRate * 0.4;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 2.5;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now + 0.05);
    } catch {
      // safe audio
    }
  },

  // Traditional Japanese Shoji/Fusuma Wooden Door Slide Friction
  playShojiSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.42;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);

      // Organic wood sliding friction texture
      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize;
        // Envelope: quick swell, steady slide, soft taper
        const env = Math.sin(progress * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.4;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Filter to simulate smooth cedar wood grain on waxed rail
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(1100, now + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);
      filter.Q.value = 1.8;

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.12, now + duration * 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // safe audio
    }
  },

  // Traditional Shoji Solid Wood Frame Latch / Clack (Ton-Koto)
  playShojiClose() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Primary Solid Wood Clack (Wood meeting pillar)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(75, now + 0.09);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      // 2. Secondary subtle hollow cedar resonance (koto rebound)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(160, now + 0.025);
      osc2.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain2.gain.setValueAtTime(0.2, now + 0.025);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.025);
      osc2.stop(now + 0.12);
    } catch {
      // safe audio
    }
  },

  // Shoji Door Opening Glide
  playShojiOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Initial light wood unlatch tap
      const tapOsc = this.ctx.createOscillator();
      const tapGain = this.ctx.createGain();
      tapOsc.type = 'triangle';
      tapOsc.frequency.setValueAtTime(320, now);
      tapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      tapGain.gain.setValueAtTime(0.15, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      tapOsc.connect(tapGain);
      tapGain.connect(this.ctx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.04);

      // Followed by sliding sound
      this.playShojiSlide();
    } catch {
      // safe audio
    }
  },

  // Traditional Sensu (Folding Fan) Snap Open (Bamboo rib flick & silk flutter)
  playSensuOpen() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Bamboo rib snap clicks (staccato flick of ribs fanning out)
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.035;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480 + i * 90, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.025);

        gain.gain.setValueAtTime(0.12 - i * 0.015, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
      }

      // 2. Silk paper swoosh air friction
      const duration = 0.28;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const p = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // safe audio
    }
  },

  // Sensu Fan Snap Shut (Bamboo ribs snapping together with a clean clack)
  playSensuClose() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Snappy wood-on-bamboo clack
      const clackOsc = this.ctx.createOscillator();
      const clackGain = this.ctx.createGain();
      clackOsc.type = 'triangle';
      clackOsc.frequency.setValueAtTime(380, now);
      clackOsc.frequency.exponentialRampToValueAtTime(80, now + 0.045);

      clackGain.gain.setValueAtTime(0.28, now);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      clackOsc.connect(clackGain);
      clackGain.connect(this.ctx.destination);
      clackOsc.start(now);
      clackOsc.stop(now + 0.045);
    } catch {
      // safe audio
    }
  },

  // Gentle tactile chime/flick when gliding over a fan blade/rib
  playSensuRibHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // safe audio
    }
  },
  // 🌸 Spring Haru: Sakura Wind + Koto Petal Drop
  playSeasonHaru() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Wind whoosh
      const bufLen = this.ctx.sampleRate * 1.2;
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.6;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.045, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      noise.connect(filter); filter.connect(g); g.connect(this.ctx.destination);
      noise.start(now); noise.stop(now + 1.2);

      // Koto petal drop: descending pentatonic
      [523.25, 392, 329.63, 261.63].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const og = this.ctx!.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        og.gain.setValueAtTime(0.06, now + i * 0.22);
        og.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.55);
        o.connect(og); og.connect(this.ctx!.destination);
        o.start(now + i * 0.22); o.stop(now + i * 0.22 + 0.6);
      });
    } catch { /* safe */ }
  },

  // 🏮 Summer Natsu: Firefly Twinkle + Furin Chime
  playSeasonNatsu() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Furin windchime trio
      [2489.02, 2093, 2637].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const og = this.ctx!.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        og.gain.setValueAtTime(0.07, now + i * 0.18);
        og.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 1.1);
        o.connect(og); og.connect(this.ctx!.destination);
        o.start(now + i * 0.18); o.stop(now + i * 0.18 + 1.2);
      });
      // Cicada buzz
      const o2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      o2.type = 'sawtooth'; o2.frequency.value = 3200;
      g2.gain.setValueAtTime(0, now + 0.4);
      g2.gain.linearRampToValueAtTime(0.008, now + 0.6);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      o2.connect(g2); g2.connect(this.ctx.destination);
      o2.start(now + 0.4); o2.stop(now + 1.15);
    } catch { /* safe */ }
  },

  // 🍁 Autumn Aki: Momiji Whisper + Shakuhachi Breath
  playSeasonAki() {
    if (!this.ctx) return;
    try {
      this.playShakuhachiBreath(293.66, 1.4, 0.07); // D4 breath
      setTimeout(() => this.playShakuhachiBreath(261.63, 1.2, 0.055), 600);
      // Leaf rustle noise
      const now = this.ctx.currentTime + 0.3;
      const bufLen = this.ctx.sampleRate * 0.8;
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
      const ns = this.ctx.createBufferSource();
      ns.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = 2000;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.03, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      ns.connect(f); f.connect(g); g.connect(this.ctx.destination);
      ns.start(now); ns.stop(now + 0.8);
    } catch { /* safe */ }
  },

  // ❄️ Winter Fuyu: Snow Crystal Chimes + Wind
  playSeasonFuyu() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Crystal bell ascending
      [1046.5, 1174.66, 1318.51, 1568].forEach((f, i) => {
        const o = this.ctx!.createOscillator();
        const og = this.ctx!.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        og.gain.setValueAtTime(0.05, now + i * 0.16);
        og.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.9);
        o.connect(og); og.connect(this.ctx!.destination);
        o.start(now + i * 0.16); o.stop(now + i * 0.16 + 1.0);
      });
      // Blizzard wind
      const bufLen = this.ctx.sampleRate * 1.5;
      const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
      const ns = this.ctx.createBufferSource();
      ns.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 400;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, now + 0.5);
      g.gain.linearRampToValueAtTime(0.035, now + 0.9);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      ns.connect(f); f.connect(g); g.connect(this.ctx.destination);
      ns.start(now + 0.5); ns.stop(now + 1.5);
    } catch { /* safe */ }
  },

  // Play seasonal transition sound based on season
  playSeasonTransition(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    if (!this.ctx) return;
    switch (season) {
      case 'spring': this.playSeasonHaru(); break;
      case 'summer': this.playSeasonNatsu(); break;
      case 'autumn': this.playSeasonAki(); break;
      case 'winter': this.playSeasonFuyu(); break;
    }
  },
};
