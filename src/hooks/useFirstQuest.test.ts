/**
 * src/hooks/useFirstQuest.test.ts
 * P3 (Revisi 6): unit test "Misi Pertama Pengasuh" — visibilitas untuk pet muda,
 * progres & persistensi localStorage terikat pet.id, hadiah tepat satu kali,
 * dan reset untuk generasi baru.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFirstQuest, FIRST_QUEST_STEPS } from './useFirstQuest';
import { makePet } from '../test/helpers';
import type { PetData } from '../types/game';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

/** Harness: setPet meniru React (updater(prev) diterapkan ke state terkini). */
function createHarness(pet: PetData) {
  let state = pet;
  const setPet = vi.fn((action: PetData | ((prev: PetData) => PetData)) => {
    state = typeof action === 'function' ? action(state) : action;
  });
  const showToast = vi.fn();
  return { getState: () => state, setPet, showToast };
}

const FRESH_PET = makePet({ stage: 'bayi', level: 1, coins: 50, exp: 10 });

describe('useFirstQuest — visibilitas', () => {
  it('tampil untuk pet muda (bayi, level < 3)', () => {
    const h = createHarness(FRESH_PET);
    const { result } = renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));
    expect(result.current.visible).toBe(true);
    expect(result.current.activeStep).toBe('feed');
  });

  it('tidak tampil untuk pet yang sudah besar (anak / level >= 3)', () => {
    const older = makePet({ stage: 'anak', level: 3 });
    const h = createHarness(older);
    const { result } = renderHook(() => useFirstQuest({ pet: older, setPet: h.setPet, showToast: h.showToast }));
    expect(result.current.visible).toBe(false);
  });

  it('tidak tampil untuk telur', () => {
    const egg = makePet({ stage: 'egg', level: 1 });
    const h = createHarness(egg);
    const { result } = renderHook(() => useFirstQuest({ pet: egg, setPet: h.setPet, showToast: h.showToast }));
    expect(result.current.visible).toBe(false);
  });
});

describe('useFirstQuest — progres & persistensi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('markDone menandai langkah & tersimpan di localStorage terikat pet.id', () => {
    const h = createHarness(FRESH_PET);
    const { result } = renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));
    act(() => result.current.markDone('feed'));
    expect(result.current.progress.feed).toBe(true);
    const raw = localStorage.getItem(`hagumi_first_quest_${FRESH_PET.id}`);
    expect(JSON.parse(raw!)).toMatchObject({ feed: true, bath: false, minigame: false });
  });

  it('progres dilanjutkan untuk pet.id yang sama saat hook di-render ulang', () => {
    localStorage.setItem(`hagumi_first_quest_${FRESH_PET.id}`, JSON.stringify({ feed: true, bath: false, minigame: false, rewarded: false }));
    const h = createHarness(FRESH_PET);
    const { result } = renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));
    expect(result.current.progress.feed).toBe(true);
    expect(result.current.activeStep).toBe('bath');
  });

  it('generasi baru (pet.id berbeda) memulai misi dari awal', () => {
    localStorage.setItem(`hagumi_first_quest_${FRESH_PET.id}`, JSON.stringify({ feed: true, bath: true, minigame: true, rewarded: true }));
    const gen2 = makePet({ stage: 'bayi', level: 1, id: 'kitsune_gen2' });
    const h = createHarness(gen2);
    const { result } = renderHook(() => useFirstQuest({ pet: gen2, setPet: h.setPet, showToast: h.showToast }));
    expect(result.current.progress.feed).toBe(false);
    expect(result.current.visible).toBe(true);
  });

  it('markDone pada langkah yang sama bersifat idempoten', () => {
    const h = createHarness(FRESH_PET);
    const { result } = renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));
    act(() => result.current.markDone('feed'));
    act(() => result.current.markDone('feed'));
    expect(result.current.progress.feed).toBe(true);
  });
});

describe('useFirstQuest — hadiah penyelesaian', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('memberikan +20 Ryo & +15 EXP tepat satu kali saat 3 langkah tuntas', () => {
    const h = createHarness(FRESH_PET);
    const { result } = renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));

    act(() => result.current.markDone('feed'));
    act(() => result.current.markDone('bath'));
    expect(h.setPet).not.toHaveBeenCalled(); // belum lengkap

    act(() => result.current.markDone('minigame'));
    expect(result.current.isCompleted).toBe(true);
    expect(h.showToast).toHaveBeenCalledWith(expect.stringContaining('Misi Pertama Pengasuh selesai'));
    // state pet: +20 Ryo & +15 EXP (diterapkan via updater yang dijalankan harness)
    expect(h.getState().coins).toBe(70);
    expect(h.getState().exp).toBe(25);
  });

  it('tidak memberi hadiah dua kali', () => {
    localStorage.setItem(
      `hagumi_first_quest_${FRESH_PET.id}`,
      JSON.stringify({ feed: true, bath: true, minigame: true, rewarded: true })
    );
    const h = createHarness(FRESH_PET);
    renderHook(() => useFirstQuest({ pet: FRESH_PET, setPet: h.setPet, showToast: h.showToast }));
    expect(h.setPet).not.toHaveBeenCalled();
    expect(h.showToast).not.toHaveBeenCalled();
  });

  it('daftar langkah & urutannya konsisten', () => {
    expect(FIRST_QUEST_STEPS.map((s) => s.id)).toEqual(['feed', 'bath', 'minigame']);
  });
});
