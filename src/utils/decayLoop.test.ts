/**
 * Unit test decay loop (src/utils/decayLoop.ts):
 * tick decay 10 detik (bangun/tidur, poop, sakit, health, Care Score)
 * dan decay offline saat pemain kembali.
 * Math.random di-mock agar deterministik.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { applyDecayTick, applyOfflineDecay } from './decayLoop';
import { makePet, TEST_NOW } from '../test/helpers';

// 0.99 > semua threshold random (0.08 & 0.1) → tidak ada event acak
const NO_EVENT = 0.99;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('applyDecayTick — kondisi normal (terjaga)', () => {
  it('meluruhkan hunger/energy/cleanliness sesuai laju per 10 detik', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const pet = makePet();
    const next = applyDecayTick(pet, TEST_NOW);

    expect(next.stats.hunger).toBeCloseTo(79.88, 5); // −0,12
    expect(next.stats.energy).toBeCloseTo(79.85, 5); // −0,15
    expect(next.stats.cleanliness).toBeCloseTo(79.88, 5); // −0,12
    expect(next.stats.happiness).toBe(80); // tidak ada penalti
    expect(next.stats.health).toBe(100); // sudah penuh
    expect(next.lastInteractionTime).toBe(TEST_NOW);
  });

  it('pure: objek input tidak dimutasi', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const pet = makePet();
    const before = JSON.stringify(pet);
    applyDecayTick(pet, TEST_NOW);
    expect(JSON.stringify(pet)).toBe(before);
  });

  it('Care Score dihitung ulang dari rata-rata 5 vital (contoh 80→84)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(makePet(), TEST_NOW);
    // (79.88 + 79.85 + 79.88 + 80 + 100) / 5 = 83.922 → 84
    expect(next.careScore).toBe(84);
  });

  it('tidak mengubah discipline', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(
      makePet({
        stats: { hunger: 80, energy: 80, cleanliness: 80, happiness: 80, discipline: 77, health: 100 },
      }),
      TEST_NOW
    );
    expect(next.stats.discipline).toBe(77);
  });
});

describe('applyDecayTick — tidur & bangun', () => {
  it('sesi tidur 15 menit selesai → bangun: energy 100, happiness +20, +15 EXP', () => {
    const pet = makePet({
      isSleeping: true,
      sleepUntilTimestamp: TEST_NOW - 1,
      stats: { hunger: 80, energy: 50, cleanliness: 80, happiness: 70, discipline: 50, health: 100 },
      exp: 100,
    });
    const next = applyDecayTick(pet, TEST_NOW);
    expect(next.isSleeping).toBe(false);
    expect(next.sleepUntilTimestamp).toBeUndefined();
    expect(next.stats.energy).toBe(100);
    expect(next.stats.happiness).toBe(90); // 70 + 20
    expect(next.exp).toBe(115); // 100 + 15
    expect(next.lastInteractionTime).toBe(TEST_NOW);
  });

  it('saat tidur: hunger −0,04, energy +1,1, cleanliness tetap meluruh', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const pet = makePet({
      isSleeping: true,
      sleepUntilTimestamp: TEST_NOW + 60_000, // belum selesai
    });
    const next = applyDecayTick(pet, TEST_NOW);
    expect(next.isSleeping).toBe(true);
    expect(next.stats.hunger).toBeCloseTo(79.96, 5); // −0,04
    expect(next.stats.energy).toBeCloseTo(81.1, 5); // +1,1
    expect(next.stats.cleanliness).toBeCloseTo(79.88, 5); // −0,12
  });

  it('tidak buang kotoran saat tidur (meski random memicu)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // pasti memicu jika kondisi terbuka
    const pet = makePet({
      isSleeping: true,
      sleepUntilTimestamp: TEST_NOW + 60_000,
    });
    const next = applyDecayTick(pet, TEST_NOW);
    expect(next.poopCount).toBe(0);
  });
});

describe('applyDecayTick — penalti, kotoran & sakit', () => {
  it('hunger < 25 → happiness −0,5 dan careMistakes +0,05 per tick', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const pet = makePet({
      stats: { hunger: 20, energy: 80, cleanliness: 80, happiness: 80, discipline: 50, health: 100 },
    });
    const next = applyDecayTick(pet, TEST_NOW);
    expect(next.stats.hunger).toBeCloseTo(19.88, 5);
    expect(next.stats.happiness).toBe(79.5);
    expect(next.careMistakes).toBeCloseTo(0.05, 5);
    // (19.88 + 79.85 + 79.88 + 79.5 + 100) / 5 − 0.025 = 71.797 → 72
    expect(next.careScore).toBe(72);
  });

  it('kotoran muncul: terjaga, hunger > 30, random < 0,08', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = applyDecayTick(makePet(), TEST_NOW);
    expect(next.poopCount).toBe(1);
  });

  it('kotoran tidak melebihi 4', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const next = applyDecayTick(makePet({ poopCount: 4 }), TEST_NOW);
    expect(next.poopCount).toBe(4);
  });

  it('kebersihan < 20 + random < 0,1 → sakit: health −0,8 & happiness −0,5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const pet = makePet({
      stats: { hunger: 80, energy: 80, cleanliness: 15, happiness: 80, discipline: 50, health: 100 },
    });
    const next = applyDecayTick(pet, TEST_NOW);
    expect(next.isSick).toBe(true);
    expect(next.stats.health).toBeCloseTo(99.2, 5);
    expect(next.stats.happiness).toBe(79); // 80 − 0.5 (penalti kotor) − 0.5 (sakit)
  });

  it('health tidak turun di bawah 10 saat sakit', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(
      makePet({
        isSick: true,
        stats: { hunger: 80, energy: 80, cleanliness: 80, happiness: 80, discipline: 50, health: 10 },
      }),
      TEST_NOW
    );
    expect(next.stats.health).toBe(10);
  });

  it('kelaparan (hunger < 15) → health −0,4 per tick', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(
      makePet({ stats: { hunger: 10, energy: 80, cleanliness: 80, happiness: 80, discipline: 50, health: 100 } }),
      TEST_NOW
    );
    expect(next.stats.health).toBeCloseTo(99.6, 5);
  });

  it('penyembuhan alami +0,3 saat hunger > 60, cleanliness > 60, health < 100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(
      makePet({ stats: { hunger: 80, energy: 80, cleanliness: 80, happiness: 80, discipline: 50, health: 90 } }),
      TEST_NOW
    );
    expect(next.stats.health).toBeCloseTo(90.3, 5);
  });

  it('Care Score punya floor 10 walau semua vital nol', () => {
    vi.spyOn(Math, 'random').mockReturnValue(NO_EVENT);
    const next = applyDecayTick(
      makePet({
        careMistakes: 0,
        stats: { hunger: 0, energy: 0, cleanliness: 0, happiness: 0, discipline: 0, health: 0 },
      }),
      TEST_NOW
    );
    expect(next.careScore).toBe(10);
  });
});

describe('applyOfflineDecay — decay saat pemain pergi', () => {
  it('pergi < 3 menit → null (tanpa efek sama sekali)', () => {
    const pet = makePet();
    const result = applyOfflineDecay(pet, pet.lastInteractionTime + 2 * 60_000);
    expect(result).toBeNull();
  });

  it('tepat 3 menit → decay aktif dengan bonus koin minimum 10', () => {
    const pet = makePet();
    const result = applyOfflineDecay(pet, pet.lastInteractionTime + 3 * 60_000);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.awayMinutes).toBe(3);
      expect(result.coins).toBe(10);
      expect(result.pet.stats.hunger).toBeCloseTo(79.75, 5); // −0,25 (0,05/jam)
    }
  });

  it('pergi 4 jam (terjaga): hunger 60, energy 68, cleanliness 64, kotoran +1', () => {
    const pet = makePet();
    const result = applyOfflineDecay(pet, pet.lastInteractionTime + 4 * 3_600_000);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.awayMinutes).toBe(240);
      expect(result.pet.stats.hunger).toBe(60); // 80 − min(60, 4×5)
      expect(result.pet.stats.energy).toBe(68); // 80 − min(40, 4×3)
      expect(result.pet.stats.cleanliness).toBe(64); // 80 − min(50, 4×4)
      expect(result.pet.stats.happiness).toBe(80); // tidak diluruhkan offline
      expect(result.pet.poopCount).toBe(1); // pergi ≥ 4 jam & < 2
      expect(result.pet.careScore).toBe(80); // tidak dihitung ulang offline
      expect(result.coins).toBe(34); // min(100, floor(4×6)+10)
    }
  });

  it('pergi 4 jam (tidur, sesi selesai): bangun dengan energy penuh', () => {
    const pet = makePet({
      isSleeping: true,
      sleepUntilTimestamp: TEST_NOW - 1000, // sesi selesai sebelum pemain kembali
    });
    const result = applyOfflineDecay(pet, TEST_NOW + 4 * 3_600_000);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.pet.isSleeping).toBe(false);
      expect(result.pet.sleepUntilTimestamp).toBeUndefined();
      expect(result.pet.stats.energy).toBe(100);
      expect(result.pet.stats.happiness).toBe(100); // 80 + 20
    }
  });

  it('pergi 30 jam: cap 24 jam, floor stat, koin maksimum 100', () => {
    // Stat dasar rendah agar floor (15/10/10) benar-benar menggigit
    const pet = makePet({
      stats: { hunger: 40, energy: 20, cleanliness: 20, happiness: 80, discipline: 50, health: 100 },
    });
    const result = applyOfflineDecay(pet, pet.lastInteractionTime + 30 * 3_600_000);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.awayMinutes).toBe(1800); // dilaporkan apa adanya
      expect(result.pet.stats.hunger).toBe(15); // max(15, 40−60) → floor
      expect(result.pet.stats.energy).toBe(10); // max(10, 20−40) → floor
      expect(result.pet.stats.cleanliness).toBe(10); // max(10, 20−50) → floor
      expect(result.coins).toBe(100); // min(100, floor(24×6)+10)
    }
  });

  it('cap 24 jam: stat dasar 80 hanya turun sesuai plafon kerugian', () => {
    const pet = makePet();
    const result = applyOfflineDecay(pet, pet.lastInteractionTime + 30 * 3_600_000);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.pet.stats.hunger).toBe(20); // max(15, 80−60)
      expect(result.pet.stats.energy).toBe(40); // max(10, 80−40)
      expect(result.pet.stats.cleanliness).toBe(30); // max(10, 80−50)
    }
  });

  it('ageDays maju mengikuti waktu nyata & koin ditambahkan', () => {
    const pet = makePet(); // ageDays 2, lahir 5 hari sebelum BASE_NOW
    const fiveDaysLater = pet.lastInteractionTime + 5 * 86_400_000;
    const result = applyOfflineDecay(pet, fiveDaysLater);
    expect(result).not.toBeNull();
    if (result) {
      // now − birthTimestamp = (BASE_NOW + 5 hari) − (BASE_NOW − 5 hari) = 10 hari
      expect(result.pet.ageDays).toBe(10);
      expect(result.pet.coins).toBe(200); // 100 + bonus cap 100
      expect(result.pet.lastInteractionTime).toBe(fiveDaysLater);
    }
  });

  it('pure: objek input tidak dimutasi', () => {
    const pet = makePet();
    const before = JSON.stringify(pet);
    applyOfflineDecay(pet, pet.lastInteractionTime + 4 * 3_600_000);
    expect(JSON.stringify(pet)).toBe(before);
  });
});
