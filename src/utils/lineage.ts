/**
 * src/utils/lineage.ts
 * P5 (Revisi 6): "Restu Silsilah" — warisan lintas generasi saat melepas kitsune
 * (Mulai Generasi Baru). Tujuan: reinkarnasi punya insentif, bukan reset total.
 *
 * Mekanik:
 *  - Saat konfirmasi reset, generasi lama merekam LineageBlessing ke kunci
 *    localStorage TERPISAH (pola cooldown elusan) — selamat dari reset save.
 *  - EggAltarModal membaca blessing saat penetasan: telur lahir dengan
 *    generation = targetGeneration (bukan 1 lagi).
 *  - App menerapkan blessing (field `lineage` + koin warisan) begitu pet
 *    generasi target ada. Perhitungan koin BOUNDED (anti-inflasi): 
 *    min(500, levelElder × 5 + streakTerbaik × 2).
 *  - Semua fungsi storage tahan kegagalan (try/catch) — gameplay tidak boleh
 *    terblokir karena warisan.
 */

import { LineageBlessing, PetData } from '../types/game';

export const LINEAGE_BLESSING_KEY = 'HAGUMI_LINEAGE_BLESSING';

/** Batas atas koin warisan per generasi (anti-inflasi ekonomi). */
export const LINEAGE_COIN_CAP = 500;

export function computeInheritedCoins(elderLevel: number, bestStreak: number): number {
  const level = Number.isFinite(elderLevel) && elderLevel > 0 ? Math.floor(elderLevel) : 0;
  const streak = Number.isFinite(bestStreak) && bestStreak > 0 ? Math.floor(bestStreak) : 0;
  return Math.min(LINEAGE_COIN_CAP, level * 5 + streak * 2);
}

export function createLineageBlessing(pet: PetData, now: number = Date.now()): LineageBlessing {
  const elderLevel = Math.max(1, Math.floor(pet.level || 1));
  const bestStreak = pet.dailyQuest?.bestStreak ?? 0;
  return {
    targetGeneration: (pet.generation || 1) + 1,
    elderName: pet.name,
    elderLevel,
    elderForm: pet.form,
    elderTails: pet.tailCount,
    bestStreak,
    inheritedCoins: computeInheritedCoins(elderLevel, bestStreak),
    recordedAt: now,
  };
}

/** Rekam restu saat konfirmasi "Mulai Generasi Baru". Mengembalikan blessing (atau null bila storage gagal). */
export function recordLineageBlessing(pet: PetData, now: number = Date.now()): LineageBlessing | null {
  const blessing = createLineageBlessing(pet, now);
  try {
    localStorage.setItem(LINEAGE_BLESSING_KEY, JSON.stringify(blessing));
    return blessing;
  } catch {
    return null; // gameplay tetap jalan tanpa warisan
  }
}

/** Baca blessing tertunda untuk generasi berikutnya (null bila tidak ada / korup). */
export function readPendingLineageBlessing(): LineageBlessing | null {
  try {
    const raw = localStorage.getItem(LINEAGE_BLESSING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.targetGeneration !== 'number' || parsed.targetGeneration < 2) return null;
    return parsed as LineageBlessing;
  } catch {
    return null;
  }
}
