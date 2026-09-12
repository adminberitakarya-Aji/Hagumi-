/**
 * src/utils/matsuri/taikoLogic.ts
 * Logika murni mini-game Taiko Rhythm (temuan audit Revisi 8, item T2).
 *
 * Diekstrak dari src/components/matsuri/TaikoRhythmGame.tsx agar dapat diuji
 * unit test tanpa React/DOM/audio (pola yang sama dengan src/utils/decayLoop.ts).
 * Fungsi di sini TIDAK boleh punya efek samping selain membaca `random` yang diinjeksi.
 *
 * KONSTANTA mencerminkan perilaku komponen — jika angka di komponen berubah,
 * perbarui di sini dan jalankan `npm run test`.
 */

export interface TaikoNote {
  id: number;
  type: 'don' | 'ka';
  x: number; // 0 to 100%
  hit: boolean;
}

/** Posisi lingkaran target hit (% dari kiri). */
export const HIT_TARGET_X = 20;
/** Jarak maksimum note dari target agar masih bisa dipukul (%). */
export const HIT_WINDOW = 14;
/** Jarak maksimum untuk judgment PERFECT (%). */
export const PERFECT_WINDOW = 4.5;
/** Note dianggap MISS jika melewati garis ini tanpa dipukul (%). */
export const MISS_LINE_X = HIT_TARGET_X - 7;
/** Interval spawn nada (ms). */
export const SPAWN_INTERVAL_MS = 750;
/** Kecepatan note (% per detik). */
export const NOTE_SPEED_PER_SEC = 36;
/** Durasi satu sesi taiko (ms). */
export const GAME_DURATION_MS = 30_000;

export type TaikoJudgment = 'perfect' | 'good' | 'wrong-type';

export interface TaikoJudgmentResult {
  judgment: TaikoJudgment;
  /** Poin yang didapat (0 untuk wrong-type). */
  points: number;
  /** Nilai combo BERIKUTNYA (naik untuk perfect/good, reset untuk wrong-type). */
  nextCombo: number;
}

/**
 * Mencari note yang belum dipukul dengan jarak terdekat ke target.
 * Mengembalikan null jika tidak ada note dalam jendela HIT_WINDOW.
 */
export function findClosestUnhitNote(
  notes: TaikoNote[],
  hitX: number = HIT_TARGET_X
): { note: TaikoNote; distance: number } | null {
  let best: { note: TaikoNote; distance: number } | null = null;
  for (const note of notes) {
    if (note.hit) continue;
    const distance = Math.abs(note.x - hitX);
    if (distance < HIT_WINDOW && (!best || distance < best.distance)) {
      best = { note, distance };
    }
  }
  return best;
}

/**
 * Menilai satu pukulan taiko terhadap note terdekat.
 * - type cocok + jarak ≤ PERFECT_WINDOW → 'perfect' (100 + min(combo×5, 100))
 * - type cocok + jarak > PERFECT_WINDOW → 'good' (50 + min(combo×2, 50))
 * - type salah → 'wrong-type' (0 poin, combo reset)
 */
export function judgeTaikoHit(
  noteType: 'don' | 'ka',
  hitType: 'don' | 'ka',
  distance: number,
  combo: number
): TaikoJudgmentResult {
  if (noteType !== hitType) {
    return { judgment: 'wrong-type', points: 0, nextCombo: 0 };
  }
  if (distance <= PERFECT_WINDOW) {
    return {
      judgment: 'perfect',
      points: 100 + Math.min(combo * 5, 100),
      nextCombo: combo + 1,
    };
  }
  return {
    judgment: 'good',
    points: 50 + Math.min(combo * 2, 50),
    nextCombo: combo + 1,
  };
}

/** Tipe note berikutnya: 65% DON, 35% KA (sesuai perilaku spawn komponen). */
export function nextSpawnType(random: () => number = Math.random): 'don' | 'ka' {
  return random() > 0.35 ? 'don' : 'ka';
}

/**
 * Hitungan reward akhir taiko berdasarkan skor:
 * coins = min(50, max(15, floor(score / 70))); happiness = min(45, max(20, floor(score / 80))).
 */
export function calculateTaikoReward(score: number): { coins: number; happiness: number } {
  return {
    coins: Math.min(50, Math.max(15, Math.floor(score / 70))),
    happiness: Math.min(45, Math.max(20, Math.floor(score / 80))),
  };
}
