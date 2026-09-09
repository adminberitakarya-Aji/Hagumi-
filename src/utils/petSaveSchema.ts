/**
 * src/utils/petSaveSchema.ts
 * Schema versioning, migration chain & validator untuk save data Kitsune.
 *
 * Format save:
 *  - v1 (legacy): objek PetData mentah tanpa envelope — semua save yang dibuat
 *    sebelum versi schema ini ada.
 *  - v2 (current): { version: 2, data: PetData }
 *
 * Aturan migration:
 *  - Save tanpa `version` dianggap v1 dan dimigrasi naik bertahap.
 *  - Save dengan `version` > CURRENT_SCHEMA_VERSION ditolak (data dari build
 *    aplikasi yang lebih baru — jangan diubah diam-diam).
 *  - Semua migrasi adalah pure function: menerima data versi N, mengembalikan
 *    data versi N+1. Tambahkan entri baru di MIGRATIONS saat PetData berubah.
 */

import { PetData } from '../types/game';
import {
  DEFAULT_SANCTUARY_DECOR,
  DEFAULT_UNLOCKED_DECOR,
  DEFAULT_SHRINE_WISHES,
  getBondingLevelInfo,
} from '../data/gameConfig';

export const CURRENT_SCHEMA_VERSION = 3;

/** Kunci localStorage untuk backup save yang gagal divalidasi (jangan ditimpa otomatis). */
export const CORRUPT_SAVE_BACKUP_KEY = 'HAGUMI_KITSUNE_SAVE_DATA_CORRUPT';

/**
 * Validasi & sanitasi PetData dari sumber tidak tepercaya (localStorage / import backup).
 * Melempar Error dengan pesan Indonesia yang ramah jika data tidak bisa diselamatkan.
 * Mengembalikan PetData yang dijamin lengkap & dalam rentang nilai aman.
 */
export function validateAndSanitizePetData(parsed: any): PetData {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Format data tidak valid (bukan objek JSON).');
  }

  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Data tidak memiliki atribut nama Kitsune yang valid.');
  }

  if (!parsed.stats || typeof parsed.stats !== 'object') {
    throw new Error('Data tidak memiliki atribut status vitals (lapar, energi, bersih, dll).');
  }

  const sanitized: PetData = {
    id: parsed.id || `kitsune_${Date.now()}`,
    name: parsed.name.slice(0, 20),
    element: parsed.element || 'fire',
    stage: parsed.stage || 'anak',
    form: parsed.form || 'kogitsune',
    tailCount: typeof parsed.tailCount === 'number' ? Math.max(0, Math.min(9, parsed.tailCount)) : 1,
    stats: {
      hunger: typeof parsed.stats?.hunger === 'number' ? Math.max(0, Math.min(100, parsed.stats.hunger)) : 80,
      energy: typeof parsed.stats?.energy === 'number' ? Math.max(0, Math.min(100, parsed.stats.energy)) : 80,
      cleanliness: typeof parsed.stats?.cleanliness === 'number' ? Math.max(0, Math.min(100, parsed.stats.cleanliness)) : 80,
      happiness: typeof parsed.stats?.happiness === 'number' ? Math.max(0, Math.min(100, parsed.stats.happiness)) : 80,
      discipline: typeof parsed.stats?.discipline === 'number' ? Math.max(0, Math.min(100, parsed.stats.discipline)) : 50,
      health: typeof parsed.stats?.health === 'number' ? Math.max(0, Math.min(100, parsed.stats.health)) : 90,
    },
    weight: typeof parsed.weight === 'number' ? parsed.weight : 450,
    ageDays: typeof parsed.ageDays === 'number' ? parsed.ageDays : 1,
    exp: typeof parsed.exp === 'number' ? parsed.exp : 0,
    level: typeof parsed.level === 'number' ? Math.max(1, parsed.level) : 1,
    careScore: typeof parsed.careScore === 'number' ? Math.max(10, Math.min(100, parsed.careScore)) : 80,
    careMistakes: typeof parsed.careMistakes === 'number' ? Math.max(0, parsed.careMistakes) : 0,
    hankoSignature: parsed.hankoSignature || '福',
    birthTimestamp: typeof parsed.birthTimestamp === 'number' ? parsed.birthTimestamp : Date.now(),
    // PENTING: pertahankan timestamp asli agar kalkulasi offline progress
    // (decay saat pemain pergi) tetap bekerja saat load. Nilai default hanya
    // untuk data yang memang tidak punya field ini.
    lastInteractionTime: typeof parsed.lastInteractionTime === 'number' ? parsed.lastInteractionTime : Date.now(),
    lastDecayTime: typeof parsed.lastDecayTime === 'number' ? parsed.lastDecayTime : Date.now(),
    isSleeping: Boolean(parsed.isSleeping),
    sleepUntilTimestamp: typeof parsed.sleepUntilTimestamp === 'number' ? parsed.sleepUntilTimestamp : undefined,
    isSick: Boolean(parsed.isSick),
    poopCount: typeof parsed.poopCount === 'number' ? Math.max(0, Math.min(4, parsed.poopCount)) : 0,
    coins: typeof parsed.coins === 'number' ? Math.max(0, parsed.coins) : 50,
    inventory: parsed.inventory && typeof parsed.inventory === 'object' ? parsed.inventory : {},
    favoriteFood: parsed.favoriteFood || 'Aburaage (Tahu Goreng Gurih)',
    generation: typeof parsed.generation === 'number' ? Math.max(1, parsed.generation) : 1,
    totalMiniGamesWon: typeof parsed.totalMiniGamesWon === 'number' ? parsed.totalMiniGamesWon : 0,
    accessories: parsed.accessories || { neck: 'none', head: 'none' },
    unlockedAccessories: Array.isArray(parsed.unlockedAccessories)
      ? parsed.unlockedAccessories
      : ['neck_none', 'head_none', 'head_leaf'],
    sanctuaryDecor: parsed.sanctuaryDecor || DEFAULT_SANCTUARY_DECOR,
    unlockedDecor: Array.isArray(parsed.unlockedDecor) ? parsed.unlockedDecor : DEFAULT_UNLOCKED_DECOR,
    season: parsed.season || 'autumn',
    unlockedMemories: Array.isArray(parsed.unlockedMemories) ? parsed.unlockedMemories : [],
    customDiaryNotes: Array.isArray(parsed.customDiaryNotes) ? parsed.customDiaryNotes : [],
    visitedShrines: Array.isArray(parsed.visitedShrines) ? parsed.visitedShrines : [],
    hanabiLaunches: typeof parsed.hanabiLaunches === 'number' ? parsed.hanabiLaunches : 0,
    caretakerName: parsed.caretakerName || 'Pengasuh',
    shrineWishes: Array.isArray(parsed.shrineWishes) && parsed.shrineWishes.length > 0 ? parsed.shrineWishes : DEFAULT_SHRINE_WISHES,
    bondingPoints: typeof parsed.bondingPoints === 'number' ? parsed.bondingPoints : 120,
    bondingLevel: typeof parsed.bondingLevel === 'number' ? parsed.bondingLevel : 1,
    bondingTitle: parsed.bondingTitle || 'Kenalan Kuil',
    // Cooldown meditasi Zen harian (YYYY-MM-DD lokal, schema v3) — Revisi 4 bug #5
    lastZenMeditationDate:
      typeof parsed.lastZenMeditationDate === 'string' && parsed.lastZenMeditationDate
        ? parsed.lastZenMeditationDate.slice(0, 10)
        : undefined,
  };

  const bondInfo = getBondingLevelInfo(sanitized.bondingPoints ?? 120);
  sanitized.bondingLevel = bondInfo.level;
  sanitized.bondingTitle = bondInfo.currentMilestone.title;

  return sanitized;
}

/**
 * Migrasi v1 → v2: v1 adalah PetData mentah, v2 membungkusnya dalam envelope
 * { version, data }. Konten PetData sendiri saat ini identik — normalisasi
 * field ditangani oleh validateAndSanitizePetData setelah chain selesai.
 * Saat PetData berubah di masa depan, tambahkan transformasi nyata di sini
 * dan naikkan CURRENT_SCHEMA_VERSION.
 */
function migrateV1ToV2(data: any): any {
  return data;
}

function migrateV2ToV3(data: any): any {
  // v3 menambahkan `lastZenMeditationDate` (cooldown meditasi Zen harian,
  // Revisi 4 bug #5) — save lama cukup dibiarkan tanpa field (undefined).
  return data;
}

/** Chain migration: kunci = versi sumber, nilai = fungsi ke versi berikutnya. */
const MIGRATIONS: Record<number, (data: any) => any> = {
  1: migrateV1ToV2,
  2: migrateV2ToV3,
};

/**
 * Parse & migrasi save string/objek ke PetData versi terkini, tanpa melempar exception.
 * Menerima:
 *  - string JSON: format v1 (raw PetData) maupun v2 ({ version, data })
 *  - objek hasil parse sebelumnya (mis. dari import backup)
 * Mengembalikan { ok: true, pet } atau { ok: false, error } dengan pesan Indonesia.
 */
export function parseAndMigratePetSave(
  raw: unknown
): { ok: true; pet: PetData } | { ok: false; error: string } {
  let obj: any = raw;

  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw);
    } catch {
      return { ok: false, error: 'Data save bukan JSON yang valid (kemungkinan korup).' };
    }
  }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, error: 'Format data tidak valid (bukan objek JSON).' };
  }

  // Format v2+: envelope { version, data }
  if (typeof obj.version === 'number' && obj.data && typeof obj.data === 'object') {
    let version: number = obj.version;
    let data = obj.data;

    if (version > CURRENT_SCHEMA_VERSION) {
      return {
        ok: false,
        error: `Data dari versi aplikasi yang lebih baru (schema v${version}, aplikasi ini v${CURRENT_SCHEMA_VERSION}). Perbarui aplikasi sebelum memuat.`,
      };
    }

    try {
      while (version < CURRENT_SCHEMA_VERSION) {
        const migrate = MIGRATIONS[version];
        if (!migrate) {
          return { ok: false, error: `Tidak ada jalur migrasi dari schema v${version}.` };
        }
        data = migrate(data);
        version++;
      }
      return { ok: true, pet: validateAndSanitizePetData(data) };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Gagal memigrasi data save.' };
    }
  }

  // Format legacy v1: PetData mentah tanpa envelope
  try {
    return { ok: true, pet: validateAndSanitizePetData(obj) };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Data save tidak dapat divalidasi.' };
  }
}

/**
 * Serialisasi PetData ke string untuk localStorage / backup, dibungkus envelope
 * versi schema saat ini.
 */
export function serializePetSave(pet: PetData): string {
  return JSON.stringify({ version: CURRENT_SCHEMA_VERSION, data: pet });
}