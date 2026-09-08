/**
 * src/utils/decayLoop.ts
 * Logika murni (pure functions) untuk decay tick & decay offline HAGUMI.
 *
 * Diekstrak dari src/hooks/useGameLoop.ts agar dapat diuji unit test tanpa
 * React/DOM/localStorage (lihat src/utils/decayLoop.test.ts). Fungsi di sini
 * tidak boleh punya efek samping selain membaca Math.random & Date.now().
 *
 * PENTING: setiap perubahan nilai di sini WAJIB dicerminkan di
 * docs/02_GAMEPLAY_MECHANICS.md (Revisi 2).
 */

import { PetData } from '../types/game';

/**
 * Satu tick decay (dipanggil tiap 10 detik selama tab aktif).
 * Asumsi: `prev` valid & bukan telur (guard dilakukan pemanggil).
 * Pure: selalu mengembalikan objek PetData baru; `now` diinjeksi agar testable.
 */
export function applyDecayTick(prev: PetData, now: number): PetData {
  const isSleeping = prev.isSleeping;

  // Check if 15-minute sleep completed while online
  if (isSleeping && prev.sleepUntilTimestamp && now >= prev.sleepUntilTimestamp) {
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
      lastInteractionTime: now,
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
    lastInteractionTime: now,
  };
}

export interface OfflineDecayResult {
  pet: PetData;
  awayMinutes: number;
  coins: number;
}

/**
 * Decay lembut saat pemain pergi. Mengembalikan null jika pergi < 3 menit
 * (tanpa efek sama sekali — cocok dengan perilaku lama useGameLoop).
 * Pure: input tidak dimutasi; hasil berupa objek PetData baru.
 */
export function applyOfflineDecay(
  pet: PetData,
  now: number
): OfflineDecayResult | null {
  const elapsedMinutes = (now - pet.lastInteractionTime) / (1000 * 60);
  if (elapsedMinutes < 3) return null;

  const next: PetData = { ...pet, stats: { ...pet.stats } };

  // If player was away for more than 3 minutes, calculate gentle offline decay
  const hoursAway = Math.min(24, elapsedMinutes / 60);
  const hungerLoss = Math.min(60, hoursAway * 5);
  const energyRegen = next.isSleeping ? Math.min(80, hoursAway * 15) : -Math.min(40, hoursAway * 3);
  const cleanLoss = Math.min(50, hoursAway * 4);

  next.stats.hunger = Math.max(15, next.stats.hunger - hungerLoss);
  next.stats.energy = Math.max(10, Math.min(100, next.stats.energy + energyRegen));
  next.stats.cleanliness = Math.max(10, Math.min(100, next.stats.cleanliness - cleanLoss));

  // Check if 15-minute sleep period completed while offline
  if (next.isSleeping && next.sleepUntilTimestamp && now >= next.sleepUntilTimestamp) {
    next.isSleeping = false;
    next.sleepUntilTimestamp = undefined;
    next.stats.energy = 100;
    next.stats.happiness = Math.min(100, next.stats.happiness + 20);
  }

  if (hoursAway >= 4 && next.poopCount < 2) {
    next.poopCount = Math.min(3, next.poopCount + 1);
  }

  // Age calculation: 1 day per 24 hours real time
  const ageDays = Math.floor((now - next.birthTimestamp) / (1000 * 60 * 60 * 24));
  next.ageDays = Math.max(next.ageDays, ageDays);

  const welcomeCoins = Math.min(100, Math.floor(hoursAway * 6) + 10);
  next.coins += welcomeCoins;
  next.lastInteractionTime = now;

  return { pet: next, awayMinutes: elapsedMinutes, coins: welcomeCoins };
}
