import { useState, useEffect, useRef } from 'react';
import { PetData } from '../types/game';
import {
  CORRUPT_SAVE_BACKUP_KEY,
  parseAndMigratePetSave,
  serializePetSave,
} from '../utils/petSaveSchema';

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
        const elapsedMinutes = (now - parsed.lastInteractionTime) / (1000 * 60);

        // If player was away for more than 3 minutes, calculate gentle offline decay
        if (elapsedMinutes >= 3) {
          const hoursAway = Math.min(24, elapsedMinutes / 60);
          const hungerLoss = Math.min(60, hoursAway * 5);
          const energyRegen = parsed.isSleeping ? Math.min(80, hoursAway * 15) : -Math.min(40, hoursAway * 3);
          const cleanLoss = Math.min(50, hoursAway * 4);

          parsed.stats.hunger = Math.max(15, parsed.stats.hunger - hungerLoss);
          parsed.stats.energy = Math.max(10, Math.min(100, parsed.stats.energy + energyRegen));
          parsed.stats.cleanliness = Math.max(10, Math.min(100, parsed.stats.cleanliness - cleanLoss));

          // Check if 15-minute sleep period completed while offline
          if (parsed.isSleeping && parsed.sleepUntilTimestamp && now >= parsed.sleepUntilTimestamp) {
            parsed.isSleeping = false;
            parsed.sleepUntilTimestamp = undefined;
            parsed.stats.energy = 100;
            parsed.stats.happiness = Math.min(100, parsed.stats.happiness + 20);
          }

          if (hoursAway >= 4 && parsed.poopCount < 2) {
            parsed.poopCount = Math.min(3, parsed.poopCount + 1);
          }

          // Age calculation: 1 day per 24 hours real time
          const ageDays = Math.floor((now - parsed.birthTimestamp) / (1000 * 60 * 60 * 24));
          parsed.ageDays = Math.max(parsed.ageDays, ageDays);

          const welcomeCoins = Math.min(100, Math.floor(hoursAway * 6) + 10);
          parsed.coins += welcomeCoins;
          parsed.lastInteractionTime = now;

          setOfflineAwayMinutes(elapsedMinutes);
          setOfflineCoins(welcomeCoins);
        }

        setPet(parsed);
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

        const isSleeping = prev.isSleeping;

        // Check if 15-minute sleep completed while online
        if (isSleeping && prev.sleepUntilTimestamp && Date.now() >= prev.sleepUntilTimestamp) {
          return {
            ...prev,
            isSleeping: false,
            sleepUntilTimestamp: undefined,
            stats: {
              ...prev.stats,
              energy: 100,
              happiness: Math.min(100, prev.stats.happiness + 20),
            },
            exp: prev.exp + 15,
            lastInteractionTime: Date.now(),
          };
        }

        // Stat decays (Cozy zen pacing: 0.12% per 10s = ~0.72% per minute awake, 0.04% when sleeping)
        const hungerDecay = isSleeping ? 0.04 : 0.12;
        const energyDecay = isSleeping ? -1.1 : 0.15; // Smoothly reaches 100% across 15 min when sleeping (-1.1/10s), gentle drain when awake
        const cleanlinessDecay = 0.12;

        let hunger = Math.max(0, prev.stats.hunger - hungerDecay);
        let energy = Math.max(0, Math.min(100, prev.stats.energy - energyDecay));
        let cleanliness = Math.max(0, prev.stats.cleanliness - cleanlinessDecay);
        let happiness = prev.stats.happiness;
        let health = prev.stats.health;
        let isSick = prev.isSick;
        let poopCount = prev.poopCount;
        let careMistakes = prev.careMistakes;

        // Happiness impact
        if (hunger < 25 || energy < 20 || cleanliness < 25) {
          happiness = Math.max(0, happiness - 0.5);
          careMistakes += 0.05;
        }

        // Random Poop generator: if hunger > 35 and elapsed, chance to poop
        if (!isSleeping && hunger > 30 && poopCount < 4 && Math.random() < 0.08) {
          poopCount = Math.min(4, poopCount + 1);
        }

        // Sickness trigger if very dirty or poop neglected
        if (!isSick && (cleanliness < 20 || poopCount >= 3) && Math.random() < 0.1) {
          isSick = true;
        }

        // Health decay if sick or starving
        if (isSick) {
          health = Math.max(10, health - 0.8);
          happiness = Math.max(10, happiness - 0.5);
        } else if (hunger < 15) {
          health = Math.max(10, health - 0.4);
        } else if (health < 100 && hunger > 60 && cleanliness > 60) {
          health = Math.min(100, health + 0.3); // Natural healing
        }

        // Calculate Care Score (0 - 100)
        // Formula: average of vitals with penalty for mistakes
        const vitalsAvg =
          (hunger + energy + cleanliness + happiness + health) / 5;
        const careScore = Math.max(
          10,
          Math.min(100, Math.round(vitalsAvg - careMistakes * 0.5))
        );

        return {
          ...prev,
          stats: {
            hunger,
            energy,
            cleanliness,
            happiness,
            discipline: prev.stats.discipline,
            health,
          },
          isSick,
          poopCount,
          careScore,
          careMistakes,
          lastInteractionTime: Date.now(),
        };
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
