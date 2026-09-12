/**
 * src/components/tatami/FirstQuestBanner.test.tsx
 * P3 (Revisi 6): test komponen Misi Pertama — status langkah (aktif/selesai/
 * terkunci), klik langkah aktif memicu onStepClick, dan aksesibilitas label.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirstQuestBanner } from './FirstQuestBanner';
import { makePet } from '../../test/helpers';

const PET = makePet({ stage: 'bayi', level: 1 });

function renderBanner(overrides: { activeStep?: 'feed' | 'bath' | 'minigame'; progress?: Record<string, boolean>; onStepClick?: (s: string) => void } = {}) {
  const onStepClick = overrides.onStepClick ?? vi.fn();
  render(
    <FirstQuestBanner
      pet={PET}
      activeStep={(overrides.activeStep ?? 'feed') as 'feed'}
      progress={(overrides.progress ?? { feed: false, bath: false, minigame: false }) as any}
      onStepClick={onStepClick}
    />
  );
  return { onStepClick };
}

describe('FirstQuestBanner', () => {
  it('menampilkan 3 langkah dengan langkah aktif ter-enable dan lainnya ter-disable', () => {
    renderBanner({ activeStep: 'feed' });
    const feed = screen.getByRole('button', { name: /Beri Makan untuk Konko \(langkah berikutnya/ });
    const bath = screen.getByRole('button', { name: /Mandikan untuk Konko \(terkunci/ });
    const minigame = screen.getByRole('button', { name: /Mini-game untuk Konko \(terkunci/ });
    expect(feed).toBeTruthy();
    expect((feed as HTMLButtonElement).disabled).toBe(false);
    expect((bath as HTMLButtonElement).disabled).toBe(true);
    expect((minigame as HTMLButtonElement).disabled).toBe(true);
  });

  it('klik langkah aktif memanggil onStepClick dengan id langkah', () => {
    const { onStepClick } = renderBanner({ activeStep: 'feed' });
    fireEvent.click(screen.getByRole('button', { name: /Beri Makan untuk Konko/ }));
    expect(onStepClick).toHaveBeenCalledWith('feed');
  });

  it('klik langkah terkunci tidak memanggil onStepClick', () => {
    const { onStepClick } = renderBanner({ activeStep: 'feed' });
    fireEvent.click(screen.getByRole('button', { name: /Mandikan untuk Konko/ }));
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('langkah yang selesai berlabel ✅ dan tidak bisa diklik ulang', () => {
    const { onStepClick } = renderBanner({
      activeStep: 'bath',
      progress: { feed: true, bath: false, minigame: false },
    });
    const feed = screen.getByRole('button', { name: /Beri Makan untuk Konko \(selesai\)/ });
    expect((feed as HTMLButtonElement).disabled).toBe(true);
    const bath = screen.getByRole('button', { name: /Mandikan untuk Konko \(langkah berikutnya/ });
    expect((bath as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText('✅')).toBeTruthy();
    fireEvent.click(feed);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it('punya region ber-label untuk pembaca layar', () => {
    renderBanner();
    expect(screen.getByRole('region', { name: /Misi Pertama Pengasuh/ })).toBeTruthy();
  });
});
