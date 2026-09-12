/**
 * src/hooks/useFirstQuest.ts
 * P2 (Revisi 6): "Misi Pertama Pengasuh" — onboarding garis lurus pasca-penetasan:
 * 🍙 Beri makan → 🛁 Mandikan → 🎏 Mainkan 1 mini-game Festival.
 *
 * - UI-only: TIDAK mengubah schema save. Progres disimpan di localStorage terpisah
 *   dan diikat `pet.id`, sehingga generasi baru otomatis memulai misi dari awal.
 * - Bersifat memandu (non-blocking): seluruh modal tetap bisa dibuka kapan saja —
 *   konsisten dengan desain cozy non-punishing HAGUMI.
 * - Hanya tampil untuk pet muda (stage 'bayi' & level < 3): pemain lama & pet
 *   generasi lanjut tidak diganggu.
 * - Hadiah penyelesaian (+20 Ryo & +15 EXP) diberikan tepat satu kali (flag
 *   `rewarded` ikut tersimpan).
 */
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import confetti from 'canvas-confetti';
import { PetData } from '../types/game';
import { addPetExp } from '../data/gameConfig';

export type FirstQuestStepId = 'feed' | 'bath' | 'minigame';

export const FIRST_QUEST_STEPS: { id: FirstQuestStepId; label: string; icon: string }[] = [
  { id: 'feed', label: 'Beri Makan', icon: '🍙' },
  { id: 'bath', label: 'Mandikan', icon: '🛁' },
  { id: 'minigame', label: 'Mini-game', icon: '🎏' },
];

export interface FirstQuestProgress extends Record<FirstQuestStepId, boolean> {
  rewarded: boolean;
}

const EMPTY_PROGRESS: FirstQuestProgress = { feed: false, bath: false, minigame: false, rewarded: false };

interface UseFirstQuestOptions {
  pet: PetData;
  setPet: Dispatch<SetStateAction<PetData>>;
  showToast: (msg: string) => void;
}

const storageKey = (petId: string) => `hagumi_first_quest_${petId}`;

function loadProgress(petId: string): FirstQuestProgress {
  try {
    const raw = localStorage.getItem(storageKey(petId));
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<FirstQuestProgress>;
    return { ...EMPTY_PROGRESS, ...parsed };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function useFirstQuest({ pet, setPet, showToast }: UseFirstQuestOptions) {
  const [progress, setProgress] = useState<FirstQuestProgress>(() => loadProgress(pet.id));

  // Reset progres saat identitas pet berubah (generasi baru / pemain reset)
  useEffect(() => {
    setProgress(loadProgress(pet.id));
  }, [pet.id]);

  const markDone = useCallback(
    (step: FirstQuestStepId) => {
      setProgress((prev) => {
        if (prev[step]) return prev;
        const next = { ...prev, [step]: true };
        try {
          localStorage.setItem(storageKey(pet.id), JSON.stringify(next));
        } catch {
          /* penyimpanan gagal diabaikan — progres tetap hidup untuk sesi ini */
        }
        return next;
      });
    },
    [pet.id]
  );

  // Hadiah penyelesaian — diberikan tepat satu kali
  useEffect(() => {
    const isComplete = progress.feed && progress.bath && progress.minigame;
    if (!isComplete || progress.rewarded) return;
    const next = { ...progress, rewarded: true };
    try {
      localStorage.setItem(storageKey(pet.id), JSON.stringify(next));
    } catch {
      /* diabaikan — hadiah tetap diberikan untuk sesi ini */
    }
    setProgress(next);

    const REWARD_RYO = 20;
    const REWARD_EXP = 15;
    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, REWARD_EXP);
      return {
        ...prev,
        coins: prev.coins + REWARD_RYO,
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });
    showToast(`⛩️ Misi Pertama Pengasuh selesai! Inari berkatimu +${REWARD_RYO} Ryo & +${REWARD_EXP} EXP.`);
    // Confetti hanya kosmetik — jangan pernah membuat hadiah gagal (mis. canvas
    // tidak tersedia di environment test / browser eksotis).
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#ffb7c5', '#f59e0b', '#d63a2f', '#e8f4fd'],
        disableForReducedMotion: true,
      });
    } catch {
      /* diabaikan */
    }
  }, [progress, pet.id, setPet, showToast]);

  const isCompleted = progress.feed && progress.bath && progress.minigame;
  // Hanya untuk pet muda — pemain lama & pet generasi lanjut tidak diganggu
  const visible = pet.stage === 'bayi' && pet.level < 3 && !isCompleted;
  const activeStep = FIRST_QUEST_STEPS.find((step) => !progress[step.id])?.id ?? null;

  return { progress, activeStep, markDone, visible, isCompleted };
}
