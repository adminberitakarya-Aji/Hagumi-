/**
 * src/utils/lineage.test.ts
 * P5 (Revisi 6): test Restu Silsilah — perhitungan warisan bounded, rekam/baca
 * blessing (localStorage terpisah), dan integrasi schema save v5 (roundtrip,
 * migrasi v4, sanitasi korupsi, bestStreak).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  LINEAGE_COIN_CAP,
  LINEAGE_BLESSING_KEY,
  computeInheritedCoins,
  createLineageBlessing,
  recordLineageBlessing,
  readPendingLineageBlessing,
} from './lineage';
import {
  parseAndMigratePetSave,
  serializePetSave,
  CURRENT_SCHEMA_VERSION,
} from './petSaveSchema';
import { makePet } from '../test/helpers';

const QUEST = {
  questDate: '2026-09-12',
  feedDone: true,
  gameDone: true,
  streakCount: 12,
  bestStreak: 12,
  lastStreakDate: '2026-09-12',
  lastBonusStreak: 7,
};

describe('computeInheritedCoins (bounded, anti-inflasi)', () => {
  it('contoh docs/02 §10.2: Lv.40 + streak 12 → 224', () => {
    expect(computeInheritedCoins(40, 12)).toBe(224);
  });

  it('di-cap pada 500 Ryo', () => {
    expect(computeInheritedCoins(999, 999)).toBe(LINEAGE_COIN_CAP);
    expect(LINEAGE_COIN_CAP).toBe(500);
  });

  it('nilai tidak valid → 0', () => {
    expect(computeInheritedCoins(0, 0)).toBe(0);
    expect(computeInheritedCoins(NaN, -5)).toBe(0);
  });
});

describe('createLineageBlessing', () => {
  it('targetGeneration = generasi elder + 1; metadata tersalin; bestStreak dari dailyQuest', () => {
    const pet = makePet({ name: 'Konko', level: 40, tailCount: 7, generation: 2, dailyQuest: QUEST });
    const blessing = createLineageBlessing(pet);
    expect(blessing.targetGeneration).toBe(3);
    expect(blessing.elderName).toBe('Konko');
    expect(blessing.elderLevel).toBe(40);
    expect(blessing.elderTails).toBe(7);
    expect(blessing.bestStreak).toBe(12);
    expect(blessing.inheritedCoins).toBe(224);
    expect(blessing.recordedAt).toBeGreaterThan(0);
  });

  it('tanpa dailyQuest (save lama) → bestStreak 0, warisan dari level saja', () => {
    const pet = makePet({ level: 10, generation: 1 });
    const blessing = createLineageBlessing(pet);
    expect(blessing.bestStreak).toBe(0);
    expect(blessing.inheritedCoins).toBe(50);
  });
});

describe('storage blessing (localStorage terpisah)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('record → read roundtrip; read saat kosong → null', () => {
    expect(readPendingLineageBlessing()).toBeNull();
    const pet = makePet({ level: 20, generation: 1, dailyQuest: QUEST });
    const recorded = recordLineageBlessing(pet);
    expect(recorded).not.toBeNull();
    const read = readPendingLineageBlessing();
    expect(read).toEqual(recorded);
  });

  it('blessing korup → null (tidak melempar)', () => {
    localStorage.setItem(LINEAGE_BLESSING_KEY, '{bukan-json');
    expect(readPendingLineageBlessing()).toBeNull();
  });
});

describe('integrasi schema save v5', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('CURRENT_SCHEMA_VERSION = 5', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(5);
  });

  it('roundtrip serialize → parse mempertahankan lineage & bestStreak', () => {
    const pet = makePet({
      generation: 3,
      lineage: {
        targetGeneration: 3,
        elderName: 'Kaze',
        elderLevel: 28,
        elderForm: 'zenko',
        elderTails: 7,
        bestStreak: 9,
        inheritedCoins: 155,
        recordedAt: 1_700_000_000_000,
      },
      dailyQuest: QUEST,
    });
    const result = parseAndMigratePetSave(serializePetSave(pet));
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.lineage?.elderName).toBe('Kaze');
    expect(result.pet.lineage?.inheritedCoins).toBe(155);
    expect(result.pet.dailyQuest?.bestStreak).toBe(12);
  });

  it('save v4 dimigrasi ke v5; lineage undefined; bestStreak diisi dari streakCount', () => {
    const pet = makePet({ dailyQuest: { questDate: '2026-09-12', feedDone: true, gameDone: true, streakCount: 5, bestStreak: 5, lastStreakDate: '2026-09-12', lastBonusStreak: 0 } });
    const result = parseAndMigratePetSave(JSON.stringify({ version: 4, data: pet }));
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.lineage).toBeUndefined();
    expect(result.pet.dailyQuest?.bestStreak).toBe(5);
  });

  it('lineage korup → undefined (bukan melempar)', () => {
    const result = parseAndMigratePetSave(
      JSON.stringify({ version: 5, data: { ...makePet(), lineage: { targetGeneration: 1 } } })
    );
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.lineage).toBeUndefined();
  });
});
