/**
 * Unit test schema & migrasi save data (src/utils/petSaveSchema.ts):
 * roundtrip serialize/parse, migrasi v1→v2, penolakan save korup/versi baru,
 * dan sanitasi nilai di luar rentang aman.
 */

import { describe, it, expect } from 'vitest';
import {
  CURRENT_SCHEMA_VERSION,
  validateAndSanitizePetData,
  parseAndMigratePetSave,
  serializePetSave,
} from './petSaveSchema';
import { makePet } from '../test/helpers';

describe('serializePetSave + parseAndMigratePetSave — roundtrip', () => {
  it('menghasilkan envelope versi schema saat ini dan bisa di-parse balik', () => {
    const pet = makePet();
    const raw = serializePetSave(pet);
    expect(JSON.parse(raw).version).toBe(CURRENT_SCHEMA_VERSION);

    const result = parseAndMigratePetSave(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Sanitizer mengisi field default (shrineWishes, unlockedDecor, dll.)
      // sehingga hasil ⊇ input — pakai toMatchObject, bukan toEqual
      expect(result.pet).toMatchObject(pet);
      expect(result.pet.shrineWishes?.length).toBeGreaterThan(0);
    }
  });

  it('objek (bukan string) juga diterima — kasus import backup', () => {
    const result = parseAndMigratePetSave(serializePetSave(makePet()));
    expect(result.ok).toBe(true);
  });
});

describe('migrasi & validasi format lama', () => {
  it('save v1 (PetData mentah tanpa envelope) diterima', () => {
    const pet = makePet();
    const result = parseAndMigratePetSave(JSON.stringify(pet));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pet.name).toBe('Konko');
      expect(result.pet.stats.hunger).toBe(80);
    }
  });

  it('save v2 ({ version, data }) diterima', () => {
    const result = parseAndMigratePetSave({
      version: 2,
      data: makePet(),
    });
    expect(result.ok).toBe(true);
  });

  it('save dari versi aplikasi lebih baru DITOLAK (tidak diubah diam-diam)', () => {
    const result = parseAndMigratePetSave({
      version: CURRENT_SCHEMA_VERSION + 1,
      data: makePet(),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('lebih baru');
    }
  });

  it('input korup ditolak dengan pesan ramah', () => {
    const notJson = parseAndMigratePetSave('bukan json {{{');
    expect(notJson.ok).toBe(false);

    const array = parseAndMigratePetSave('[1, 2, 3]');
    expect(array.ok).toBe(false);
    if (!array.ok) {
      expect(array.error).toContain('bukan objek');
    }

    const nullInput = parseAndMigratePetSave(null);
    expect(nullInput.ok).toBe(false);
  });

  it('data tanpa nama / tanpa stats ditolak dengan pesan spesifik', () => {
    const noName = parseAndMigratePetSave(JSON.stringify({ stats: {} }));
    expect(noName.ok).toBe(false);
    if (!noName.ok) expect(noName.error).toContain('nama');

    const noStats = parseAndMigratePetSave(JSON.stringify({ name: 'Konko' }));
    expect(noStats.ok).toBe(false);
    if (!noStats.ok) expect(noStats.error).toContain('status vitals');
  });
});

describe('validateAndSanitizePetData — sanitasi nilai tidak aman', () => {
  it('nama dipotong maksimal 20 karakter', () => {
    const pet = validateAndSanitizePetData(
      makePet({ name: 'x'.repeat(30) })
    );
    expect(pet.name).toHaveLength(20);
  });

  it('stat di-clamp ke rentang 0–100', () => {
    const pet = validateAndSanitizePetData(
      makePet({
        stats: {
          hunger: 250,
          energy: -30,
          cleanliness: 80,
          happiness: 80,
          discipline: -10,
          health: 500,
        },
      })
    );
    expect(pet.stats.hunger).toBe(100);
    expect(pet.stats.energy).toBe(0);
    expect(pet.stats.discipline).toBe(0);
    expect(pet.stats.health).toBe(100);
  });

  it('field numerik lain di-clamp sesuai aturan masing-masing', () => {
    const pet = validateAndSanitizePetData(
      makePet({ level: 0, tailCount: 99, careScore: -50, careMistakes: -3 })
    );
    expect(pet.level).toBe(1); // minimum 1
    expect(pet.tailCount).toBe(9); // maksimum 9
    expect(pet.careScore).toBe(10); // minimum 10
    expect(pet.careMistakes).toBe(0); // minimum 0
  });

  it('bondingLevel & bondingTitle diturunkan ulang dari bondingPoints', () => {
    const pet = validateAndSanitizePetData(
      makePet({ bondingPoints: 900, bondingLevel: 1, bondingTitle: 'Salah' })
    );
    expect(pet.bondingLevel).toBe(5);
    expect(pet.bondingTitle).toBe('Ikatan Mistis Abadi');
  });

  it('lempar Error untuk input non-objek', () => {
    expect(() => validateAndSanitizePetData(null)).toThrow();
    expect(() => validateAndSanitizePetData('string')).toThrow();
    expect(() => validateAndSanitizePetData(42)).toThrow();
  });
});
