/**
 * src/components/tatami/StatusBanners.test.tsx
 * P3 (Revisi 6): test banner status — toast (role=status), banner sakit
 * (role=alert + tombol beli obat), banner tidur & banner Odekake.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusBanners } from './StatusBanners';
import { makePet } from '../../test/helpers';
import type { PetData } from '../../types/game';

function makeOdekake(): NonNullable<PetData['activeOdekake']> {
  return {
    id: 't1',
    destinationId: 'fuji',
    destinationName: 'Gunung Fuji',
    destinationKanji: '富士',
    destinationRegion: 'Honshu',
    startedAt: Date.now() - 60_000,
    durationMs: 600_000,
    bentoName: 'Bento',
    bentoEmoji: '🍱',
    omamoriName: 'Omamori',
    omamoriEmoji: '🧿',
    gearName: 'Tongkat',
    gearEmoji: '🥢',
    reward: {
      coins: 10,
      exp: 5,
      bondingPoints: 1,
      postcardId: 'p1',
      postcardTitle: 'Pemandangan',
      postcardKanji: '絵',
      postcardDesc: 'd',
      postcardStory: 's',
    },
  };
}

function renderBanners(pet: PetData, toastMessage: string | null = null) {
  const dismissToast = vi.fn();
  const setActiveModal = vi.fn();
  const handleOpenBedroomScene = vi.fn();
  render(
    <StatusBanners
      pet={pet}
      toastMessage={toastMessage}
      dismissToast={dismissToast}
      sleepRemainingSeconds={895}
      odekakeRemainingSeconds={540}
      setActiveModal={setActiveModal}
      handleOpenBedroomScene={handleOpenBedroomScene}
    />
  );
  return { dismissToast, setActiveModal, handleOpenBedroomScene };
}

describe('StatusBanners', () => {
  it('menampilkan toast; klik toast memanggil dismissToast', () => {
    const { dismissToast } = renderBanners(makePet(), 'Kon kon! Selamat datang!');
    expect(screen.getByText('Kon kon! Selamat datang!')).toBeTruthy();
    fireEvent.click(screen.getByText('Kon kon! Selamat datang!'));
    expect(dismissToast).toHaveBeenCalledTimes(1);
  });

  it('pet sakit: banner role=alert muncul + tombol "Beli Obat" membuka Toko', () => {
    const { setActiveModal } = renderBanners(makePet({ isSick: true }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(/demam roh/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Beli Obat' }));
    expect(setActiveModal).toHaveBeenCalledWith('shop');
  });

  it('pet tidur: banner tidur dengan tombol Toko & Futon', () => {
    const { setActiveModal, handleOpenBedroomScene } = renderBanners(makePet({ isSleeping: true }));
    expect(screen.getByText(/sedang tidur lelap/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Buka Toko Tanuki' }));
    expect(setActiveModal).toHaveBeenCalledWith('shop');
    fireEvent.click(screen.getByRole('button', { name: 'Lihat Kitsune di kamar tidur futon' }));
    expect(handleOpenBedroomScene).toHaveBeenCalledTimes(1);
  });

  it('pet berkelana: banner Odekake menampilkan destinasi + tombol Periksa Tabi', () => {
    const { setActiveModal } = renderBanners(makePet({ activeOdekake: makeOdekake() }));
    expect(screen.getByText(/berkelana ke Gunung Fuji/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Periksa Tabi/ }));
    expect(setActiveModal).toHaveBeenCalledWith('odekake');
  });

  it('tanpa kondisi khusus: tidak ada banner sakit/tidur/odekake', () => {
    renderBanners(makePet());
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText(/sedang tidur lelap/)).toBeNull();
  });
});
