/**
 * src/hooks/useAudioHaptic.ts
 * Domain state audio & haptic: mute, BGM aktif, dan konfigurasi haptic feedback.
 * Toggle logic memanggil soundEngine langsung; notifikasi toast tetap di komponen.
 */
import { useEffect, useState } from 'react';
import { DayPhase, SeasonType } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine, HapticConfig } from '../utils/hapticFeedback';

export function useAudioHaptic(timePhase: DayPhase, season: SeasonType) {
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);

  // Haptic feedback configuration state (mengikuti konfigurasi global engine)
  const [hapticConfig, setHapticConfig] = useState<HapticConfig>(() => hapticEngine.getConfig());

  useEffect(() => {
    return hapticEngine.subscribe((newCfg) => setHapticConfig(newCfg));
  }, []);

  /** Toggle mute seluruh audio. Mengembalikan status mute terbaru. */
  const toggleMute = (): boolean => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  /**
   * Toggle musik latar Zen. Mengembalikan status BGM terbaru (aktif/tidak).
   * Konfigurasi BGM mengikuti fase waktu hari & musim aktif.
   */
  const toggleBgm = (): boolean => {
    const active = soundEngine.toggleAmbientBGM(timePhase, season);
    setIsBgmActive(active);
    return active;
  };

  return {
    isMuted,
    isBgmActive,
    hapticConfig,
    toggleMute,
    toggleBgm,
  };
}