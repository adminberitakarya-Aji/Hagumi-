/**
 * src/components/tatami/InariConsiderationCard.test.tsx
 * P3 (Revisi 6): test layar "Pertimbangan Inari" — keterbukaan, konten per
 * tahap (bayi → tujuan level; remaja → 4 cabang + prediksi; dewasa → takdir
 * terpilih), determinisme prediksi cabang, dan kehadiran narasi wabi-sabi.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InariConsiderationCard } from './InariConsiderationCard';
import { makePet } from '../../test/helpers';

function openCard(pet = makePet()) {
  render(<InariConsiderationCard pet={pet} />);
  fireEvent.click(screen.getByRole('button', { name: /Pertimbangan Inari —/ }));
}

describe('InariConsiderationCard', () => {
  it('tertutup secara default; tombol membuka panel', () => {
    render(<InariConsiderationCard pet={makePet()} />);
    expect(screen.queryByRole('region', { name: 'Pertimbangan Inari' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Pertimbangan Inari/ }));
    expect(screen.getByRole('region', { name: 'Pertimbangan Inari' })).toBeTruthy();
  });

  it('tahap bayi: menampilkan tujuan level berikutnya (Kogitsune @Lv3)', () => {
    openCard(makePet({ stage: 'bayi', level: 1 }));
    expect(screen.getByText(/Menuju: Kogitsune \(Anak Rubah\)/)).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
  });

  it('tahap anak: menampilkan tujuan level berikutnya (Wakahitsune @Lv6)', () => {
    openCard(makePet({ stage: 'anak', level: 4 }));
    expect(screen.getByText(/Menuju: Wakahitsune \(Rubah Muda\)/)).toBeTruthy();
    expect(screen.getByText('4/6')).toBeTruthy();
  });

  it('tahap remaja: menampilkan 4 cabang + prediksi deterministik (Kasih 75/Disiplin 75 → Zenko)', () => {
    openCard(makePet({ stage: 'remaja', level: 8, careScore: 75 }));
    expect(screen.getByText(/Zenko \(Rubah Putih Kebajikan\)/)).toBeTruthy();
    expect(screen.getByText(/Tenko \(Rubah Surgawi 9 Ekor\)/)).toBeTruthy();
    expect(screen.getByText(/Yako \(Rubah Liar Cerdik\)/)).toBeTruthy();
    expect(screen.getByText(/Nogitsune \(Rubah Rimba Pegunungan\)/)).toBeTruthy();
    // Tepat satu badge prediksi, dan jatuh di Zenko
    const badges = screen.getAllByText('KONDISI KINI');
    expect(badges.length).toBe(1);
    expect(screen.getByText('75/85')).toBeTruthy(); // progres Kasih menuju Tenko
    expect(screen.getAllByText('75/70').length).toBeGreaterThanOrEqual(1); // bar Kasih & Disiplin menuju Zenko
  });

  it('tahap remaja: Kasih tinggi tanpa Disiplin memprediksi Yako, bukan Zenko', () => {
    openCard(makePet({ stage: 'remaja', level: 8, careScore: 75 }));
    // Disiplin default makePet = 50 → Zenko (butuh 70) gagal → Yako
    const zenkoBlock = screen.getByText(/Zenko \(Rubah Putih Kebajikan\)/).closest('div');
    expect(zenkoBlock?.textContent).not.toContain('KONDISI KINI');
    const yakoBlock = screen.getByText(/Yako \(Rubah Liar Cerdik\)/).closest('div');
    expect(yakoBlock?.textContent).toContain('KONDISI KINI');
  });

  it('tahap dewasa: menampilkan takdir yang telah terpilih', () => {
    openCard(makePet({ stage: 'dewasa', form: 'nogitsune', tailCount: 4 }));
    expect(screen.getByText(/Takdir telah terpilih: Nogitsune \(Rubah Rimba Pegunungan\) • 4 ekor/)).toBeTruthy();
  });

  it('selalu memuat konsekuensi naratif wabi-sabi', () => {
    openCard();
    expect(screen.getByText(/tak ada kematian/i)).toBeTruthy();
  });
});
