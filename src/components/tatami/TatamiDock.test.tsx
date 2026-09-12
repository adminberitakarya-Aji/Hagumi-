/**
 * src/components/tatami/TatamiDock.test.tsx
 * P3 (Revisi 6): test dock aksi klasik — 8 tombol hadir, blokir aktivitas saat
 * tidur, pemanggilan triggerShoji/aksi, dan tombol pindah ke Sensu.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TatamiDock } from './TatamiDock';
import { makePet } from '../../test/helpers';

// Mock audio & haptic (Proxy: setiap metode = vi.fn) agar test deterministik
vi.mock('../../utils/soundEngine', () => ({
  soundEngine: new Proxy({}, { get: () => vi.fn() }),
}));
vi.mock('../../utils/hapticFeedback', () => ({
  hapticEngine: new Proxy({}, { get: () => vi.fn() }),
}));

function renderDock(pet = makePet(), overrides: Partial<Parameters<typeof TatamiDock>[0]> = {}) {
  const triggerShoji = vi.fn();
  const setActiveModal = vi.fn();
  const handleSleepingActivityBlocked = vi.fn();
  const handleOpenBathScene = vi.fn();
  const handleSleepButtonClick = vi.fn();
  const setIsDockMode = vi.fn();
  const setIsSensuOpen = vi.fn();
  render(
    <TatamiDock
      pet={pet}
      isDockMode={true}
      setActiveModal={setActiveModal}
      triggerShoji={triggerShoji}
      handleSleepingActivityBlocked={handleSleepingActivityBlocked}
      handleOpenBathScene={handleOpenBathScene}
      handleSleepButtonClick={handleSleepButtonClick}
      setIsDockMode={setIsDockMode}
      setIsSensuOpen={setIsSensuOpen}
      sleepRemainingSeconds={900}
      {...overrides}
    />
  );
  return { triggerShoji, setActiveModal, handleSleepingActivityBlocked, handleOpenBathScene, handleSleepButtonClick, setIsDockMode, setIsSensuOpen };
}

const AWAKE_LABELS = [
  'Makan Bento',
  'Pemandian Onsen',
  'Tidurkan Kitsune selama 15 Menit',
  'Lemari Busana Kitsune Tansu',
  'Buka Kuil Inari (Omikuji, Ema & AI Chat)',
  'Buka Festival Matsuri (mini-game)',
  'Buka Toko Serba Ada Tanuki (buka selalu)',
  'Buka Menu Fitur Santuari',
];

describe('TatamiDock — pet terjaga', () => {
  it('menampilkan 8 tombol aksi dengan aria-label yang benar', () => {
    renderDock();
    AWAKE_LABELS.forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    });
  });

  it('klik Makan membuka Bento via transisi Shoji', () => {
    const { triggerShoji } = renderDock();
    fireEvent.click(screen.getByRole('button', { name: 'Makan Bento' }));
    expect(triggerShoji).toHaveBeenCalledTimes(1);
    expect(triggerShoji.mock.calls[0][0].label).toBe('Kotak Bento Jubako');
  });

  it('klik Tidur memanggil handleSleepButtonClick', () => {
    const { handleSleepButtonClick } = renderDock();
    fireEvent.click(screen.getByRole('button', { name: AWAKE_LABELS[2] }));
    expect(handleSleepButtonClick).toHaveBeenCalledTimes(1);
  });

  it('tombol pindah ke Sensu mematikan dock & membuka kipas', () => {
    const { setIsDockMode, setIsSensuOpen } = renderDock();
    fireEvent.click(screen.getByRole('button', { name: /Beralih ke Menu Kipas Sensu/ }));
    expect(setIsDockMode).toHaveBeenCalledWith(false);
    expect(setIsSensuOpen).toHaveBeenCalledWith(true);
  });
});

describe('TatamiDock — pet tidur', () => {
  it('aktivitas fisik diblokir dengan pesan, tanpa membuka modal', () => {
    const sleeping = makePet({ isSleeping: true, sleepUntilTimestamp: Date.now() + 600_000 });
    const { triggerShoji, handleSleepingActivityBlocked } = renderDock(sleeping);
    fireEvent.click(screen.getByRole('button', { name: 'Makan — Kitsune sedang tidur lelap' }));
    expect(handleSleepingActivityBlocked).toHaveBeenCalledWith('Makan');
    expect(triggerShoji).not.toHaveBeenCalled();
  });

  it('Toko tetap bisa dibuka saat pet tidur (via transisi Shoji)', () => {
    const sleeping = makePet({ isSleeping: true, sleepUntilTimestamp: Date.now() + 600_000 });
    const { triggerShoji } = renderDock(sleeping);
    fireEvent.click(screen.getByRole('button', { name: 'Buka Toko Serba Ada Tanuki (buka selalu)' }));
    // Toko tidak diblokir tidur: langsung menyiapkan transisi Shoji ke modal toko
    expect(triggerShoji).toHaveBeenCalledTimes(1);
    expect(triggerShoji.mock.calls[0][0].label).toBe('Toko Serba Ada Tanuki');
  });
});
