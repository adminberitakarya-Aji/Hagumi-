/**
 * src/hooks/useCareActions.ts
 * Cluster aksi perawatan Kitsune: mengelus, memberi makan, mandi/bersih-bersih,
 * tidur & bangun (dialog + toggle), serta blokir aktivitas saat tidur.
 * Diekstrak dari TatamiRoom.tsx (Mid-Term #4 follow-up) agar God component mengecil.
 */

import type { Dispatch, SetStateAction } from 'react';
import { PetData, FoodItem } from '../types/game';
import { addPetExp, getBondingLevelInfo } from '../data/gameConfig';
import { ModalKind } from '../components/tatami/modalRegistry';
import { ShojiTransitionConfig } from '../components/ShojiTransition';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

export type TatamiActionState = 'idle' | 'eating' | 'bathing' | 'sleeping' | 'happy' | 'sick';

interface UseCareActionsOptions {
  pet: PetData;
  setPet: Dispatch<SetStateAction<PetData>>;
  showToast: (msg: string) => void;
  setActiveModal: Dispatch<SetStateAction<ModalKind | null>>;
  triggerShoji: (config: ShojiTransitionConfig) => void;
  setActionState: Dispatch<SetStateAction<TatamiActionState>>;
  setIsLanternOn: Dispatch<SetStateAction<boolean>>;
}

export function useCareActions({
  pet,
  setPet,
  showToast,
  setActiveModal,
  triggerShoji,
  setActionState,
  setIsLanternOn,
}: UseCareActionsOptions) {
  // Pet action: Petting the Kitsune (+5 EXP)
  const handlePetClick = () => {
    soundEngine.playFoxChirp();
    hapticEngine.petPurr();
    setActionState('happy');

    const expGain = 5;
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
      showToast(`🎉 Level Up! ${pet.name} kini mencapai Level ${expRes.newLevel}! (+${expGain} EXP)`);
    } else {
      showToast(`*Kon!* ${pet.name} merasa disayangi! (+3 Bahagia, +${expGain} EXP)`);
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      const newBondingPts = (prev.bondingPoints ?? 120) + 2;
      const bondInfo = getBondingLevelInfo(newBondingPts);

      return {
        ...prev,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 3),
        },
        bondingPoints: newBondingPts,
        bondingLevel: bondInfo.level,
        bondingTitle: bondInfo.currentMilestone.title,
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });

    setTimeout(() => setActionState('idle'), 1800);
  };

  // Feeding item (Dynamic EXP based on item)
  const handleFeedItem = (item: FoodItem) => {
    soundEngine.playFeed();
    hapticEngine.medium();
    setActionState('eating');

    const isFavorite =
      item.id === pet.favoriteFood ||
      (pet.favoriteFood === 'aburaage' && (item.id === 'aburaage' || item.id === 'inari'));
    const bondingGain = isFavorite ? 15 : 4;

    const expGain = item.exp || 15;
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
      showToast(`🎉 Level Up! ${pet.name} mencapai Level ${expRes.newLevel} berkat ${item.name}!`);
    } else if (isFavorite) {
      soundEngine.playChime();
      hapticEngine.heavy();
      showToast(`💖 Makanan Kesukaan Roh! ${pet.name} bersuka cita! (+15 Poin Ikatan Batin, +${expGain} EXP)`);
    } else {
      showToast(`Kamu menyuapkan ${item.name} ke ${pet.name}! (+${item.hunger} Kenyang, +${bondingGain} Ikatan)`);
    }

    setPet((prev) => {
      const currentCount = prev.inventory[item.id] || 0;
      const updatedInv = { ...prev.inventory };
      if (currentCount > 1) {
        updatedInv[item.id] = currentCount - 1;
      } else {
        delete updatedInv[item.id];
      }

      const newHunger = Math.min(100, prev.stats.hunger + item.hunger);
      const newHappiness = Math.min(100, prev.stats.happiness + item.happiness);
      const newEnergy = Math.min(100, prev.stats.energy + (item.energy || 0));
      const newHealth = item.curesSickness
        ? Math.min(100, prev.stats.health + (item.health || 40))
        : prev.stats.health;
      const curesSick = item.curesSickness ? false : prev.isSick;

      const res = addPetExp(prev.exp, prev.level, expGain);
      const newBondingPts = (prev.bondingPoints ?? 120) + bondingGain;
      const bondInfo = getBondingLevelInfo(newBondingPts);

      return {
        ...prev,
        inventory: updatedInv,
        stats: {
          ...prev.stats,
          hunger: newHunger,
          happiness: newHappiness,
          energy: newEnergy,
          health: newHealth,
        },
        bondingPoints: newBondingPts,
        bondingLevel: bondInfo.level,
        bondingTitle: bondInfo.currentMilestone.title,
        isSick: curesSick,
        weight: prev.weight + 15,
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });

    setTimeout(() => setActionState('idle'), 2200);
  };

  // Open Onsen Bath Sanctuary
  const handleOpenBathScene = () => {
    triggerShoji({
      label: 'Pemandian Onsen Hinoki',
      kanji: '🛁 湯',
      sublabel: 'Kolam Air Hangat & Busa Melati',
      onMidpoint: () => setActiveModal('bath'),
    });
  };

  // Complete Bathing from Onsen Scene
  const handleFinishBath = (expGain: number, happinessGain: number) => {
    const expRes = addPetExp(pet.exp, pet.level, expGain);
    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
      showToast(`🎉 Level Up! Mandi air hangat menyegarkan! ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(`✨ ${pet.name} segar berseri setelah berendam di Hinoki Ofuro! (+${expGain} EXP)`);
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      return {
        ...prev,
        poopCount: 0,
        stats: {
          ...prev.stats,
          cleanliness: 100,
          happiness: Math.min(100, prev.stats.happiness + happinessGain),
        },
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });
  };

  // Open Futon Bedroom Sanctuary
  const handleOpenBedroomScene = () => {
    triggerShoji({
      label: 'Kamar Peraduan Futon',
      kanji: '🛏️ 眠',
      sublabel: 'Peristirahatan Futon & Selimut Sutra',
      onMidpoint: () => {
        setIsLanternOn(false);
        setActiveModal('bedroom');
      },
    });
  };

  // Complete Sleeping / Wake up from Bedroom Scene
  const handleWakeUpFromBedroom = (energyGain: number, expGain: number) => {
    setIsLanternOn(true);
    const expRes = addPetExp(pet.exp, pet.level, expGain);
    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
      showToast(`🎉 ${pet.name} bangun tidur dengan segar dan naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(`☀️ ${pet.name} terbangun dengan bugar dan siap bermain! (+${Math.round(energyGain)} Energi, +${expGain} EXP)`);
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      return {
        ...prev,
        isSleeping: false,
        sleepUntilTimestamp: undefined,
        stats: {
          ...prev.stats,
          energy: Math.min(100, prev.stats.energy + energyGain),
        },
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });
  };

  // Helper when clicking blocked activities while sleeping
  const handleSleepingActivityBlocked = (activityName: string) => {
    soundEngine.playFoxChirp();
    hapticEngine.softTap();
    showToast(`Shhh... ${pet.name} sedang tidur lelap (Zzz...). Menu ${activityName} istirahat sejenak hingga bangun.`);
  };

  // Confirm Sleep for 15 minutes & automatically open Bedroom Scene
  const handleConfirmSleep = () => {
    setActiveModal(null);
    soundEngine.playSleepChime();
    hapticEngine.heavy();

    const sleepDurationMs = 15 * 60 * 1000; // 15 Menit
    const target = Date.now() + sleepDurationMs;

    setIsLanternOn(false);
    setActionState('sleeping');
    showToast(`🌙 ${pet.name} mulai tidur lelap selama 15 menit... Toko Tanuki tetap buka!`);

    setPet((prev) => ({
      ...prev,
      isSleeping: true,
      sleepUntilTimestamp: target,
      lastInteractionTime: Date.now(),
    }));

    // Otomatis beralih ke latar Kamar Tidur Futon (Bedroom Scene) dengan transisi Shoji halus
    triggerShoji({
      label: 'Kamar Peraduan Futon',
      kanji: '🛏️ 眠',
      sublabel: `Peristirahatan Kasur Futon • ${pet.name}`,
      onMidpoint: () => {
        setActiveModal('bedroom');
      },
    });
  };

  // Sleeping button action (from dock or menu)
  const handleSleepButtonClick = () => {
    if (pet.isSleeping) {
      handleOpenBedroomScene();
    } else {
      setActiveModal('sleepConfirm');
    }
  };

  // Bathing & Cleaning Poop quick on tatami floor (+20 EXP for cleaning poop)
  const handleCleanAndBath = () => {
    soundEngine.playBath();
    hapticEngine.medium();
    const hadPoop = pet.poopCount > 0;
    if (hadPoop) {
      soundEngine.playSweep();
    }
    setActionState('bathing');

    const expGain = hadPoop ? 20 : 12;
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
      showToast(`🎉 Level Up! Pelataran bersih membawa berkah! ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(
        hadPoop
          ? `Menyapu pelataran tatami & memandikan ${pet.name} dengan air hangat! (+${expGain} EXP)`
          : `Memandikan ${pet.name} dengan busa wangi melati! (+${expGain} EXP)`
      );
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      return {
        ...prev,
        poopCount: 0,
        stats: {
          ...prev.stats,
          cleanliness: 100,
          happiness: Math.min(100, prev.stats.happiness + 10),
        },
        exp: res.newExp,
        level: res.newLevel,
        lastInteractionTime: Date.now(),
      };
    });

    setTimeout(() => setActionState('idle'), 2400);
  };

  // Sleeping toggle
  const handleToggleSleep = () => {
    soundEngine.playSleepChime();
    hapticEngine.heavy();
    const willSleep = !pet.isSleeping;

    if (willSleep) {
      setIsLanternOn(false);
      setActionState('sleeping');
      showToast(`${pet.name} bergelung tidur di atas futon hangat... Zzz`);

      setPet((prev) => ({
        ...prev,
        isSleeping: true,
        lastInteractionTime: Date.now(),
      }));
    } else {
      setIsLanternOn(true);
      setActionState('idle');
      const expGain = 10;
      const expRes = addPetExp(pet.exp, pet.level, expGain);

      if (expRes.leveledUp) {
        soundEngine.playEvolutionFanfare();
        hapticEngine.evolution();
        showToast(`🎉 ${pet.name} bangun tidur dengan segar dan naik ke Level ${expRes.newLevel}!`);
      } else {
        showToast(`${pet.name} terbangun dengan bugar! (+35 Energi, +${expGain} EXP)`);
      }

      setPet((prev) => {
        const res = addPetExp(prev.exp, prev.level, expGain);
        return {
          ...prev,
          isSleeping: false,
          stats: {
            ...prev.stats,
            energy: Math.min(100, prev.stats.energy + 35),
          },
          exp: res.newExp,
          level: res.newLevel,
          lastInteractionTime: Date.now(),
        };
      });
    }
  };

  return {
    handlePetClick,
    handleFeedItem,
    handleOpenBathScene,
    handleFinishBath,
    handleOpenBedroomScene,
    handleWakeUpFromBedroom,
    handleSleepingActivityBlocked,
    handleConfirmSleep,
    handleSleepButtonClick,
    handleCleanAndBath,
    handleToggleSleep,
  };
}
