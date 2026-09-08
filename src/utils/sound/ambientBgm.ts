/**
 * src/utils/sound/ambientBgm.ts
 * Subsystem BGM Zen prosedural: drone musiman, sequencer Koto/Shakuhachi,
 * skala tradisional Jepang per fase waktu & musim, Furin chime.
 * Diekstrak dari soundEngine.ts via prototype-mixin (sama dengan uiSeasonSfx):
 * method digabung ke prototype di soundEngine.ts sehingga API identik.
 */

import type { DayPhase, SeasonType } from '../../types/game';
import type { HagumiAudioEngine } from '../soundEngine';

export interface AmbientBgmApi {
  isBGMActive(): boolean;
  getBGMVolume(): number;
  setBGMVolume(volume: number): void;
  getBGMPhase(): DayPhase;
  getBGMSeason(): SeasonType;
  toggleAmbientBGM(phase?: DayPhase, season?: SeasonType): boolean;
  updateBGMPhase(phase: DayPhase): void;
  updateBGMSeason(season: SeasonType): void;
  updateBGMConfig(phase: DayPhase, season: SeasonType): void;
  startAmbientBGM(phase?: DayPhase, season?: SeasonType): void;
  stopAmbientBGM(): void;
  adjustDroneRoot(): void;
  startAmbientDrone(): void;
  stopAmbientDrone(): void;
  getActiveScale(): number[];
  scheduleNextBgmBeat(): void;
  playPluckedKoto(freq: number, volume?: number): void;
  playShakuhachiBreath(freq: number, duration?: number, volume?: number): void;
  playFurinChime(freq?: number): void;
}

export const ambientBgm: AmbientBgmApi & ThisType<HagumiAudioEngine & AmbientBgmApi> = {
  // ==========================================
  // DYNAMIC PROCEDURAL ZEN AMBIENT BGM SYNTHESIZER
  // Koto, Shakuhachi, Ambient Drone, Seasonal Scales & Meditative "Ma" (間)
  isBGMActive(): boolean {
    return this.isBgmRunning;
  }
,
  getBGMVolume(): number {
    return this.bgmVolume;
  }
,
  setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmMasterGain && this.ctx && !this.isMuted && this.isBgmRunning) {
      this.bgmMasterGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.2);
    }
  }
,
  getBGMPhase(): DayPhase {
    return this.currentPhase;
  }
,
  getBGMSeason(): SeasonType {
    return this.currentSeason;
  }
,
  toggleAmbientBGM(phase?: DayPhase, season?: SeasonType): boolean {
    if (this.isBgmRunning) {
      this.stopAmbientBGM();
      return false;
    } else {
      this.startAmbientBGM(phase || this.currentPhase, season || this.currentSeason);
      return true;
    }
  }
,
  updateBGMPhase(phase: DayPhase) {
    this.currentPhase = phase;
    this.adjustDroneRoot();
  }
,
  updateBGMSeason(season: SeasonType) {
    this.currentSeason = season;
    this.adjustDroneRoot();
  }
,
  updateBGMConfig(phase: DayPhase, season: SeasonType) {
    this.currentPhase = phase;
    this.currentSeason = season;
    this.adjustDroneRoot();
  }
,
  adjustDroneRoot() {
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
,
  startAmbientBGM(phase: DayPhase = 'noon', season: SeasonType = 'spring') {
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
,
  startAmbientDrone() {
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
,
  stopAmbientDrone() {
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
  },

  // Get traditional Japanese scale based on time and season
  getActiveScale(): number[] {
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
,
  scheduleNextBgmBeat() {
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
  },

  // Soft Plucked Koto/Shamisen Note
  playPluckedKoto(freq: number, volume: number = 0.08) {
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
  },

  // Traditional Japanese Bamboo Flute Breath Note (Shakuhachi - 尺八)
  // Breathy muraiki air transient + expressive pitch scooping tone with micro-vibrato
  playShakuhachiBreath(freq: number, duration: number = 1.6, volume: number = 0.065) {
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
  },

  // Furin (風鈴) Delicate Japanese Glass / Brass Windchime Accent
  // D#7 or high crystalline chime
  playFurinChime(freq: number = 2489.02) {
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
,
  stopAmbientBGM() {
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
};
