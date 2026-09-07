export type HapticIntensity = 'soft' | 'medium' | 'strong' | 'off';

export type HapticProfile =
  | 'tap'
  | 'softTap'
  | 'medium'
  | 'heavy'
  | 'petPurr'
  | 'shojiSlide'
  | 'shojiClose'
  | 'sensuOpen'
  | 'sensuClose'
  | 'taiko'
  | 'bell'
  | 'omikuji'
  | 'evolution'
  | 'water'
  | 'coinsRattle'
  | 'warning';

export interface HapticConfig {
  enabled: boolean;
  intensity: HapticIntensity;
}

const STORAGE_KEY = 'hagumi_haptic_config';

const INTENSITY_MULTIPLIERS: Record<HapticIntensity, number> = {
  off: 0,
  soft: 0.6,
  medium: 1.0,
  strong: 1.45,
};

// Base vibration patterns in milliseconds
const BASE_PATTERNS: Record<HapticProfile, number[]> = {
  tap: [12],
  softTap: [7],
  medium: [28],
  heavy: [50],
  petPurr: [15, 45, 18, 45, 22],
  shojiSlide: [10, 30, 10],
  shojiClose: [25, 25, 40],
  sensuOpen: [12, 22, 14, 22, 18],
  sensuClose: [35],
  taiko: [55, 30, 35],
  bell: [40, 50, 25, 60, 15],
  omikuji: [18, 30, 18, 30, 28],
  evolution: [30, 45, 35, 45, 55, 40, 75],
  water: [15, 25, 12],
  coinsRattle: [12, 18, 20, 22, 14],
  warning: [35, 50, 35],
};

class HapticEngine {
  private config: HapticConfig;
  private listeners: Set<(config: HapticConfig) => void> = new Set();
  public isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && Boolean(navigator.vibrate);
    this.config = this.loadConfig();
  }

  private loadConfig(): HapticConfig {
    if (typeof window === 'undefined') {
      return { enabled: true, intensity: 'medium' };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          enabled: parsed.enabled ?? true,
          intensity: parsed.intensity ?? 'medium',
        };
      }
    } catch {
      // fallback
    }
    return { enabled: true, intensity: 'medium' };
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // safe ignore
    }
  }

  public getConfig(): HapticConfig {
    return { ...this.config };
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
    this.notify();
  }

  public setIntensity(intensity: HapticIntensity): void {
    this.config.intensity = intensity;
    this.config.enabled = intensity !== 'off';
    this.saveConfig();
    this.notify();
    if (intensity !== 'off') {
      this.trigger('tap');
    }
  }

  public cycleIntensity(): HapticIntensity {
    const cycle: HapticIntensity[] = ['soft', 'medium', 'strong', 'off'];
    const nextIdx = (cycle.indexOf(this.config.intensity) + 1) % cycle.length;
    const nextIntensity = cycle[nextIdx];
    this.setIntensity(nextIntensity);
    return nextIntensity;
  }

  public subscribe(listener: (config: HapticConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.config));
  }

  /**
   * Triggers a tailored vibration sequence scaled by the user's intensity preference.
   */
  public trigger(profile: HapticProfile): boolean {
    if (!this.config.enabled || this.config.intensity === 'off') {
      return false;
    }

    const mult = INTENSITY_MULTIPLIERS[this.config.intensity];
    if (mult <= 0) return false;

    const basePattern = BASE_PATTERNS[profile] || [15];
    const scaledPattern = basePattern.map((ms, idx) => {
      // Scale vibration bursts (even indices are vibrate, odd indices are pauses)
      return idx % 2 === 0 ? Math.max(1, Math.round(ms * mult)) : ms;
    });

    if (this.isSupported && navigator.vibrate) {
      try {
        navigator.vibrate(scaledPattern);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  // Quick helper shortcuts
  public tap(): boolean {
    return this.trigger('tap');
  }

  public softTap(): boolean {
    return this.trigger('softTap');
  }

  public medium(): boolean {
    return this.trigger('medium');
  }

  public heavy(): boolean {
    return this.trigger('heavy');
  }

  public petPurr(): boolean {
    return this.trigger('petPurr');
  }

  public shojiSlide(): boolean {
    return this.trigger('shojiSlide');
  }

  public shojiClose(): boolean {
    return this.trigger('shojiClose');
  }

  public sensuOpen(): boolean {
    return this.trigger('sensuOpen');
  }

  public sensuClose(): boolean {
    return this.trigger('sensuClose');
  }

  public taiko(): boolean {
    return this.trigger('taiko');
  }

  public bell(): boolean {
    return this.trigger('bell');
  }

  public omikuji(): boolean {
    return this.trigger('omikuji');
  }

  public evolution(): boolean {
    return this.trigger('evolution');
  }

  public water(): boolean {
    return this.trigger('water');
  }

  public coinsRattle(): boolean {
    return this.trigger('coinsRattle');
  }

  public warning(): boolean {
    return this.trigger('warning');
  }
}

export const hapticEngine = new HapticEngine();
