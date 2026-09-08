/**
 * src/hooks/useAmbient.ts
 * Domain state lingkungan/visual sanctuary: musim, fase waktu hari, lentera,
 * dan riak klik tatami. Sinkronisasi musim ke pet data ditangani di sini.
 */
import { useEffect, useState } from 'react';
import { PetData, DayPhase, SeasonType } from '../types/game';
import { soundEngine, detectRealSeason } from '../utils/soundEngine';

export interface TatamiRipple {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

/** Kesepakatan waktu: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night */
function computeInitialDayPhase(): DayPhase {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    if (hour < 11) return 'morning';
    if (hour < 15) return 'noon';
    return 'evening';
  }
  return 'night';
}

export function useAmbient(pet: PetData, setPet: React.Dispatch<React.SetStateAction<PetData>>) {
  const [season, setSeason] = useState<SeasonType>(() => {
    if (pet.season) return pet.season;
    return detectRealSeason();
  });

  const [isLanternOn, setIsLanternOn] = useState(true);

  const [timePhase, setTimePhase] = useState<DayPhase>(computeInitialDayPhase);

  // Tatami Interactive Ripple Clicks state
  const [tatamiRipples, setTatamiRipples] = useState<TatamiRipple[]>([]);

  // Sinkronisasi otomatis jam lokal (cek tiap menit)
  useEffect(() => {
    const updateDayPhase = () => {
      const hour = new Date().getHours();
      let nextPhase: DayPhase = 'night';
      if (hour >= 6 && hour < 18) {
        if (hour < 11) nextPhase = 'morning';
        else if (hour < 15) nextPhase = 'noon';
        else nextPhase = 'evening';
      }
      setTimePhase(nextPhase);
    };
    const interval = setInterval(updateDayPhase, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sinkronisasi musik latar Zen (BGM) dengan fase waktu hari & musim aktif
  useEffect(() => {
    if (soundEngine.isBGMActive()) {
      soundEngine.updateBGMConfig(timePhase, season);
    }
  }, [timePhase, season]);

  // Sync season to pet data
  useEffect(() => {
    setPet((prev) => ({
      ...prev,
      season,
    }));
  }, [season, setPet]);

  return {
    season,
    setSeason,
    isLanternOn,
    setIsLanternOn,
    timePhase,
    tatamiRipples,
    setTatamiRipples,
  };
}