/**
 * src/components/tatami/ModalLayer.tsx
 * Layer seluruh modal & ruangan fullscreen Santuari (19 modal) + wrapper
 * role="dialog" (focus trap / Esc / restorasi fokus).
 * Diekstrak dari TatamiRoom.tsx (langkah 3 refactor God component):
 * TatamiRoom cukup merender <ModalLayer {...deps} />.
 *
 * CODE SPLITTING (Revisi 4 bug #4):
 * - 19 modal di-lazy-load via React.lazy — 1 chunk terpisah per modal,
 *   sehingga bundle utama tidak lagi memuat semuanya di depan.
 * - Karena layer me-render modal dengan pattern `isOpen` (tetap ter-mount),
 *   lazy polos akan mem-fetch SEMUA chunk saat mount. Maka dipakai gating
 *   mount-on-first-open (`everOpenedModal`): modal baru di-mount saat pertama
 *   kali dibuka, dan setelah itu tetap ter-mount (perilaku identik dengan
 *   implementasi lama sejak open pertama).
 * - Prefetch semua chunk modal saat idle (requestIdleCallback, fallback
 *   setTimeout) sehingga open pertama biasanya tanpa jeda terlihat.
 * - SleepConfirmDialog kecil & bagian dari tatami/ — tetap eager.
 */

import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { PetData, FoodItem, SeasonType, OdekakeTrip, OdekakeReward } from '../../types/game';
import { ModalKind, MODAL_LABELS } from './modalRegistry';
import { DialogA11yWrapper } from '../../hooks/useDialogA11y';
import { getBondingLevelInfo, DEFAULT_SANCTUARY_DECOR, DEFAULT_UNLOCKED_DECOR } from '../../data/gameConfig';
import { useParallax2D } from '../../utils/useParallax2D';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';
import type { ShojiTransitionConfig } from '../ShojiTransition';
import { SleepConfirmDialog } from './SleepConfirmDialog';

// --- Loader dinamis per modal (dipakai lazy() DAN prefetch idle) ---
const loadBentoFoodModal = () => import('../BentoFoodModal');
const loadOnsenBathModal = () => import('../OnsenBathModal');
const loadFutonBedroomModal = () => import('../FutonBedroomModal');
const loadTanukiShopModal = () => import('../TanukiShopModal');
const loadShrineModal = () => import('../ShrineModal');
const loadMatsuriGamesModal = () => import('../MatsuriGamesModal');
const loadHankoAlbumModal = () => import('../HankoAlbumModal');
const loadWardrobeModal = () => import('../WardrobeModal');
const loadSanctuaryDecorModal = () => import('../SanctuaryDecorModal');
const loadMemoryScrollModal = () => import('../MemoryScrollModal');
const loadShrinePassModal = () => import('../ShrinePassModal');
const loadHanabiMakerModal = () => import('../HanabiMakerModal');
const loadHapticSettingsModal = () => import('../HapticSettingsModal');
const loadBackupRestoreModal = () => import('../BackupRestoreModal');
const loadOdekakeModal = () => import('../OdekakeModal');
const loadOdekakeReturnModal = () => import('../OdekakeReturnModal');
const loadZenGardenModal = () => import('../ZenGardenModal');
const loadSanctuaryMenuModal = () => import('../SanctuaryMenuModal');
const loadParallaxSettingsModal = () => import('../ParallaxSettingsModal');

// --- Komponen lazy (named export di-map ke default untuk React.lazy) ---
const BentoFoodModal = lazy(() => loadBentoFoodModal().then((m) => ({ default: m.BentoFoodModal })));
const OnsenBathModal = lazy(() => loadOnsenBathModal().then((m) => ({ default: m.OnsenBathModal })));
const FutonBedroomModal = lazy(() => loadFutonBedroomModal().then((m) => ({ default: m.FutonBedroomModal })));
const TanukiShopModal = lazy(() => loadTanukiShopModal().then((m) => ({ default: m.TanukiShopModal })));
const ShrineModal = lazy(() => loadShrineModal().then((m) => ({ default: m.ShrineModal })));
const MatsuriGamesModal = lazy(() => loadMatsuriGamesModal().then((m) => ({ default: m.MatsuriGamesModal })));
const HankoAlbumModal = lazy(() => loadHankoAlbumModal().then((m) => ({ default: m.HankoAlbumModal })));
const WardrobeModal = lazy(() => loadWardrobeModal().then((m) => ({ default: m.WardrobeModal })));
const SanctuaryDecorModal = lazy(() => loadSanctuaryDecorModal().then((m) => ({ default: m.SanctuaryDecorModal })));
const MemoryScrollModal = lazy(() => loadMemoryScrollModal().then((m) => ({ default: m.MemoryScrollModal })));
const ShrinePassModal = lazy(() => loadShrinePassModal().then((m) => ({ default: m.ShrinePassModal })));
const HanabiMakerModal = lazy(() => loadHanabiMakerModal().then((m) => ({ default: m.HanabiMakerModal })));
const HapticSettingsModal = lazy(() => loadHapticSettingsModal().then((m) => ({ default: m.HapticSettingsModal })));
const BackupRestoreModal = lazy(() => loadBackupRestoreModal().then((m) => ({ default: m.BackupRestoreModal })));
const OdekakeModal = lazy(() => loadOdekakeModal().then((m) => ({ default: m.OdekakeModal })));
const OdekakeReturnModal = lazy(() => loadOdekakeReturnModal().then((m) => ({ default: m.OdekakeReturnModal })));
const ZenGardenModal = lazy(() => loadZenGardenModal().then((m) => ({ default: m.ZenGardenModal })));
const SanctuaryMenuModal = lazy(() => loadSanctuaryMenuModal().then((m) => ({ default: m.SanctuaryMenuModal })));
const ParallaxSettingsModal = lazy(() => loadParallaxSettingsModal().then((m) => ({ default: m.ParallaxSettingsModal })));

/** Semua loader modal — untuk prefetch saat idle agar open pertama tanpa jeda. */
const MODAL_CHUNK_LOADERS = [
  loadBentoFoodModal, loadOnsenBathModal, loadFutonBedroomModal, loadTanukiShopModal,
  loadShrineModal, loadMatsuriGamesModal, loadHankoAlbumModal, loadWardrobeModal,
  loadSanctuaryDecorModal, loadMemoryScrollModal, loadShrinePassModal, loadHanabiMakerModal,
  loadHapticSettingsModal, loadBackupRestoreModal, loadOdekakeModal, loadOdekakeReturnModal,
  loadZenGardenModal, loadSanctuaryMenuModal, loadParallaxSettingsModal,
];

/** Fallback Suspense saat chunk modal sedang diunduh (jarang terlihat karena prefetch idle). */
function ModalChunkFallback() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0906]/70"
      role="status"
      aria-label="Memuat layar santuari..."
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border-2 border-amber-600/70 flex items-center justify-center text-2xl animate-pulse">
        ⛩️
      </div>
    </div>
  );
}

interface CompletedTrip {
  destinationName: string;
  destinationKanji: string;
  reward: OdekakeReward;
}

interface ModalLayerProps {
  pet: PetData;
  setPet: Dispatch<SetStateAction<PetData>>;
  activeModal: ModalKind | null;
  setActiveModal: Dispatch<SetStateAction<ModalKind | null>>;
  triggerShoji: (config: ShojiTransitionConfig) => void;
  showToast: (msg: string) => void;
  visitedShrines: string[];
  setVisitedShrines: Dispatch<SetStateAction<string[]>>;
  bondInfo: ReturnType<typeof getBondingLevelInfo>;
  season: SeasonType;
  onOpenPrologue?: () => void;
  handleCycleSeason: () => void;
  handleFeedItem: (item: FoodItem) => void;
  handleFinishBath: (expGain: number, happinessGain: number) => void;
  handleWakeUpFromBedroom: (energyGain: number, expGain: number) => void;
  handleBuyItem: (item: FoodItem) => void;
  handleOmikujiDrawn: (bonusCoins: number, bonusHap: number) => void;
  handleGameReward: (coinsEarned: number, hapGained: number) => void;
  handleHanabiSuccess: (score: number, coinsEarned: number, happinessEarned: number) => void;
  handleReceivePilgrimageBlessing: (coins: number, exp: number, giftName: string) => void;
  handleAddDiaryNote: (text: string, moodEmoji: string) => void;
  handleDeleteDiaryNote: (noteId: string) => void;
  handleRequestReset: () => void;
  handleConfirmSleep: () => void;
  handleDepartOdekake: (trip: OdekakeTrip, totalCost: number) => void;
  handleRecallEarlyOdekake: () => void;
  handleClaimOdekakeReward: () => void;
  completedTripToCelebrate: CompletedTrip | null;
  parallax: ReturnType<typeof useParallax2D>;
}

export function ModalLayer({
  pet,
  setPet,
  activeModal,
  setActiveModal,
  triggerShoji,
  showToast,
  visitedShrines,
  setVisitedShrines,
  bondInfo,
  season,
  onOpenPrologue,
  handleCycleSeason,
  handleFeedItem,
  handleFinishBath,
  handleWakeUpFromBedroom,
  handleBuyItem,
  handleOmikujiDrawn,
  handleGameReward,
  handleHanabiSuccess,
  handleReceivePilgrimageBlessing,
  handleAddDiaryNote,
  handleDeleteDiaryNote,
  handleRequestReset,
  handleConfirmSleep,
  handleDepartOdekake,
  handleRecallEarlyOdekake,
  handleClaimOdekakeReward,
  completedTripToCelebrate,
  parallax,
}: ModalLayerProps) {
  // Gating mount-on-first-open: modal lazy hanya di-mount setelah pertama kali
  // dibuka (lalu tetap ter-mount — perilaku identik dengan implementasi lama).
  // Tanpa ini, React.lazy yang dirender terus-menerus (pattern isOpen) akan
  // mem-fetch seluruh 19 chunk sekaligus saat mount dan membuang manfaat split.
  const [everOpenedModal, setEverOpenedModal] = useState<Set<ModalKind>>(
    () => new Set(activeModal ? [activeModal] : [])
  );

  useEffect(() => {
    if (activeModal && !everOpenedModal.has(activeModal)) {
      setEverOpenedModal((prev) => {
        const next = new Set(prev);
        next.add(activeModal);
        return next;
      });
    }
  }, [activeModal, everOpenedModal]);

  // Prefetch semua chunk modal saat idle (setelah interaksi pertama tenang),
  // sehingga open pertama tiap modal biasanya sudah tanpa jeda unduhan.
  useEffect(() => {
    const prefetchAll = () => {
      MODAL_CHUNK_LOADERS.forEach((load) => {
        void load().catch(() => {
          /* prefetch gagal diabaikan — chunk tetap dimuat saat modal dibuka */
        });
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(prefetchAll, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(prefetchAll, 3000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <DialogA11yWrapper
      isActive={activeModal !== null}
      onClose={() => setActiveModal(null)}
      label={activeModal ? MODAL_LABELS[activeModal] : 'Dialog Santuari'}
    >
      {everOpenedModal.has('bento') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <BentoFoodModal
            isOpen={activeModal === 'bento'}
            onClose={() => setActiveModal(null)}
            inventory={pet.inventory}
            onFeedItem={handleFeedItem}
            onOpenShop={() => setActiveModal('shop')}
            hunger={pet.stats.hunger}
            happiness={pet.stats.happiness}
            petName={pet.name}
            coins={pet.coins}
            pet={pet}
            onFinishDining={() => {
              setActiveModal(null);
              soundEngine.playChime();
              hapticEngine.heavy();
              showToast(`🙏 Gochisousama! ${pet.name} kenyang dan puas bersantap di Meja Bento!`);
            }}
          />
        </Suspense>
      )}

      {/* Onsen Bath Sanctuary Scene */}
      {everOpenedModal.has('bath') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <OnsenBathModal
            isOpen={activeModal === 'bath'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onFinishBath={handleFinishBath}
          />
        </Suspense>
      )}

      {/* Futon Bedroom Sanctuary Scene */}
      {everOpenedModal.has('bedroom') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <FutonBedroomModal
            isOpen={activeModal === 'bedroom'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onWakeUp={handleWakeUpFromBedroom}
            onOpenShop={() => setActiveModal('shop')}
          />
        </Suspense>
      )}

      {everOpenedModal.has('shop') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <TanukiShopModal
            isOpen={activeModal === 'shop'}
            onClose={() => setActiveModal(null)}
            coins={pet.coins}
            inventory={pet.inventory}
            onBuyItem={handleBuyItem}
            onOpenWardrobe={() => setActiveModal('wardrobe')}
          />
        </Suspense>
      )}

      {everOpenedModal.has('shrine') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <ShrineModal
            isOpen={activeModal === 'shrine'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            setPet={setPet}
            showToast={showToast}
            onOmikujiDrawn={handleOmikujiDrawn}
          />
        </Suspense>
      )}

      {everOpenedModal.has('matsuri') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <MatsuriGamesModal
            isOpen={activeModal === 'matsuri'}
            onClose={() => setActiveModal(null)}
            onReward={handleGameReward}
          />
        </Suspense>
      )}

      {everOpenedModal.has('hanko') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <HankoAlbumModal
            isOpen={activeModal === 'hanko'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onResetPet={handleRequestReset}
          />
        </Suspense>
      )}

      {everOpenedModal.has('wardrobe') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <WardrobeModal
            isOpen={activeModal === 'wardrobe'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            setPet={setPet}
            showToast={showToast}
          />
        </Suspense>
      )}

      {everOpenedModal.has('decor') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <SanctuaryDecorModal
            isOpen={activeModal === 'decor'}
            onClose={() => setActiveModal(null)}
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
        </Suspense>
      )}

      {/* Buku Harian Roh (Memory Scroll & Ukiyo-e Album) Modal */}
      {everOpenedModal.has('memoryScroll') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <MemoryScrollModal
            isOpen={activeModal === 'memoryScroll'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onAddDiaryNote={handleAddDiaryNote}
            onDeleteDiaryNote={handleDeleteDiaryNote}
          />
        </Suspense>
      )}

      {/* Paspor Kuil & Pertukaran Ziarah (Shrine Pass) Modal */}
      {everOpenedModal.has('shrinePass') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <ShrinePassModal
            isOpen={activeModal === 'shrinePass'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            visitedShrines={visitedShrines}
            setVisitedShrines={setVisitedShrines}
            onReceivePilgrimageBlessing={handleReceivePilgrimageBlessing}
          />
        </Suspense>
      )}

      {/* Pengrajin Kembang Api Tradisional (Hanabi Maker) Mini-Game Modal */}
      {everOpenedModal.has('hanabi') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <HanabiMakerModal
            isOpen={activeModal === 'hanabi'}
            onClose={() => setActiveModal(null)}
            onLaunchSuccess={handleHanabiSuccess}
          />
        </Suspense>
      )}

      {/* Pengaturan Umpan Balik Taktil (Haptic Feedback) Modal */}
      {everOpenedModal.has('haptic') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <HapticSettingsModal
            isOpen={activeModal === 'haptic'}
            onClose={() => setActiveModal(null)}
          />
        </Suspense>
      )}

      {/* Menu Fitur Santuari Tradisional Modal */}
      {everOpenedModal.has('sanctuaryMenu') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <SanctuaryMenuModal
            isOpen={activeModal === 'sanctuaryMenu'}
            onClose={() => setActiveModal(null)}
            onOpenPrologue={onOpenPrologue}
            onOpenHanko={() => {
              triggerShoji({
                label: 'Kitab Segel Hanko',
                kanji: '📜 印',
                sublabel: 'Arsip Silsilah Roh Kitsune',
                onMidpoint: () => setActiveModal('hanko'),
              });
            }}
            onOpenMemoryScroll={() => {
              triggerShoji({
                label: 'Gulungan Memori Emakimono',
                kanji: '📖 記',
                sublabel: 'Album Ukiyo-e & Catatan Kenangan',
                onMidpoint: () => setActiveModal('memoryScroll'),
              });
            }}
            onOpenShrinePass={() => {
              triggerShoji({
                label: 'Paspor Ziarah Inari',
                kanji: '⛩️ 通',
                sublabel: 'Ziarah Kuil Teman & Tukar Berkah',
                onMidpoint: () => setActiveModal('shrinePass'),
              });
            }}
            onOpenHanabi={() => {
              triggerShoji({
                label: 'Pesta Kembang Api Hanabi',
                kanji: '🎆 火',
                sublabel: 'Hanabi Taikai • Langit Festival',
                onMidpoint: () => setActiveModal('hanabi'),
              });
            }}
            onOpenDecor={() => {
              triggerShoji({
                label: 'Renovasi Sanctuary Tatami',
                kanji: '🏡 館',
                sublabel: 'Tatami, Altar & Kakemono',
                onMidpoint: () => setActiveModal('decor'),
              });
            }}
            onOpenHaptic={() => {
              setActiveModal('haptic');
            }}
            onOpenParallax={() => {
              setActiveModal('parallax');
            }}
            onOpenWardrobe={() => {
              triggerShoji({
                label: 'Lemari Busana Miyabi',
                kanji: '👘 衣',
                sublabel: 'Kimono & Aksesoris Roh Kitsune',
                onMidpoint: () => setActiveModal('wardrobe'),
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
                onMidpoint: () => setActiveModal('shop'),
              });
            }}
            onOpenShrine={() => {
              triggerShoji({
                label: 'Kuil Inari Okami',
                kanji: '⛩️ 縁',
                sublabel: `Ikatan Batin Lv.${bondInfo.level} • ${bondInfo.currentMilestone.title}`,
                onMidpoint: () => setActiveModal('shrine'),
              });
            }}
            onOpenBackupRestore={() => {
              setActiveModal('backupRestore');
            }}
            onOpenOdekake={() => {
              setActiveModal('odekake');
            }}
            onOpenZenGarden={() => {
              setActiveModal('zenGarden');
            }}
            onCycleSeason={handleCycleSeason}
            currentSeason={season}
          />
        </Suspense>
      )}

      {/* Petualangan Berkelana Roh (O-dekake / Tabi) Modal */}
      {everOpenedModal.has('odekake') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <OdekakeModal
            isOpen={activeModal === 'odekake'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onDepart={handleDepartOdekake}
            onRecallEarly={handleRecallEarlyOdekake}
            showToast={showToast}
          />
        </Suspense>
      )}

      {/* Sambutan Kepulangan Berkelana (Odekake Return) Modal */}
      {completedTripToCelebrate && (
        <Suspense fallback={<ModalChunkFallback />}>
          <OdekakeReturnModal
            isOpen={true}
            onClose={handleClaimOdekakeReward}
            petName={pet.name}
            destinationName={completedTripToCelebrate.destinationName}
            destinationKanji={completedTripToCelebrate.destinationKanji}
            reward={completedTripToCelebrate.reward}
            onClaim={handleClaimOdekakeReward}
          />
        </Suspense>
      )}

      {/* Taman Zen & Kolam Ikan Koi (Engawa Karesansui) Modal */}
      {everOpenedModal.has('zenGarden') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <ZenGardenModal
            isOpen={activeModal === 'zenGarden'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            setPet={setPet}
            showToast={showToast}
          />
        </Suspense>
      )}

      {/* Cadangan & Pemulihan Santuari (Backup & Restore) Modal */}
      {everOpenedModal.has('backupRestore') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <BackupRestoreModal
            isOpen={activeModal === 'backupRestore'}
            onClose={() => setActiveModal(null)}
            pet={pet}
            onRestore={(restoredPet) => {
              setPet(restoredPet);
              showToast(`⛩️ Segel Santuari Berhasil Dipulihkan: ${restoredPet.name}!`);
            }}
            showToast={showToast}
          />
        </Suspense>
      )}

      {/* Sensasi Kedalaman Parallax 2.5D Settings Modal */}
      {everOpenedModal.has('parallax') && (
        <Suspense fallback={<ModalChunkFallback />}>
          <ParallaxSettingsModal
            isOpen={activeModal === 'parallax'}
            onClose={() => setActiveModal(null)}
            mode={parallax.mode}
            onSetMode={parallax.setMode}
            x={parallax.x}
            y={parallax.y}
            hasGyroscope={parallax.hasGyroscope}
            isGyroActive={parallax.isGyroActive}
            onRequestGyroPermission={parallax.requestGyroPermission}
          />
        </Suspense>
      )}

      {/* DIALOG KONFIRMASI TIDUR 15 MENIT */}
      {activeModal === 'sleepConfirm' && (
        <SleepConfirmDialog
          petName={pet.name}
          onConfirm={handleConfirmSleep}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </DialogA11yWrapper>
  );
}
