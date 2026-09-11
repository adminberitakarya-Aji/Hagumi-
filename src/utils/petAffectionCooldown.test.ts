/**
 * Unit test cooldown reward elusan (src/utils/petAffectionCooldown.ts):
 * keputusan reward/cooldown murni, persistensi localStorage terikat petId,
 * serta ketahanan terhadap entri korup / storage tak tersedia.
 */

import { describe, it, expect, afterEach } from 'vitest';
import {
  PET_AFFECTION_COOLDOWN_MS,
  PET_AFFECTION_COOLDOWN_KEY,
  readPetAffectionTimestamp,
  resolvePetAffection,
  writePetAffectionTimestamp,
} from './petAffectionCooldown';

const NOW = 1_700_000_000_000;

type Store = Map<string, string>;

/** Stub globalThis.localStorage (vitest berjalan di env node — localStorage tak ada). */
function stubLocalStorage(): Store {
  const store: Store = new Map();
  (globalThis as any).localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };
  return store;
}

function unstubLocalStorage(): void {
  delete (globalThis as any).localStorage;
}

afterEach(() => {
  unstubLocalStorage();
});

describe('resolvePetAffection — keputusan cooldown murni', () => {
  it('belum pernah dielus (0/undefined) → langsung berhak reward', () => {
    expect(resolvePetAffection(undefined, NOW)).toEqual({ rewarded: true, remainingMs: 0 });
    expect(resolvePetAffection(0, NOW)).toEqual({ rewarded: true, remainingMs: 0 });
  });

  it('dalam periode cooldown → tidak berhak reward, sisa dihitung benar', () => {
    const last = NOW - 30_000; // 30 detik lalu
    const decision = resolvePetAffection(last, NOW);
    expect(decision.rewarded).toBe(false);
    expect(decision.remainingMs).toBe(PET_AFFECTION_COOLDOWN_MS - 30_000); // sisa 90 detik
  });

  it('tepat pada batas cooldown (elapsed = 2 menit) → berhak reward', () => {
    const last = NOW - PET_AFFECTION_COOLDOWN_MS;
    expect(resolvePetAffection(last, NOW)).toEqual({ rewarded: true, remainingMs: 0 });
  });

  it('setelah cooldown lewat → berhak reward', () => {
    const last = NOW - PET_AFFECTION_COOLDOWN_MS - 1;
    expect(resolvePetAffection(last, NOW)).toEqual({ rewarded: true, remainingMs: 0 });
  });

  it('cooldownMs bisa diinjeksi untuk test (mis. 5 detik)', () => {
    const last = NOW - 4_000;
    expect(resolvePetAffection(last, NOW, 5_000)).toEqual({ rewarded: false, remainingMs: 1_000 });
    expect(resolvePetAffection(last, NOW, 4_000)).toEqual({ rewarded: true, remainingMs: 0 });
  });

  it('timestamp negative diperlakukan seperti belum pernah dielus', () => {
    expect(resolvePetAffection(-123, NOW)).toEqual({ rewarded: true, remainingMs: 0 });
  });
});

describe('persistensi localStorage — terikat petId & tahan korupsi', () => {
  it('localStorage tak tersedia → read mengembalikan 0 (tidak melempar)', () => {
    unstubLocalStorage();
    expect(readPetAffectionTimestamp('kitsune_1')).toBe(0);
  });

  it('roundtrip: write lalu read mengembalikan timestamp yang sama', () => {
    stubLocalStorage();
    writePetAffectionTimestamp('kitsune_1', NOW);
    expect(readPetAffectionTimestamp('kitsune_1')).toBe(NOW);
  });

  it('entri milik kitsune lain (petId beda) → 0 (generasi baru bebas cooldown)', () => {
    stubLocalStorage();
    writePetAffectionTimestamp('kitsune_1', NOW);
    expect(readPetAffectionTimestamp('kitsune_2')).toBe(0);
  });

  it('entri korup (bukan JSON) → 0, tidak melempar', () => {
    stubLocalStorage();
    (globalThis as any).localStorage.setItem(PET_AFFECTION_COOLDOWN_KEY, '{{{bukan json');
    expect(readPetAffectionTimestamp('kitsune_1')).toBe(0);
  });

  it('ts tidak valid (bukan number / negatif) → 0', () => {
    stubLocalStorage();
    (globalThis as any).localStorage.setItem(
      PET_AFFECTION_COOLDOWN_KEY,
      JSON.stringify({ petId: 'kitsune_1', ts: 'bukan-angka' })
    );
    expect(readPetAffectionTimestamp('kitsune_1')).toBe(0);
    (globalThis as any).localStorage.setItem(
      PET_AFFECTION_COOLDOWN_KEY,
      JSON.stringify({ petId: 'kitsune_1', ts: -5 })
    );
    expect(readPetAffectionTimestamp('kitsune_1')).toBe(0);
  });

  it('gagal write (kuota penuh) tidak melempar — gameplay tidak boleh terblokir', () => {
    const store = stubLocalStorage();
    (globalThis as any).localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => writePetAffectionTimestamp('kitsune_1', NOW)).not.toThrow();
    expect(store.size).toBe(0);
  });
});
