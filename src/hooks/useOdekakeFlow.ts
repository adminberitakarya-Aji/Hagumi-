/**
 * src/hooks/useOdekakeFlow.ts
 * Cluster logika Petualangan Berkelana (Kitsune O-dekake / Tabi):
 * countdown perjalanan, deteksi kepulangan, berangkat/panggil-pulang/klaim hadiah.
 * Diekstrak dari TatamiRoom.tsx (Mid-Term #4 follow-up) agar God component mengecil.
 */

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { PetData, OdekakeTrip, OdekakeReward } from '../types/game';
import { addPetExp } from '../data/gameConfig';
import { useCountdown } from './useTimers';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface UseOdekakeFlowOptions {
  pet: PetData;
  setPet: Dispatch<SetStateAction<PetData>>;
  showToast: (msg: string) => void;
  /** Dipanggil saat panggil-pulang dini (menutup modal Odekake). */
  closeModal: () => void;
}

export function useOdekakeFlow({ pet, setPet, showToast, closeModal }: UseOdekakeFlowOptions) {
  // Sambutan kepulangan yang menunggu di-claim pemain (via OdekakeReturnModal)
  const [completedTripToCelebrate, setCompletedTripToCelebrate] = useState<{
    destinationName: string;
    destinationKanji: string;
    reward: OdekakeReward;
  } | null>(null);

  // Odekake live countdown (target = startedAt + durationMs; null saat tidak berkelana)
  const odekakeRemainingSeconds = useCountdown(
    pet.activeOdekake ? pet.activeOdekake.startedAt + pet.activeOdekake.durationMs : null
  );

  // Jika durasi perjalanan sudah habis, selesaikan perjalanan dan sambut kepulangan Kitsune!
  useEffect(() => {
    if (pet.activeOdekake && odekakeRemainingSeconds <= 0 && !completedTripToCelebrate) {
      soundEngine.playOdekakeReturn();
      hapticEngine.evolution();
      setCompletedTripToCelebrate({
        destinationName: pet.activeOdekake.destinationName,
        destinationKanji: pet.activeOdekake.destinationKanji,
        reward: pet.activeOdekake.reward,
      });
    }
  }, [pet.activeOdekake, odekakeRemainingSeconds, completedTripToCelebrate]);

  // Helper when clicking blocked activities while on Odekake journey
  const handleOdekakeActivityBlocked = (activityName: string) => {
    soundEngine.playFoxChirp();
    hapticEngine.softTap();
    showToast(`🎒 ${pet.name} sedang berkelana di ${pet.activeOdekake?.destinationName}... Menu ${activityName} menunggu hingga Kitsune kembali!`);
  };

  // Depart on Odekake journey
  const handleDepartOdekake = (trip: OdekakeTrip, totalCost: number) => {
    setPet((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - totalCost),
      activeOdekake: trip,
      lastInteractionTime: Date.now(),
    }));
  };

  // Early recall from Odekake (Kitsunebi return)
  const handleRecallEarlyOdekake = () => {
    if (!pet.activeOdekake) return;
    const partialCoins = Math.max(10, Math.round(pet.activeOdekake.reward.coins * 0.5));
    const partialExp = Math.max(10, Math.round(pet.activeOdekake.reward.exp * 0.5));
    const expRes = addPetExp(pet.exp, pet.level, partialExp);

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, partialExp);
      return {
        ...prev,
        coins: prev.coins + partialCoins,
        exp: res.newExp,
        level: res.newLevel,
        activeOdekake: undefined,
        completedOdekakes: (prev.completedOdekakes || 0) + 1,
        lastInteractionTime: Date.now(),
      };
    });

    closeModal();
    showToast(`✨ Kitsunebi Return! ${pet.name} kembali pulang membawa ${partialCoins} Ryo & ${partialExp} EXP!`);
  };

  // Claim Completed Odekake Reward
  const handleClaimOdekakeReward = () => {
    if (!completedTripToCelebrate) return;
    const { reward } = completedTripToCelebrate;
    const expRes = addPetExp(pet.exp, pet.level, reward.exp);

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, reward.exp);
      const updatedPostcards = [...(prev.unlockedPostcards || [])];
      if (reward.postcardId && !updatedPostcards.includes(reward.postcardId)) {
        updatedPostcards.push(reward.postcardId);
      }

      const updatedSeeds = [...(prev.unlockedSeeds || [])];
      if (reward.seedName && !updatedSeeds.includes(reward.seedName)) {
        updatedSeeds.push(reward.seedName);
      }

      return {
        ...prev,
        coins: prev.coins + reward.coins,
        exp: res.newExp,
        level: res.newLevel,
        bondingPoints: (prev.bondingPoints || 0) + reward.bondingPoints,
        activeOdekake: undefined,
        completedOdekakes: (prev.completedOdekakes || 0) + 1,
        unlockedPostcards: updatedPostcards,
        unlockedSeeds: updatedSeeds,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 20),
        },
        lastInteractionTime: Date.now(),
      };
    });

    setCompletedTripToCelebrate(null);
    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      showToast(`🎉 Level Up! Oleh-oleh perjalanan membuat ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(`🎴 Oleh-oleh berhasil disimpan ke Album! +${reward.coins} Ryo, +${reward.exp} EXP & +${reward.bondingPoints} Kizuna!`);
    }
  };

  return {
    completedTripToCelebrate,
    odekakeRemainingSeconds,
    handleOdekakeActivityBlocked,
    handleDepartOdekake,
    handleRecallEarlyOdekake,
    handleClaimOdekakeReward,
  };
}
