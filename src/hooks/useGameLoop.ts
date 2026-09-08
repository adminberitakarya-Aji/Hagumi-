import { useState, useEffect, useRef } from 'react';
import { PetData } from '../types/game';
import {
  CORRUPT_SAVE_BACKUP_KEY,
  parseAndMigratePetSave,
  serializePetSave,
} from '../utils/petSaveSchema';
import { applyDecayTick, applyOfflineDecay } from '../utils/decayLoop';

const STORAGE_KEY = 'HAGUMI_KITSUNE_SAVE_DATA';

export function useGameLoop() {
  const [pet, setPet] = useState<PetData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [offlineAwayMinutes, setOfflineAwayMinutes] = useState<number | null>(null);
  const [offlineCoins, setOfflineCoins] = useState<number>(0);

  // 1. Initial Load from LocalStorage (dengan schema migration & validasi)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const result = parseAndMigratePetSave(saved);
        if (!result.ok) {
          // Save korup / dari schema lebih baru: JANGAN ditimpa diam-diam.
          // Simpan salinan agar pemain/developer masih bisa memulihkannya manual.
          console.error('Failed to load saved pet data:', result.error);
          try {
            localStorage.setItem(CORRUPT_SAVE_BACKUP_KEY, saved);
          } catch {
            /* kegagalan backup diabaikan — jangan blok proses load */
          }
          return;
        }

        const parsed = result.pet;
        const now = Date.now();

        // If player was away for more than 3 minutes, calculate gentle offline decay
        // (logika murni diekstrak ke src/utils/decayLoop.ts agar bisa di-unit-test)
        const away = applyOfflineDecay(parsed, now);
        if (away) {
          setOfflineAwayMinutes(away.awayMinutes);
          setOfflineCoins(away.coins);
          setPet(away.pet);
        } else {
          setPet(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved pet data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persistent Save on every pet state change
  useEffect(() => {
    if (!isLoaded || !pet) return;
    try {
      localStorage.setItem(STORAGE_KEY, serializePetSave(pet));
    } catch (e) {
      console.error('Failed to save pet data:', e);
    }
  }, [pet, isLoaded]);

  // 3. Real-time Game Loop (Tick every 10 seconds)
  useEffect(() => {
    if (!pet || pet.stage === 'egg') return;

    const interval = setInterval(() => {
      setPet((prev) => {
        if (!prev || prev.stage === 'egg') return prev;
        // Logika murni diekstrak ke src/utils/decayLoop.ts agar bisa di-unit-test
        return applyDecayTick(prev, Date.now());
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [pet?.stage]);

  const resetPet = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPet(null);
  };

  const closeOfflineModal = () => {
    setOfflineAwayMinutes(null);
  };

  return {
    pet,
    setPet,
    isLoaded,
    resetPet,
    offlineAwayMinutes,
    offlineCoins,
    closeOfflineModal,
  };
}
