/**
 * Unit test src/utils/matsuri/wanageLogic.ts (temuan audit Revisi 8, item T2):
 * penilaian lemparan sweet spot, osilasi power meter, bonus disiplin, dan reward.
 */

import { describe, it, expect } from 'vitest';
import {
  scoreWanageThrow,
  advancePowerMeter,
  wanageDisciplineBonus,
  calculateWanageReward,
  TOTAL_RINGS,
} from './wanageLogic';

describe('scoreWanageThrow', () => {
  it('target Daruma (power ≈ 30, toleransi < 10) → 10 poin', () => {
    expect(scoreWanageThrow(30)).toBe(10);
    expect(scoreWanageThrow(21)).toBe(10);
    expect(scoreWanageThrow(39)).toBe(10);
  });

  it('target Tanuki (power ≈ 60, toleransi < 10) → 25 poin', () => {
    expect(scoreWanageThrow(60)).toBe(25);
    expect(scoreWanageThrow(51)).toBe(25);
  });

  it('target Topeng Kitsune (power ≈ 85, toleransi < 8) → 50 poin', () => {
    expect(scoreWanageThrow(85)).toBe(50);
    expect(scoreWanageThrow(78)).toBe(50);
  });

  it('meleset semua target → 0 poin', () => {
    expect(scoreWanageThrow(0)).toBe(0);
    expect(scoreWanageThrow(45)).toBe(0);
    expect(scoreWanageThrow(72)).toBe(0);
    expect(scoreWanageThrow(99)).toBe(0);
  });

  it('urutan pengecekan sesuai komponen (30 → 60 → 85): 21 kena Daruma dulu', () => {
    // 21 aman untuk Daruma (|21-30|=9 < 10) — bukan 0
    expect(scoreWanageThrow(21)).toBe(10);
  });
});

describe('advancePowerMeter', () => {
  it('majuan +4 per tick', () => {
    expect(advancePowerMeter(0)).toBe(4);
    expect(advancePowerMeter(50)).toBe(54);
  });

  it('wrap mod 100', () => {
    expect(advancePowerMeter(97)).toBe(1);
    expect(advancePowerMeter(99)).toBe(3);
  });
});

describe('wanageDisciplineBonus', () => {
  it('≥ 25 → +8 (tancapan bagus)', () => {
    expect(wanageDisciplineBonus(25)).toBe(8);
    expect(wanageDisciplineBonus(50)).toBe(8);
    expect(wanageDisciplineBonus(85)).toBe(8);
  });

  it('≥ 12 → +4 (cukup)', () => {
    expect(wanageDisciplineBonus(12)).toBe(4);
    expect(wanageDisciplineBonus(20)).toBe(4);
  });

  it('< 12 → 0', () => {
    expect(wanageDisciplineBonus(0)).toBe(0);
    expect(wanageDisciplineBonus(11)).toBe(0);
  });
});

describe('calculateWanageReward', () => {
  it('coins = floor(score×0.8)+10; happiness = score+15; discipline sesuai bonus', () => {
    expect(calculateWanageReward(0)).toEqual({ coins: 10, happiness: 15, discipline: 0 });
    expect(calculateWanageReward(25)).toEqual({ coins: 30, happiness: 40, discipline: 8 });
    expect(calculateWanageReward(12)).toEqual({ coins: 19, happiness: 27, discipline: 4 });
  });

  it('TOTAL_RINGS sesuai UI (5 gelang per sesi)', () => {
    expect(TOTAL_RINGS).toBe(5);
  });
});
