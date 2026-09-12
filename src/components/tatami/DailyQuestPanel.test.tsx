/**
 * src/components/tatami/DailyQuestPanel.test.tsx
 * P4 (Revisi 6): test panel Misi Harian — chip status per quest, mode tuntas,
 * badge streak 🔥, dan label aksesibilitas.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyQuestPanel } from './DailyQuestPanel';

describe('DailyQuestPanel', () => {
  it('belum ada quest: dua chip "belum dilakukan", tanpa badge streak', () => {
    render(<DailyQuestPanel streakCount={0} feedDone={false} gameDone={false} />);
    expect(screen.getByLabelText(/Makan: belum dilakukan hari ini/)).toBeTruthy();
    expect(screen.getByLabelText(/Mini-game: belum dilakukan hari ini/)).toBeTruthy();
    expect(screen.queryByText(/🔥/)).toBeNull();
  });

  it('quest makan selesai: chip ✅, chip mini-game masih pending', () => {
    render(<DailyQuestPanel streakCount={1} feedDone={true} gameDone={false} />);
    expect(screen.getByLabelText(/Makan: selesai/)).toBeTruthy();
    expect(screen.getByLabelText(/Mini-game: belum dilakukan hari ini/)).toBeTruthy();
  });

  it('semua tuntas: teks "Tuntas — kembali besok!"', () => {
    render(<DailyQuestPanel streakCount={3} feedDone={true} gameDone={true} />);
    expect(screen.getByText(/Tuntas — kembali besok!/)).toBeTruthy();
  });

  it('badge streak 🔥 muncul saat streak > 0 dengan angka yang benar', () => {
    render(<DailyQuestPanel streakCount={7} feedDone={false} gameDone={true} />);
    expect(screen.getByText('🔥7')).toBeTruthy();
    expect(screen.getByLabelText(/streak 7 hari/)).toBeTruthy();
  });

  it('region ber-role status dengan label pembaca layar', () => {
    render(<DailyQuestPanel streakCount={2} feedDone={false} gameDone={false} />);
    expect(screen.getByRole('status', { name: /Misi Harian — streak 2 hari/ })).toBeTruthy();
  });
});
