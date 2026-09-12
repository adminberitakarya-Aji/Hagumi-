/**
 * src/utils/dailyQuest.test.ts
 * P4 (Revisi 6): test quest harian & streak — tanggal lokal, roll hari baru,
 * aturan streak (sama/berurutan/bolong/bonus kelipatan 7), dan integrasi
 * schema save v4 (roundtrip + migrasi v3 + sanitasi korupsi).
 */
import { describe, it, expect } from 'vitest';
import {
  toLocalDateKey,
  shiftDateKey,
  rollDailyState,
  applyStreakOnCompletion,
  createDailyQuestState,
  DAILY_FEED_REWARD,
  DAILY_GAME_REWARD,
  STREAK_BONUS_COINS,
  STREAK_BONUS_EVERY,
} from './dailyQuest';
import {
  parseAndMigratePetSave,
  serializePetSave,
  CURRENT_SCHEMA_VERSION,
} from './petSaveSchema';
import { makePet } from '../test/helpers';

describe('toLocalDateKey & shiftDateKey', () => {
  it('menghasilkan format YYYY-MM-DD lokal', () => {
    expect(toLocalDateKey(new Date(2026, 8, 12, 9, 30))).toBe('2026-09-12');
  });

  it('shift −1 hari lintas bulan & tahun (2026 bukan kabisat)', () => {
    expect(shiftDateKey('2026-09-01', -1)).toBe('2026-08-31');
    expect(shiftDateKey('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDateKey('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('shift +7 hari', () => {
    expect(shiftDateKey('2026-09-25', 7)).toBe('2026-10-02');
  });
});

describe('rollDailyState', () => {
  const TODAY = '2026-09-12';

  it('hari sama → state diteruskan apa adanya (identitas terjaga)', () => {
    const prev = { questDate: TODAY, feedDone: true, gameDone: false, streakCount: 3, lastStreakDate: TODAY, lastBonusStreak: 0 };
    expect(rollDailyState(prev, TODAY)).toBe(prev);
  });

  it('hari baru → quest direset, streak & lastStreakDate dibawa', () => {
    const prev = { questDate: '2026-09-11', feedDone: true, gameDone: true, streakCount: 4, lastStreakDate: '2026-09-11', lastBonusStreak: 0 };
    expect(rollDailyState(prev, TODAY)).toEqual({
      questDate: TODAY,
      feedDone: false,
      gameDone: false,
      streakCount: 4,
      lastStreakDate: '2026-09-11',
      lastBonusStreak: 0,
    });
  });

  it('undefined → state kosong untuk hari tersebut', () => {
    expect(rollDailyState(undefined, TODAY)).toEqual({
      questDate: TODAY, feedDone: false, gameDone: false, streakCount: 0, lastStreakDate: '', lastBonusStreak: 0,
    });
  });

  it('state korup/tidak lengkap → di-sanitize tanpa melempar', () => {
    const rolled = rollDailyState({ questDate: TODAY } as any, TODAY);
    expect(rolled.feedDone).toBe(false);
    expect(rolled.gameDone).toBe(false);
    expect(rolled.streakCount).toBe(0);
  });
});

describe('applyStreakOnCompletion', () => {
  const TODAY = '2026-09-12';
  const base = createDailyQuestState(TODAY);

  it('quest pertama hari ini → streak menjadi 1', () => {
    const res = applyStreakOnCompletion(base, TODAY);
    expect(res).toEqual({ streakCount: 1, lastStreakDate: TODAY, bonusClaimed: false });
  });

  it('aksi kedua di hari sama → streak tidak berubah & tidak dobel', () => {
    const res = applyStreakOnCompletion({ ...base, streakCount: 5, lastStreakDate: TODAY }, TODAY);
    expect(res).toEqual({ streakCount: 5, lastStreakDate: TODAY, bonusClaimed: false });
  });

  it('kemarin → streak +1', () => {
    const res = applyStreakOnCompletion({ ...base, streakCount: 3, lastStreakDate: shiftDateKey(TODAY, -1) }, TODAY);
    expect(res.streakCount).toBe(4);
  });

  it('bolong ≥1 hari → streak reset ke 1 (tanpa hukuman lain)', () => {
    const res = applyStreakOnCompletion({ ...base, streakCount: 12, lastStreakDate: shiftDateKey(TODAY, -2) }, TODAY);
    expect(res.streakCount).toBe(1);
  });

  it('streak 7 → bonus sekali; 8 tidak; 14 (dari lastBonus 7) → bonus lagi', () => {
    const at7 = applyStreakOnCompletion({ ...base, streakCount: 6, lastStreakDate: shiftDateKey(TODAY, -1), lastBonusStreak: 0 }, TODAY);
    expect(at7.streakCount).toBe(7);
    expect(at7.bonusClaimed).toBe(true);

    const at8 = applyStreakOnCompletion({ ...base, streakCount: 7, lastStreakDate: shiftDateKey(TODAY, -1), lastBonusStreak: 7 }, TODAY);
    expect(at8.streakCount).toBe(8);
    expect(at8.bonusClaimed).toBe(false);

    const at14 = applyStreakOnCompletion({ ...base, streakCount: 13, lastStreakDate: shiftDateKey(TODAY, -1), lastBonusStreak: 7 }, TODAY);
    expect(at14.streakCount).toBe(14);
    expect(at14.bonusClaimed).toBe(true);
  });

  it('konstanta reward sesuai docs/02 §9', () => {
    expect(DAILY_FEED_REWARD).toEqual({ coins: 10, exp: 5 });
    expect(DAILY_GAME_REWARD).toEqual({ coins: 15, exp: 10 });
    expect(STREAK_BONUS_COINS).toBe(50);
    expect(STREAK_BONUS_EVERY).toBe(7);
  });
});

describe('integrasi schema save v4', () => {
  const QUEST = { questDate: '2026-09-12', feedDone: true, gameDone: false, streakCount: 8, lastStreakDate: '2026-09-12', lastBonusStreak: 7 };

  it('CURRENT_SCHEMA_VERSION = 4', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe(4);
  });

  it('roundtrip serialize → parse mempertahankan dailyQuest', () => {
    const pet = makePet({ dailyQuest: QUEST });
    const result = parseAndMigratePetSave(serializePetSave(pet));
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.dailyQuest).toEqual(QUEST);
  });

  it('save v3 dimigrasi ke v4; dailyQuest menjadi undefined', () => {
    const result = parseAndMigratePetSave(JSON.stringify({ version: 3, data: makePet() }));
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.dailyQuest).toBeUndefined();
  });

  it('dailyQuest korup di-sanitize (bukan melempar)', () => {
    const result = parseAndMigratePetSave(
      JSON.stringify({ version: 4, data: { ...makePet(), dailyQuest: { streakCount: 'x', feedDone: 'yes' } } })
    );
    if (!result.ok) throw new Error(result.error);
    expect(result.pet.dailyQuest).toEqual({
      questDate: '', feedDone: false, gameDone: false, streakCount: 0, lastStreakDate: '', lastBonusStreak: 0,
    });
  });
});
