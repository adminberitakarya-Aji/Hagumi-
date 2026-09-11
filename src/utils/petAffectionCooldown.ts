/**
 * src/utils/petAffectionCooldown.ts
 * Cooldown reward elusan (petting) Kitsune — menutup eksploit spam-tap:
 * sebelumnya setiap tap memberi +5 EXP / +3 happiness / +2 Kizuna tanpa batas
 * (dipanggil dari KitsuneCanvas, handleTatamiClick & handleThoughtClick).
 *
 * Niat desain sudah tertulis di ROADMAP M9.5 ("Cooling down 2 menit untuk
 * mencegah eksploitasi spam") namun tidak pernah diimplementasi — modul ini
 * merealisasikannya. Logika murni diekstrak ke sini agar bisa di-unit-test
 * (konvensi yang sama dengan src/utils/decayLoop.ts).
 *
 * Persistensi: timestamp reward terakhir disimpan di localStorage terpisah
 * dari save utama (kunci di bawah) sehingga cooldown tidak bisa di-reset
 * hanya dengan reload halaman. Entri diikat ke `petId`, sehingga pemain baru
 * / generasi baru (pet.id berbeda) otomatis mulai tanpa cooldown.
 *
 * Catatan desain: enforcement sisi klien bertujuan mencegah spam kasual dan
 * eksploit sesi-aktif; game ini tidak memiliki ekonomi server sehingga bukan
 * target anti-cheat yang ketat. Selama cooldown, kitsune tetap merespons
 * sentuhan (suara + animasi senang) tanpa reward — elusan tetap terasa hidup.
 */

/** Durasi cooldown antar reward elusan: 2 menit (sesuai niat desain ROADMAP M9.5). */
export const PET_AFFECTION_COOLDOWN_MS = 2 * 60 * 1000;

/** Kunci localStorage entri cooldown elusan (terpisah dari save utama HAGUMI_KITSUNE_SAVE_DATA). */
export const PET_AFFECTION_COOLDOWN_KEY = 'HAGUMI_KITSUNE_PET_COOLDOWN';

export interface PetAffectionDecision {
  /** true = elusan ini berhak mendapat reward penuh. */
  rewarded: boolean;
  /** Sisa cooldown dalam ms (0 jika berhak reward). */
  remainingMs: number;
}

/**
 * Keputusan murni: apakah elusan pada `now` berhak reward, dengan
 * `lastRewardedAt` = timestamp reward terakhir (0/undefined jika belum pernah).
 * Pure: `now` diinjeksi agar testable; `cooldownMs` bisa diinjeksi untuk test.
 */
export function resolvePetAffection(
  lastRewardedAt: number | undefined,
  now: number,
  cooldownMs: number = PET_AFFECTION_COOLDOWN_MS
): PetAffectionDecision {
  if (!lastRewardedAt || lastRewardedAt <= 0) {
    return { rewarded: true, remainingMs: 0 };
  }
  const elapsed = now - lastRewardedAt;
  if (elapsed >= cooldownMs) {
    return { rewarded: true, remainingMs: 0 };
  }
  return { rewarded: false, remainingMs: cooldownMs - elapsed };
}

/**
 * Baca timestamp reward elusan terakhir dari localStorage, diikat ke `petId`.
 * Mengembalikan 0 jika: localStorage tak tersedia (SSR/test), belum ada entri,
 * entri milik kitsune lain (pemain baru / generasi baru), entri korup,
 * atau nilai timestamp tidak valid.
 */
export function readPetAffectionTimestamp(petId: string): number {
  if (typeof localStorage === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(PET_AFFECTION_COOLDOWN_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { petId?: unknown; ts?: unknown };
    if (parsed?.petId !== petId) return 0;
    return typeof parsed.ts === 'number' && Number.isFinite(parsed.ts) && parsed.ts > 0
      ? parsed.ts
      : 0;
  } catch {
    return 0;
  }
}

/**
 * Simpan timestamp reward elusan terakhir untuk `petId`.
 * Kegagalan storage (kuota penuh / private mode) diabaikan — jangan pernah
 * memblokir gameplay; proteksi sesi tetap berjalan via ref di useCareActions.
 */
export function writePetAffectionTimestamp(petId: string, ts: number): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PET_AFFECTION_COOLDOWN_KEY, JSON.stringify({ petId, ts }));
  } catch {
    /* diabaikan secara sengaja */
  }
}
