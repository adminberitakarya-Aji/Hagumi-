import React, { useState, useEffect, useRef } from 'react';
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
import { PetData, DayPhase, FoodItem, SeasonType } from '../types/game';
import { useOdekakeFlow } from '../hooks/useOdekakeFlow';
import { useCareActions } from '../hooks/useCareActions';
import { ELEMENTS_CONFIG, getRequiredExp, addPetExp, getBondingLevelInfo } from '../data/gameConfig';
import { KitsuneCanvas } from './KitsuneCanvas';
import { SeasonParticles } from './SeasonParticles';
import { SeasonSwitcherPanel } from './SeasonSwitcherPanel';
import { TatamiSanctuaryBackground } from './TatamiSanctuaryBackground';
import { ShojiTransition } from './ShojiTransition';
import { useShojiTransition } from '../hooks/useShojiTransition';
import { useAmbient } from '../hooks/useAmbient';
import { useAudioHaptic } from '../hooks/useAudioHaptic';
import { useCountdown, formatCountdown } from '../hooks/useTimers';
import { SensuFanHUD, SensuItem } from './SensuFanHUD';
import { SleepConfirmDialog } from './tatami/SleepConfirmDialog';
import { ResetConfirmDialog } from './tatami/ResetConfirmDialog';
import { ModalLayer } from './tatami/ModalLayer';
import { TatamiHeader } from './tatami/TatamiHeader';
import { StatusBanners } from './tatami/StatusBanners';
import { TatamiDock } from './tatami/TatamiDock';
import { useFirstQuest } from '../hooks/useFirstQuest';
import { FirstQuestBanner } from './tatami/FirstQuestBanner';
import { InariConsiderationCard } from './tatami/InariConsiderationCard';
import { useDailyQuest } from '../hooks/useDailyQuest';
import { DailyQuestPanel } from './tatami/DailyQuestPanel';
import { createLineageBlessing, recordLineageBlessing } from '../utils/lineage';
import { DEFAULT_SANCTUARY_DECOR, DEFAULT_UNLOCKED_DECOR } from '../data/gameConfig';
import { MODAL_LABELS, type ModalKind } from './tatami/modalRegistry';

// Registry modal dipindah ke src/components/tatami/modalRegistry.ts —
// re-export dipertahankan agar jalur import lama tetap berfungsi.
export { MODAL_LABELS };
export type { ModalKind };
import { ParallaxSettingsModal } from './ParallaxSettingsModal';
import { useParallax2D } from '../utils/useParallax2D';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

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

  /**
   * State modal terkonsolidasi: hanya satu modal terbuka pada satu waktu.
   * Membuka modal lain akan MENUTUP modal yang sedang terbuka (perilaku replace),
   * sehingga dua modal tidak mungkin terbuka bersamaan.
   */
  const [activeModal, setActiveModal] = useState<ModalKind | null>(() =>
    // Otomatis buka Kamar Peraduan jika mode tidur masih aktif
    Boolean(pet.isSleeping && pet.sleepUntilTimestamp && pet.sleepUntilTimestamp > Date.now())
      ? 'bedroom'
      : null
  );
  // Sleep 15-minute countdown (target timestamp; null saat tidak tidur)
  const sleepRemainingSeconds = useCountdown(
    pet.isSleeping && pet.sleepUntilTimestamp ? pet.sleepUntilTimestamp : null
  );

  // Parallax 2.5D Depth Engine (Cursor and Gyroscope sensor tracking)
  const parallax = useParallax2D();

  // Sensu Folding Fan Radial HUD state (default to true dockMode so classic dock is always visible and clear)
  const [isSensuOpen, setIsSensuOpen] = useState(false);
  const [isDockMode, setIsDockMode] = useState(true);

  // Domain lingkungan/visual sanctuary: musim, fase waktu hari, lentera & riak tatami
  const {
    season,
    setSeason,
    isLanternOn,
    setIsLanternOn,
    timePhase,
    tatamiRipples,
    setTatamiRipples,
  } = useAmbient(pet, setPet);

  // Domain audio & haptic: mute, BGM aktif & konfigurasi haptic feedback
  const { isMuted, isBgmActive, hapticConfig, toggleMute, toggleBgm } = useAudioHaptic(timePhase, season);

  const [visitedShrines, setVisitedShrines] = useState<string[]>(() => pet.visitedShrines || []);

  // Room environment states
  const [actionState, setActionState] = useState<'idle' | 'eating' | 'bathing' | 'sleeping' | 'happy' | 'sick'>('idle');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dialog konfirmasi "Mulai Generasi Baru" (reset pet) — aksi destruktif permanen
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const elementInfo = ELEMENTS_CONFIG[pet.element] || ELEMENTS_CONFIG.fire;
  const bondInfo = getBondingLevelInfo(pet.bondingPoints ?? 120);

  // Sync visited shrines to pet data (season sudah disinkronkan oleh useAmbient)
  useEffect(() => {
    setPet((prev) => ({
      ...prev,
      visitedShrines,
    }));
  }, [visitedShrines, setPet]);

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
        soundEngine.playSeasonTransition(nextSeason);
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


  // Show quick toast notification (5 detik; bisa ditutup lebih awal dengan klik)
  const toastTimerRef = useRef<number | null>(null);
  const showToast = (msg: string) => {
    // Bersihkan timer toast sebelumnya agar toast baru tidak tertutup prematur
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null;
      setToastMessage(null);
    }, 5000);
  };
  const dismissToast = () => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  };

  // Reset pet: HankoAlbumModal hanya MEMINTA reset; konfirmasi nyata
  // ditangani dialog khusus di bawah (aksi destruktif, tidak boleh 1-klik)
  const handleRequestReset = () => {
    setActiveModal(null);
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    soundEngine.playShrineBell();
    hapticEngine.heavy();
    // P5 (Revisi 6): rekam Restu Silsilah SEBELUM reset — warisan lintas
    // generasi diterapkan otomatis saat telur generasi berikutnya menetas.
    recordLineageBlessing(pet);
    onResetPet();
  };

  // P5 (Revisi 6): preview Restu Silsilah untuk dialog konfirmasi (hitungan
  // sama dengan createLineageBlessing — level & streak terbaik generasi ini).
  const lineagePreview = createLineageBlessing(pet);

  // Cluster logika Odekake diekstrak ke src/hooks/useOdekakeFlow.ts (Mid-Term #4)
  const {
    completedTripToCelebrate,
    odekakeRemainingSeconds,
    handleOdekakeActivityBlocked,
    handleDepartOdekake,
    handleRecallEarlyOdekake,
    handleClaimOdekakeReward,
  } = useOdekakeFlow({ pet, setPet, showToast, closeModal: () => setActiveModal(null) });

  // Cluster aksi perawatan diekstrak ke src/hooks/useCareActions.ts (Mid-Term #4)
  const {
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
  } = useCareActions({
    pet,
    setPet,
    showToast,
    setActiveModal,
    triggerShoji,
    setActionState,
    setIsLanternOn,
  });

  // P2 (Revisi 6): Misi Pertama Pengasuh — tandai langkah saat aksi terkait selesai.
  const firstQuest = useFirstQuest({ pet, setPet, showToast });
  const handleFeedItemWithQuest = (item: FoodItem) => {
    handleFeedItem(item);
    firstQuest.markDone('feed');
    dailyQuest.markQuestDone('feed');
  };
  const handleFinishBathWithQuest = (expGain: number, happinessGain: number) => {
    handleFinishBath(expGain, happinessGain);
    firstQuest.markDone('bath');
  };
  const handleCleanAndBathWithQuest = () => {
    handleCleanAndBath();
    firstQuest.markDone('bath');
  };

  // P4 (Revisi 6): quest harian & streak — dipicu dari aksi makan & mini-game.
  const dailyQuest = useDailyQuest({ pet, setPet, showToast });

  // P5 (Revisi 6): sambutan Restu Silsilah — sekali per kitsune (ref guard),
  // muncul di ruangan setelah telur generasi berikutnya menetas & restu aktif.
  const lineageGreetedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pet.lineage || lineageGreetedRef.current === pet.id) return;
    lineageGreetedRef.current = pet.id;
    const l = pet.lineage;
    showToast(
      `⛩️ Restu Silsilah dari ${l.elderName} (Lv.${l.elderLevel}, ${l.elderTails} ekor) mewariskan +${l.inheritedCoins} Ryo untuk ${pet.name}!`
    );
    soundEngine.playShrineBell();
  }, [pet, showToast]);

  // Idle Thought Bubble tap → open the suggested modal
  const handleThoughtClick = (thoughtType: string, _thoughtText: string) => {
    soundEngine.playSuzuChime();
    hapticEngine.tap();
    switch (thoughtType) {
      case 'hunger':
        if (!pet.isSleeping) setActiveModal('bento');
        break;
      case 'energy':
        if (!pet.isSleeping) setActiveModal('sleepConfirm');
        break;
      case 'dirty':
        if (!pet.isSleeping) setActiveModal('bath');
        break;
      case 'bored':
        if (!pet.isSleeping) setActiveModal('matsuri');
        break;
      case 'sick':
        if (!pet.isSleeping) setActiveModal('shop');
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
  // disciplineGained (opsional): bonus disiplin dari Wanage performa bagus (Revisi 4 bug #5).
  const handleGameReward = (coinsEarned: number, hapGained: number, disciplineGained?: number) => {
    firstQuest.markDone('minigame'); // P2 (Revisi 6): langkah mini-game Misi Pertama
    dailyQuest.markQuestDone('game'); // P4 (Revisi 6): quest harian mini-game
    const expGain = Math.max(15, Math.floor(coinsEarned * 0.8) + 15);
    const expRes = addPetExp(pet.exp, pet.level, expGain);

    if (expRes.leveledUp) {
      soundEngine.playEvolutionFanfare();
      showToast(`🎉 Level Up! Prestasi festival membawa ${pet.name} naik ke Level ${expRes.newLevel}!`);
    } else if (disciplineGained && disciplineGained > 0) {
      showToast(`Hadiah Festival: +${coinsEarned} Ryo, +${hapGained} Bahagia, +${disciplineGained} Disiplin & +${expGain} EXP!`);
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
          discipline: Math.min(100, prev.stats.discipline + (disciplineGained || 0)),
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
          onMidpoint: () => setActiveModal('bento'),
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
      label: pet.isSleeping ? `Tidur (${formatCountdown(sleepRemainingSeconds)})` : pet.activeOdekake ? 'Tidur 🎒' : 'Tidur',
      kanji: pet.isSleeping ? '💤 眠' : '🛏️ 眠',
      sublabel: pet.isSleeping
        ? `Tidur lelap (${formatCountdown(sleepRemainingSeconds)} tersisa)`
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
          onMidpoint: () => setActiveModal('wardrobe'),
        });
      },
    },
    {
      id: 'odekake',
      label: pet.activeOdekake
        ? `Tabi (${formatCountdown(odekakeRemainingSeconds)})`
        : 'Berkelana',
      kanji: pet.activeOdekake ? '🚶 旅' : '🎒 旅',
      sublabel: pet.activeOdekake
        ? `Sedang ke ${pet.activeOdekake.destinationName} (${formatCountdown(odekakeRemainingSeconds)})`
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
          onMidpoint: () => setActiveModal('odekake'),
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
          onMidpoint: () => setActiveModal('shrine'),
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
          onMidpoint: () => setActiveModal('matsuri'),
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
          onMidpoint: () => setActiveModal('shop'),
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
        setActiveModal('sanctuaryMenu');
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

      {/* Seasonal Particles Overlay: Falling Sakura, Summer Fireflies, Autumn Momiji, Winter Snow */}
      <SeasonParticles season={season} intensity="medium" />

      {/* TOP HEADER + CORE VITALS METERS — diekstrak ke tatami/TatamiHeader.tsx */}
      <TatamiHeader
        pet={pet}
        bondInfo={bondInfo}
        setActiveModal={setActiveModal}
        triggerShoji={triggerShoji}
        showToast={showToast}
        parallax={parallax}
        isBgmActive={isBgmActive}
        toggleBgm={toggleBgm}
        isMuted={isMuted}
        toggleMute={toggleMute}
        timePhase={timePhase}
        season={season}
        odekakeRemainingSeconds={odekakeRemainingSeconds}
        onOpenPrologue={onOpenPrologue}
        handleCycleSeason={handleCycleSeason}
        isDockMode={isDockMode}
        setIsDockMode={setIsDockMode}
        setIsSensuOpen={setIsSensuOpen}
      />

      {/* BANNER STATUS — diekstrak ke tatami/StatusBanners.tsx */}
      <StatusBanners
        pet={pet}
        toastMessage={toastMessage}
        dismissToast={dismissToast}
        sleepRemainingSeconds={sleepRemainingSeconds}
        odekakeRemainingSeconds={odekakeRemainingSeconds}
        setActiveModal={setActiveModal}
        handleOpenBedroomScene={handleOpenBedroomScene}
      />

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

        {/* P2 (Revisi 6): Misi Pertama Pengasuh — panduan 3 langkah untuk pemain baru */}
        {firstQuest.visible && (
          <FirstQuestBanner
            pet={pet}
            activeStep={firstQuest.activeStep ?? 'feed'}
            progress={firstQuest.progress}
            onStepClick={(step) => {
              if (pet.isSleeping) {
                handleSleepingActivityBlocked('Misi Pertama');
                return;
              }
              if (step === 'feed') setActiveModal('bento');
              else if (step === 'bath') handleOpenBathScene();
              else setActiveModal('matsuri');
            }}
          />
        )}

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
              onKeyDown={(e) => {
                // A11y: kartu tidur dapat diaktifkan via keyboard
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenBedroomScene();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Menengok ${pet.name} yang sedang tidur di kamar peraduan futon`}
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
                <span className="text-amber-300 font-mono">⏱️ {formatCountdown(sleepRemainingSeconds)}</span>
              </div>
            </div>
          ) : pet.activeOdekake ? (
            /* Saat Kitsune sedang berkelana (O-dekake): Catatan surat pamit di atas meja tatami */
            <div
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClick();
                setActiveModal('odekake');
              }}
              onKeyDown={(e) => {
                // A11y: kartu surat Odekake dapat diaktifkan via keyboard
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  soundEngine.playClick();
                  setActiveModal('odekake');
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Lihat kabar perjalanan ${pet.name} yang sedang berkelana ke ${pet.activeOdekake.destinationName}`}
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
                  ⏱️ {formatCountdown(odekakeRemainingSeconds)}
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

              {/* A11y: pad kasih sayang keyboard — jalur alternatif non-pointer
                  untuk mengelus kitsune (interaksi canvas tidak bisa via keyboard). */}
              <button
                onClick={handlePetClick}
                aria-label={`Elus ${pet.name} (kasih sayang)`}
                className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-900/90 border border-rose-500 text-rose-200 text-[10px] sm:text-xs font-bold shadow-lg hover:bg-rose-800 transition-all cursor-pointer flex-shrink-0"
              >
                <Heart className="w-3 h-3 text-rose-300" />
                <span>Elus {pet.name}</span>
              </button>

              {/* Poop cleaning quick alert if dirty */}
              {pet.poopCount > 0 && (
                <button
                  onClick={handleCleanAndBathWithQuest}
                  className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/90 border border-amber-500 text-amber-200 text-[10px] sm:text-xs font-bold shadow-lg hover:bg-amber-800 transition-all animate-bounce cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-amber-400" />
                  <span>Sapu {pet.poopCount} Kotoran Tatami</span>
                </button>
              )}

              {/* P2 (Revisi 6): Pertimbangan Inari — preview deterministik takdir evolusi */}
              <InariConsiderationCard pet={pet} />

              {/* P4 (Revisi 6): Misi Harian + streak retensi */}
              <DailyQuestPanel
                streakCount={dailyQuest.view.streakCount}
                feedDone={dailyQuest.isFeedDone}
                gameDone={dailyQuest.isGameDone}
              />
            </>
          )}
        </div>
      </main>

      {/* DOCK AKSI KLASIK — diekstrak ke tatami/TatamiDock.tsx */}
      <TatamiDock
        pet={pet}
        isDockMode={isDockMode}
        setActiveModal={setActiveModal}
        triggerShoji={triggerShoji}
        handleSleepingActivityBlocked={handleSleepingActivityBlocked}
        handleOpenBathScene={handleOpenBathScene}
        handleSleepButtonClick={handleSleepButtonClick}
        setIsDockMode={setIsDockMode}
        setIsSensuOpen={setIsSensuOpen}
        sleepRemainingSeconds={sleepRemainingSeconds}
      />

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

      {/* MODALS & FULLSCREEN SANCTUARY ROOMS — diekstrak ke tatami/ModalLayer.tsx */}
      <ModalLayer
        pet={pet}
        setPet={setPet}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        triggerShoji={triggerShoji}
        showToast={showToast}
        visitedShrines={visitedShrines}
        setVisitedShrines={setVisitedShrines}
        bondInfo={bondInfo}
        season={season}
        onOpenPrologue={onOpenPrologue}
        handleCycleSeason={handleCycleSeason}
        handleFeedItem={handleFeedItemWithQuest}
        handleFinishBath={handleFinishBathWithQuest}
        handleWakeUpFromBedroom={handleWakeUpFromBedroom}
        handleBuyItem={handleBuyItem}
        handleOmikujiDrawn={handleOmikujiDrawn}
        handleGameReward={handleGameReward}
        handleHanabiSuccess={handleHanabiSuccess}
        handleReceivePilgrimageBlessing={handleReceivePilgrimageBlessing}
        handleAddDiaryNote={handleAddDiaryNote}
        handleDeleteDiaryNote={handleDeleteDiaryNote}
        handleRequestReset={handleRequestReset}
        handleConfirmSleep={handleConfirmSleep}
        handleDepartOdekake={handleDepartOdekake}
        handleRecallEarlyOdekake={handleRecallEarlyOdekake}
        handleClaimOdekakeReward={handleClaimOdekakeReward}
        completedTripToCelebrate={completedTripToCelebrate}
        parallax={parallax}
      />

      {/* DIALOG KONFIRMASI MULAI GENERASI BARU (Reset Pet — destruktif permanen) */}
      {isResetConfirmOpen && (
        <ResetConfirmDialog
          petName={pet.name}
          blessing={lineagePreview}
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
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
