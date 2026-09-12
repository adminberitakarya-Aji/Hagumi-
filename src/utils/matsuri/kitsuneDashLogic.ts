/**
 * src/utils/matsuri/kitsuneDashLogic.ts
 * Logika murni mini-game Kitsune Dash (runner) — temuan audit Revisi 8, item T2.
 *
 * Diekstrak dari src/components/matsuri/KitsuneDashGame.tsx agar dapat diuji unit
 * test tanpa React/DOM/audio (pola src/utils/decayLoop.ts).
 *
 * KONSTANTA mencerminkan perilaku komponen — jika angka di komponen berubah,
 * perbarui di sini dan jalankan `npm run test`.
 */

/** Rentang tubuh rubah di sumbu-x (rubah di x=40, lebar 30 — komentar komponen). */
export const FOX_X_RANGE = { min: 25, max: 65 } as const;
/** Tinggi lompat minimum untuk aman melewati rintangan (px). */
export const JUMP_CLEAR_Y = 30;
/** Kecepatan rintangan (px per tick 30 ms). */
export const HURDLE_SPEED_PER_TICK = 6;
/** Posisi spawn rintangan baru setelah dilewati. */
export const HURDLE_SPAWN_X = 400;
/** Rentang acak tambahan posisi spawn (400 + random×50). */
export const HURDLE_SPAWN_SPAN = 50;
/** Rintangan dianggap hilang di kiri layar. */
export const HURDLE_DESPAWN_X = -20;

export interface HurdleAdvanceResult {
  nextX: number;
  /** true jika rintangan berhasil dilewati (+1 skor). */
  passed: boolean;
  /** true jika rubah menabrak rintangan (game over). */
  collided: boolean;
}

/** Cek tabrakan: rintangan dalam rentang-x rubah DAN rubah belum cukup tinggi. */
export function isHurdleCollision(hurdleX: number, foxY: number): boolean {
  return (
    hurdleX > FOX_X_RANGE.min && hurdleX < FOX_X_RANGE.max && foxY < JUMP_CLEAR_Y
  );
}

/**
 * Satu tick pergerakan rintangan (pure):
 * - maju `HURDLE_SPEED_PER_TICK`;
 * - jika sudah lewat kiri layar → rintangan dianggap PASSED dan di-spawn ulang
 *   di `HURDLE_SPAWN_X + random × HURDLE_SPAWN_SPAN`;
 * - jika menabrak rubah → COLLIDED (pemanggil yang memicu game over).
 */
export function advanceHurdle(
  hurdleX: number,
  foxY: number,
  random: () => number = Math.random
): HurdleAdvanceResult {
  const nextX = hurdleX - HURDLE_SPEED_PER_TICK;

  if (nextX <= HURDLE_DESPAWN_X) {
    return {
      nextX: HURDLE_SPAWN_X + random() * HURDLE_SPAWN_SPAN,
      passed: true,
      collided: false,
    };
  }

  return { nextX, passed: false, collided: isHurdleCollision(nextX, foxY) };
}

/** Reward akhir: coins = score×6+10; happiness = score×4+15 (sesuai layar tabrakan). */
export function calculateKitsuneDashReward(score: number): { coins: number; happiness: number } {
  return { coins: score * 6 + 10, happiness: score * 4 + 15 };
}
