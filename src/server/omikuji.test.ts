/**
 * Unit test src/server/omikuji.ts (temuan audit Revisi 7, item B2):
 * validasi bentuk payload omikuji dari AI + pemilihan fallback lokal.
 */

import { describe, it, expect } from 'vitest';
import {
  validateOmikujiPayload,
  pickFallbackOmikuji,
  OMIKUJI_FALLBACK_FORTUNES,
} from './omikuji';

const VALID_PAYLOAD = {
  blessing: 'Daikichi (Great Blessing)',
  poem: 'Api rubah menari di bawah rembulan,\nLangkahmu diberkahi.',
  advice: 'Mulai kebiasaan baik baru hari ini.',
  luckyItem: 'Aburaage',
};

describe('validateOmikujiPayload', () => {
  it('menerima payload valid dan men-trim whitespace', () => {
    const result = validateOmikujiPayload({
      ...VALID_PAYLOAD,
      blessing: '  Daikichi (Great Blessing)  ',
    });
    expect(result).not.toBeNull();
    expect(result?.blessing).toBe('Daikichi (Great Blessing)');
    expect(result?.poem).toBe(VALID_PAYLOAD.poem);
    expect(result?.advice).toBe(VALID_PAYLOAD.advice);
    expect(result?.luckyItem).toBe(VALID_PAYLOAD.luckyItem);
  });

  it('menolak nilai non-objek: null, array, string, angka', () => {
    expect(validateOmikujiPayload(null)).toBeNull();
    expect(validateOmikujiPayload(undefined)).toBeNull();
    expect(validateOmikujiPayload([VALID_PAYLOAD])).toBeNull();
    expect(validateOmikujiPayload('Daikichi')).toBeNull();
    expect(validateOmikujiPayload(42)).toBeNull();
  });

  it('menolak jika salah satu field hilang', () => {
    const { luckyItem: _omitted, ...incomplete } = VALID_PAYLOAD;
    expect(validateOmikujiPayload(incomplete)).toBeNull();
  });

  it('menolak jika field bukan string (angka/objek)', () => {
    expect(validateOmikujiPayload({ ...VALID_PAYLOAD, advice: 123 })).toBeNull();
    expect(validateOmikujiPayload({ ...VALID_PAYLOAD, poem: { text: 'x' } })).toBeNull();
  });

  it('menolak field kosong atau hanya whitespace', () => {
    expect(validateOmikujiPayload({ ...VALID_PAYLOAD, advice: '' })).toBeNull();
    expect(validateOmikujiPayload({ ...VALID_PAYLOAD, advice: '   \n  ' })).toBeNull();
  });

  it('menolak field yang melebihi batas panjang karakter', () => {
    expect(
      validateOmikujiPayload({ ...VALID_PAYLOAD, blessing: 'あ'.repeat(121) })
    ).toBeNull();
    // Tepat di batas masih diterima
    expect(
      validateOmikujiPayload({ ...VALID_PAYLOAD, blessing: 'あ'.repeat(120) })
    ).not.toBeNull();
  });

  it('menolak hasil parse "{}" dari AI yang gagal mengikuti kontrak', () => {
    expect(validateOmikujiPayload({})).toBeNull();
  });
});

describe('pickFallbackOmikuji', () => {
  it('mengembalikan ramalan fallback pertama saat random = 0', () => {
    const result = pickFallbackOmikuji(() => 0);
    expect(result.blessing).toBe(OMIKUJI_FALLBACK_FORTUNES[0].blessing);
  });

  it('mengembalikan ramalan fallback terakhir saat random mendekati 1', () => {
    const result = pickFallbackOmikuji(() => 0.999);
    expect(result.blessing).toBe(
      OMIKUJI_FALLBACK_FORTUNES[OMIKUJI_FALLBACK_FORTUNES.length - 1].blessing
    );
  });

  it('selalu mengembalikan satu dari kumpulan fallback (index ter-clamp)', () => {
    for (const value of [0, 0.3, 0.5, 0.7, 0.99, 1]) {
      const result = pickFallbackOmikuji(() => value);
      expect(OMIKUJI_FALLBACK_FORTUNES).toContainEqual(result);
    }
  });
});
