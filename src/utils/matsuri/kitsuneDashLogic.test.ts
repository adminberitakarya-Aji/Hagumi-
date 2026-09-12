/**
 * Unit test src/utils/matsuri/kitsuneDashLogic.ts (temuan audit Revisi 8, item T2):
 * tabrakan rintangan, pergerakan/spawn rintangan, dan reward.
 */

import { describe, it, expect } from 'vitest';
import {
  advanceHurdle,
  calculateKitsuneDashReward,
  isHurdleCollision,
  HURDLE_DESPAWN_X,
} from './kitsuneDashLogic';

describe('isHurdleCollision', () => {
  it('tabrak jika rintangan dalam rentang-x rubah DAN rubah di tanah', () => {
    expect(isHurdleCollision(40, 0)).toBe(true);
    expect(isHurdleCollision(26, 10)).toBe(true);
    expect(isHurdleCollision(64, 10)).toBe(true);
  });

  it('aman jika rubah cukup tinggi (foxY ≥ 30)', () => {
    expect(isHurdleCollision(40, 30)).toBe(false);
    expect(isHurdleCollision(40, 65)).toBe(false);
  });

  it('aman jika rintangan di luar rentang-x rubah', () => {
    expect(isHurdleCollision(24, 0)).toBe(false);
    expect(isHurdleCollision(65, 0)).toBe(false);
  });
});

describe('advanceHurdle', () => {
  it('majuan 6 px per tick tanpa event', () => {
    const result = advanceHurdle(300, 0, () => 0.5);
    expect(result).toEqual({ nextX: 294, passed: false, collided: false });
  });

  it('terdeteksi tabrakan saat rubah di tanah', () => {
    const result = advanceHurdle(40, 0, () => 0.5);
    expect(result.collided).toBe(true);
    expect(result.passed).toBe(false);
  });

  it('rintangan yang hilang di kiri → PASSED + spawn ulang di 400..450', () => {
    const result = advanceHurdle(HURDLE_DESPAWN_X, 0, () => 0.5);
    expect(result.passed).toBe(true);
    expect(result.collided).toBe(false);
    expect(result.nextX).toBe(425); // 400 + 0.5×50
  });

  it('spawn ulang: batas bawah 400 (random=0) & atas 450 (random≈1)', () => {
    expect(advanceHurdle(-25, 0, () => 0).nextX).toBe(400);
    expect(advanceHurdle(-25, 0, () => 0.99).nextX).toBeCloseTo(449.5, 5);
  });

  it('rintangan yang mencapai garis despawn (-20) dihitung passed (kondisi <=)', () => {
    const result = advanceHurdle(-14, 0, () => 0.5);
    expect(result.passed).toBe(true); // -14 - 6 = -20 → memenuhi kondisi nextX <= -20
  });
});

describe('calculateKitsuneDashReward', () => {
  it('coins = score×6+10; happiness = score×4+15', () => {
    expect(calculateKitsuneDashReward(0)).toEqual({ coins: 10, happiness: 15 });
    expect(calculateKitsuneDashReward(5)).toEqual({ coins: 40, happiness: 35 });
  });
});
