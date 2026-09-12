/**
 * src/hooks/useDailyQuest.test.ts
 * P4 (Revisi 6): test hook quest harian — reward auto-claim (feed/game),
 * guard anti-dobel dalam satu hari, dan streak lintas hari (fake timers).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDailyQuest } from './useDailyQuest';
import { makePet } from '../test/helpers';
import type { PetData } from '../types/game';

vi.mock('../utils/soundEngine', () => ({
  soundEngine: new Proxy({}, { get: () => vi.fn() }),
}));
vi.mock('../utils/hapticFeedback', () => ({
  hapticEngine: new Proxy({}, { get: () => vi.fn() }),
}));

/** Harness: setPet meniru React (updater(prev) diterapkan ke state terkini). */
function createHarness(pet: PetData) {
  let state = pet;
  const setPet = vi.fn((action: PetData | ((prev: PetData) => PetData)) => {
    state = typeof action === 'function' ? action(state) : action;
  });
  const showToast = vi.fn();
  return { getState: () => state, setPet, showToast };
}

afterEach(() => {
  vi.useRealTimers();
});

const DAY1 = new Date(2026, 8, 12, 10, 0).getTime();
const DAY2 = new Date(2026, 8, 13, 10, 0).getTime();

describe('useDailyQuest', () => {
  it('quest makan: +10 Ryo & +5 EXP, feedDone true, toast muncul', () => {
    vi.setSystemTime(DAY1);
    const h = createHarness(makePet({ coins: 100, exp: 0, level: 3 }));
    const { result } = renderHook(() => useDailyQuest({ pet: h.getState(), setPet: h.setPet, showToast: h.showToast }));

    act(() => result.current.markQuestDone('feed'));

    expect(h.getState().coins).toBe(110);
    expect(h.getState().exp).toBe(5);
    expect(h.getState().dailyQuest?.feedDone).toBe(true);
    expect(h.getState().dailyQuest?.streakCount).toBe(1);
    expect(h.showToast).toHaveBeenCalledWith(expect.stringContaining('Misi Harian'));
  });

  it('guard anti-dobel: aksi kedua di hari sama tidak memberi reward lagi', () => {
    vi.setSystemTime(DAY1);
    const h = createHarness(makePet({ coins: 100 }));
    const { result, rerender } = renderHook(
      ({ pet }: { pet: PetData }) => useDailyQuest({ pet, setPet: h.setPet, showToast: h.showToast }),
      { initialProps: { pet: h.getState() } }
    );

    act(() => result.current.markQuestDone('feed'));
    rerender({ pet: h.getState() });
    act(() => result.current.markQuestDone('feed'));

    expect(h.getState().coins).toBe(110); // tetap sekali reward
    expect(h.setPet).toHaveBeenCalledTimes(1);
  });

  it('quest mini-game: +15 Ryo & +10 EXP', () => {
    vi.setSystemTime(DAY1);
    const h = createHarness(makePet({ coins: 0, exp: 0, level: 3 }));
    const { result } = renderHook(() => useDailyQuest({ pet: h.getState(), setPet: h.setPet, showToast: h.showToast }));

    act(() => result.current.markQuestDone('game'));

    expect(h.getState().coins).toBe(15);
    expect(h.getState().exp).toBe(10);
    expect(h.getState().dailyQuest?.gameDone).toBe(true);
  });

  it('streak lintas hari: hari 1 makan, hari 2 mini-game → streak 2', () => {
    vi.setSystemTime(DAY1);
    const h = createHarness(makePet());
    const { result, rerender } = renderHook(
      ({ pet }: { pet: PetData }) => useDailyQuest({ pet, setPet: h.setPet, showToast: h.showToast }),
      { initialProps: { pet: h.getState() } }
    );

    act(() => result.current.markQuestDone('feed'));
    rerender({ pet: h.getState() });

    vi.setSystemTime(DAY2);
    act(() => result.current.markQuestDone('game'));

    const q = h.getState().dailyQuest!;
    expect(q.gameDone).toBe(true);
    expect(q.streakCount).toBe(2);
    expect(q.questDate).toBe('2026-09-13');
    // feedDone sengaja di-reset saat roll ke hari baru (misi kemarin tidak
    // dibawa — yang dibawa hanya streak); quest baru mulai dari kosong.
    expect(q.feedDone).toBe(false);
  });

  it('bonus streak kelipatan 7: +50 Ryo ekstra & lastBonusStreak tercatat', () => {
    vi.setSystemTime(DAY2);
    const h = createHarness(
      makePet({
        coins: 100,
        dailyQuest: {
          questDate: '2026-09-12',
          feedDone: true,
          gameDone: false,
          streakCount: 6,
          lastStreakDate: '2026-09-12', // KEMARIN (fake time = 2026-09-13) → berurutan
          lastBonusStreak: 0,
        },
      })
    );
    const { result } = renderHook(() => useDailyQuest({ pet: h.getState(), setPet: h.setPet, showToast: h.showToast }));

    act(() => result.current.markQuestDone('game'));

    expect(h.getState().coins).toBe(100 + 15 + 50); // reward + bonus
    expect(h.getState().dailyQuest?.streakCount).toBe(7);
    expect(h.getState().dailyQuest?.lastBonusStreak).toBe(7);
    expect(h.showToast).toHaveBeenCalledWith(expect.stringContaining('Streak 7 hari'));
  });
});
