/**
 * Unit test src/utils/matsuri/taikoLogic.ts (temuan audit Revisi 8, item T2):
 * pencarian note terdekat, judgment pukulan (perfect/good/wrong-type),
 * tipe spawn, dan formula reward akhir.
 */

import { describe, it, expect } from 'vitest';
import {
  findClosestUnhitNote,
  judgeTaikoHit,
  nextSpawnType,
  calculateTaikoReward,
  HIT_TARGET_X,
  type TaikoNote,
} from './taikoLogic';

function note(id: number, type: 'don' | 'ka', x: number, hit = false): TaikoNote {
  return { id, type, x, hit };
}

describe('findClosestUnhitNote', () => {
  it('mengembalikan note terdekat dalam jendela hit', () => {
    const notes = [note(1, 'don', 40), note(2, 'don', 24), note(3, 'ka', 10)];
    const result = findClosestUnhitNote(notes, HIT_TARGET_X);
    expect(result?.note.id).toBe(2);
    expect(result?.distance).toBe(4);
  });

  it('mengabaikan note yang sudah dipukul', () => {
    const notes = [note(1, 'don', 21, true), note(2, 'ka', 30)];
    const result = findClosestUnhitNote(notes, HIT_TARGET_X);
    expect(result?.note.id).toBe(2);
  });

  it('mengembalikan null jika tidak ada note dalam jendela hit', () => {
    const notes = [note(1, 'don', 40), note(2, 'ka', 60, true)];
    expect(findClosestUnhitNote(notes, HIT_TARGET_X)).toBeNull();
  });

  it('mengembalikan null untuk daftar kosong', () => {
    expect(findClosestUnhitNote([], HIT_TARGET_X)).toBeNull();
  });
});

describe('judgeTaikoHit', () => {
  it('perfect: type cocok + jarak ≤ 4.5 → 100 + min(combo×5, 100)', () => {
    expect(judgeTaikoHit('don', 'don', 4.5, 0)).toEqual({
      judgment: 'perfect',
      points: 100,
      nextCombo: 1,
    });
    expect(judgeTaikoHit('don', 'don', 0, 10)).toMatchObject({
      judgment: 'perfect',
      points: 150, // 100 + min(10×5, 100) = 150 (cap combo bonus)
      nextCombo: 11,
    });
  });

  it('good: type cocok + jarak > 4.5 → 50 + min(combo×2, 50)', () => {
    expect(judgeTaikoHit('ka', 'ka', 13.9, 0)).toEqual({
      judgment: 'good',
      points: 50,
      nextCombo: 1,
    });
    expect(judgeTaikoHit('ka', 'ka', 8, 25)).toMatchObject({
      judgment: 'good',
      points: 100, // 50 + min(25×2, 50) = 100 (cap)
      nextCombo: 26,
    });
  });

  it('wrong-type: type tidak cocok → 0 poin, combo reset', () => {
    expect(judgeTaikoHit('don', 'ka', 0, 12)).toEqual({
      judgment: 'wrong-type',
      points: 0,
      nextCombo: 0,
    });
    expect(judgeTaikoHit('ka', 'don', 3, 30)).toEqual({
      judgment: 'wrong-type',
      points: 0,
      nextCombo: 0,
    });
  });
});

describe('nextSpawnType', () => {
  it('don jika random > 0.35, ka jika ≤ 0.35', () => {
    expect(nextSpawnType(() => 0.36)).toBe('don');
    expect(nextSpawnType(() => 0.99)).toBe('don');
    expect(nextSpawnType(() => 0.35)).toBe('ka');
    expect(nextSpawnType(() => 0)).toBe('ka');
  });
});

describe('calculateTaikoReward', () => {
  it('skor rendah → floor reward minimum', () => {
    expect(calculateTaikoReward(0)).toEqual({ coins: 15, happiness: 20 });
  });

  it('skor menengah dihitung proporsional (di atas floor minimum)', () => {
    // floor(2000/70)=28 → coins 28; floor(2000/80)=25 → happiness 25
    expect(calculateTaikoReward(2000)).toEqual({ coins: 28, happiness: 25 });
  });

  it('skor tinggi → floor reward maksimum', () => {
    expect(calculateTaikoReward(99999)).toEqual({ coins: 50, happiness: 45 });
  });
});
