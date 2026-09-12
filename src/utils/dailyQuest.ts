/**
 * src/utils/dailyQuest.ts
 * P4 (Revisi 6): logika murni quest harian & streak retensi HAGUMI.
 *
 * Desain cozy non-punishing:
 *  - 2 quest ringan per hari kalender LOKAL (🖥️ YYYY-MM-DD via toLocaleDateString
 *    'sv-SE' — pola yang sama dengan cooldown meditasi Zen):
 *    1) 🍙 beri makan 1×, 2) 🎏 mainkan 1 mini-game festival.
 *  - Streak = jumlah hari BERTURUT-TURUT menuntaskan minimal 1 quest.
 *    Bolong sehari → kembali ke 1 (tanpa hukuman lain; hadiah tidak pernah
 *    dicabut). Bonus +50 Ryo tiap kelipatan 7.
 *  - Semua fungsi murni & menerima `now` (timestamp) untuk testability.
 *  - PENTING: setiap perubahan nilai/aturan di sini WAJIB dicerminkan di
 *    docs/02_GAMEPLAY_MECHANICS.md (bagian Quest Harian & Streak).
 */

import { DailyQuestState } from '../types/game';

/** Kunci tanggal lokal YYYY-MM-DD (pola 'sv-SE', konsisten dgn Zen Garden). */
export function toLocalDateKey(now: number | Date): string {
  return new Date(now).toLocaleDateString('sv-SE');
}

/** Geser kunci tanggal N hari (aman TZ: diparse sebagai tengah hari lokal). */
export function shiftDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map((part) => parseInt(part, 10));
  const date = new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

/** State kosong untuk tanggal tertentu (streak mulai 0; naik saat quest pertama dituntaskan). */
export function createDailyQuestState(today: string): DailyQuestState {
  return {
    questDate: today,
    feedDone: false,
    gameDone: false,
    streakCount: 0,
    bestStreak: 0,
    lastStreakDate: '',
    lastBonusStreak: 0,
  };
}

/**
 * Roll ke hari baru: jika state masih milik hari lain, quest direset — tetapi
 * streak & tanggal streak terakhir DIBAWA (dihitung ulang saat quest dituntaskan).
 * Sanitasi ringan terhadap state tidak tepercaya.
 */
export function rollDailyState(
  prev: DailyQuestState | undefined,
  today: string
): DailyQuestState {
  if (
    prev &&
    prev.questDate === today &&
    typeof prev.feedDone === 'boolean' &&
    typeof prev.gameDone === 'boolean'
  ) {
    return prev;
  }
  return {
    questDate: today,
    feedDone: false,
    gameDone: false,
    streakCount: typeof prev?.streakCount === 'number' && prev.streakCount > 0 ? prev.streakCount : 0,
    bestStreak: typeof prev?.bestStreak === 'number' && prev.bestStreak >= 0 ? prev.bestStreak : 0,
    lastStreakDate: typeof prev?.lastStreakDate === 'string' ? prev.lastStreakDate : '',
    lastBonusStreak: typeof prev?.lastBonusStreak === 'number' && prev.lastBonusStreak >= 0 ? prev.lastBonusStreak : 0,
  };
}

export interface StreakUpdate {
  streakCount: number;
  lastStreakDate: string;
  /** true jika penuntasan ini memicu bonus streak (kelipatan 7 yang belum diklaim). */
  bonusClaimed: boolean;
}

/**
 * Update streak saat minimal 1 quest dituntaskan hari `today`.
 * - Hari yang sama → streak tidak berubah (dan tidak dihitung ganda).
 * - Hari berurutan (kemarin) → streak +1.
 * - Bolong → streak kembali ke 1.
 */
export function applyStreakOnCompletion(
  state: DailyQuestState,
  today: string
): StreakUpdate {
  if (state.lastStreakDate === today) {
    return { streakCount: state.streakCount, lastStreakDate: state.lastStreakDate, bonusClaimed: false };
  }
  const isConsecutive = state.lastStreakDate === shiftDateKey(today, -1);
  const streakCount = isConsecutive ? state.streakCount + 1 : 1;
  const bonusClaimed = streakCount % 7 === 0 && streakCount > state.lastBonusStreak;
  return { streakCount, lastStreakDate: today, bonusClaimed };
}

/** Reward quest 1 (beri makan): +10 Ryo, +5 EXP. */
export const DAILY_FEED_REWARD = { coins: 10, exp: 5 } as const;
/** Reward quest 2 (mini-game): +15 Ryo, +10 EXP. */
export const DAILY_GAME_REWARD = { coins: 15, exp: 10 } as const;
/** Bonus streak kelipatan 7: +50 Ryo. */
export const STREAK_BONUS_COINS = 50;
/** Kelipatan streak pemicu bonus. */
export const STREAK_BONUS_EVERY = 7;
