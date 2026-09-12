import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { TatamiRoom } from './components/TatamiRoom';
import { EvolutionTarget, determineNextEvolution } from './data/gameConfig';
import { PetData } from './types/game';
import { DialogA11yWrapper } from './hooks/useDialogA11y';
import { applyStoredTextScale } from './utils/textScale';

// CODE SPLITTING (Revisi 4 bug #4): layar berat yang kondisional di-lazy-load
// agar tidak ikut dalam bundle utama (pemain lama tidak pernah memuat Prolog/
// Altar Telur; EvolutionModal & OfflineReturnModal hanya saat momennya tiba).
const EggAltarModal = lazy(() =>
  import('./components/EggAltarModal').then((m) => ({ default: m.EggAltarModal }))
);
const EvolutionModal = lazy(() =>
  import('./components/EvolutionModal').then((m) => ({ default: m.EvolutionModal }))
);
const OfflineReturnModal = lazy(() =>
  import('./components/OfflineReturnModal').then((m) => ({ default: m.OfflineReturnModal }))
);
const ToriiPrologueGateway = lazy(() =>
  import('./components/ToriiPrologueGateway').then((m) => ({ default: m.ToriiPrologueGateway }))
);

/** Layar boot santuari — dipakai saat load save & sebagai fallback Suspense. */
function SanctuaryBootFallback() {
  return (
    <div className="min-h-screen bg-[#1c1815] flex flex-col items-center justify-center text-amber-200 font-['Shippori_Mincho',serif]">
      <div className="w-16 h-16 rounded-3xl bg-amber-950/80 border-2 border-amber-600/70 flex items-center justify-center text-3xl animate-spin mb-3">
        ⛩️
      </div>
      <p className="text-sm tracking-widest uppercase font-bold text-amber-300">
        Membuka Gerbang Kuil HAGUMI...
      </p>
    </div>
  );
}

export default function App() {
  const {
    pet,
    setPet,
    isLoaded,
    resetPet,
    offlineAwayMinutes,
    offlineCoins,
    closeOfflineModal,
  } = useGameLoop();

  const [activeEvolution, setActiveEvolution] = useState<EvolutionTarget | null>(null);

  // A11y: terapkan preferensi "Teks Besar" tersimpan saat aplikasi boot.
  useEffect(() => {
    applyStoredTextScale();
  }, []);

  // Buffer hadiah Prolog yang diklaim SEBELUM pet ada (pemain baru belum menetas).
  // Tanpa buffer ini, setPet((prev) => prev) adalah no-op saat pet masih null,
  // sehingga bonus koin Omamori & careScore Ema lenyap diam-diam bagi pemain baru.
  const [pendingPrologueRewards, setPendingPrologueRewards] = useState<{
    coins: number;
    careScore: number;
  }>({ coins: 0, careScore: 0 });
  
  // Interactive Torii Prologue Gateway state
  const [isPrologueOpen, setIsPrologueOpen] = useState<boolean>(() => {
    const skipAuto = localStorage.getItem('hagumi_skip_prologue_auto');
    return skipAuto !== 'true';
  });

  // Check evolution milestone directly in App
  useEffect(() => {
    if (!pet || pet.stage === 'egg' || activeEvolution) return;

    const nextEvo = determineNextEvolution(
      pet.stage,
      pet.level,
      pet.ageDays,
      pet.careScore,
      pet.stats.discipline
    );
    if (nextEvo) {
      setActiveEvolution(nextEvo);
    }
  }, [pet?.stage, pet?.level, pet?.ageDays, pet?.careScore, pet?.stats.discipline, activeEvolution]);

  // Handle claiming Omamori blessing reward from Prologue
  // Reward masuk buffer dulu; flushing ke pet dilakukan oleh useEffect di bawah
  // (langsung jika pet sudah ada, atau setelah penetasan telur untuk pemain baru).
  const handleClaimBlessingReward = (bonusCoins: number) => {
    setPendingPrologueRewards((prev) => ({
      ...prev,
      coins: prev.coins + bonusCoins,
    }));
  };

  // Handle saving Ema prayer
  const handleSaveEmaPrayer = (_prayer: string) => {
    setPendingPrologueRewards((prev) => ({
      ...prev,
      careScore: Math.min(100, prev.careScore + 5),
    }));
  };

  // Flush buffer hadiah Prolog ke pet segera setelah pet tersedia.
  // Dijalankan ulang secara reaktif: saat pemain baru menetas telur (pet berubah
  // dari null menjadi PetData), seluruh reward yang diklaim di Prolog diterapkan.
  useEffect(() => {
    if (!pet) return;
    if (pendingPrologueRewards.coins === 0 && pendingPrologueRewards.careScore === 0) return;

    setPet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        coins: prev.coins + pendingPrologueRewards.coins,
        careScore: Math.min(100, prev.careScore + pendingPrologueRewards.careScore),
      };
    });
    setPendingPrologueRewards({ coins: 0, careScore: 0 });
  }, [pet, pendingPrologueRewards]);

  // Still loading saved data from localStorage
  if (!isLoaded) {
    return <SanctuaryBootFallback />;
  }

  // If initial visitor and has not passed prologue yet, show Prologue Gateway before hatching
  if ((!pet || pet.stage === 'egg') && isPrologueOpen) {
    return (
      <div className="min-h-screen bg-[#0e0906] text-stone-100 flex flex-col justify-center">
        <DialogA11yWrapper isActive={true} label="Gerbang Prolog Torii">
          <Suspense fallback={<SanctuaryBootFallback />}>
            <ToriiPrologueGateway
              isOpen={true}
              onEnterSanctuary={() => setIsPrologueOpen(false)}
              onClaimBlessingReward={handleClaimBlessingReward}
              onSaveEmaPrayer={handleSaveEmaPrayer}
            />
          </Suspense>
        </DialogA11yWrapper>
      </div>
    );
  }

  // If no pet exists yet or still an egg, show the Inari Egg Hatching Altar
  if (!pet || pet.stage === 'egg') {
    return (
      <div className="min-h-screen bg-[#181411] text-stone-100 flex flex-col justify-center">
        <DialogA11yWrapper isActive={true} label="Altar Penetasan Telur Inari">
          <Suspense fallback={<SanctuaryBootFallback />}>
            <EggAltarModal
              onHatchComplete={(newPet: PetData) => {
                setPet(newPet);
              }}
            />
          </Suspense>
        </DialogA11yWrapper>
      </div>
    );
  }

  // Handle evolution confirmation
  const handleConfirmEvolution = () => {
    if (!activeEvolution || !pet) return;

    setPet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stage: activeEvolution.stage,
        form: activeEvolution.form,
        tailCount: activeEvolution.tailCount,
        stats: {
          ...prev.stats,
          health: 100,
          happiness: 100,
          energy: 100,
        },
        careScore: Math.min(100, prev.careScore + 10),
      };
    });

    setActiveEvolution(null);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#1c1815] text-stone-100 flex flex-col font-['Zen_Maru_Gothic',sans-serif]">
      {/* Main Tatami Sanctuary View */}
      <TatamiRoom
        pet={pet}
        setPet={setPet as React.Dispatch<React.SetStateAction<PetData>>}
        onResetPet={resetPet}
        onOpenPrologue={() => setIsPrologueOpen(true)}
      />

      {/* Torii Prologue Gateway Overlay */}
      {isPrologueOpen && (
        <DialogA11yWrapper isActive={isPrologueOpen} label="Gerbang Prolog Torii">
          <Suspense fallback={null}>
            <ToriiPrologueGateway
              isOpen={isPrologueOpen}
              onEnterSanctuary={() => setIsPrologueOpen(false)}
              onClose={() => setIsPrologueOpen(false)}
              onClaimBlessingReward={handleClaimBlessingReward}
              onSaveEmaPrayer={handleSaveEmaPrayer}
            />
          </Suspense>
        </DialogA11yWrapper>
      )}

      {/* Evolution Ceremony Modal */}
      {activeEvolution && (
        <DialogA11yWrapper isActive={true} label="Upacara Evolusi Kitsune">
          <Suspense fallback={null}>
            <EvolutionModal
              isOpen={Boolean(activeEvolution)}
              evolutionTarget={activeEvolution}
              pet={pet}
              onConfirmEvolution={handleConfirmEvolution}
            />
          </Suspense>
        </DialogA11yWrapper>
      )}

      {/* Offline Return Progress Modal */}
      {offlineAwayMinutes !== null && offlineAwayMinutes >= 3 && (
        <DialogA11yWrapper
          isActive={true}
          onClose={closeOfflineModal}
          label="Ringkasan Kepulangan Offline"
        >
          <Suspense fallback={null}>
            <OfflineReturnModal
              isOpen={true}
              onClose={closeOfflineModal}
              minutesAway={offlineAwayMinutes}
              petName={pet.name}
              bonusCoins={offlineCoins}
            />
          </Suspense>
        </DialogA11yWrapper>
      )}
    </div>
  );
}
