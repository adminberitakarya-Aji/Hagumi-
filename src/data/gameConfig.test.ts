/**
 * Unit test formula gameplay di src/data/gameConfig.ts
 * (kurva EXP, multi-level-up, evolusi bercabang, Kizuna Bond, sanity data).
 * Nilai ekspektasi kurva EXP diverifikasi via perhitungan Node (lihat audit.md).
 */

import { describe, it, expect } from 'vitest';
import {
  getRequiredExp,
  addPetExp,
  determineNextEvolution,
  getBondingLevelInfo,
  BONDING_MILESTONES,
  ELEMENTS_CONFIG,
  FOOD_ITEMS,
  ACCESSORIES_CATALOG,
  MEMORY_SCROLL_ENTRIES,
} from './gameConfig';

describe('getRequiredExp — kurva EXP floor(40 × L^1.35 + 60)', () => {
  it.each([
    [1, 100],
    [2, 161],
    [3, 236],
    [5, 411],
    [10, 955],
    [15, 1608],
    [25, 3145],
    [40, 5878],
    [50, 7924],
  ])('level %i membutuhkan %i EXP', (level, expected) => {
    expect(getRequiredExp(level)).toBe(expected);
  });

  it('monoton naik untuk level berurutan', () => {
    for (let l = 1; l <= 60; l++) {
      expect(getRequiredExp(l + 1)).toBeGreaterThan(getRequiredExp(l));
    }
  });

  it('level < 1 diperlakukan sebagai level 1', () => {
    expect(getRequiredExp(0)).toBe(getRequiredExp(1));
    expect(getRequiredExp(-5)).toBe(100);
  });
});

describe('addPetExp — multi-level-up', () => {
  it('tidak naik level jika EXP belum cukup', () => {
    const res = addPetExp(0, 1, 99);
    expect(res).toEqual({
      newExp: 99,
      newLevel: 1,
      leveledUp: false,
      levelsGained: 0,
    });
  });

  it('naik level tepat di boundary (EXP = kebutuhan)', () => {
    const res = addPetExp(0, 1, 100);
    expect(res.newLevel).toBe(2);
    expect(res.newExp).toBe(0);
    expect(res.leveledUp).toBe(true);
    expect(res.levelsGained).toBe(1);
  });

  it('sisa EXP dibawa ke level berikutnya', () => {
    const res = addPetExp(0, 1, 150);
    expect(res.newLevel).toBe(2);
    expect(res.newExp).toBe(50);
  });

  it('multi-level-up dalam satu penambahan (300 EXP → Lv 3)', () => {
    // L1: 100 → sisa 200; L2: 161 → sisa 39; L3: 236 tidak tercapai
    const res = addPetExp(0, 1, 300);
    expect(res.newLevel).toBe(3);
    expect(res.newExp).toBe(39);
    expect(res.levelsGained).toBe(2);
  });

  it('gain besar: invarian sisa EXP < kebutuhan level baru', () => {
    const res = addPetExp(0, 1, 100_000);
    expect(res.leveledUp).toBe(true);
    expect(res.newLevel).toBeGreaterThan(10);
    expect(res.newExp).toBeLessThan(getRequiredExp(res.newLevel));
  });

  it('gain 0 tidak mengubah apa pun', () => {
    const res = addPetExp(50, 3, 0);
    expect(res.newExp).toBe(50);
    expect(res.newLevel).toBe(3);
    expect(res.leveledUp).toBe(false);
  });
});

describe('determineNextEvolution — evolusi bercabang', () => {
  it('telur → bayi (Kitsunebi, 1 ekor)', () => {
    const evo = determineNextEvolution('egg', 0, 0, 0, 0);
    expect(evo).toMatchObject({ stage: 'bayi', form: 'kitsunebi', tailCount: 1 });
  });

  it('bayi Lv < 3 belum berevolusi; Lv 3 → Kogitsune (2 ekor)', () => {
    expect(determineNextEvolution('bayi', 2, 0, 90, 90)).toBeNull();
    // ageDays tidak dipakai sebagai gate di kode saat ini (metadata saja)
    expect(determineNextEvolution('bayi', 3, 0, 90, 90)).toMatchObject({
      stage: 'anak',
      form: 'kogitsune',
      tailCount: 2,
    });
  });

  it('anak Lv < 6 belum berevolusi; Lv 6 → Wakahitsune (3 ekor)', () => {
    expect(determineNextEvolution('anak', 5, 2, 90, 90)).toBeNull();
    expect(determineNextEvolution('anak', 6, 2, 90, 90)).toMatchObject({
      stage: 'remaja',
      form: 'wakahitsune',
      tailCount: 3,
    });
  });

  it('remaja Lv < 10 belum berevolusi', () => {
    expect(determineNextEvolution('remaja', 9, 4, 90, 90)).toBeNull();
  });

  it('cabang Dewasa: careScore ≥ 85 → Tenko (9 ekor), prioritas tertinggi', () => {
    expect(determineNextEvolution('remaja', 10, 5, 90, 0)).toMatchObject({
      form: 'tenko',
      tailCount: 9,
    });
    expect(determineNextEvolution('remaja', 10, 5, 85, 100)).toMatchObject({
      form: 'tenko',
      tailCount: 9,
    });
  });

  it('cabang Dewasa: careScore ≥ 70 & discipline ≥ 70 → Zenko (7 ekor)', () => {
    expect(determineNextEvolution('remaja', 10, 5, 84, 70)).toMatchObject({
      form: 'zenko',
      tailCount: 7,
    });
    expect(determineNextEvolution('remaja', 10, 5, 70, 70)).toMatchObject({
      form: 'zenko',
      tailCount: 7,
    });
  });

  it('cabang Dewasa: careScore ≥ 50 (disiplin kurang) → Yako (5 ekor)', () => {
    expect(determineNextEvolution('remaja', 10, 5, 84, 69)).toMatchObject({
      form: 'yako',
      tailCount: 5,
    });
    expect(determineNextEvolution('remaja', 10, 5, 70, 30)).toMatchObject({
      form: 'yako',
      tailCount: 5,
    });
    expect(determineNextEvolution('remaja', 10, 5, 50, 0)).toMatchObject({
      form: 'yako',
      tailCount: 5,
    });
  });

  it('cabang Dewasa: careScore < 50 → Nogitsune (4 ekor, fallback)', () => {
    expect(determineNextEvolution('remaja', 10, 5, 49, 0)).toMatchObject({
      form: 'nogitsune',
      tailCount: 4,
    });
    expect(determineNextEvolution('remaja', 10, 5, 0, 0)).toMatchObject({
      form: 'nogitsune',
      tailCount: 4,
    });
  });

  it('stage dewasa/mistik tidak berevolusi lagi', () => {
    expect(determineNextEvolution('dewasa', 50, 99, 99, 99)).toBeNull();
    expect(determineNextEvolution('mistik', 50, 99, 99, 99)).toBeNull();
  });
});

describe('getBondingLevelInfo — Kizuna Bond 5 level', () => {
  it.each([
    [0, 1, 'Kenalan Kuil'],
    [99, 1, 'Kenalan Kuil'],
    [100, 2, 'Teman Berbagi Teh'],
    [249, 2, 'Teman Berbagi Teh'],
    [250, 3, 'Penjaga Doa Ema'],
    [499, 3, 'Penjaga Doa Ema'],
    [500, 4, 'Jiwa Senada'],
    [849, 4, 'Jiwa Senada'],
    [850, 5, 'Ikatan Mistis Abadi'],
    [99_999, 5, 'Ikatan Mistis Abadi'],
  ])('%i poin → Level %i "%s"', (points, level, title) => {
    const info = getBondingLevelInfo(points);
    expect(info.level).toBe(level);
    expect(info.currentMilestone.title).toBe(title);
  });

  it('level tertinggi tidak punya milestone berikutnya & progress 100%', () => {
    const info = getBondingLevelInfo(99_999);
    expect(info.nextMilestone).toBeNull();
    expect(info.progressPercent).toBe(100);
  });

  it('progress di tengah range dihitung benar (175 poin → 50%)', () => {
    const info = getBondingLevelInfo(175);
    expect(info.level).toBe(2);
    expect(info.progressPercent).toBe(50);
  });

  it('poin negatif diperlakukan sebagai 0', () => {
    expect(getBondingLevelInfo(-10).level).toBe(1);
  });
});

describe('sanity data katalog', () => {
  it('ELEMENTS_CONFIG memuat tepat 6 elemen lengkap', () => {
    const elements = Object.values(ELEMENTS_CONFIG);
    expect(elements).toHaveLength(6);
    for (const el of elements) {
      expect(el.kanji.length).toBeGreaterThan(0);
      expect(el.primaryColor).toMatch(/^#/);
      expect(el.auraColor).toMatch(/rgba\(/);
    }
  });

  it('FOOD_ITEMS: id konsisten, harga & efek non-negatif', () => {
    for (const [key, food] of Object.entries(FOOD_ITEMS)) {
      expect(food.id).toBe(key);
      expect(food.price).toBeGreaterThanOrEqual(0);
      expect(food.hunger).toBeGreaterThanOrEqual(0);
      expect(food.iconEmoji.length).toBeGreaterThan(0);
    }
  });

  it('ACCESSORIES_CATALOG: id unik, kategori valid, harga & unlockLevel wajar', () => {
    const ids = ACCESSORIES_CATALOG.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const acc of ACCESSORIES_CATALOG) {
      expect(['neck', 'head']).toContain(acc.category);
      expect(acc.price).toBeGreaterThanOrEqual(0);
      expect(acc.unlockLevel).toBeGreaterThanOrEqual(1);
    }
  });

  it('BONDING_MILESTONES: 5 level, minPoints menaik ketat', () => {
    expect(BONDING_MILESTONES).toHaveLength(5);
    for (let i = 0; i < BONDING_MILESTONES.length; i++) {
      expect(BONDING_MILESTONES[i].level).toBe(i + 1);
      if (i > 0) {
        expect(BONDING_MILESTONES[i].minPoints).toBeGreaterThan(
          BONDING_MILESTONES[i - 1].minPoints
        );
      }
    }
  });

  it('MEMORY_SCROLL_ENTRIES: id unik', () => {
    const ids = MEMORY_SCROLL_ENTRIES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
