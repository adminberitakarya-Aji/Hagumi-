/**
 * src/utils/sleepReward.ts
 * Keputusan reward bangun tidur Kitsune — menutup eksploit siklus
 * "tidur → Bangunkan Awal → tidur lagi" (+14 EXP & +25 energi per ~5 detik).
 *
 * Model reward (disepakati 10 September 2026), konsisten dengan pola Odekake
 * ("selesaikan = hadiah penuh; pulang awal = hadiah tidak ada"):
 *  - Energi selama tidur tetap proporsional secara PASIF via decay loop
 *    (+1,1/10 detik saat online, +15/jam saat offline — lihat decayLoop.ts),
 *    sehingga bangun awal tetap membawa hasil akumulasi alami.
 *  - Bonus penyelesaian (+14 EXP dan tambahan energi `min(100 − energi, 25)`)
 *    diberikan PENUH hanya jika sesi tidur 15 menit benar-benar selesai.
 *  - Bangun awal = MEMBATALKAN sesi: bonus 0/0. Siklus spam menghasilkan
 *    nol — eksploit mati secara matematis, tanpa melarang fitur apa pun.
 *
 * Keputusan dihitung dari WAKTU NYATA (`now` vs `sleepUntilTimestamp`),
 * BUKAN dari bar energi visual (`energyProgress`) — bar itu bisa dinaikkan
 * `handleGentlePat` (+4 per tap) dan kini murni kosmetik.
 *
 * Logika murni diekstrak ke sini agar bisa di-unit-test tanpa React/DOM
 * (konvensi yang sama dengan src/utils/decayLoop.ts & petAffectionCooldown.ts).
 */

/** Durasi sesi tidur penuh: 15 menit (harus cocok dengan handleConfirmSleep). */
export const SLEEP_SESSION_DURATION_MS = 15 * 60 * 1000;

/** EXP bonus penyelesaian tidur penuh (sebelumnya flat 14 untuk bangun kapan pun). */
export const SLEEP_COMPLETION_EXP = 14;

/** Energi bonus penyelesaian tidur penuh, setelah akumulasi pasif decay loop. */
export const SLEEP_COMPLETION_ENERGY = 25;

export interface SleepWakeReward {
  /** true = sesi tidur 15 menit selesai → bonus penuh. */
  completed: boolean;
  /** Energi bonus (0 jika bangun awal; akumulasi pasif decay loop tetap aman). */
  energyGain: number;
  /** EXP bonus (0 jika bangun awal). */
  expGain: number;
}

/**
 * Keputusan murni reward bangun tidur.
 *  - `now`: timestamp sekarang (diinjeksi agar testable).
 *  - `sleepUntilTimestamp`: target selesai sesi (set oleh handleConfirmSleep).
 *    undefined / <= now berarti tidak ada sesi aktif → diperlakukan selesai
 *    (bangun tanpa sesi tidak boleh mengunci pemain).
 *  - `currentEnergy`: energi pet saat ini (0–100) untuk clamp bonus.
 */
export function resolveSleepWakeReward(
  now: number,
  sleepUntilTimestamp: number | undefined,
  currentEnergy: number
): SleepWakeReward {
  const sessionActive =
    typeof sleepUntilTimestamp === 'number' &&
    sleepUntilTimestamp > 0 &&
    now < sleepUntilTimestamp;

  // Sesi masih berjalan + pemain menekan bangun = bangun awal → tanpa bonus.
  if (sessionActive) {
    return { completed: false, energyGain: 0, expGain: 0 };
  }

  // Sesi selesai (atau tidak ada sesi aktif): bonus penuh, di-clamp ke 100.
  const energyGain = Math.max(
    0,
    Math.min(SLEEP_COMPLETION_ENERGY, 100 - Math.max(0, Math.min(100, currentEnergy)))
  );
  return { completed: true, energyGain, expGain: SLEEP_COMPLETION_EXP };
}
