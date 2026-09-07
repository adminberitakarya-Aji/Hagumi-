import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Sparkles,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Coins,
  Heart,
  Shield,
  Award,
  Zap,
  Droplets,
  BookOpen,
  ShoppingBag,
  Bell,
  Trash2,
  Flame,
} from 'lucide-react';
import { PetData, DayPhase, FoodItem, SeasonType, OdekakeTrip, OdekakeReward } from '../types/game';
import { ELEMENTS_CONFIG, getRequiredExp, addPetExp, getBondingLevelInfo } from '../data/gameConfig';
import { KitsuneCanvas } from './KitsuneCanvas';
import { BentoFoodModal } from './BentoFoodModal';
import { OnsenBathModal } from './OnsenBathModal';
import { FutonBedroomModal } from './FutonBedroomModal';
import { TanukiShopModal } from './TanukiShopModal';
import { ShrineModal } from './ShrineModal';
import { MatsuriGamesModal } from './MatsuriGamesModal';
import { HankoAlbumModal } from './HankoAlbumModal';
import { WardrobeModal } from './WardrobeModal';
import { SanctuaryDecorModal } from './SanctuaryDecorModal';
import { MemoryScrollModal } from './MemoryScrollModal';
import { ShrinePassModal } from './ShrinePassModal';
import { HanabiMakerModal } from './HanabiMakerModal';
import { SanctuaryMenuModal } from './SanctuaryMenuModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { OdekakeModal } from './OdekakeModal';
import { OdekakeReturnModal } from './OdekakeReturnModal';
import { TatamiSanctuaryBackground } from './TatamiSanctuaryBackground';
import { ShojiTransition } from './ShojiTransition';
import { useShojiTransition } from '../hooks/useShojiTransition';
import { SensuFanHUD, SensuItem } from './SensuFanHUD';
import { HapticSettingsModal } from './HapticSettingsModal';
import { ParallaxSettingsModal } from './ParallaxSettingsModal';
import { useParallax2D } from '../utils/useParallax2D';
import { DEFAULT_SANCTUARY_DECOR, DEFAULT_UNLOCKED_DECOR } from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine, HapticConfig } from '../utils/hapticFeedback';

interface TatamiRoomProps {
  pet: PetData;
  setPet: React.Dispatch<React.SetStateAction<PetData>>;
  onResetPet: () => void;
  onOpenPrologue?: () => void;
}

export const TatamiRoom: React.FC<TatamiRoomProps> = ({
  pet,
  setPet,
  onResetPet,
  onOpenPrologue,
}) => {
  // Traditional Shoji Screen Wipe Transition
  const { isShojiActive, shojiConfig, triggerShoji, handleShojiFinished } = useShojiTransition();

  // Modal toggles (Otomatis buka Kamar Peraduan jika mode tidur masih aktif)
  const [isBedroomOpen, setIsBedroomOpen] = useState<boolean>(() => {
    return Boolean(pet.isSleeping && pet.sleepUntilTimestamp && pet.sleepUntilTimestamp > Date.now());
  });
  const [isBentoOpen, setIsBentoOpen] = useState(false);
  const [isBathOpen, setIsBathOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isShrineOpen, setIsShrineOpen] = useState(false);
  const [isMatsuriOpen, setIsMatsuriOpen] = useState(false);
  const [isHankoOpen, setIsHankoOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isDecorOpen, setIsDecorOpen] = useState(false);
  const [isMemoryScrollOpen, setIsMemoryScrollOpen] = useState(false);
  const [isShrinePassOpen, setIsShrinePassOpen] = useState(false);
  const [isHanabiOpen, setIsHanabiOpen] = useState(false);
  const [isHapticModalOpen, setIsHapticModalOpen] = useState(false);
  const [isParallaxModalOpen, setIsParallaxModalOpen] = useState(false);
  const [isSanctuaryMenuOpen, setIsSanctuaryMenuOpen] = useState(false);
  const [isBackupRestoreOpen, setIsBackupRestoreOpen] = useState(false);
  const [isSleepConfirmOpen, setIsSleepConfirmOpen] = useState(false);
  const [isOdekakeOpen, setIsOdekakeOpen] = useState(false);
  const [completedTripToCelebrate, setCompletedTripToCelebrate] = useState<{
    destinationName: string;
    destinationKanji: string;
    reward: OdekakeReward;
  } | null>(null);

  // Sleep 15-minute countdown tracker
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number>(() => {
    if (pet.isSleeping && pet.sleepUntilTimestamp) {
      return Math.max(0, Math.ceil((pet.sleepUntilTimestamp - Date.now()) / 1000));
    }
    return 0;
  });

  // Odekake live countdown & completion check
  const [odekakeRemainingSeconds, setOdekakeRemainingSeconds] = useState<number>(() => {
    if (pet.activeOdekake) {
      const finishTime = pet.activeOdekake.startedAt + pet.activeOdekake.durationMs;
      return Math.max(0, Math.ceil((finishTime - Date.now()) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    if (!pet.activeOdekake) {
      setOdekakeRemainingSeconds(0);
      return;
    }

    const checkOdekake = () => {
      if (pet.activeOdekake) {
        const finishTime = pet.activeOdekake.startedAt + pet.activeOdekake.durationMs;
        const diff = Math.max(0, Math.ceil((finishTime - Date.now()) / 1000));
        setOdekakeRemainingSeconds(diff);

        // Jika durasi sudah habis, selesaikan perjalanan dan sambut kepulangan Kitsune!
        if (diff <= 0 && !completedTripToCelebrate) {
          const finishedTrip = pet.activeOdekake;
          soundEngine.playOdekakeReturn();
          hapticEngine.evolution();
          setCompletedTripToCelebrate({
            destinationName: finishedTrip.destinationName,
            destinationKanji: finishedTrip.destinationKanji,
            reward: finishedTrip.reward,
          });
        }
      }
    };

    checkOdekake();
    const timer = setInterval(checkOdekake, 1000);
    return () => clearInterval(timer);
  }, [pet.activeOdekake, completedTripToCelebrate]);

  const formatOdekakeCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!pet.isSleeping || !pet.sleepUntilTimestamp) {
      setSleepRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      if (pet.sleepUntilTimestamp) {
        const diff = Math.max(0, Math.ceil((pet.sleepUntilTimestamp - Date.now()) / 1000));
        setSleepRemainingSeconds(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pet.isSleeping, pet.sleepUntilTimestamp]);

  const formatSleepCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Parallax 2.5D Depth Engine (Cursor and Gyroscope sensor tracking)
  const parallax = useParallax2D();

  // Haptic feedback configuration state
  const [hapticConfig, setHapticConfig] = useState<HapticConfig>(() => hapticEngine.getConfig());

  useEffect(() => {
    return hapticEngine.subscribe((newCfg) => setHapticConfig(newCfg));
  }, []);

  // Sensu Folding Fan Radial HUD state (default to true dockMode so classic dock is always visible and clear)
  const [isSensuOpen, setIsSensuOpen] = useState(false);
  const [isDockMode, setIsDockMode] = useState(true);

  // Tatami Interactive Ripple Clicks state
  const [tatamiRipples, setTatamiRipples] = useState<
    Array<{ id: number; x: number; y: number; symbol: string }>
  >([]);

  // Seasonal Weather state
  const [season, setSeason] = useState<SeasonType>(() => {
    if (pet.season) return pet.season;
    const month = new Date().getMonth(); // 0 to 11
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  });

  const [visitedShrines, setVisitedShrines] = useState<string[]>(() => pet.visitedShrines || []);

  // Room environment states
  const [isLanternOn, setIsLanternOn] = useState(true);
  const [actionState, setActionState] = useState<'idle' | 'eating' | 'bathing' | 'sleeping' | 'happy' | 'sick'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isBgmActive, setIsBgmActive] = useState(false);
  // Kesepakatan waktu: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const [timePhase, setTimePhase] = useState<DayPhase>(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      if (hour < 11) return 'morning';
      if (hour < 15) return 'noon';
      return 'evening';
    }
    return 'night';
  });

  // Sinkronisasi otomatis jam lokal
  useEffect(() => {
    const updateDayPhase = () => {
      const hour = new Date().getHours();
      let nextPhase: DayPhase = 'night';
      if (hour >= 6 && hour < 18) {
        if (hour < 11) nextPhase = 'morning';
        else if (hour < 15) nextPhase = 'noon';
        else nextPhase = 'evening';
      }
      setTimePhase(nextPhase);
    };
    const interval = setInterval(updateDayPhase, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sinkronisasi musik latar Zen (BGM) dengan fase waktu hari & musim aktif
  useEffect(() => {
    if (soundEngine.isBGMActive()) {
      soundEngine.updateBGMConfig(timePhase, season);
    }
  }, [timePhase, season]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const elementInfo = ELEMENTS_CONFIG[pet.element] || ELEMENTS_CONFIG.fire;
  const bondInfo = getBondingLevelInfo(pet.bondingPoints ?? 120);

  // Sync visited shrines to pet data
  useEffect(() => {
    setPet((prev) => ({
      ...prev,
      visitedShrines,
      season,
    }));
  }, [visitedShrines, season, setPet]);

  // Handler: Cycle through the 4 seasons with Shoji door wipe transition
  const handleCycleSeason = () => {
    const seasons: SeasonType[] = ['spring', 'summer', 'autumn', 'winter'];
    const nextIdx = (seasons.indexOf(season) + 1) % seasons.length;
    const nextSeason = seasons[nextIdx];
    const kanjiMap: Record<SeasonType, string> = {
      spring: '🌸 春',
      summer: '🍃 夏',
      autumn: '🍁 秋',
      winter: '❄️ 冬',
    };
    const labels: Record<SeasonType, string> = {
      spring: '🌸 Musim Semi (Haru) - Guguran Sakura',
      summer: '🍃 Musim Panas (Natsu) - Kunang-kunang Hotaru',
      autumn: '🍁 Musim Gugur (Aki) - Daun Momiji Merah',
      winter: '❄️ Musim Dingin (Fuyu) - Salju Lembah Fuji',
    };

    triggerShoji({
      label: labels[nextSeason],
      kanji: kanjiMap[nextSeason],
      sublabel: 'Pintu Shoji Membuka Musim Baru...',
      onMidpoint: () => {
        setSeason(nextSeason);
        showToast(`Musim Berganti: ${labels[nextSeason]}`);
      },
    });
  };

  // Handler: Add Custom Diary Note
  const handleAddDiaryNote = (text: string, moodEmoji: string) => {
    const newNote = {
      id: `note_${Date.now()}`,
      text,
      moodEmoji,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setPet((prev) => {
      const expRes = addPetExp(prev.exp, prev.level, 25);
      return {
        ...prev,
        exp: expRes.newExp,
        level: expRes.newLevel,
        customDiaryNotes: [newNote, ...(prev.customDiaryNotes || [])],
      };
    });
    showToast('📜 Kenangan baru terukir di Buku Harian Roh (+25 EXP)!');
  };

  // Handler: Delete Custom Diary Note
  const handleDeleteDiaryNote = (noteId: string) => {
    setPet((prev) => ({
      ...prev,
      customDiaryNotes: (prev.customDiaryNotes || []).filter((n) => n.id !== noteId),
    }));
    showToast('🗑️ Catatan harian dihapus');
  };

  // Handler: Pilgrimage visit blessing
  const handleReceivePilgrimageBlessing = (coins: number, exp: number, giftName: string) => {
    setPet((prev) => {
      const expRes = addPetExp(prev.exp, prev.level, exp);
      return {
        ...prev,
        coins: prev.coins + coins,
        exp: expRes.newExp,
        level: expRes.newLevel,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 20),
        },
      };
    });
    showToast(`⛩️ Berkah Kuil Diterima: ${giftName}!`);
  };

  // Handler: Hanabi Fireworks Launch
  const handleHanabiSuccess = (score: number, coinsEarned: number, happinessEarned: number) => {
    setPet((prev) => {
      const expRes = addPetExp(prev.exp, prev.level, 40);
      const unlocked = prev.unlockedMemories || ['mem_birth', 'mem_fuji_view'];
      const nextUnlocked = unlocked.includes('mem_hanabi') ? unlocked : [...unlocked, 'mem_hanabi'];
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        exp: expRes.newExp,
        level: expRes.newLevel,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + happinessEarned),
        },
        hanabiLaunches: (prev.hanabiLaunches || 0) + 1,
        unlockedMemories: nextUnlocked,
      };
    });
    showToast(`🎆 Bunga Api Hanabi Mekar! (+${coinsEarned} Ryo, +40 EXP, +${happinessEarned} Bahagia)`);
  };


  // Show quick toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Idle Thought Bubble tap → open the suggested modal
  const handleThoughtClick = (thoughtType: string, _thoughtText: string) => {
    soundEngine.playSuzuChime();
    hapticEngine.tap();
    switch (thoughtType) {
      case 'hunger':
        if (!pet.isSleeping) setIsBentoOpen(true);
        break;
      case 'energy':
        if (!pet.isSleeping) setIsSleepConfirmOpen(true);
        break;
      case 'dirty':
        if (!pet.isSleeping) setIsBathOpen(true);
        break;
      case 'bored':
        if (!pet.isSleeping) setIsMatsuriOpen(true);
        break;
      case 'sick':
        if (!pet.isSleeping) setIsShopOpen(true);
        break;
      case 'happy':
        // Play a happy chirp and give a tiny bonding bonus
        handlePetClick();
        break;
      default:
        // Random zen thoughts → just a gentle affectionate tap
        handlePetClick();
        break;
    }
  };

  // Tatami Interactive Floor Tap: ripple waves, chime audio, haptics & kitsune reaction
  const handleTatamiClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const id = Date.now() + Math.random();
    const symbols = ['🌸', '✨', '🐾', '⛩️', '🍃', '🏮'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    setTatamiRipples((prev) => [...prev.slice(-6), { id, x: clickX, y: clickY, symbol }]);

    setTimeout(() => {
      setTatamiRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);

    soundEngine.playSuzuChime();
    hapticEngine.tap();

    handlePetClick();
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
      onMidpoint: () => setIsBathOpen(true),
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
        setIsBedroomOpen(true);
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

    setIsOdekakeOpen(false);
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

  // Confirm Sleep for 15 minutes & automatically open Bedroom Scene
  const handleConfirmSleep = () => {
    setIsSleepConfirmOpen(false);
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
        setIsBedroomOpen(true);
      },
    });
  };

  // Sleeping button action (from dock or menu)
  const handleSleepButtonClick = () => {
    if (pet.isSleeping) {
      handleOpenBedroomScene();
    } else {
      setIsSleepConfirmOpen(true);
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

  // Buy Shop item
  const handleBuyItem = (item: FoodItem) => {
    setPet((prev) => {
      if (prev.coins < item.price) return prev;
      return {
        ...prev,
        coins: prev.coins - item.price,
        inventory: {
          ...prev.inventory,
          [item.id]: (prev.inventory[item.id] || 0) + 1,
        },
      };
    });
    showToast(`Membeli 1x ${item.name}! Disimpan di bekal bento.`);
  };

  // Mini games reward (Dynamic EXP based on performance)
  const handleGameReward = (coinsEarned: number, hapGained: number) => {
    const expGain = Math.max(15, Math.floor(coinsEarned * 0.8) + 15);
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      showToast(`🎉 Level Up! Prestasi festival membawa ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(`Hadiah Festival: +${coinsEarned} Ryo, +${hapGained} Bahagia & +${expGain} EXP!`);
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + hapGained),
        },
        totalMiniGamesWon: prev.totalMiniGamesWon + 1,
        exp: res.newExp,
        level: res.newLevel,
      };
    });
  };

  // Omikuji reward (+30 EXP from Inari Shrine blessing)
  const handleOmikujiDrawn = (bonusCoins: number, bonusHap: number) => {
    const expGain = 30;
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      showToast(`🎉 Berkah Inari! ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else {
      showToast(`Berkah Kuil Inari: +${bonusCoins} Ryo, +${bonusHap} Bahagia & +${expGain} EXP!`);
    }

    setPet((prev) => {
      const res = addPetExp(prev.exp, prev.level, expGain);
      return {
        ...prev,
        coins: prev.coins + bonusCoins,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + bonusHap),
        },
        exp: res.newExp,
        level: res.newLevel,
      };
    });
  };

  // Sensu Fan HUD Radial Menu Action Items
  const sensuItems: SensuItem[] = [
    {
      id: 'bento',
      label: pet.isSleeping ? 'Makan 💤' : pet.activeOdekake ? 'Makan 🎒' : 'Makan',
      kanji: '🍱 食',
      sublabel: pet.isSleeping
        ? 'Istirahat tidur... Menu terkunci sejenak'
        : pet.activeOdekake
        ? `Sedang berkelana di ${pet.activeOdekake.destinationName}...`
        : 'Kotak Bento Jubako & Kuliner',
      icon: '🍙',
      color: pet.isSleeping || pet.activeOdekake ? 'from-stone-900 to-stone-950 opacity-40' : 'from-[#3a281e] to-[#251811]',
      border: pet.isSleeping || pet.activeOdekake ? 'border-stone-700/50' : 'border-amber-600/80',
      badge: !pet.isSleeping && !pet.activeOdekake && pet.stats.hunger < 30 ? 'Lapar' : undefined,
      onClick: () => {
        if (pet.isSleeping) {
          handleSleepingActivityBlocked('Makan');
          return;
        }
        if (pet.activeOdekake) {
          handleOdekakeActivityBlocked('Makan');
          return;
        }
        triggerShoji({
          label: 'Kotak Bento Jubako',
          kanji: '🍱 食',
          sublabel: 'Perjamuan Kuliner & Khasiat Roh',
          onMidpoint: () => setIsBentoOpen(true),
        });
      },
    },
    {
      id: 'clean',
      label: pet.isSleeping ? 'Mandi 💤' : pet.activeOdekake ? 'Mandi 🎒' : 'Mandi',
      kanji: '🛁 湯',
      sublabel: pet.isSleeping
        ? 'Istirahat tidur... Menu terkunci sejenak'
        : pet.activeOdekake
        ? `Sedang berkelana di ${pet.activeOdekake.destinationName}...`
        : 'Pemandian Onsen Hinoki & Busa',
      icon: '🛁',
      color: pet.isSleeping || pet.activeOdekake ? 'from-stone-900 to-stone-950 opacity-40' : 'from-[#1e2e38] to-[#121c22]',
      border: pet.isSleeping || pet.activeOdekake ? 'border-stone-700/50' : 'border-cyan-600/80',
      badge: !pet.isSleeping && !pet.activeOdekake && pet.poopCount > 0 ? `${pet.poopCount}` : undefined,
      onClick: () => {
        if (pet.isSleeping) {
          handleSleepingActivityBlocked('Mandi');
          return;
        }
        if (pet.activeOdekake) {
          handleOdekakeActivityBlocked('Mandi');
          return;
        }
        handleOpenBathScene();
      },
    },
    {
      id: 'sleep',
      label: pet.isSleeping ? `Tidur (${formatSleepCountdown(sleepRemainingSeconds)})` : pet.activeOdekake ? 'Tidur 🎒' : 'Tidur',
      kanji: pet.isSleeping ? '💤 眠' : '🛏️ 眠',
      sublabel: pet.isSleeping
        ? `Tidur lelap (${formatSleepCountdown(sleepRemainingSeconds)} tersisa)`
        : pet.activeOdekake
        ? `Sedang berkelana di ${pet.activeOdekake.destinationName}...`
        : 'Kamar Peraduan Futon (15 Menit)',
      icon: pet.isSleeping ? '💤' : '🛏️',
      color: pet.isSleeping
        ? 'from-[#381e4a] to-[#200f2e]'
        : pet.activeOdekake
        ? 'from-stone-900 to-stone-950 opacity-40'
        : 'from-[#3a281e] to-[#251811]',
      border: pet.isSleeping
        ? 'border-purple-500/80 animate-pulse'
        : pet.activeOdekake
        ? 'border-stone-700/50'
        : 'border-purple-600/80',
      onClick: () => {
        if (pet.activeOdekake) {
          handleOdekakeActivityBlocked('Tidur');
          return;
        }
        handleSleepButtonClick();
      },
    },
    {
      id: 'wardrobe',
      label: pet.isSleeping ? 'Busana 💤' : 'Busana',
      kanji: '👘 衣',
      sublabel: pet.isSleeping ? 'Istirahat tidur... Menu terkunci sejenak' : 'Lemari Busana Miyabi & Topeng',
      icon: '👘',
      color: pet.isSleeping ? 'from-stone-900 to-stone-950 opacity-40' : 'from-[#3d2319] to-[#26130d]',
      border: pet.isSleeping ? 'border-stone-700/50' : 'border-amber-500/80',
      onClick: () => {
        if (pet.isSleeping) {
          handleSleepingActivityBlocked('Busana');
          return;
        }
        triggerShoji({
          label: 'Lemari Busana Miyabi',
          kanji: '👘 衣',
          sublabel: 'Kimono & Aksesoris Roh Kitsune',
          onMidpoint: () => setIsWardrobeOpen(true),
        });
      },
    },
    {
      id: 'odekake',
      label: pet.activeOdekake
        ? `Tabi (${formatOdekakeCountdown(odekakeRemainingSeconds)})`
        : 'Berkelana',
      kanji: pet.activeOdekake ? '🚶 旅' : '🎒 旅',
      sublabel: pet.activeOdekake
        ? `Sedang ke ${pet.activeOdekake.destinationName} (${formatOdekakeCountdown(odekakeRemainingSeconds)})`
        : 'Petualangan Berkelana Roh (O-dekake)',
      icon: '🎒',
      color: pet.activeOdekake
        ? 'from-amber-900/90 to-amber-950'
        : 'from-[#3a281e] to-[#251811]',
      border: pet.activeOdekake
        ? 'border-amber-400 animate-pulse'
        : 'border-amber-500/80',
      badge: pet.activeOdekake ? 'Aktif' : undefined,
      onClick: () => {
        triggerShoji({
          label: 'Petualangan Berkelana Roh',
          kanji: '🎒 旅',
          sublabel: 'O-dekake • Kuil & Pegunungan Sakral',
          onMidpoint: () => setIsOdekakeOpen(true),
        });
      },
    },
    {
      id: 'shrine',
      label: pet.isSleeping ? 'Kuil 💤' : pet.activeOdekake ? 'Kuil 🎒' : 'Kuil',
      kanji: '⛩️ 社',
      sublabel: pet.isSleeping
        ? 'Istirahat tidur... Menu terkunci sejenak'
        : pet.activeOdekake
        ? `Sedang berkelana di ${pet.activeOdekake.destinationName}...`
        : 'Fushimi Inari • Kotodama & Ema',
      icon: '⛩️',
      color: pet.isSleeping || pet.activeOdekake ? 'from-stone-900 to-stone-950 opacity-40' : 'from-[#4a1b18] to-[#2b0e0c]',
      border: pet.isSleeping || pet.activeOdekake ? 'border-stone-700/50' : 'border-rose-600/80',
      onClick: () => {
        if (pet.isSleeping) {
          handleSleepingActivityBlocked('Kuil Inari');
          return;
        }
        if (pet.activeOdekake) {
          handleOdekakeActivityBlocked('Kuil Inari');
          return;
        }
        triggerShoji({
          label: 'Kuil Inari Okami',
          kanji: '⛩️ 社',
          sublabel: 'Fushimi Inari • Kotodama & Ema',
          onMidpoint: () => setIsShrineOpen(true),
        });
      },
    },
    {
      id: 'matsuri',
      label: pet.isSleeping ? 'Festival 💤' : pet.activeOdekake ? 'Festival 🎒' : 'Festival',
      kanji: '🏮 祭',
      sublabel: pet.isSleeping
        ? 'Istirahat tidur... Menu terkunci sejenak'
        : pet.activeOdekake
        ? `Sedang berkelana di ${pet.activeOdekake.destinationName}...`
        : 'Natsu Matsuri • Taiko & Mini-Games',
      icon: '🎏',
      color: pet.isSleeping || pet.activeOdekake ? 'from-stone-900 to-stone-950 opacity-40' : 'from-[#3a281e] to-[#251811]',
      border: pet.isSleeping || pet.activeOdekake ? 'border-stone-700/50' : 'border-amber-600/80',
      onClick: () => {
        if (pet.isSleeping) {
          handleSleepingActivityBlocked('Festival Matsuri');
          return;
        }
        if (pet.activeOdekake) {
          handleOdekakeActivityBlocked('Festival Matsuri');
          return;
        }
        triggerShoji({
          label: 'Pekan Raya Matsuri',
          kanji: '🏮 祭',
          sublabel: 'Natsu Matsuri • Taiko & Mini-Games',
          onMidpoint: () => setIsMatsuriOpen(true),
        });
      },
    },
    {
      id: 'shop',
      label: 'Toko',
      kanji: '🏪 店',
      sublabel: 'Toko Serba Ada Tanuki • Buka Selalu',
      icon: '🏪',
      color: 'from-[#3a281e] to-[#251811]',
      border: 'border-amber-600/80',
      onClick: () => {
        triggerShoji({
          label: 'Toko Serba Ada Tanuki',
          kanji: '🏪 店',
          sublabel: 'Minimarket Modern Istana Rubah',
          onMidpoint: () => setIsShopOpen(true),
        });
      },
    },
    {
      id: 'sanctuary_menu',
      label: 'Menu Fitur',
      kanji: '🏮 館',
      sublabel: 'Arsip Silsilah, Harian, Hanabi & Dekor',
      icon: '🏮',
      color: 'from-[#3a281e] to-[#251811]',
      border: 'border-amber-500/80',
      onClick: () => {
        soundEngine.playClick();
        setIsSanctuaryMenuOpen(true);
      },
    },
  ];

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] w-full bg-[#120d09] text-stone-100 flex flex-col justify-between p-2 sm:p-3 select-none relative overflow-hidden"
    >
      {/* Authentic Japanese Sanctuary Background (Shoji, Engawa, Tatami Weave, Kakemono & Andon Lighting) */}
      <TatamiSanctuaryBackground
        timePhase={timePhase}
        isLanternOn={isLanternOn}
        isSleeping={pet.isSleeping}
        sanctuaryDecor={pet.sanctuaryDecor || DEFAULT_SANCTUARY_DECOR}
        season={season}
        bgParallaxStyle={parallax.bgStyle}
        midBgParallaxStyle={parallax.midBgStyle}
        tatamiParallaxStyle={parallax.tatamiStyle}
      />

      {/* TOP HEADER: Pet Identity, Level, Coins & Time Indicator */}
      <header className="relative z-10 max-w-4xl mx-auto w-full bg-[#201813]/90 backdrop-blur-md rounded-2xl border border-amber-700/60 px-2 py-1.5 sm:px-4 sm:py-2 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Pet Identity & Hanko Stamp */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsHankoOpen(true);
              }}
              title="Lihat Buku Silsilah & Cap Hanko"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-600 border border-rose-400 text-white font-['Shippori_Mincho',serif] font-bold text-sm sm:text-lg flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
            >
              {pet.hankoSignature || '福'}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <h1 className="text-xs sm:text-base font-bold font-['Shippori_Mincho',serif] text-amber-200 leading-tight truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                  {pet.name}
                </h1>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950/80 border border-amber-600/60 text-[8px] sm:text-[10px] text-amber-300 font-bold capitalize flex-shrink-0">
                  {pet.stage} • {pet.tailCount}E
                </span>
              </div>

              {/* Exp Progress Bar with Balanced Exponential Formula */}
              {(() => {
                const requiredExp = getRequiredExp(pet.level);
                const progressPct = Math.min(100, Math.round((pet.exp / requiredExp) * 100));
                return (
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5" title={`Progres EXP: ${pet.exp} / ${requiredExp} (${progressPct}%)`}>
                    <span className="text-[8px] sm:text-[10px] text-stone-400 font-semibold flex-shrink-0">
                      Lv.{pet.level}
                    </span>
                    <div className="w-14 xs:w-20 sm:w-28 h-1.5 sm:h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700 flex-shrink-0">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[7px] sm:text-[9px] text-amber-400 font-mono hidden xs:inline flex-shrink-0">
                      {pet.exp}/{requiredExp}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Currency, Kizuna, Mode Switcher, Features Menu & Quick Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Kizuna / Deep Bonding Quick Button */}
            <button
              onClick={() => {
                triggerShoji({
                  label: 'Kuil Inari Okami',
                  kanji: '⛩️ 縁',
                  sublabel: `Ikatan Batin Lv.${bondInfo.level} • ${bondInfo.currentMilestone.title}`,
                  onMidpoint: () => setIsShrineOpen(true),
                });
              }}
              title={`Ikatan Batin (Kizuna Lv.${bondInfo.level}: ${bondInfo.currentMilestone.title}) • Pengasuh: ${pet.caretakerName || 'Pengasuh'}`}
              className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-pink-950/90 to-rose-950 border border-rose-600/70 text-rose-200 font-extrabold text-[10px] sm:text-xs shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
            >
              <span className="text-xs">💖</span>
              <span className="text-[10px] sm:text-xs">Lv.{bondInfo.level}</span>
            </button>

            {/* Coins Badge */}
            <button
              onClick={() => {
                triggerShoji({
                  label: 'Toko Serba Ada Tanuki',
                  kanji: '🏪 店',
                  sublabel: 'Minimarket Modern Istana Rubah',
                  onMidpoint: () => setIsShopOpen(true),
                });
              }}
              title="Buka Toko Tanuki (08.00 - 22.00)"
              className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/80 border border-amber-600/70 text-amber-300 font-extrabold text-[10px] sm:text-xs shadow-sm hover:bg-amber-900/60 transition-all cursor-pointer flex-shrink-0"
            >
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>{pet.coins}</span>
              <span className="hidden xs:inline text-[9px] text-amber-400/80">Ryo</span>
            </button>

            {/* Parallax 2.5D Quick Toggle / Settings */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsParallaxModalOpen(true);
              }}
              title={`Mode Parallax 2.5D: ${
                parallax.mode === 'dynamic'
                  ? 'Dinamis (100%)'
                  : parallax.mode === 'subtle'
                  ? 'Lembut (50%)'
                  : 'Nonaktif'
              }`}
              className={`flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-xl border text-[10px] sm:text-xs font-extrabold shadow-sm transition-all cursor-pointer flex-shrink-0 ${
                parallax.mode !== 'off'
                  ? 'bg-gradient-to-r from-[#381f14] to-[#24130c] border-amber-500/80 text-amber-200 hover:brightness-110'
                  : 'bg-stone-900/90 border-stone-700/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🪞</span>
              <span className="hidden sm:inline">2.5D</span>
            </button>

            {/* Quick Audio Toggle - Compact on mobile, expanded on desktop */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-stone-900/90 border border-stone-700/80 flex-shrink-0">
              {/* Music BGM Toggle */}
              <button
                onClick={() => {
                  const active = soundEngine.toggleAmbientBGM(timePhase, season);
                  setIsBgmActive(active);
                  const seasonNames: Record<SeasonType, string> = {
                    spring: '🌸 Musim Semi (Haru)',
                    summer: '🍃 Musim Panas (Natsu)',
                    autumn: '🍁 Musim Gugur (Aki)',
                    winter: '❄️ Musim Dingin (Fuyu)',
                  };
                  const phaseNames: Record<DayPhase, string> = {
                    morning: '🌅 Fajar',
                    noon: '☀️ Siang',
                    evening: '🌇 Senja',
                    night: '🌙 Malam',
                  };
                  if (active) {
                    showToast(`🎵 Musik Zen (Koto & Shakuhachi) Aktif: ${seasonNames[season]} • ${phaseNames[timePhase]}`);
                  } else {
                    showToast('🔇 Musik Zen Santuari Dijeda');
                  }
                }}
                title={
                  isBgmActive
                    ? `Jeda Musik Zen (${season} • ${timePhase})`
                    : 'Putar Musik Zen Kuil Inari (Koto & Shakuhachi)'
                }
                className={`relative p-1 sm:p-1.5 rounded-lg transition-all cursor-pointer ${
                  isBgmActive
                    ? 'bg-amber-600/40 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-xs">🎵</span>
                {isBgmActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>

              {/* Time Phase Indicator */}
              <div
                title={`Fase Waktu: ${timePhase === 'morning' ? 'Pagi (朝)' : timePhase === 'noon' ? 'Siang (昼)' : timePhase === 'evening' ? 'Senja (夕)' : 'Malam (夜)'}`}
                className="px-1 text-[10px] text-stone-300 font-medium select-none"
              >
                {timePhase === 'morning' && '🌅'}
                {timePhase === 'noon' && '☀️'}
                {timePhase === 'evening' && '🌇'}
                {timePhase === 'night' && '🌙'}
              </div>

              {/* Sound Mute Toggle */}
              <button
                onClick={() => {
                  const muted = soundEngine.toggleMute();
                  setIsMuted(muted);
                  showToast(muted ? '🔇 Seluruh Audio Santuari Dibisukan' : '🔊 Audio Santuari Aktif');
                }}
                className={`p-1 sm:p-1.5 rounded-lg transition-all cursor-pointer ${
                  isMuted ? 'text-red-400 hover:text-red-300' : 'text-stone-400 hover:text-stone-200'
                }`}
                title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Torii Gateway / Prologue Button */}
            {onOpenPrologue && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenPrologue();
                }}
                title="Buka Gerbang Torii & Prologue (Gunung Fuji, 9 Ekor, Ema)"
                className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-950/90 to-amber-950 border border-amber-500/90 text-amber-200 font-extrabold text-[10px] sm:text-xs shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
              >
                <span className="text-xs">⛩️</span>
                <span className="font-bold hidden xs:inline">Gerbang</span>
              </button>
            )}

            {/* Quick Odekake / Tabi Berkelana Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsOdekakeOpen(true);
              }}
              title={
                pet.activeOdekake
                  ? `Sedang Berkelana ke ${pet.activeOdekake.destinationName} (${formatOdekakeCountdown(odekakeRemainingSeconds)})`
                  : 'Petualangan Berkelana Roh (O-dekake / Tabi)'
              }
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-xs font-extrabold shadow-sm transition-all cursor-pointer flex-shrink-0 ${
                pet.activeOdekake
                  ? 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-400 text-amber-100 ring-1 ring-amber-400/60 animate-pulse'
                  : 'bg-gradient-to-r from-[#3a2216] to-[#25150d] border-amber-600/80 text-amber-200 hover:brightness-110'
              }`}
            >
              <span className="text-xs">{pet.activeOdekake ? '🚶' : '🎒'}</span>
              <span className="font-bold hidden xs:inline">
                {pet.activeOdekake
                  ? `Tabi ${formatOdekakeCountdown(odekakeRemainingSeconds)}`
                  : 'Berkelana'}
              </span>
            </button>

            {/* HUD Style Switcher (Sensu vs Classic Dock) - Desktop Only */}
            <button
              onClick={() => {
                if (isDockMode) {
                  soundEngine.playSensuOpen();
                  setIsDockMode(false);
                  setIsSensuOpen(true);
                } else {
                  soundEngine.playClick();
                  setIsDockMode(true);
                  setIsSensuOpen(false);
                }
              }}
              title={isDockMode ? 'Beralih ke Kipas Sensu Radial HUD' : 'Beralih ke Bilah Dock Klasik'}
              className="hidden sm:flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#381f14] to-[#24130c] border border-amber-500/80 text-amber-200 text-[11px] sm:text-xs font-extrabold shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <span>{isDockMode ? '🪭 Sensu' : '📱 Dock'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE VITALS METERS: 1-Row Compact Grid */}
      <section className="relative z-10 max-w-4xl mx-auto w-full my-1 sm:my-1.5 flex-shrink-0">
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {/* 1. Kenyang (Hunger) */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>🍙</span> <span className="hidden sm:inline">Kenyang</span>
              </span>
              <span className={`font-mono text-[7px] xs:text-[8px] sm:text-[10px] ${pet.stats.hunger < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-stone-400'}`}>
                {Math.round(pet.stats.hunger)}%
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all ${
                  pet.stats.hunger > 50
                    ? 'bg-amber-500'
                    : pet.stats.hunger > 25
                    ? 'bg-orange-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${pet.stats.hunger}%` }}
              />
            </div>
          </div>

          {/* 2. Energi */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>⚡</span> <span className="hidden sm:inline">Energi</span>
              </span>
              <span className={`font-mono text-[7px] xs:text-[8px] sm:text-[10px] ${pet.stats.energy < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-stone-400'}`}>
                {Math.round(pet.stats.energy)}%
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all ${
                  pet.stats.energy > 50
                    ? 'bg-yellow-400'
                    : pet.stats.energy > 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${pet.stats.energy}%` }}
              />
            </div>
          </div>

          {/* 3. Kebersihan */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>🛁</span> <span className="hidden sm:inline">Bersih</span>
              </span>
              <span className={`font-mono text-[7px] xs:text-[8px] sm:text-[10px] ${pet.stats.cleanliness < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-stone-400'}`}>
                {Math.round(pet.stats.cleanliness)}%
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all ${
                  pet.stats.cleanliness > 50
                    ? 'bg-sky-400'
                    : pet.stats.cleanliness > 25
                    ? 'bg-blue-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${pet.stats.cleanliness}%` }}
              />
            </div>
          </div>

          {/* 4. Kebahagiaan */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>💖</span> <span className="hidden sm:inline">Bahagia</span>
              </span>
              <span className={`font-mono text-[7px] xs:text-[8px] sm:text-[10px] ${pet.stats.happiness < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-stone-400'}`}>
                {Math.round(pet.stats.happiness)}%
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all ${
                  pet.stats.happiness > 50
                    ? 'bg-rose-500'
                    : pet.stats.happiness > 25
                    ? 'bg-pink-500'
                    : 'bg-stone-500'
                }`}
                style={{ width: `${pet.stats.happiness}%` }}
              />
            </div>
          </div>

          {/* 5. Kesehatan */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-stone-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>🌿</span> <span className="hidden sm:inline">Sehat</span>
              </span>
              <span className={`font-mono text-[7px] xs:text-[8px] sm:text-[10px] ${pet.isSick || pet.stats.health < 40 ? 'text-rose-400 font-bold animate-pulse' : 'text-stone-400'}`}>
                {pet.isSick ? 'Sakit' : `${Math.round(pet.stats.health)}%`}
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all ${
                  pet.isSick
                    ? 'bg-purple-600'
                    : pet.stats.health > 50
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${pet.stats.health}%` }}
              />
            </div>
          </div>

          {/* 6. Skor Kasih (Care Score) */}
          <div className="p-1 sm:p-1.5 rounded-xl bg-[#1c1511]/90 border border-stone-800/80 flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between text-[8px] xs:text-[9px] sm:text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-0.5 truncate">
                <span>🏮</span> <span className="hidden sm:inline">Kasih</span>
              </span>
              <span className="text-amber-400 font-bold font-mono text-[7px] xs:text-[8px] sm:text-[10px]">
                {Math.round(pet.careScore)}
              </span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                style={{ width: `${pet.careScore}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TOAST ALERT NOTIFICATION */}
      {toastMessage && (
        <div className="relative z-20 max-w-sm mx-auto my-0.5 flex-shrink-0 animate-in fade-in slide-in-from-top-1 px-2">
          <div className="px-3 py-1 rounded-xl bg-amber-950/95 border border-amber-500/80 text-amber-200 text-[10px] sm:text-xs font-bold shadow-lg text-center">
            {toastMessage}
          </div>
        </div>
      )}

      {/* SICK BANNER ALERT */}
      {pet.isSick && (
        <div className="relative z-20 max-w-md mx-auto my-0.5 flex-shrink-0 animate-in fade-in">
          <div className="px-3 py-1 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-[10px] sm:text-xs flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-1.5 truncate">
              <span>🤒</span>
              <span className="truncate">{pet.name} demam roh! Butuh ramuan Yakusou.</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsShopOpen(true);
              }}
              className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] sm:text-[10px] whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              Beli Obat
            </button>
          </div>
        </div>
      )}

      {/* RESTING SLEEP STATUS BANNER (15 MENIT NYENYAK) */}
      {pet.isSleeping && (
        <div className="relative z-20 max-w-2xl mx-auto w-full px-2 sm:px-3 mb-1 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-purple-950/85 backdrop-blur-md border border-purple-500/70 text-purple-200 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm animate-pulse">💤</span>
              <span className="text-[11px] sm:text-xs">
                <strong>{pet.name}</strong> sedang tidur lelap:{' '}
                <span className="font-mono font-bold text-amber-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-400/40">
                  ⏱️ {formatSleepCountdown(sleepRemainingSeconds)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setIsShopOpen(true)}
                className="px-2 py-0.5 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-[10px] font-bold border border-amber-600/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                title="Toko Tanuki tetap buka dan bisa belanja kapan saja"
              >
                <span>🏪</span>
                <span className="hidden xs:inline">Toko</span>
              </button>
              <button
                onClick={handleOpenBedroomScene}
                className="px-2 py-0.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-purple-100 text-[10px] font-bold border border-purple-400/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                title="Lihat Kitsune di kamar tidur futon"
              >
                <span>🛏️</span>
                <span className="hidden xs:inline">Futon</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ODEKAKE TRAVEL STATUS BANNER */}
      {pet.activeOdekake && (
        <div className="relative z-20 max-w-2xl mx-auto w-full px-2 sm:px-3 mb-1 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-[#26160e]/95 to-[#1c100a]/90 backdrop-blur-md border border-amber-500/70 text-amber-200 text-xs shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm animate-bounce">🎒</span>
              <span className="text-[11px] sm:text-xs truncate">
                <strong>{pet.name}</strong> berkelana ke {pet.activeOdekake.destinationName}:{' '}
                <span className="font-mono font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-400/40">
                  ⏱️ {formatOdekakeCountdown(odekakeRemainingSeconds)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsOdekakeOpen(true);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white text-[10px] font-bold border border-amber-400/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <span>🧭</span>
                <span>Periksa Tabi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN STAGE: Interactive Tatami Canvas & Room Fixtures */}
      <main
        onClick={handleTatamiClick}
        title="Klik di mana saja pada tikar tatami untuk berinteraksi dengan Kitsune!"
        style={parallax.roomTiltStyle}
        className={`relative z-10 flex-1 min-h-0 w-full flex flex-col items-center justify-center overflow-hidden my-0.5 cursor-pointer select-none will-change-transform ${
          !isDockMode ? 'pb-16 sm:pb-18' : ''
        }`}
      >
        {/* Animated Tatami Ripple Wave Rings when user clicks */}
        {tatamiRipples.map((ripple) => (
          <div
            key={ripple.id}
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-out fade-out duration-1000"
            style={{ left: ripple.x, top: ripple.y }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-amber-400/80 animate-ping opacity-75" />
              <div className="absolute w-20 h-20 rounded-full border border-rose-400/50 animate-pulse" />
              <span className="absolute text-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-bounce">
                {ripple.symbol}
              </span>
            </div>
          </div>
        ))}

        {/* Kitsune Canvas Renderer (Midground subject layer) */}
        <div
          style={parallax.petStyle}
          className="relative flex-1 min-h-0 flex flex-col items-center justify-center w-full max-h-full transition-transform will-change-transform"
        >
          {pet.isSleeping ? (
            /* Saat Kitsune tidur di kamar peraduan futon: Beranda hening tanpa pet */
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleOpenBedroomScene();
              }}
              className="relative flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-3xl bg-black/40 border border-purple-500/40 backdrop-blur-md max-w-xs text-center cursor-pointer hover:border-purple-400/80 hover:bg-black/60 transition-all group shadow-2xl animate-in fade-in"
              title="Klik untuk menengok Kitsune di kamar peraduan futon"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-purple-950 border border-purple-400/60 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(168,85,247,0.35)] group-hover:scale-110 transition-transform">
                  🛏️
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500"></span>
                </span>
              </div>

              <div className="mt-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-purple-200 font-['Shippori_Mincho',serif] flex items-center justify-center gap-1">
                  <span>{pet.name} sedang di Kamar Peraduan</span>
                </h3>
                <p className="text-[10px] text-stone-300/80 mt-0.5 leading-tight">
                  Beranda tatami sedang hening & tenang.
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/70 border border-purple-400/60 text-[10px] sm:text-xs font-bold text-purple-200 group-hover:bg-purple-800 transition-all shadow-md">
                <span>Tengok ke Kamar</span>
                <span className="text-amber-300 font-mono">⏱️ {formatSleepCountdown(sleepRemainingSeconds)}</span>
              </div>
            </div>
          ) : pet.activeOdekake ? (
            /* Saat Kitsune sedang berkelana (O-dekake): Catatan surat pamit di atas meja tatami */
            <div
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                setIsOdekakeOpen(true);
              }}
              className="relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2a1b12]/90 to-[#180f0a]/95 border-2 border-amber-500/70 backdrop-blur-md max-w-sm text-center cursor-pointer hover:border-amber-400 hover:bg-black/70 transition-all group shadow-2xl animate-in fade-in"
              title="Klik untuk melihat kabar perjalanan Kitsune"
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-700/90 to-amber-950 border border-amber-400/80 flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_25px_rgba(245,158,11,0.35)] group-hover:scale-110 transition-transform">
                  💌
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-[10px] text-amber-300 font-bold mb-1">
                  <span>🎒</span>
                  <span>Sedang Berkelana • お出かけ中</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-200 font-['Shippori_Mincho',serif]">
                  {pet.name} sedang menjelajahi {pet.activeOdekake.destinationName}
                </h3>
                <p className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                  {pet.activeOdekake.destinationKanji} • {pet.activeOdekake.destinationRegion}
                </p>
                <p className="text-[11px] text-stone-300/85 mt-2 italic px-2.5 py-1.5 rounded-xl bg-black/40 border border-amber-900/40 leading-relaxed line-clamp-3">
                  "{pet.activeOdekake.reward.postcardStory}"
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/80 border border-amber-400/70 text-[10px] sm:text-xs font-bold text-amber-100 group-hover:bg-amber-800 transition-all shadow-md">
                <span>Periksa Kabar Perjalanan</span>
                <span className="text-amber-300 font-mono bg-black/50 px-1.5 py-0.5 rounded border border-amber-500/40">
                  ⏱️ {formatOdekakeCountdown(odekakeRemainingSeconds)}
                </span>
              </div>
            </div>
          ) : (
            <>
              <KitsuneCanvas
                pet={pet}
                actionState={actionState}
                onPetClick={handlePetClick}
                onThoughtClick={handleThoughtClick}
              />

              {/* Poop cleaning quick alert if dirty */}
              {pet.poopCount > 0 && (
                <button
                  onClick={handleCleanAndBath}
                  className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/90 border border-amber-500 text-amber-200 text-[10px] sm:text-xs font-bold shadow-lg hover:bg-amber-800 transition-all animate-bounce cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-amber-400" />
                  <span>Sapu {pet.poopCount} Kotoran Tatami</span>
                </button>
              )}
            </>
          )}
        </div>
      </main>

      {/* CARE ACTION BUTTONS: Classic Dock (4 cols on mobile, 8 cols on desktop) */}
      {isDockMode && (
        <footer className="relative z-10 max-w-4xl mx-auto w-full bg-[#1e1612]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-amber-700/70 p-1.5 sm:p-2 shadow-2xl flex-shrink-0 mb-1">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2 w-full">
            {/* 1. Makan (Bento) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Makan');
                  return;
                }
                triggerShoji({
                  label: 'Kotak Bento Jubako',
                  kanji: '🍱 食',
                  sublabel: 'Perjamuan Kuliner & Khasiat Roh',
                  onMidpoint: () => setIsBentoOpen(true),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-600/60 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Makan Bento'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🍙
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-300'}`}>
                {pet.isSleeping ? 'Makan 💤' : 'Makan'}
              </span>
            </button>

            {/* 2. Mandi / Bersihkan (Pindah ke Kamar Mandi Onsen) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Mandi');
                  return;
                }
                handleOpenBathScene();
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#1e2e38] to-[#121c22] hover:from-[#2a3f4c] hover:to-[#17242c] border border-cyan-600/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Pemandian Onsen'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🛁
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-cyan-300'}`}>
                {pet.isSleeping ? 'Mandi 💤' : 'Mandi'}
              </span>
            </button>

            {/* 3. Tidur (Pindah ke Kamar Tidur Futon atau Konfirmasi Tidur) */}
            <button
              onClick={handleSleepButtonClick}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group ${
                pet.isSleeping
                  ? 'bg-gradient-to-b from-purple-900/90 to-purple-950 border-purple-400/90 text-purple-100 shadow-purple-950/60 ring-1 ring-purple-400/50'
                  : 'bg-gradient-to-b from-[#2e1c3a] to-[#1c0f24] hover:from-[#3d254e] hover:to-[#24132f] border-purple-600/70 text-stone-100'
              }`}
              title={pet.isSleeping ? 'Lihat Kamar Tidur & Sisa Waktu' : 'Tidurkan Kitsune (15 Menit)'}
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                {pet.isSleeping ? '💤' : '🛏️'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-200 mt-0.5 whitespace-nowrap">
                {pet.isSleeping ? formatSleepCountdown(sleepRemainingSeconds) : 'Tidur'}
              </span>
            </button>

            {/* 4. Lemari Busana & Aksesoris (Wardrobe) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Busana');
                  return;
                }
                triggerShoji({
                  label: 'Lemari Busana Miyabi',
                  kanji: '👘 衣',
                  sublabel: 'Kimono & Aksesoris Roh Kitsune',
                  onMidpoint: () => setIsWardrobeOpen(true),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3d2319] to-[#26130d] hover:from-[#4c2d20] hover:to-[#311911] border border-amber-500/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Lemari Busana'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                👘
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-200'}`}>
                {pet.isSleeping ? 'Busana 💤' : 'Busana'}
              </span>
            </button>

            {/* 5. Kuil & Omikuji / AI Chat */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Kuil Inari');
                  return;
                }
                triggerShoji({
                  label: 'Kuil Inari Okami',
                  kanji: '⛩️ 社',
                  sublabel: 'Fushimi Inari • Kotodama & Ema',
                  onMidpoint: () => setIsShrineOpen(true),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#4a1b18] to-[#2b0e0c] hover:from-[#58211d] hover:to-[#34110f] border border-rose-600/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Kuil Inari'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                ⛩️
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-rose-300'}`}>
                {pet.isSleeping ? 'Kuil 💤' : 'Kuil'}
              </span>
            </button>

            {/* 6. Festival Mini-Games */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Festival Matsuri');
                  return;
                }
                triggerShoji({
                  label: 'Pekan Raya Matsuri',
                  kanji: '🏮 祭',
                  sublabel: 'Natsu Matsuri • Taiko & Mini-Games',
                  onMidpoint: () => setIsMatsuriOpen(true),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-600/60 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Festival Matsuri'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🎏
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-300'}`}>
                {pet.isSleeping ? 'Festival 💤' : 'Festival'}
              </span>
            </button>

            {/* 7. Toko Serba Ada Tanuki (TETAP BISA DIAKSES & BELANJA!) */}
            <button
              onClick={() => {
                triggerShoji({
                  label: 'Toko Serba Ada Tanuki',
                  kanji: '🏪 店',
                  sublabel: 'Minimarket Modern Istana Rubah',
                  onMidpoint: () => setIsShopOpen(true),
                });
              }}
              className="py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-500 text-stone-100 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group ring-1 ring-amber-500/50"
              title="Toko Serba Ada Tanuki (Buka Selalu)"
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                🏪
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mt-0.5">
                Toko
              </span>
            </button>

            {/* 8. Menu Fitur Santuari */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSanctuaryMenuOpen(true);
              }}
              className="py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-500/80 text-stone-100 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group"
              title="Menu Fitur Santuari"
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                🏮
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mt-0.5">
                Menu
              </span>
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-stone-400">
            <span>Mode Bilah Dock Klasik</span>
            <button
              onClick={() => {
                soundEngine.playSensuOpen();
                setIsDockMode(false);
                setIsSensuOpen(true);
              }}
              className="text-amber-300 hover:text-amber-100 font-bold underline cursor-pointer"
            >
              🪭 Beralih ke Menu Kipas Sensu
            </button>
          </div>
        </footer>
      )}

      {/* Sensu Radial Fan HUD (Immersive Mode) */}
      <SensuFanHUD
        items={sensuItems}
        isOpen={isSensuOpen}
        onToggle={() => setIsSensuOpen((prev) => !prev)}
        onClose={() => setIsSensuOpen(false)}
        isDockMode={isDockMode}
        onToggleDockMode={() => {
          setIsDockMode((prev) => !prev);
          if (isSensuOpen) setIsSensuOpen(false);
        }}
      />

      {/* MODALS & FULLSCREEN SANCTUARY ROOMS */}
      <BentoFoodModal
        isOpen={isBentoOpen}
        onClose={() => setIsBentoOpen(false)}
        inventory={pet.inventory}
        onFeedItem={handleFeedItem}
        onOpenShop={() => setIsShopOpen(true)}
        hunger={pet.hunger}
        happiness={pet.happiness}
        petName={pet.name}
        coins={pet.coins}
        pet={pet}
        onFinishDining={() => {
          setIsBentoOpen(false);
          soundEngine.playChime();
          hapticEngine.heavy();
          showToast(`🙏 Gochisousama! ${pet.name} kenyang dan puas bersantap di Meja Bento!`);
        }}
      />

      {/* Onsen Bath Sanctuary Scene */}
      <OnsenBathModal
        isOpen={isBathOpen}
        onClose={() => setIsBathOpen(false)}
        pet={pet}
        onFinishBath={handleFinishBath}
      />

      {/* Futon Bedroom Sanctuary Scene */}
      <FutonBedroomModal
        isOpen={isBedroomOpen}
        onClose={() => setIsBedroomOpen(false)}
        pet={pet}
        onWakeUp={handleWakeUpFromBedroom}
        onOpenShop={() => setIsShopOpen(true)}
      />

      <TanukiShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={pet.coins}
        inventory={pet.inventory}
        onBuyItem={handleBuyItem}
        onOpenWardrobe={() => setIsWardrobeOpen(true)}
      />

      <ShrineModal
        isOpen={isShrineOpen}
        onClose={() => setIsShrineOpen(false)}
        pet={pet}
        setPet={setPet}
        showToast={showToast}
        onOmikujiDrawn={handleOmikujiDrawn}
      />

      <MatsuriGamesModal
        isOpen={isMatsuriOpen}
        onClose={() => setIsMatsuriOpen(false)}
        onReward={handleGameReward}
      />

      <HankoAlbumModal
        isOpen={isHankoOpen}
        onClose={() => setIsHankoOpen(false)}
        pet={pet}
        onResetPet={onResetPet}
      />

      <WardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        pet={pet}
        setPet={setPet}
        showToast={showToast}
      />

      <SanctuaryDecorModal
        isOpen={isDecorOpen}
        onClose={() => setIsDecorOpen(false)}
        currentDecor={pet.sanctuaryDecor || DEFAULT_SANCTUARY_DECOR}
        coins={pet.coins}
        petLevel={pet.level}
        unlockedDecor={pet.unlockedDecor || DEFAULT_UNLOCKED_DECOR}
        onUpdateDecor={(newDecor) => {
          setPet((prev) => ({
            ...prev,
            sanctuaryDecor: newDecor,
          }));
          showToast('🏡 Dekorasi Ruangan Sanctuary Diperbarui!');
        }}
        onBuyDecor={(item) => {
          setPet((prev) => ({
            ...prev,
            coins: Math.max(0, prev.coins - item.price),
            unlockedDecor: [...(prev.unlockedDecor || DEFAULT_UNLOCKED_DECOR), item.id],
          }));
          showToast(`Membeli dekorasi: ${item.name}! (+${item.blessingText})`);
        }}
      />

      {/* Buku Harian Roh (Memory Scroll & Ukiyo-e Album) Modal */}
      <MemoryScrollModal
        isOpen={isMemoryScrollOpen}
        onClose={() => setIsMemoryScrollOpen(false)}
        pet={pet}
        onAddNote={handleAddDiaryNote}
        onDeleteNote={handleDeleteDiaryNote}
      />

      {/* Paspor Kuil & Pertukaran Ziarah (Shrine Pass) Modal */}
      <ShrinePassModal
        isOpen={isShrinePassOpen}
        onClose={() => setIsShrinePassOpen(false)}
        pet={pet}
        visitedShrines={visitedShrines}
        onVisitShrine={(code) => {
          setVisitedShrines((prev) => (prev.includes(code) ? prev : [...prev, code]));
        }}
        onReceiveBlessing={handleReceivePilgrimageBlessing}
      />

      {/* Pengrajin Kembang Api Tradisional (Hanabi Maker) Mini-Game Modal */}
      <HanabiMakerModal
        isOpen={isHanabiOpen}
        onClose={() => setIsHanabiOpen(false)}
        onSuccess={handleHanabiSuccess}
      />

      {/* Pengaturan Umpan Balik Taktil (Haptic Feedback) Modal */}
      <HapticSettingsModal
        isOpen={isHapticModalOpen}
        onClose={() => setIsHapticModalOpen(false)}
      />

      {/* Menu Fitur Santuari Tradisional Modal */}
      <SanctuaryMenuModal
        isOpen={isSanctuaryMenuOpen}
        onClose={() => setIsSanctuaryMenuOpen(false)}
        onOpenPrologue={onOpenPrologue}
        onOpenHanko={() => {
          triggerShoji({
            label: 'Kitab Segel Hanko',
            kanji: '📜 印',
            sublabel: 'Arsip Silsilah Roh Kitsune',
            onMidpoint: () => setIsHankoOpen(true),
          });
        }}
        onOpenMemoryScroll={() => {
          triggerShoji({
            label: 'Gulungan Memori Emakimono',
            kanji: '📖 記',
            sublabel: 'Album Ukiyo-e & Catatan Kenangan',
            onMidpoint: () => setIsMemoryScrollOpen(true),
          });
        }}
        onOpenShrinePass={() => {
          triggerShoji({
            label: 'Paspor Ziarah Inari',
            kanji: '⛩️ 通',
            sublabel: 'Ziarah Kuil Teman & Tukar Berkah',
            onMidpoint: () => setIsShrinePassOpen(true),
          });
        }}
        onOpenHanabi={() => {
          triggerShoji({
            label: 'Pesta Kembang Api Hanabi',
            kanji: '🎆 火',
            sublabel: 'Hanabi Taikai • Langit Festival',
            onMidpoint: () => setIsHanabiOpen(true),
          });
        }}
        onOpenDecor={() => {
          triggerShoji({
            label: 'Renovasi Sanctuary Tatami',
            kanji: '🏡 館',
            sublabel: 'Tatami, Altar & Kakemono',
            onMidpoint: () => setIsDecorOpen(true),
          });
        }}
        onOpenHaptic={() => {
          setIsHapticModalOpen(true);
        }}
        onOpenParallax={() => {
          setIsParallaxModalOpen(true);
        }}
        onOpenWardrobe={() => {
          triggerShoji({
            label: 'Lemari Busana Miyabi',
            kanji: '👘 衣',
            sublabel: 'Kimono & Aksesoris Roh Kitsune',
            onMidpoint: () => setIsWardrobeOpen(true),
          });
        }}
        onTriggerShoji={() => {
          triggerShoji({
            label: 'Gerbang Pintu Shoji',
            kanji: '🚪 障',
            sublabel: 'Transisi Layar Tradisional Fusuma',
            onMidpoint: () => {
              showToast('🚪 Pintu Shoji bergeser membuka santuari...');
            },
          });
        }}
        onOpenShop={() => {
          triggerShoji({
            label: 'Toko Serba Ada Tanuki',
            kanji: '🏪 店',
            sublabel: 'Minimarket Modern Istana Rubah',
            onMidpoint: () => setIsShopOpen(true),
          });
        }}
        onOpenShrine={() => {
          triggerShoji({
            label: 'Kuil Inari Okami',
            kanji: '⛩️ 縁',
            sublabel: `Ikatan Batin Lv.${bondInfo.level} • ${bondInfo.currentMilestone.title}`,
            onMidpoint: () => setIsShrineOpen(true),
          });
        }}
        onOpenBackupRestore={() => {
          setIsBackupRestoreOpen(true);
        }}
        onOpenOdekake={() => {
          setIsOdekakeOpen(true);
        }}
      />

      {/* Petualangan Berkelana Roh (O-dekake / Tabi) Modal */}
      <OdekakeModal
        isOpen={isOdekakeOpen}
        onClose={() => setIsOdekakeOpen(false)}
        pet={pet}
        onDepart={handleDepartOdekake}
        onRecallEarly={handleRecallEarlyOdekake}
        showToast={showToast}
      />

      {/* Sambutan Kepulangan Berkelana (Odekake Return) Modal */}
      {completedTripToCelebrate && (
        <OdekakeReturnModal
          isOpen={true}
          onClose={handleClaimOdekakeReward}
          petName={pet.name}
          destinationName={completedTripToCelebrate.destinationName}
          destinationKanji={completedTripToCelebrate.destinationKanji}
          reward={completedTripToCelebrate.reward}
          onClaim={handleClaimOdekakeReward}
        />
      )}

      {/* Cadangan & Pemulihan Santuari (Backup & Restore) Modal */}
      <BackupRestoreModal
        isOpen={isBackupRestoreOpen}
        onClose={() => setIsBackupRestoreOpen(false)}
        pet={pet}
        onRestore={(restoredPet) => {
          setPet(restoredPet);
          showToast(`⛩️ Segel Santuari Berhasil Dipulihkan: ${restoredPet.name}!`);
        }}
        showToast={showToast}
      />

      {/* Sensasi Kedalaman Parallax 2.5D Settings Modal */}
      <ParallaxSettingsModal
        isOpen={isParallaxModalOpen}
        onClose={() => setIsParallaxModalOpen(false)}
        mode={parallax.mode}
        onSetMode={parallax.setMode}
        x={parallax.x}
        y={parallax.y}
        hasGyroscope={parallax.hasGyroscope}
        isGyroActive={parallax.isGyroActive}
        onRequestGyroPermission={parallax.requestGyroPermission}
      />

      {/* DIALOG KONFIRMASI TIDUR 15 MENIT */}
      {isSleepConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative max-w-md w-full rounded-2xl sm:rounded-3xl bg-stone-950/95 border-2 border-purple-500/70 p-5 sm:p-6 shadow-2xl space-y-4 text-stone-100">
            {/* Header Dialog */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700/80 to-purple-950 border border-purple-400/80 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🌙
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-purple-200">
                  Tidurkan {pet.name}?
                </h3>
                <p className="text-xs text-purple-300/80 font-['Shippori_Mincho',serif]">
                  Peraduan Kasur Futon Hangat (15 Menit)
                </p>
              </div>
            </div>

            {/* Content & Details */}
            <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3.5 space-y-2.5 text-xs text-stone-200 leading-relaxed">
              <p>
                Apakah kamu ingin menidurkan <strong>{pet.name}</strong> di atas kasur futon?
              </p>
              <div className="space-y-1.5 pt-1 text-[11px] text-stone-300">
                <div className="flex items-center gap-2 text-purple-200 font-semibold">
                  <span>⏱️</span>
                  <span><strong>Durasi Tidur:</strong> 15 Menit waktu nyata</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <span>⚡</span>
                  <span><strong>Pemulihan:</strong> Energi terisi penuh 100% saat bangun</span>
                </div>
                <div className="flex items-center gap-2 text-amber-200 font-semibold">
                  <span>🏪</span>
                  <span><strong>Toko Tanuki:</strong> Tetap BUKA & bisa kamu kunjungi untuk belanja!</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <span>🔒</span>
                  <span><strong>Menu Aktivitas Fisik:</strong> Makan, Mandi, Kuil, dan Festival diistirahatkan sejenak</span>
                </div>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsSleepConfirmOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs active:scale-95 transition-all cursor-pointer text-center"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleConfirmSleep}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-purple-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer text-center"
              >
                <span>💤 Ya, Tidurkan (15 Menit)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traditional Shoji/Fusuma Sliding Door Screen Wipe Transition */}
      <ShojiTransition
        isActive={isShojiActive}
        config={shojiConfig}
        onFinished={handleShojiFinished}
      />
    </div>
  );
};
