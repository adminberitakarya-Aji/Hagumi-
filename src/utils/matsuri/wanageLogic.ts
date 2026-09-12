/**
 * src/utils/matsuri/wanageLogic.ts
 * Logika murni mini-game Wanage (lempar gelang) — temuan audit Revisi 8, item T2.
 *
 * Diekstrak dari src/components/matsuri/WanageGame.tsx agar dapat diuji unit test
 * tanpa React/DOM/audio (pola src/utils/decayLoop.ts).
 *
 * KONSTANTA mencerminkan perilaku komponen — jika angka di komponen berubah,
 * perbarui di sini dan jalankan `npm run test`.
 */

/** Jumlah gelang rotan per sesi. */
export const TOTAL_RINGS = 5;

/** Target sweet spot power meter → poin (Daruma 30→10, Tanuki 60→25, Topeng 85→50). */
export const WANAGE_TARGETS = [
  { center: 30, tolerance: 10, points: 10 },
  { center: 60, tolerance: 10, points: 25 },
  { center: 85, tolerance: 8, points: 50 },
] as const;

/**
 * Menilai satu lemparan berdasarkan posisi power meter.
 * Urutan pengecekan sesuai komponen (30 → 60 → 85); lepas semua target = 0 poin.
 */
export function scoreWanageThrow(power: number): number {
  for (const target of WANAGE_TARGETS) {
    if (Math.abs(power - target.center) < target.tolerance) {
      return target.points;
    }
  }
  return 0;
}

/** Langkah osilasi power meter per tick 30 ms (sesuai komponen: +4, wrap mod 100). */
export function advancePowerMeter(power: number): number {
  return (power + 4) % 100;
}

/**
 * Bonus disiplin Wanage (Revisi 4 bug #5): ketangkasan melatih fokus Kitsune.
 * +8 jika tancapan bagus (skor ≥ 25), +4 jika cukup (≥ 12), else 0.
 */
export function wanageDisciplineBonus(score: number): number {
  return score >= 25 ? 8 : score >= 12 ? 4 : 0;
}

/**
 * Reward akhir sesuai handler komponen:
 * coins = floor(score × 0.8) + 10; happiness = score + 15; discipline = bonus fokus.
 */
export function calculateWanageReward(score: number): {
  coins: number;
  happiness: number;
  discipline: number;
} {
  return {
    coins: Math.floor(score * 0.8) + 10,
    happiness: score + 15,
    discipline: wanageDisciplineBonus(score),
  };
}
