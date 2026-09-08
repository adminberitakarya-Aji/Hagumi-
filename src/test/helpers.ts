/**
 * src/test/helpers.ts
 * Factory PetData untuk unit test (dipakai lintas file test).
 * Nilai dasar dipilih "sehat & normal" agar test mudah di-override per kasus.
 */

import { PetData } from '../types/game';

const BASE_NOW = 1_700_000_000_000;

export const TEST_NOW = BASE_NOW + 60_000; // 1 menit setelah interaksi terakhir

export function makePet(overrides: Partial<PetData> = {}): PetData {
  return {
    id: 'kitsune_test',
    name: 'Konko',
    element: 'fire',
    stage: 'anak',
    form: 'kogitsune',
    tailCount: 2,
    stats: {
      hunger: 80,
      energy: 80,
      cleanliness: 80,
      happiness: 80,
      discipline: 50,
      health: 100,
    },
    weight: 450,
    ageDays: 2,
    exp: 0,
    level: 3,
    careScore: 80,
    careMistakes: 0,
    hankoSignature: '福',
    birthTimestamp: BASE_NOW - 5 * 86_400_000, // lahir 5 hari lalu
    lastInteractionTime: BASE_NOW,
    lastDecayTime: BASE_NOW,
    isSleeping: false,
    isSick: false,
    poopCount: 0,
    coins: 100,
    inventory: {},
    favoriteFood: 'aburaage',
    generation: 1,
    totalMiniGamesWon: 0,
    ...overrides,
  };
}
