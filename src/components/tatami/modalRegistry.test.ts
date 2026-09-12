/**
 * src/components/tatami/modalRegistry.test.ts
 * P3 (Revisi 6): guard registry modal — setiap ModalKind WAJIB punya label
 * pembaca layar yang tidak kosong. Mencegah modal baru terdaftar tanpa
 * nama aksesibel (regresi a11y senyap).
 */
import { describe, it, expect } from 'vitest';
import { MODAL_LABELS } from './modalRegistry';

describe('modalRegistry', () => {
  it('setiap ModalKind punya label non-kosong', () => {
    const entries = Object.entries(MODAL_LABELS);
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach(([kind, label]) => {
      expect(label, `Modal "${kind}" tanpa label`).toBeTruthy();
    });
  });

  it('jumlah modal tercatat sesuai arsitektur (19 modal + guard mencegah penambahan lupa label)', () => {
    // 19 modal konsolidasi (lihat ModalLayer.tsx). Naikkan angka ini saat
    // menambah modal BARU + labelnya — penambahan tanpa label akan gagal di
    // test pertama.
    expect(Object.keys(MODAL_LABELS).length).toBe(19);
  });
});
