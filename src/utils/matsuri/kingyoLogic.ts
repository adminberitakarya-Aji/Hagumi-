/**
 * src/utils/matsuri/kingyoLogic.ts
 * Logika murni mini-game Kingyo-sukui (temuan audit Revisi 8, item T2).
 *
 * Diekstrak dari src/components/matsuri/KingyoSukuiGame.tsx agar dapat diuji
 * unit test tanpa React/DOM/audio (pola src/utils/decayLoop.ts).
 * Fungsi di sini TIDAK boleh punya efek samping selain membaca `random` yang diinjeksi.
 *
 * KONSTANTA mencerminkan perilaku komponen — jika angka di komponen berubah,
 * perbarui di sini dan jalankan `npm run test`.
 */

export interface KingyoFish {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

/** Jumlah ikan mas yang berenang saat mulai. */
export const FISH_COUNT = 7;
/** Kerusakan kertas poi per percobaan siduk (%). */
export const POI_DAMAGE_PER_SCOP = 18;
/** Jarak klik-ikan yang dianggap kena (% px area bak). */
export const CATCH_RADIUS = 28;
/** Batas pantulan pergerakan ikan (px area bak 360×240). */
export const FISH_BOUNDS = { minX: 20, maxX: 320, minY: 20, maxY: 200 };
/** Rentang spawn posisi ikan (px). */
export const FISH_SPAWN = { minX: 40, spawnWidth: 240, minY: 40, spawnHeight: 160 };

/** Tier warna bar ketahanan poi sesuai ambang UI (>50 hijau, >25 amber, sisanya rose). */
export type PoiDurabilityTier = 'emerald' | 'amber' | 'rose';

export function poiDurabilityTier(durability: number): PoiDurabilityTier {
  if (durability > 50) return 'emerald';
  if (durability > 25) return 'amber';
  return 'rose';
}

/** Spawning 7 ikan mas awal (warna bergantian oranye/merah, ukuran acak 14–22). */
export function spawnInitialFish(random: () => number = Math.random): KingyoFish[] {
  return Array.from({ length: FISH_COUNT }, (_, i) => ({
    id: i,
    x: FISH_SPAWN.minX + random() * FISH_SPAWN.spawnWidth,
    y: FISH_SPAWN.minY + random() * FISH_SPAWN.spawnHeight,
    vx: (random() - 0.5) * 2.5,
    vy: (random() - 0.5) * 2.5,
    color: i % 2 === 0 ? '#ea580c' : '#dc2626',
    size: 14 + random() * 8,
  }));
}

/**
 * Satu tick pergerakan ikan (pure): posisi + kecepatan baru dengan pantulan
 * di batas bak (arah vx/vy dibalik jika menembus batas — persis perilaku komponen).
 */
export function moveFishes(fishes: KingyoFish[]): KingyoFish[] {
  return fishes.map((f) => {
    let nextVx = f.vx;
    let nextVy = f.vy;
    const nextX = f.x + f.vx;
    const nextY = f.y + f.vy;

    if (nextX < FISH_BOUNDS.minX || nextX > FISH_BOUNDS.maxX) nextVx = -nextVx;
    if (nextY < FISH_BOUNDS.minY || nextY > FISH_BOUNDS.maxY) nextVy = -nextVy;

    return { ...f, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
  });
}

/**
 * Mencari ikan pertama yang kena sidukan pada koordinat klik.
 * Mengembalikan id ikan, atau -1 jika tidak ada yang kena (sesuai perilaku komponen).
 */
export function findCaughtFishId(fishes: KingyoFish[], clickX: number, clickY: number): number {
  for (const fish of fishes) {
    if (Math.hypot(fish.x - clickX, fish.y - clickY) < CATCH_RADIUS) {
      return fish.id;
    }
  }
  return -1;
}

/** Menghitung sisa ketahanan poi setelah satu sidukan (floor 0). */
export function applyPoiDamage(durability: number, damage: number = POI_DAMAGE_PER_SCOP): number {
  return Math.max(0, durability - damage);
}

/** Ikan yang tertangkap di-respawn ke posisi/kecepatan acak baru (pure). */
export function respawnFish(fish: KingyoFish, id: number, random: () => number = Math.random): KingyoFish {
  if (fish.id !== id) return fish;
  return {
    ...fish,
    x: FISH_SPAWN.minX + random() * FISH_SPAWN.spawnWidth,
    y: FISH_SPAWN.minY + random() * FISH_SPAWN.spawnHeight,
    vx: (random() - 0.5) * 3,
    vy: (random() - 0.5) * 3,
  };
}

/** Reward akhir: coins = score×8+5; happiness = score×5+10 (sesuai layar game over). */
export function calculateKingyoReward(score: number): { coins: number; happiness: number } {
  return { coins: score * 8 + 5, happiness: score * 5 + 10 };
}
