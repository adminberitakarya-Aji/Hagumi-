/**
 * Unit test src/utils/matsuri/kingyoLogic.ts (temuan audit Revisi 8, item T2):
 * spawn ikan, pergerakan & pantulan, deteksi sidukan, kerusakan poi, dan reward.
 */

import { describe, it, expect } from 'vitest';
import {
  spawnInitialFish,
  moveFishes,
  findCaughtFishId,
  applyPoiDamage,
  respawnFish,
  calculateKingyoReward,
  poiDurabilityTier,
  FISH_COUNT,
  type KingyoFish,
} from './kingyoLogic';

// Deterministik: semua random → 0.5
const HALF = () => 0.5;

function fish(overrides: Partial<KingyoFish> = {}): KingyoFish {
  return {
    id: 1,
    x: 100,
    y: 100,
    vx: 1,
    vy: 1,
    color: '#ea580c',
    size: 16,
    ...overrides,
  };
}

describe('spawnInitialFish', () => {
  it('membuat 7 ikan dengan warna bergantian oranye/merah', () => {
    const fishes = spawnInitialFish(HALF);
    expect(fishes).toHaveLength(FISH_COUNT);
    expect(fishes[0].color).toBe('#ea580c');
    expect(fishes[1].color).toBe('#dc2626');
    expect(fishes[6].color).toBe('#ea580c');
  });

  it('posisi ikan berada dalam rentang spawn', () => {
    const fishes = spawnInitialFish(HALF);
    for (const f of fishes) {
      expect(f.x).toBeGreaterThanOrEqual(40);
      expect(f.x).toBeLessThanOrEqual(280);
      expect(f.y).toBeGreaterThanOrEqual(40);
      expect(f.y).toBeLessThanOrEqual(200);
    }
  });
});

describe('moveFishes', () => {
  it('memindahkan ikan sesuai kecepatan tanpa memutasi input', () => {
    const input = [fish({ x: 100, y: 100, vx: 2, vy: -3 })];
    const result = moveFishes(input);
    expect(result[0].x).toBe(102);
    expect(result[0].y).toBe(97);
    expect(result[0].vx).toBe(2);
    expect(result[0].vy).toBe(-3);
    expect(input[0].x).toBe(100); // tidak dimutasi
  });

  it('membalikkan arah vx saat menembus batas horizontal', () => {
    const result = moveFishes([fish({ x: 319, vx: 2 })]); // 319+2=321 > 320
    expect(result[0].vx).toBe(-2);
  });

  it('membalikkan arah vy saat menembus batas vertikal', () => {
    const result = moveFishes([fish({ y: 19, vy: -2 })]); // 19-2=17 < 20
    expect(result[0].vy).toBe(2);
  });
});

describe('findCaughtFishId', () => {
  const fishes = [fish({ id: 1, x: 100, y: 100 }), fish({ id: 2, x: 200, y: 150 })];

  it('menemukan ikan dalam radius 28 px', () => {
    expect(findCaughtFishId(fishes, 110, 105)).toBe(1);
  });

  it('mengembalikan -1 jika klik meleset', () => {
    expect(findCaughtFishId(fishes, 0, 0)).toBe(-1);
  });
});

describe('applyPoiDamage', () => {
  it('mengurangi ketahanan 18 per sidukan', () => {
    expect(applyPoiDamage(100)).toBe(82);
  });

  it('tidak pernah di bawah 0', () => {
    expect(applyPoiDamage(10)).toBe(0);
    expect(applyPoiDamage(0)).toBe(0);
  });
});

describe('poiDurabilityTier', () => {
  it('emerald > 50, amber > 25, rose sisanya', () => {
    expect(poiDurabilityTier(51)).toBe('emerald');
    expect(poiDurabilityTier(50)).toBe('amber');
    expect(poiDurabilityTier(26)).toBe('amber');
    expect(poiDurabilityTier(25)).toBe('rose');
    expect(poiDurabilityTier(0)).toBe('rose');
  });
});

describe('respawnFish', () => {
  it('hanya merespons ikan dengan id yang cocok', () => {
    const other = fish({ id: 2 });
    expect(respawnFish(other, 1, HALF)).toBe(other); // referensi sama (tidak berubah)
    // Dengan random=0.5: x=40+0.5×240=160, y=40+0.5×160=120, vx/vy=(0.5-0.5)×3=0
    const respawned = respawnFish(fish({ id: 1, x: 100, y: 100 }), 1, HALF);
    expect(respawned.x).toBe(160);
    expect(respawned.y).toBe(120);
    expect(respawned.vx).toBe(0);
    expect(respawned.vy).toBe(0);
  });
});

describe('calculateKingyoReward', () => {
  it('coins = score×8+5, happiness = score×5+10', () => {
    expect(calculateKingyoReward(0)).toEqual({ coins: 5, happiness: 10 });
    expect(calculateKingyoReward(3)).toEqual({ coins: 29, happiness: 25 });
    expect(calculateKingyoReward(7)).toEqual({ coins: 61, happiness: 45 });
  });
});
