// HAGUMI Web Audio Synthesizer (Chiptune, Shamisen & Traditional Japanese Ambience)
import { DayPhase, SeasonType } from '../types/game';
import { uiSeasonSfx } from './sound/uiSeasonSfx';
import type { UiSeasonSfx } from './sound/uiSeasonSfx';

// Diekspor sebagai tipe agar modul mixin (src/utils/sound/) bisa mengetik `this`.
export class HagumiAudioEngine {
  // publik: diakses mixin di src/utils/sound/ (lihat uiSeasonSfx.ts)
  public ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isBgmRunning: boolean = false;
  private bgmMasterGain: GainNode | null = null;
  private bgmTimer: number | null = null;
  private currentPhase: DayPhase = 'noon';
  private currentSeason: SeasonType = 'spring';
  private bgmVolume: number = 0.14;
  private stepIndex: number = 0;
  private phraseStepCount: number = 0;
  private targetPhraseLength: number = 10;
  private isZenPausing: boolean = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmMasterGain && this.ctx) {
      if (this.isMuted) {
        this.bgmMasterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
      } else if (this.isBgmRunning) {
        this.bgmMasterGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.4);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Soft woodblock tap
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Helper to synthesize a crunchy & squishy bite transient
  private synthesizeBite(start: number, startFreq: number, endFreq: number, volume: number, noiseFreq: number) {
    if (!this.ctx) return;

    // 1. Tonal body (chomp pitch dive)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, start);
    osc.frequency.exponentialRampToValueAtTime(endFreq, start + 0.07);

    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + 0.09);

    // 2. Crunch noise transient
    const noiseBuffer = this.createNoiseBuffer(0.06);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(noiseFreq, start);
      filter.Q.value = 2.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.75, start);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(start);
    }
  }

  // ==========================================
  // 1. SUARA MAKAN / DINING & CHEWING
  // ==========================================

  // Multi-bite rhythmic chewing: Crunch... squish... chomp... gulp... happy purr!
  public playChewBite() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Bite 1 (t=0.0): Crisp squishy crunch
    this.synthesizeBite(now, 320, 160, 0.28, 1300);

    // Bite 2 (t=0.18): Softer chewy squish
    this.synthesizeBite(now + 0.18, 270, 140, 0.25, 980);

    // Bite 3 (t=0.36): Deep tasty chomp
    this.synthesizeBite(now + 0.36, 350, 170, 0.3, 1450);

    // Satisfied swallow gulp at t=0.58 ("Gluk!")
    const gulpOsc = this.ctx.createOscillator();
    const gulpGain = this.ctx.createGain();
    const gulpTime = now + 0.58;
    gulpOsc.type = 'sine';
    gulpOsc.frequency.setValueAtTime(360, gulpTime);
    gulpOsc.frequency.exponentialRampToValueAtTime(110, gulpTime + 0.11);

    gulpGain.gain.setValueAtTime(0.28, gulpTime);
    gulpGain.gain.exponentialRampToValueAtTime(0.001, gulpTime + 0.11);

    gulpOsc.connect(gulpGain);
    gulpGain.connect(this.ctx.destination);
    gulpOsc.start(gulpTime);
    gulpOsc.stop(gulpTime + 0.12);

    // Happy Kitsune purr / chirp at t=0.74 ("Kyuu~")
    const purrOsc = this.ctx.createOscillator();
    const purrGain = this.ctx.createGain();
    const purrTime = now + 0.74;
    purrOsc.type = 'sine';
    purrOsc.frequency.setValueAtTime(840, purrTime);
    purrOsc.frequency.exponentialRampToValueAtTime(1180, purrTime + 0.1);
    purrGain.gain.setValueAtTime(0.16, purrTime);
    purrGain.gain.exponentialRampToValueAtTime(0.001, purrTime + 0.2);

    purrOsc.connect(purrGain);
    purrGain.connect(this.ctx.destination);
    purrOsc.start(purrTime);
    purrOsc.stop(purrTime + 0.22);
  }

  // Warm tea sipping sound (gentle slurp + cup coaster tap + warm sigh)
  public playSipTea() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Liquid suction swoosh (filtered noise with resonant bandpass sweep)
    const noiseBuffer = this.createNoiseBuffer(0.38);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.5;
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.linearRampToValueAtTime(1650, now + 0.2);
      filter.frequency.linearRampToValueAtTime(850, now + 0.38);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    // 2. Ceramic cup placement tap on wooden coaster at t=0.46
    const cupOsc = this.ctx.createOscillator();
    const cupGain = this.ctx.createGain();
    const cupTime = now + 0.46;
    cupOsc.type = 'triangle';
    cupOsc.frequency.setValueAtTime(1760, cupTime);
    cupOsc.frequency.exponentialRampToValueAtTime(620, cupTime + 0.05);

    cupGain.gain.setValueAtTime(0.18, cupTime);
    cupGain.gain.exponentialRampToValueAtTime(0.001, cupTime + 0.05);

    cupOsc.connect(cupGain);
    cupGain.connect(this.ctx.destination);
    cupOsc.start(cupTime);
    cupOsc.stop(cupTime + 0.06);

    // 3. Satisfied warm sigh ("Aah~") at t=0.54
    const sighOsc = this.ctx.createOscillator();
    const sighGain = this.ctx.createGain();
    const sighTime = now + 0.54;
    sighOsc.type = 'sine';
    sighOsc.frequency.setValueAtTime(490, sighTime);
    sighOsc.frequency.exponentialRampToValueAtTime(360, sighTime + 0.26);

    sighGain.gain.setValueAtTime(0.12, sighTime);
    sighGain.gain.exponentialRampToValueAtTime(0.001, sighTime + 0.26);

    sighOsc.connect(sighGain);
    sighGain.connect(this.ctx.destination);
    sighOsc.start(sighTime);
    sighOsc.stop(sighTime + 0.28);
  }

  // Universal Feed dispatcher
  public playFeed(itemOrIsDrink?: any) {
    if (typeof itemOrIsDrink === 'string') {
      const lower = itemOrIsDrink.toLowerCase();
      if (lower.includes('ocha') || lower.includes('tea') || lower.includes('drink')) {
        this.playSipTea();
        return;
      }
    } else if (itemOrIsDrink && typeof itemOrIsDrink === 'object') {
      if (itemOrIsDrink.id === 'ocha' || itemOrIsDrink.type === 'drink') {
        this.playSipTea();
        return;
      }
    } else if (itemOrIsDrink === true) {
      this.playSipTea();
      return;
    }
    this.playChewBite();
  }

  // ==========================================
  // 2. SUARA MANDI / ONSEN & WATER FX
  // ==========================================

  // Creamy soap lathering & bursting suds
  public playSoapScrub() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Foam friction wash (filtered swoosh with rapid amplitude modulation)
    const noiseBuffer = this.createNoiseBuffer(0.35);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.linearRampToValueAtTime(2200, now + 0.18);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.35);
      filter.Q.value = 2.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    // 2. Micro-bubble pops
    const bubblePops = [520, 680, 840, 720];
    bubblePops.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + 0.04 + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq + 240, t + 0.04);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    });
  }

  // Realistic water splash & bamboo ladle pour ("Byuurrr... slosh!")
  public playWaterSplashLadle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Bamboo ladle tilt clack
    const ladleOsc = this.ctx.createOscillator();
    const ladleGain = this.ctx.createGain();
    ladleOsc.type = 'triangle';
    ladleOsc.frequency.setValueAtTime(560, now);
    ladleOsc.frequency.exponentialRampToValueAtTime(240, now + 0.06);
    ladleGain.gain.setValueAtTime(0.24, now);
    ladleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    ladleOsc.connect(ladleGain);
    ladleGain.connect(this.ctx.destination);
    ladleOsc.start(now);
    ladleOsc.stop(now + 0.07);

    // 2. Cascading rushing water splash (noise with lowpass sweep)
    const splashBuffer = this.createNoiseBuffer(0.55);
    if (splashBuffer) {
      const splash = this.ctx.createBufferSource();
      splash.buffer = splashBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now + 0.02);
      filter.frequency.exponentialRampToValueAtTime(650, now + 0.55);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      splash.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      splash.start(now + 0.02);
    }

    // 3. Reverberant water droplet plops
    const droplets = [680, 520, 820, 440, 750, 390];
    droplets.forEach((freq, idx) => {
      const dropOsc = this.ctx!.createOscillator();
      const dropGain = this.ctx!.createGain();
      const t = now + 0.08 + idx * 0.07;

      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(freq, t);
      dropOsc.frequency.exponentialRampToValueAtTime(freq - 140, t + 0.05);

      dropGain.gain.setValueAtTime(0.12, t);
      dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      dropOsc.connect(dropGain);
      dropGain.connect(this.ctx!.destination);
      dropOsc.start(t);
      dropOsc.stop(t + 0.07);
    });
  }

  // Crystal high-Q bubble pop ping
  public playBubblePop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(890, now);
    osc.frequency.exponentialRampToValueAtTime(2100, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Percikan air lembut & pakan ikan Koi (Koi Feeding Plop & Ripple)
  public playKoiFeeding() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Water drop plop (pitch bend up-then-down)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // 2. Micro water ripples
    const noiseBuffer = this.createNoiseBuffer(0.12);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now + 0.02);
      filter.Q.setValueAtTime(3.0, now + 0.02);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.06, now + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(now + 0.02);
      noise.stop(now + 0.13);
    }
  }

  // Gesekan sapu pasir batu Zen Karesansui (Bamboo rake scraping sand)
  public playSandRake() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const buffer = this.createNoiseBuffer(0.18);
    if (!buffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.16);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.19);
  }

  // Alias for backward compatibility
  public playBath() {
    this.playSoapScrub();
  }

  // ==========================================
  // 3. SUARA TIDUR / BEDROOM & LULLABY FX
  // ==========================================

  // Soft silk/cotton futon slide & tuck rustle
  public playFutonRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const buffer = this.createNoiseBuffer(0.3);
    if (buffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(580, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.28);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }
  }

  // Gentle calming breathing cycle (soft rhythmic inhale & peaceful exhale)
  public playSleepBreathe() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Inhale (0.0 -> 0.8s)
    const inOsc = this.ctx.createOscillator();
    const inGain = this.ctx.createGain();
    inOsc.type = 'sine';
    inOsc.frequency.setValueAtTime(140, now);
    inOsc.frequency.linearRampToValueAtTime(190, now + 0.7);

    inGain.gain.setValueAtTime(0.01, now);
    inGain.gain.linearRampToValueAtTime(0.09, now + 0.6);
    inGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    inOsc.connect(inGain);
    inGain.connect(this.ctx.destination);
    inOsc.start(now);
    inOsc.stop(now + 0.82);

    // Exhale (0.9 -> 2.0s)
    const exOsc = this.ctx.createOscillator();
    const exGain = this.ctx.createGain();
    const exTime = now + 0.85;
    exOsc.type = 'sine';
    exOsc.frequency.setValueAtTime(180, exTime);
    exOsc.frequency.exponentialRampToValueAtTime(120, exTime + 1.1);

    exGain.gain.setValueAtTime(0.08, exTime);
    exGain.gain.exponentialRampToValueAtTime(0.0001, exTime + 1.15);

    exOsc.connect(exGain);
    exGain.connect(this.ctx.destination);
    exOsc.start(exTime);
    exOsc.stop(exTime + 1.2);
  }

  // Japanese Hirajoshi Music Box Lullaby (E4, F4, A4, B4, C5)
  public playSleepLullaby() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 329.63, d: 0.8 }, // E4
      { f: 349.23, d: 0.8 }, // F4
      { f: 440.0, d: 1.0 },  // A4
      { f: 493.88, d: 0.9 }, // B4
      { f: 523.25, d: 1.4 }, // C5
    ];

    let t = this.ctx.currentTime;
    notes.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + note.d);

      t += 0.28;
    });
  }

  // ==========================================
  // 4. SUARA TOKO / TANUKI MERCHANT & CASH REGISTER FX
  // ==========================================

  // Traditional Japanese shopkeeper brass wind chime / hyoshigi doorbell ("Chirin-kling!")
  public playShopDoorChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chimePitches = [1318.51, 1760.0, 2637.02]; // E6, A6, E7
    chimePitches.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.16 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  // Folkloric Tanuki belly drum tap ("Poko-pon!")
  public playTanukiDrum() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. "Poko" (hollow wooden cavity thump)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(210, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // 2. "Pon" (resonant lighter tap at t=0.15)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const t2 = now + 0.15;
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(320, t2);
    osc2.frequency.exponentialRampToValueAtTime(110, t2 + 0.14);
    gain2.gain.setValueAtTime(0.3, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.16);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.17);
  }

  // Crisp packaging paper bag rustle
  public playPaperBagRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const buffer = this.createNoiseBuffer(0.16);
    if (buffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }
  }

  // Multi-coin brass & gold clash + register chime
  public playCoinTransaction() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const coins = [1046.5, 1396.91, 1760.0, 2093.0]; // C6, F6, A6, C7
    coins.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.035;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });

    // Also play paper bag wrap sound shortly after
    setTimeout(() => {
      this.playPaperBagRustle();
    }, 120);
  }

  // Backward compatible alias
  public playBuy() {
    this.playCoinTransaction();
  }

  // Straw broom sweep (clearing poop)
  public playSweep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // Cute Kitsune Fox Call ("Kon kon! / Kyuu~")
  public playFoxChirp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const start = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, start);
    osc.frequency.exponentialRampToValueAtTime(1100, start + 0.08);
    osc.frequency.exponentialRampToValueAtTime(900, start + 0.16);

    gain.gain.setValueAtTime(0.22, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(start);
    osc.stop(start + 0.2);
  }

  // Golden Ryo coin sound
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const start = this.ctx.currentTime;

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, start); // B5
    osc1.frequency.setValueAtTime(1318.51, start + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, start);
    osc2.frequency.setValueAtTime(2637.02, start + 0.08);

    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(start);
    osc2.start(start);
    osc1.stop(start + 0.35);
    osc2.stop(start + 0.35);
  }

  // ==========================================
  // KUIL INARI PROCEDURAL AUDIO SUITE (神社の儀礼音)
  // ==========================================

  // 1. Shinto Ritual Two-Hand Claps (Kashiwade - 柏手)
  // Two crisp, sacred hand claps with temple hall wooden reverberation
  public playKashiwade() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const clapTimes = [now, now + 0.32]; // Two intentional ritual claps

    clapTimes.forEach((t) => {
      // A. Sharp hand skin impact (Bandpass noise transient)
      const buffer = this.createNoiseBuffer(0.06);
      if (buffer) {
        const noise = this.ctx!.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1450, t);
        filter.Q.setValueAtTime(3.5, t);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.38, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);
        noise.start(t);
      }

      // B. Warm palm flesh impact body
      const palmOsc = this.ctx!.createOscillator();
      const palmGain = this.ctx!.createGain();
      palmOsc.type = 'triangle';
      palmOsc.frequency.setValueAtTime(380, t);
      palmOsc.frequency.exponentialRampToValueAtTime(90, t + 0.04);
      palmGain.gain.setValueAtTime(0.25, t);
      palmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      palmOsc.connect(palmGain);
      palmGain.connect(this.ctx!.destination);
      palmOsc.start(t);
      palmOsc.stop(t + 0.06);

      // C. Sacred wooden temple hall acoustic resonance / natural reverb trail
      const hallOsc = this.ctx!.createOscillator();
      const hallGain = this.ctx!.createGain();
      hallOsc.type = 'sine';
      hallOsc.frequency.setValueAtTime(540, t + 0.02);
      hallOsc.frequency.exponentialRampToValueAtTime(320, t + 0.28);
      hallGain.gain.setValueAtTime(0.06, t + 0.02);
      hallGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      hallOsc.connect(hallGain);
      hallGain.connect(this.ctx!.destination);
      hallOsc.start(t + 0.02);
      hallOsc.stop(t + 0.36);
    });
  }

  // 2. Traditional Inari Shrine Bell (Suzu / Kagura Suzu)
  // Resonant brass bell chime with hemp rope friction swish & long celestial shimmer
  public playShrineBell() {
    this.playSuzuShrineBell();
  }

  public playSuzuShrineBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // A. Hemp rope swish (Shimenawa rustle before the chime)
    const ropeBuffer = this.createNoiseBuffer(0.12);
    if (ropeBuffer) {
      const ropeNoise = this.ctx.createBufferSource();
      ropeNoise.buffer = ropeBuffer;
      const ropeFilter = this.ctx.createBiquadFilter();
      ropeFilter.type = 'bandpass';
      ropeFilter.frequency.setValueAtTime(950, now);
      const ropeGain = this.ctx.createGain();
      ropeGain.gain.setValueAtTime(0.14, now);
      ropeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      ropeNoise.connect(ropeFilter);
      ropeFilter.connect(ropeGain);
      ropeGain.connect(this.ctx.destination);
      ropeNoise.start(now);
    }

    // B. Rich Inharmonic Brass Bell Chimes (Kagura Suzu D5 Major Harmonics with micro-detuning)
    const bellT = now + 0.04;
    const harmonics = [
      { f: 587.33, amp: 0.32, decay: 2.2 },  // D5 fundamental
      { f: 880.00, amp: 0.26, decay: 1.9 },  // A5
      { f: 1174.66, amp: 0.22, decay: 1.6 }, // D6
      { f: 1479.98, amp: 0.16, decay: 1.3 }, // F#6
      { f: 1760.00, amp: 0.14, decay: 1.1 }, // A6
      { f: 2349.32, amp: 0.09, decay: 0.9 }, // D7
      { f: 2959.96, amp: 0.06, decay: 0.7 }, // F#7
    ];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Alternating micro-detuning creates authentic bell shimmer / beating
      const detuneCents = (idx % 2 === 0 ? 1 : -1) * (2 + idx * 1.5);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.f, bellT);
      osc.detune.setValueAtTime(detuneCents, bellT);

      gain.gain.setValueAtTime(h.amp, bellT);
      gain.gain.exponentialRampToValueAtTime(0.0001, bellT + h.decay);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(bellT);
      osc.stop(bellT + h.decay + 0.05);
    });
  }

  // 3. Offertory Coin Toss into Wooden Saisen Box (Saisen-bako - 賽銭箱)
  // Coin hitting wooden slats with metallic rebound and hollow wooden cavity
  public playSaisenCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // A. Wood slat impact (Slatted wooden grate tap)
    const woodOsc = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(420, now);
    woodOsc.frequency.exponentialRampToValueAtTime(140, now + 0.05);
    woodGain.gain.setValueAtTime(0.3, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    woodOsc.connect(woodGain);
    woodGain.connect(this.ctx.destination);
    woodOsc.start(now);
    woodOsc.stop(now + 0.07);

    // B. Metallic coin ringing bounce on wooden grate
    const coinHits = [
      { t: now + 0.015, freq: 2480, amp: 0.25 },
      { t: now + 0.08, freq: 3120, amp: 0.18 },
      { t: now + 0.14, freq: 2840, amp: 0.12 },
    ];

    coinHits.forEach((hit) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hit.freq, hit.t);
      gain.gain.setValueAtTime(hit.amp, hit.t);
      gain.gain.exponentialRampToValueAtTime(0.001, hit.t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(hit.t);
      osc.stop(hit.t + 0.3);
    });

    // C. Deep wooden offering box resonance
    const chestOsc = this.ctx.createOscillator();
    const chestGain = this.ctx.createGain();
    chestOsc.type = 'sine';
    chestOsc.frequency.setValueAtTime(160, now + 0.04);
    chestOsc.frequency.exponentialRampToValueAtTime(75, now + 0.25);
    chestGain.gain.setValueAtTime(0.18, now + 0.04);
    chestGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    chestOsc.connect(chestGain);
    chestGain.connect(this.ctx.destination);
    chestOsc.start(now + 0.04);
    chestOsc.stop(now + 0.32);
  }

  // 4. Divination Bamboo Cylinder Shaker & Fortune Paper Unfold (Omikuji - おみくじ)
  public playOmikujiShake() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // A. 3-4 bamboo sticks rattling inside the hollow cylinder ("shaka-shaka-clack")
    const rattleTimes = [now, now + 0.12, now + 0.24, now + 0.36];
    rattleTimes.forEach((t, i) => {
      // Hollow bamboo click
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740 + i * 40, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.05);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.07);

      // Noise rasp of bamboo stick sliding
      const buf = this.createNoiseBuffer(0.05);
      if (buf) {
        const noise = this.ctx!.createBufferSource();
        noise.buffer = buf;
        const flt = this.ctx!.createBiquadFilter();
        flt.type = 'bandpass';
        flt.frequency.setValueAtTime(1800, t);
        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        noise.connect(flt);
        flt.connect(g);
        g.connect(this.ctx!.destination);
        noise.start(t);
      }
    });

    // B. Delicate Japanese washi fortune paper unfold sound
    setTimeout(() => {
      if (this.ctx && !this.isMuted) {
        const paperBuf = this.createNoiseBuffer(0.18);
        if (paperBuf) {
          const pNow = this.ctx.currentTime;
          const pNoise = this.ctx.createBufferSource();
          pNoise.buffer = paperBuf;
          const pFilter = this.ctx.createBiquadFilter();
          pFilter.type = 'highpass';
          pFilter.frequency.setValueAtTime(2400, pNow);
          const pGain = this.ctx.createGain();
          pGain.gain.setValueAtTime(0.16, pNow);
          pGain.gain.exponentialRampToValueAtTime(0.001, pNow + 0.18);
          pNoise.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(this.ctx.destination);
          pNoise.start(pNow);
        }
      }
    }, 450);
  }

  // ==========================================
  // FESTIVAL MATSURI PROCEDURAL AUDIO SUITE (祭りの響き)
  // ==========================================

  // 1. Festive Taiko Drum Roll (Taiko Matsuri Roll - 祭り太鼓の連打)
  // Powerful rhythmic combination of deep Odaiko skin hits and wooden rim accents
  public playTaikoFestivalRoll() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Pattern: DON (0s) -> DON (0.16s) -> KA (0.3s) -> DO-DON! (0.44s & 0.54s)
    this.playTaikoDon();
    setTimeout(() => this.playTaikoDon(), 160);
    setTimeout(() => this.playTaikoKa(), 300);
    setTimeout(() => this.playTaikoDon(), 440);
    setTimeout(() => this.playTaikoDon(), 550);
  }

  // 2. Kingyo-sukui Paper Poi Water Scoop & Ripple (金魚すくい・ポイのすくい音)
  // Soft tension of paper poi dipping into water with droplet plop
  public playMatsuriPoiScoop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // A. Paper membrane entering water tension (filtered air/paper displacement)
    const paperBuf = this.createNoiseBuffer(0.08);
    if (paperBuf) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = paperBuf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(2.0, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    }

    // B. Water surface droplet plop (plip!)
    const plopOsc = this.ctx.createOscillator();
    const plopGain = this.ctx.createGain();
    plopOsc.type = 'sine';
    plopOsc.frequency.setValueAtTime(450, now + 0.02);
    plopOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.07);
    plopGain.gain.setValueAtTime(0.26, now + 0.02);
    plopGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    plopOsc.connect(plopGain);
    plopGain.connect(this.ctx.destination);
    plopOsc.start(now + 0.02);
    plopOsc.stop(now + 0.13);

    // C. Gentle ripple sub-bubble
    const rippleOsc = this.ctx.createOscillator();
    const rippleGain = this.ctx.createGain();
    rippleOsc.type = 'sine';
    rippleOsc.frequency.setValueAtTime(320, now + 0.04);
    rippleOsc.frequency.exponentialRampToValueAtTime(180, now + 0.14);
    rippleGain.gain.setValueAtTime(0.15, now + 0.04);
    rippleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    rippleOsc.connect(rippleGain);
    rippleGain.connect(this.ctx.destination);
    rippleOsc.start(now + 0.04);
    rippleOsc.stop(now + 0.19);
  }

  // 3. Traditional Japanese Bamboo Flute Flourish (Shinobue - 篠笛)
  // Expressive festival bamboo flute celebration melody in Yo/Insen pentatonic scale
  public playShinobueFlute() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Traditional cheerful festival melody: D5 -> F#5 -> A5 -> B5 -> D6
    const melody = [
      { f: 587.33, dur: 0.12 },
      { f: 739.99, dur: 0.12 },
      { f: 880.00, dur: 0.14 },
      { f: 987.77, dur: 0.12 },
      { f: 1174.66, dur: 0.38 },
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Sine with slight triangle harmonic for breathy bamboo feel
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      // Flute envelope: gentle attack, warm sustain, soft release
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + note.dur + 0.02);

      t += note.dur * 0.85;
    });
  }

  // Egg crack & hatch sparkle
  public playHatch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Crack tap
    this.playClick();

    // Magical pentatonic scale rise (Japanese Insen/Yo scale: D, F, G, A, C, D)
    const notes = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0];
    notes.forEach((note, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = this.ctx!.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // Grand Evolution Fanfare (Traditional Koto Chime)
  public playEvolutionFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [
      { f: 440.0, d: 0.15 },
      { f: 523.25, d: 0.15 },
      { f: 587.33, d: 0.2 },
      { f: 659.25, d: 0.15 },
      { f: 880.0, d: 0.6 },
    ];

    let current = this.ctx.currentTime;
    melody.forEach((m) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(m.f, current);

      gain.gain.setValueAtTime(0.25, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + m.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(current);
      osc.stop(current + m.d);

      current += m.d * 0.8;
    });
  }

  // Gentle lullaby chord for sleep
  public playSleepChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [392.0, 493.88, 587.33]; // G major gentle chime
    chords.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const start = this.ctx!.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(start);
      osc.stop(start + 1.5);
    });
  }

  // Sparkling Japanese Brass Bell (Suzu) Chime
  public playSuzuChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const ringFreqs = [1760.0, 2640.0, 3520.0]; // A6 harmonics
    const now = this.ctx.currentTime;

    ringFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    });
  }

  // Chime bell alias
  public playChime() {
    this.playSuzuChime();
  }

  // Elegant Accessory Equip Sound (Soft silk snap + chime)
  public playAccessoryEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Soft silk snap (triangle wave)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(520, now);
    snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    snapGain.gain.setValueAtTime(0.18, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.08);

    // 2. Sweet ascending chime
    const notes = [659.25, 880.0]; // E5, A5
    notes.forEach((freq, i) => {
      const chimeOsc = this.ctx!.createOscillator();
      const chimeGain = this.ctx!.createGain();
      const t = now + 0.04 + i * 0.08;

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, t);
      chimeGain.gain.setValueAtTime(0.12, t);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx!.destination);
      chimeOsc.start(t);
      chimeOsc.stop(t + 0.35);
    });
  }

  // Petualangan Berkelana Roh (O-dekake Depart: Tabi Bell Chime & Semilir Angin Perjalanan)
  public playOdekakeDepart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Shinto Tabi Kagura Bell Triple Chimes (G5, B5, D6)
    const bellNotes = [783.99, 987.77, 1174.66];
    bellNotes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    });

    // 2. Semilir Angin Perjalanan (Soft Wind Noise Sweep)
    const noiseBuffer = this.createNoiseBuffer(0.7);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.6);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.7);
    }
  }

  // Petualangan Berkelana Roh (O-dekake Return: Sambutan Meriah & Kagura Celebration)
  public playOdekakeReturn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Ascending celebratory Inari Pentatonic Scale Fanfare (D5, F5, G5, A5, D6, F6)
    const notes = [587.33, 698.46, 783.99, 880.0, 1174.66, 1396.91];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.85);
    });

    // Deep cheering drum hit at the end
    setTimeout(() => {
      this.playTaikoDon();
    }, 450);
  }

  // Traditional Japanese Taiko Drum - DON (Center Skin Strike - Deep Boom)
  public playTaikoDon() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Deep drum skin fundamental (Odaiko resonance)
    const skinOsc = this.ctx.createOscillator();
    const skinGain = this.ctx.createGain();
    skinOsc.type = 'sine';
    skinOsc.frequency.setValueAtTime(118, now);
    skinOsc.frequency.exponentialRampToValueAtTime(42, now + 0.32);

    skinGain.gain.setValueAtTime(0.45, now);
    skinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    skinOsc.connect(skinGain);
    skinGain.connect(this.ctx.destination);
    skinOsc.start(now);
    skinOsc.stop(now + 0.42);

    // 2. Body punch harmonic (wooden barrel depth)
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(74, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(36, now + 0.25);

    bodyGain.gain.setValueAtTime(0.3, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.3);

    // 3. Stick snap transient (Bachi strike on skin)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'square';
    snapOsc.frequency.setValueAtTime(260, now);
    snapOsc.frequency.exponentialRampToValueAtTime(70, now + 0.03);

    snapGain.gain.setValueAtTime(0.2, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.03);
  }

  // Traditional Japanese Taiko Drum - KA (Rim Wood Strike - Sharp Clack)
  public playTaikoKa() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. High wood rim crack
    const rimOsc = this.ctx.createOscillator();
    const rimGain = this.ctx.createGain();
    rimOsc.type = 'triangle';
    rimOsc.frequency.setValueAtTime(1450, now);
    rimOsc.frequency.exponentialRampToValueAtTime(680, now + 0.04);

    rimGain.gain.setValueAtTime(0.35, now);
    rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    rimOsc.connect(rimGain);
    rimGain.connect(this.ctx.destination);
    rimOsc.start(now);
    rimOsc.stop(now + 0.06);

    // 2. Resonant hardwood shell chime
    const shellOsc = this.ctx.createOscillator();
    const shellGain = this.ctx.createGain();
    shellOsc.type = 'sine';
    shellOsc.frequency.setValueAtTime(940, now);
    shellOsc.frequency.exponentialRampToValueAtTime(520, now + 0.09);

    shellGain.gain.setValueAtTime(0.25, now);
    shellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    shellOsc.connect(shellGain);
    shellGain.connect(this.ctx.destination);
    shellOsc.start(now);
    shellOsc.stop(now + 0.09);
  }

  // Shishi-odoshi (Traditional Bamboo Water Clack & Ripple)
  public playShishiOdoshi() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Hollow bamboo clack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);

    // Soft resonant hollow echo
    const echoOsc = this.ctx.createOscillator();
    const echoGain = this.ctx.createGain();
    echoOsc.type = 'sine';
    echoOsc.frequency.setValueAtTime(420, now + 0.01);
    echoGain.gain.setValueAtTime(0.12, now + 0.01);
    echoGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    echoOsc.connect(echoGain);
    echoGain.connect(this.ctx.destination);
    echoOsc.start(now + 0.01);
    echoOsc.stop(now + 0.16);
  }

  // ==========================================
  // DYNAMIC PROCEDURAL ZEN AMBIENT BGM SYNTHESIZER
  // Koto, Shakuhachi, Ambient Drone, Seasonal Scales & Meditative "Ma" (間)
  // ==========================================

  public isBGMActive(): boolean {
    return this.isBgmRunning;
  }

  public getBGMVolume(): number {
    return this.bgmVolume;
  }

  public setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmMasterGain && this.ctx && !this.isMuted && this.isBgmRunning) {
      this.bgmMasterGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.2);
    }
  }

  public getBGMPhase(): DayPhase {
    return this.currentPhase;
  }

  public getBGMSeason(): SeasonType {
    return this.currentSeason;
  }

  public toggleAmbientBGM(phase?: DayPhase, season?: SeasonType): boolean {
    if (this.isBgmRunning) {
      this.stopAmbientBGM();
      return false;
    } else {
      this.startAmbientBGM(phase || this.currentPhase, season || this.currentSeason);
      return true;
    }
  }

  public updateBGMPhase(phase: DayPhase) {
    this.currentPhase = phase;
    this.adjustDroneRoot();
  }

  public updateBGMSeason(season: SeasonType) {
    this.currentSeason = season;
    this.adjustDroneRoot();
  }

  public updateBGMConfig(phase: DayPhase, season: SeasonType) {
    this.currentPhase = phase;
    this.currentSeason = season;
    this.adjustDroneRoot();
  }

  private adjustDroneRoot() {
    if (this.isBgmRunning && this.droneOsc1 && this.ctx) {
      // Adjust drone root frequency smoothly depending on phase and season
      let rootFreq = 146.83; // D3 standard
      if (this.currentPhase === 'night') {
        rootFreq = 110.0; // A2 deep night
      } else if (this.currentPhase === 'evening') {
        rootFreq = this.currentSeason === 'autumn' ? 110.0 : 130.81; // A2 / C3 dusk
      } else if (this.currentPhase === 'morning') {
        rootFreq = this.currentSeason === 'winter' ? 164.81 : 146.83; // E3 / D3
      }
      this.droneOsc1.frequency.setTargetAtTime(rootFreq, this.ctx.currentTime, 3.5);
      if (this.droneOsc2) {
        this.droneOsc2.frequency.setTargetAtTime(rootFreq * 1.5, this.ctx.currentTime, 3.5);
      }
    }
  }

  public startAmbientBGM(phase: DayPhase = 'noon', season: SeasonType = 'spring') {
    this.initContext();
    if (!this.ctx) return;
    this.currentPhase = phase;
    this.currentSeason = season;

    if (this.isBgmRunning) {
      this.updateBGMConfig(phase, season);
      return;
    }

    this.isBgmRunning = true;
    this.stepIndex = 0;
    this.phraseStepCount = 0;
    this.targetPhraseLength = Math.floor(Math.random() * 5) + 8; // 8-12 notes per phrase
    this.isZenPausing = false;

    // Master BGM gain bus (keeps volume subtle and non-intrusive)
    const initialVol = this.isMuted ? 0.0001 : this.bgmVolume;
    if (!this.bgmMasterGain) {
      this.bgmMasterGain = this.ctx.createGain();
      this.bgmMasterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
      this.bgmMasterGain.connect(this.ctx.destination);
    } else {
      this.bgmMasterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmMasterGain.gain.setTargetAtTime(initialVol, this.ctx.currentTime, 0.8);
    }

    // Start soothing warm ambient drone (warm tape room pad)
    this.startAmbientDrone();

    // Start melody sequencer loop
    this.scheduleNextBgmBeat();
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.bgmMasterGain) return;
    try {
      this.stopAmbientDrone();

      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      // Soft gentle ambient pad
      this.droneGain.gain.linearRampToValueAtTime(0.042, now + 2.5);

      // Warm low-pass filter to give tape-like softness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const cutoff = this.currentPhase === 'night' ? 360 : 480;
      filter.frequency.setValueAtTime(cutoff, now);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'triangle';
      let rootFreq = 146.83; // D3
      if (this.currentPhase === 'night') rootFreq = 110.0; // A2
      else if (this.currentPhase === 'evening') rootFreq = 130.81; // C3
      this.droneOsc1.frequency.setValueAtTime(rootFreq, now);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(rootFreq * 1.5, now); // Fifth harmonic

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.bgmMasterGain);

      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
    } catch {
      // AudioContext protection
    }
  }

  private stopAmbientDrone() {
    if (this.droneGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.setTargetAtTime(0.0001, now, 0.5);
    }
    if (this.droneOsc1) {
      try { this.droneOsc1.stop(this.ctx?.currentTime || 0); } catch {}
      this.droneOsc1 = null;
    }
    if (this.droneOsc2) {
      try { this.droneOsc2.stop(this.ctx?.currentTime || 0); } catch {}
      this.droneOsc2 = null;
    }
  }

  // Get traditional Japanese scale based on time and season
  private getActiveScale(): number[] {
    // Standard frequencies (Hz)
    // Hirajoshi in D (D4, E4, F4, A4, Bb4, D5, E5, F5)
    const hirajoshiD = [293.66, 329.63, 349.23, 440.0, 466.16, 587.33, 659.25, 698.46];
    // Hirajoshi in A (A3, B3, C4, E4, F4, A4, B4, C5) - deep contemplative
    const hirajoshiA = [220.0, 246.94, 261.63, 329.63, 349.23, 440.0, 493.88, 523.25];
    // Insen (D4, Eb4, G4, A4, C5, D5, Eb5, G5) - sacred temple atmosphere
    const insen = [293.66, 311.13, 392.0, 440.0, 523.25, 587.33, 622.25, 783.99];
    // Yo / Ritsu (D4, E4, G4, A4, B4, D5, E5, G5) - bright spring / festival sun
    const yoScale = [293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 659.25, 783.99];
    // Kumoi (D4, Eb4, G4, Ab4, C5, D5, Eb5, G5) - summer evening dusk
    const kumoi = [293.66, 311.13, 392.0, 415.30, 523.25, 587.33, 622.25, 783.99];
    // Iwato (C4, Db4, F4, Gb4, Bb4, C5, Db5, F5) - ancient quiet winter shrine
    const iwato = [261.63, 277.18, 349.23, 369.99, 466.16, 523.25, 554.37, 698.46];

    if (this.currentPhase === 'morning') {
      return this.currentSeason === 'winter' ? hirajoshiD : yoScale;
    }
    if (this.currentPhase === 'noon') {
      if (this.currentSeason === 'spring') return yoScale;
      if (this.currentSeason === 'summer') return insen;
      if (this.currentSeason === 'autumn') return hirajoshiD;
      return hirajoshiD;
    }
    if (this.currentPhase === 'evening') {
      if (this.currentSeason === 'summer') return kumoi;
      if (this.currentSeason === 'autumn') return hirajoshiA;
      return insen;
    }
    // Night
    if (this.currentSeason === 'winter') return iwato;
    if (this.currentSeason === 'autumn') return hirajoshiA;
    return hirajoshiD;
  }

  private scheduleNextBgmBeat() {
    if (!this.isBgmRunning || !this.ctx) return;

    // Check if we should insert a Zen meditative pause ("Ma" - 間)
    if (this.phraseStepCount >= this.targetPhraseLength) {
      this.isZenPausing = true;
      this.phraseStepCount = 0;
      this.targetPhraseLength = Math.floor(Math.random() * 6) + 8; // Next phrase length (8 to 13 notes)

      // Occasional soft windchime / temple bell or water drop at the start of Zen silence
      if (Math.random() > 0.35) {
        if (this.currentSeason === 'spring' || this.currentSeason === 'summer') {
          this.playFurinChime();
        } else {
          this.playShakuhachiBreath(220.0, 2.2, 0.045); // Gentle A3 breath
        }
      }

      // Zen pause duration: 3.2s to 5.8s of restful ambient room silence
      const zenPauseDuration = 3200 + Math.random() * 2600;

      this.bgmTimer = window.setTimeout(() => {
        this.isZenPausing = false;
        this.scheduleNextBgmBeat();
      }, zenPauseDuration);
      return;
    }

    const activeScale = this.getActiveScale();
    const stepInMeasure = this.stepIndex % 8;

    // Phrasing: play on most beats, leave breath on beat 3 or 7
    if (stepInMeasure !== 3 && stepInMeasure !== 7) {
      const noteIdx = (this.stepIndex * 3 + (this.stepIndex % 5)) % activeScale.length;
      const freq = activeScale[noteIdx];
      const isOrnament = stepInMeasure === 2 || stepInMeasure === 6;

      // Occasional Shakuhachi bamboo flute breath solo on evening/autumn/night or cadences
      const shouldUseFlute = (
        (this.currentPhase === 'evening' || this.currentPhase === 'night' || this.currentSeason === 'autumn') &&
        (stepInMeasure === 0 || stepInMeasure === 4) &&
        Math.random() > 0.6
      );

      if (shouldUseFlute) {
        // Expressive elongated flute note
        this.playShakuhachiBreath(freq, 1.6, 0.06);
      } else {
        // Traditional plucked Koto string
        this.playPluckedKoto(freq, isOrnament ? 0.045 : 0.08);

        // Occasional gentle sub-octave echo on prominent beats (typical koto bass accompaniment)
        if (stepInMeasure === 0 && Math.random() > 0.45) {
          setTimeout(() => {
            if (this.isBgmRunning) {
              this.playPluckedKoto(freq * 0.5, 0.04);
            }
          }, 190);
        }
      }

      this.phraseStepCount++;
    }

    this.stepIndex++;

    // Tempo varies by time phase and season:
    // Morning: ~750ms, Noon: ~880ms, Evening: ~1050ms, Night: ~1350ms
    let tempoMs = 880;
    if (this.currentPhase === 'morning') tempoMs = 740;
    if (this.currentPhase === 'evening') tempoMs = 1060;
    if (this.currentPhase === 'night') tempoMs = 1380;

    // Winter slows down slightly, Spring is slightly crisper
    if (this.currentSeason === 'winter') tempoMs += 120;
    if (this.currentSeason === 'spring') tempoMs -= 40;

    // Small organic human timing drift (+/- 35ms)
    const drift = (Math.random() - 0.5) * 70;

    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextBgmBeat();
    }, Math.max(500, tempoMs + drift));
  }

  // Soft Plucked Koto/Shamisen Note
  private playPluckedKoto(freq: number, volume: number = 0.08) {
    if (!this.ctx || !this.bgmMasterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. String fundamental (sine + triangle for rich wood twang)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle pitch bend down like traditional koto finger release
      osc.frequency.exponentialRampToValueAtTime(freq * 0.993, now + 0.38);

      // Decay length varies by season: Winter is slightly longer/crystalline
      const decayDuration = this.currentSeason === 'winter' ? 1.1 : 0.85;

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

      // 2. High plectrum plucking click (Bachi / Ivory plectrum touch)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(freq * 2.01, now);
      clickGain.gain.setValueAtTime(volume * 0.42, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.bgmMasterGain);

      clickOsc.connect(clickGain);
      clickGain.connect(this.bgmMasterGain);

      osc.start(now);
      osc.stop(now + decayDuration);

      clickOsc.start(now);
      clickOsc.stop(now + 0.12);
    } catch {
      // Safe audio handling
    }
  }

  // Traditional Japanese Bamboo Flute Breath Note (Shakuhachi - 尺八)
  // Breathy muraiki air transient + expressive pitch scooping tone with micro-vibrato
  public playShakuhachiBreath(freq: number, duration: number = 1.6, volume: number = 0.065) {
    if (!this.ctx || !this.bgmMasterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Tonal Bamboo Core (Sine + subtle triangle)
      const toneOsc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();

      toneOsc.type = 'sine';
      // Subtle pitch scoop upward (classic meri-kari technique: starts ~20 cents flat)
      toneOsc.frequency.setValueAtTime(freq * 0.988, now);
      toneOsc.frequency.exponentialRampToValueAtTime(freq, now + 0.09);

      // Flute envelope: gentle swell, warm sustain, soft breathy release
      toneGain.gain.setValueAtTime(0.001, now);
      toneGain.gain.linearRampToValueAtTime(volume, now + 0.18);
      toneGain.gain.linearRampToValueAtTime(volume * 0.75, now + duration * 0.7);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      toneOsc.connect(toneGain);
      toneGain.connect(this.bgmMasterGain);

      // Micro vibrato (~4.8Hz LFO) starting after note onset
      const vibratoOsc = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibratoOsc.frequency.setValueAtTime(4.8, now);
      vibratoGain.gain.setValueAtTime(0.0, now);
      vibratoGain.gain.setValueAtTime(freq * 0.008, now + 0.25); // Subtle pitch modulation depth
      vibratoOsc.connect(toneOsc.frequency);
      vibratoOsc.start(now);
      vibratoOsc.stop(now + duration);

      toneOsc.start(now);
      toneOsc.stop(now + duration);

      // 2. Breathy "Muraiki" bamboo embouchure air turbulence
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        // Air follows fundamental flute resonance
        filter.frequency.setValueAtTime(Math.min(2200, Math.max(900, freq * 2.2)), now);
        filter.Q.setValueAtTime(3.2, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(volume * 0.45, now + 0.12);
        noiseGain.gain.linearRampToValueAtTime(volume * 0.2, now + duration * 0.6);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.bgmMasterGain);

        noise.start(now);
        noise.stop(now + duration);
      }
    } catch {
      // Safe audio
    }
  }

  // Furin (風鈴) Delicate Japanese Glass / Brass Windchime Accent
  public playFurinChime(freq: number = 2489.02) { // D#7 or high crystalline chime
    if (!this.ctx || !this.bgmMasterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.bgmMasterGain);

      osc.start(now);
      osc.stop(now + 1.85);

      // Overtone shimmer
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 1.503, now);
      overtoneGain.gain.setValueAtTime(0.015, now);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      overtone.connect(overtoneGain);
      overtoneGain.connect(this.bgmMasterGain);
      overtone.start(now);
      overtone.stop(now + 1.25);
    } catch {
      // Safe audio
    }
  }

  public stopAmbientBGM() {
    this.isBgmRunning = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.stopAmbientDrone();
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    }
  }

}

// ============================================================
// Mixin: SFX UI/Hanabi/Shoji/Sensu & musim (src/utils/sound/uiSeasonSfx.ts)
// Digabung ke prototype sehingga API soundEngine tetap identik bagi pemanggil.
// Interface ikut diekspor agar konsumen singleton melihat properti mixin.
// ============================================================
export interface HagumiAudioEngine extends UiSeasonSfx {}

Object.assign(HagumiAudioEngine.prototype, uiSeasonSfx);

export const soundEngine = new HagumiAudioEngine();

// Helper: detect current real-world season based on month
export const detectRealSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = new Date().getMonth(); // 0 = Jan ... 11 = Dec
  if (month >= 2 && month <= 4) return 'spring';  // Mar-May
  if (month >= 5 && month <= 7) return 'summer';  // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
  return 'winter'; // Dec-Feb
};
