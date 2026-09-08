/**
 * src/components/tatami/ModalLayer.tsx
 * Layer seluruh modal & ruangan fullscreen Santuari (19 modal) + wrapper
 * role="dialog" (focus trap / Esc / restorasi fokus).
 * Diekstrak dari TatamiRoom.tsx (langkah 3 refactor God component):
 * TatamiRoom cukup merender <ModalLayer {...deps} />.
 */

import type { Dispatch, SetStateAction } from 'react';
import { PetData, FoodItem, SeasonType, OdekakeTrip, OdekakeReward } from '../../types/game';
import { ModalKind, MODAL_LABELS } from './modalRegistry';
import { DialogA11yWrapper } from '../../hooks/useDialogA11y';
import { getBondingLevelInfo, DEFAULT_SANCTUARY_DECOR, DEFAULT_UNLOCKED_DECOR } from '../../data/gameConfig';
import { useParallax2D } from '../../utils/useParallax2D';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';
import { BentoFoodModal } from '../BentoFoodModal';
import { OnsenBathModal } from '../OnsenBathModal';
import { FutonBedroomModal } from '../FutonBedroomModal';
import { TanukiShopModal } from '../TanukiShopModal';
import { ShrineModal } from '../ShrineModal';
import { MatsuriGamesModal } from '../MatsuriGamesModal';
import { HankoAlbumModal } from '../HankoAlbumModal';
import { WardrobeModal } from '../WardrobeModal';
import { SanctuaryDecorModal } from '../SanctuaryDecorModal';
import { MemoryScrollModal } from '../MemoryScrollModal';
import { ShrinePassModal } from '../ShrinePassModal';
import { HanabiMakerModal } from '../HanabiMakerModal';
import { HapticSettingsModal } from '../HapticSettingsModal';
import { BackupRestoreModal } from '../BackupRestoreModal';
import { OdekakeModal } from '../OdekakeModal';
import { OdekakeReturnModal } from '../OdekakeReturnModal';
import { ZenGardenModal } from '../ZenGardenModal';
import { SanctuaryMenuModal } from '../SanctuaryMenuModal';
import { ParallaxSettingsModal } from '../ParallaxSettingsModal';
import type { ShojiTransitionConfig } from '../ShojiTransition';
import { SleepConfirmDialog } from './SleepConfirmDialog';

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
  return (
    <DialogA11yWrapper
      isActive={activeModal !== null}
      onClose={() => setActiveModal(null)}
      label={activeModal ? MODAL_LABELS[activeModal] : 'Dialog Santuari'}
    >
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

      {/* Onsen Bath Sanctuary Scene */}
      <OnsenBathModal
        isOpen={activeModal === 'bath'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        onFinishBath={handleFinishBath}
      />

      {/* Futon Bedroom Sanctuary Scene */}
      <FutonBedroomModal
        isOpen={activeModal === 'bedroom'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        onWakeUp={handleWakeUpFromBedroom}
        onOpenShop={() => setActiveModal('shop')}
      />

      <TanukiShopModal
        isOpen={activeModal === 'shop'}
        onClose={() => setActiveModal(null)}
        coins={pet.coins}
        inventory={pet.inventory}
        onBuyItem={handleBuyItem}
        onOpenWardrobe={() => setActiveModal('wardrobe')}
      />

      <ShrineModal
        isOpen={activeModal === 'shrine'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        setPet={setPet}
        showToast={showToast}
        onOmikujiDrawn={handleOmikujiDrawn}
      />

      <MatsuriGamesModal
        isOpen={activeModal === 'matsuri'}
        onClose={() => setActiveModal(null)}
        onReward={handleGameReward}
      />

      <HankoAlbumModal
        isOpen={activeModal === 'hanko'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        onResetPet={handleRequestReset}
      />

      <WardrobeModal
        isOpen={activeModal === 'wardrobe'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        setPet={setPet}
        showToast={showToast}
      />

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

      {/* Buku Harian Roh (Memory Scroll & Ukiyo-e Album) Modal */}
      <MemoryScrollModal
        isOpen={activeModal === 'memoryScroll'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        onAddDiaryNote={handleAddDiaryNote}
        onDeleteDiaryNote={handleDeleteDiaryNote}
      />

      {/* Paspor Kuil & Pertukaran Ziarah (Shrine Pass) Modal */}
      <ShrinePassModal
        isOpen={activeModal === 'shrinePass'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        visitedShrines={visitedShrines}
        setVisitedShrines={setVisitedShrines}
        onReceivePilgrimageBlessing={handleReceivePilgrimageBlessing}
      />

      {/* Pengrajin Kembang Api Tradisional (Hanabi Maker) Mini-Game Modal */}
      <HanabiMakerModal
        isOpen={activeModal === 'hanabi'}
        onClose={() => setActiveModal(null)}
        onLaunchSuccess={handleHanabiSuccess}
      />

      {/* Pengaturan Umpan Balik Taktil (Haptic Feedback) Modal */}
      <HapticSettingsModal
        isOpen={activeModal === 'haptic'}
        onClose={() => setActiveModal(null)}
      />

      {/* Menu Fitur Santuari Tradisional Modal */}
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

      {/* Petualangan Berkelana Roh (O-dekake / Tabi) Modal */}
      <OdekakeModal
        isOpen={activeModal === 'odekake'}
        onClose={() => setActiveModal(null)}
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

      {/* Taman Zen & Kolam Ikan Koi (Engawa Karesansui) Modal */}
      <ZenGardenModal
        isOpen={activeModal === 'zenGarden'}
        onClose={() => setActiveModal(null)}
        pet={pet}
        setPet={setPet}
        showToast={showToast}
      />

      {/* Cadangan & Pemulihan Santuari (Backup & Restore) Modal */}
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

      {/* Sensasi Kedalaman Parallax 2.5D Settings Modal */}
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
