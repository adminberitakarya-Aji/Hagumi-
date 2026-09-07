import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  MapPin,
  Clock,
  Coins,
  Sparkles,
  Heart,
  ChevronRight,
  Shield,
  Gift,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PetData, OdekakeDestination, OdekakeTrip, OdekakeReward } from '../types/game';
import {
  ODEKAKE_DESTINATIONS,
  TABI_BENTO_OPTIONS,
  TABI_OMAMORI_OPTIONS,
  TABI_GEAR_OPTIONS,
  TabiBentoOption,
  TabiOmamoriOption,
  TabiGearOption,
  calculateOdekakeReward,
} from '../data/odekakeConfig';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface OdekakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onDepart: (trip: OdekakeTrip, totalCost: number) => void;
  onRecallEarly: () => void;
  showToast: (msg: string) => void;
}

export const OdekakeModal: React.FC<OdekakeModalProps> = ({
  isOpen,
  onClose,
  pet,
  onDepart,
  onRecallEarly,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'destinations' | 'active' | 'album'>(() =>
    pet.activeOdekake ? 'active' : 'destinations'
  );

  const [selectedDestId, setSelectedDestId] = useState<string>(
    ODEKAKE_DESTINATIONS[0].id
  );
  const [selectedBentoId, setSelectedBentoId] = useState<string>(
    TABI_BENTO_OPTIONS[0].id
  );
  const [selectedOmamoriId, setSelectedOmamoriId] = useState<string>(
    TABI_OMAMORI_OPTIONS[0].id
  );
  const [selectedGearId, setSelectedGearId] = useState<string>(
    TABI_GEAR_OPTIONS[0].id
  );

  // Mode durasi: Waktu Nyata (15-120 min) vs Mode Kilat Cepat Roh (10 detik untuk kemudahan pengujian)
  const [isQuickMode, setIsQuickMode] = useState<boolean>(false);

  // Active trip remaining countdown
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    if (pet.activeOdekake) {
      setActiveTab('active');
    }
  }, [pet.activeOdekake]);

  useEffect(() => {
    if (!pet.activeOdekake) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      if (pet.activeOdekake) {
        const targetEnd = pet.activeOdekake.startedAt + pet.activeOdekake.durationMs;
        const diff = Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
        setRemainingSeconds(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pet.activeOdekake]);

  if (!isOpen) return null;

  const currentDest =
    ODEKAKE_DESTINATIONS.find((d) => d.id === selectedDestId) ||
    ODEKAKE_DESTINATIONS[0];
  const currentBento =
    TABI_BENTO_OPTIONS.find((b) => b.id === selectedBentoId) ||
    TABI_BENTO_OPTIONS[0];
  const currentOmamori =
    TABI_OMAMORI_OPTIONS.find((o) => o.id === selectedOmamoriId) ||
    TABI_OMAMORI_OPTIONS[0];
  const currentGear =
    TABI_GEAR_OPTIONS.find((g) => g.id === selectedGearId) ||
    TABI_GEAR_OPTIONS[0];

  const totalCost =
    currentBento.costCoins + currentOmamori.costCoins + currentGear.costCoins;
  const canAfford = pet.coins >= totalCost;
  const isLevelMet = pet.level >= currentDest.minLevel;

  // Calculate actual duration based on gear & mode
  const baseMinutes = isQuickMode
    ? 0.1667 // ~10 detik
    : currentDest.baseDurationMinutes * currentGear.speedMultiplier;
  const durationMs = Math.round(baseMinutes * 60 * 1000);

  const estimatedReward = calculateOdekakeReward(
    currentDest,
    currentBento,
    currentOmamori,
    currentGear,
    pet.level
  );

  const formatCountdown = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartDepart = () => {
    if (pet.isSleeping) {
      showToast('💤 Kitsune sedang tidur lelap. Bangunkan terlebih dahulu sebelum berangkat!');
      return;
    }
    if (!isLevelMet) {
      showToast(`🔒 Butuh Level ${currentDest.minLevel} untuk menuju ${currentDest.name}!`);
      return;
    }
    if (!canAfford) {
      showToast(`💰 Koin Ryo tidak mencukupi (Butuh ${totalCost} Ryo)!`);
      return;
    }

    const newTrip: OdekakeTrip = {
      id: `trip_${Date.now()}`,
      destinationId: currentDest.id,
      destinationName: currentDest.name,
      destinationKanji: currentDest.kanji,
      destinationRegion: currentDest.region,
      startedAt: Date.now(),
      durationMs: durationMs,
      bentoName: currentBento.name,
      bentoEmoji: currentBento.emoji,
      omamoriName: currentOmamori.name,
      omamoriEmoji: currentOmamori.emoji,
      gearName: currentGear.name,
      gearEmoji: currentGear.emoji,
      isQuickMode: isQuickMode,
      reward: estimatedReward,
    };

    soundEngine.playOdekakeDepart();
    hapticEngine.heavy();
    onDepart(newTrip, totalCost);
    setActiveTab('active');
    showToast(`🎒 Itte-rasshai! ${pet.name} mulai berkelana ke ${currentDest.name}!`);
  };

  // Progress percentage of active trip
  let tripProgressPct = 0;
  if (pet.activeOdekake && pet.activeOdekake.durationMs > 0) {
    const elapsed = Date.now() - pet.activeOdekake.startedAt;
    tripProgressPct = Math.min(
      100,
      Math.max(0, Math.round((elapsed / pet.activeOdekake.durationMs) * 100))
    );
  }

  const unlockedPostcards = pet.unlockedPostcards || [];
  const unlockedSeeds = pet.unlockedSeeds || [];
  const completedTripsCount = pet.completedOdekakes || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative max-w-2xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-[#1a130e]/95 border-2 border-amber-600/70 shadow-2xl overflow-hidden text-stone-100 font-['Shippori_Mincho',serif]"
      >
        {/* Header Tradisional */}
        <div className="relative px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#2c1a11] via-[#3a2216] to-[#20130c] border-b border-amber-700/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-950 border border-amber-400/80 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-200 tracking-wide">
                  Petualangan Berkelana Roh
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-amber-900/80 border border-amber-500/60 text-[10px] text-amber-300 font-bold">
                  お出かけ • 旅
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                Kitsune menjelajahi kuil suci & pegunungan untuk mencari oleh-oleh langka
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-amber-600/50 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="grid grid-cols-3 bg-[#140e0a] border-b border-amber-800/40 p-1 gap-1 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('destinations');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'destinations'
                ? 'bg-amber-700/80 text-amber-100 shadow-md border border-amber-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>⛩️</span>
            <span>Destinasi & Bekal</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('active');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              activeTab === 'active'
                ? 'bg-amber-700/80 text-amber-100 shadow-md border border-amber-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>🧭</span>
            <span>Perjalanan Aktif</span>
            {pet.activeOdekake && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1.5 right-2" />
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('album');
            }}
            className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'album'
                ? 'bg-amber-700/80 text-amber-100 shadow-md border border-amber-400/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>🎴</span>
            <span>Album Kartu Pos ({unlockedPostcards.length}/6)</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 text-xs">
          {/* TAB 1: DESTINASI & BEKAL PERJALANAN */}
          {activeTab === 'destinations' && (
            <div className="space-y-4">
              {pet.activeOdekake && (
                <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/70 flex items-center justify-between gap-3 text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl animate-bounce">🚶‍♂️</span>
                    <div>
                      <p className="font-bold">
                        {pet.name} sedang berada di perjalanan menuju{' '}
                        {pet.activeOdekake.destinationName}!
                      </p>
                      <p className="text-[10px] text-amber-300/80">
                        Tersisa {formatCountdown(remainingSeconds)} sebelum kembali ke santuari.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('active')}
                    className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] shadow cursor-pointer whitespace-nowrap"
                  >
                    Lihat Perjalanan
                  </button>
                </div>
              )}

              {/* 1. Pemilihan 6 Lokasi Sakral */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <span>⛩️</span> 1. Pilih Lokasi Suci Tujuan
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Kekuatan spiritual & oleh-oleh berbeda per lokasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ODEKAKE_DESTINATIONS.map((dest) => {
                    const isSelected = dest.id === selectedDestId;
                    const isLocked = pet.level < dest.minLevel;

                    return (
                      <button
                        key={dest.id}
                        disabled={isLocked}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedDestId(dest.id);
                        }}
                        className={`p-3 rounded-2xl text-left transition-all relative overflow-hidden border cursor-pointer ${
                          isLocked
                            ? 'bg-stone-900/40 border-stone-800 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-gradient-to-br from-amber-950/90 via-[#2d1b12] to-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400/40'
                            : 'bg-[#221711]/70 hover:bg-[#2c1e17] border-amber-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-amber-200 text-sm">
                                {dest.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-amber-400/80 font-mono">
                              {dest.kanji} • {dest.region}
                            </p>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-[9px] font-bold text-amber-300 whitespace-nowrap">
                            {dest.badge}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[11px] text-stone-300 leading-snug line-clamp-2">
                          {dest.description}
                        </p>

                        <div className="mt-2 pt-2 border-t border-amber-900/40 flex items-center justify-between text-[10px] text-stone-400">
                          <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                            <Clock className="w-3 h-3" />
                            {dest.baseDurationMinutes} Menit
                          </span>
                          <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                            <MapPin className="w-3 h-3" />
                            {dest.distanceKm} km
                          </span>
                          {isLocked && (
                            <span className="text-rose-400 font-bold">
                              Syarat Lv.{dest.minLevel}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Perlengkapan Tas Berkelana (Bento, Omamori, Alat) */}
              <div className="space-y-3 pt-1">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>🎒</span> 2. Masukkan Bekal & Perlengkapan ke Tas
                </span>

                {/* Bento Makanan */}
                <div className="p-3 rounded-2xl bg-[#221711]/80 border border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-200 flex items-center gap-1">
                      <span>🍙</span> Bekal Bento Perjalanan:
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Memberi stamina & bonus keberuntungan
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TABI_BENTO_OPTIONS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedBentoId(b.id);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedBentoId === b.id
                            ? 'bg-amber-900/70 border-amber-400 text-amber-100 shadow'
                            : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-lg">{b.emoji}</div>
                        <div className="font-bold text-[10px] truncate">{b.name}</div>
                        <div className="text-[9px] text-amber-400 font-mono">
                          {b.costCoins === 0 ? 'Gratis' : `${b.costCoins} Ryo`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jimat Omamori */}
                <div className="p-3 rounded-2xl bg-[#221711]/80 border border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-200 flex items-center gap-1">
                      <span>⛩️</span> Jimat Perlindungan (Omamori):
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Perlindungan spiritual & berkah khusus
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TABI_OMAMORI_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedOmamoriId(o.id);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedOmamoriId === o.id
                            ? 'bg-amber-900/70 border-amber-400 text-amber-100 shadow'
                            : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-lg">{o.emoji}</div>
                        <div className="font-bold text-[10px] truncate">{o.name}</div>
                        <div className="text-[9px] text-amber-400 font-mono">
                          {o.costCoins} Ryo
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alat Perlengkapan (Gear) */}
                <div className="p-3 rounded-2xl bg-[#221711]/80 border border-amber-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-200 flex items-center gap-1">
                      <span>☂️</span> Perlengkapan Perjalanan (Tabi Gear):
                    </span>
                    <span className="text-[10px] text-amber-400">
                      Mempercepat durasi & keamanan jalan
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TABI_GEAR_OPTIONS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedGearId(g.id);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedGearId === g.id
                            ? 'bg-amber-900/70 border-amber-400 text-amber-100 shadow'
                            : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-lg">{g.emoji}</div>
                        <div className="font-bold text-[10px] truncate">{g.name}</div>
                        <div className="text-[9px] text-amber-400 font-mono">
                          {g.costCoins === 0 ? 'Bawaan' : `${g.costCoins} Ryo`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Pilihan Mode Waktu: Realistis vs Demo Kilat Cepat Roh */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-stone-900 border border-purple-500/50 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-purple-200 flex items-center gap-1.5 text-xs">
                    <span>⚡ Mode Kecepatan Roh (Uji Cepat / Cepat Selesai):</span>
                  </div>
                  <p className="text-[10px] text-purple-300/80">
                    {isQuickMode
                      ? 'Mode Kilat Roh Aktif: Perjalanan selesai hanya dalam ~10 Detik!'
                      : 'Waktu Alami: Selesai mengikuti durasi santai (15 - 120 Menit).'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsQuickMode(!isQuickMode);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    isQuickMode
                      ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-300 shadow-lg shadow-purple-950/60'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-700'
                  }`}
                >
                  {isQuickMode ? '⚡ Kilat (10 Detik)' : '⏳ Waktu Alami'}
                </button>
              </div>

              {/* 4. Ringkasan & Tombol Berangkat */}
              <div className="p-4 rounded-2xl bg-[#2a1b13] border border-amber-600/70 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                  <span>Perkiraan Hasil Oleh-oleh:</span>
                  <span className="text-emerald-400 font-mono">
                    +{estimatedReward.coins} Ryo • +{estimatedReward.exp} EXP
                  </span>
                </div>
                <div className="text-[11px] text-stone-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span>🎴</span>
                    <span>
                      <strong>Kartu Pos Kenangan:</strong> {currentDest.postcardTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>
                      <strong>Benih Kuil:</strong> {currentDest.seed.name} ({currentDest.seed.kanji})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-800/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400">Total Biaya Bekal:</span>
                    <div className="text-sm font-bold text-amber-300 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>{totalCost} Ryo</span>
                      <span className="text-[10px] text-stone-400">
                        (Milikmu: {pet.coins} Ryo)
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={Boolean(pet.activeOdekake) || !canAfford || !isLevelMet}
                    onClick={handleStartDepart}
                    className={`px-5 py-2.5 rounded-2xl font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer ${
                      pet.activeOdekake
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : !canAfford || !isLevelMet
                        ? 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-500 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-300 shadow-amber-950/60 active:scale-95'
                    }`}
                  >
                    <span>行 🎒 Lepas Berkelana (Itte-rasshai!)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERJALANAN AKTIF (LIVE TRIP MONITOR) */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {pet.activeOdekake ? (
                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2d1b13] to-[#1a100b] border-2 border-amber-500/70 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-amber-700/80 border border-amber-400/80 flex items-center justify-center text-xl shadow">
                        🚶‍♂️
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-amber-200">
                          {pet.name} sedang di perjalanan
                        </h3>
                        <p className="text-[11px] text-amber-400/80 font-mono">
                          Tujuan: {pet.activeOdekake.destinationName} (
                          {pet.activeOdekake.destinationKanji})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400">Hitung Mundur:</span>
                      <div className="text-lg sm:text-2xl font-extrabold font-mono text-amber-300 animate-pulse">
                        ⏱️ {formatCountdown(remainingSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Jalan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-stone-300 font-semibold">
                      <span>Berangkat dari Santuari</span>
                      <span className="text-amber-400 font-bold font-mono">
                        {tripProgressPct}%
                      </span>
                      <span>Tiba di {pet.activeOdekake.destinationName}</span>
                    </div>

                    <div className="relative w-full h-3 bg-stone-900/90 rounded-full overflow-hidden border border-amber-800/80 p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 via-rose-500 to-amber-300 rounded-full transition-all duration-1000"
                        style={{ width: `${tripProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Bekal yang Dibawa */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-amber-900/60 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{pet.activeOdekake.bentoEmoji}</span>
                      <div className="min-w-0">
                        <p className="text-[9px] text-stone-400">Bekal Bento:</p>
                        <p className="font-bold text-amber-200 truncate">
                          {pet.activeOdekake.bentoName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{pet.activeOdekake.omamoriEmoji}</span>
                      <div className="min-w-0">
                        <p className="text-[9px] text-stone-400">Jimat Omamori:</p>
                        <p className="font-bold text-rose-200 truncate">
                          {pet.activeOdekake.omamoriName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{pet.activeOdekake.gearEmoji}</span>
                      <div className="min-w-0">
                        <p className="text-[9px] text-stone-400">Perlengkapan:</p>
                        <p className="font-bold text-cyan-200 truncate">
                          {pet.activeOdekake.gearName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Perjalanan Roh */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-700/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <span>📜</span>
                      <span>Bisikan Angin dari Perjalanan:</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed italic">
                      "{pet.activeOdekake.reward.postcardStory}"
                    </p>
                  </div>

                  {/* Tombol Panggil Pulang Lebih Awal */}
                  <div className="pt-2 flex items-center justify-between border-t border-amber-900/60">
                    <p className="text-[10px] text-stone-400">
                      Rindu dengan {pet.name}? Kamu bisa memanggil rohnya pulang kapan saja.
                    </p>
                    <button
                      onClick={() => {
                        soundEngine.playChime();
                        hapticEngine.medium();
                        onRecallEarly();
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-600/60 text-amber-300 font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                    >
                      Panggil Pulang Sekarang (Kitsunebi Return)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#221711]/60 border border-amber-900/60 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-950/70 border border-amber-600/50 mx-auto flex items-center justify-center text-3xl">
                    🍵
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-amber-200">
                      {pet.name} sedang bersantai di Santuari
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                      Kitsune belum memulai perjalanan berkelana. Buka tab{' '}
                      <strong>"Destinasi & Bekal"</strong> untuk menyiapkan petualangannya!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('destinations')}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Siapkan Perjalanan Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALBUM KARTU POS & HASIL PANEN BENIH KUIL */}
          {activeTab === 'album' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-950/40 p-3 rounded-2xl border border-amber-800/40">
                <div>
                  <h3 className="font-bold text-amber-200 text-xs">
                    Koleksi Album Ukiyo-e Tabi ({unlockedPostcards.length} dari 6 Terkumpul)
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    Total petualangan diselesaikan: {completedTripsCount} kali perjalanan
                  </p>
                </div>
                <div className="text-xl">🎴</div>
              </div>

              {/* Grid 6 Kartu Pos Destinasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ODEKAKE_DESTINATIONS.map((dest) => {
                  const cardId = `postcard_${dest.id}`;
                  const isCollected = unlockedPostcards.includes(cardId);

                  return (
                    <div
                      key={dest.id}
                      className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                        isCollected
                          ? 'bg-gradient-to-b from-[#2d1b13] to-[#1b110b] border-amber-500/80 shadow-lg'
                          : 'bg-stone-950/60 border-stone-800/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{isCollected ? '🎴' : '🔒'}</span>
                            <h4
                              className={`font-bold text-xs ${
                                isCollected ? 'text-amber-200' : 'text-stone-500'
                              }`}
                            >
                              {dest.postcardTitle}
                            </h4>
                          </div>
                          <p className="text-[10px] text-amber-400/80 font-mono">
                            {dest.postcardKanji} • {dest.name}
                          </p>
                        </div>

                        {isCollected && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/70 text-[9px] font-bold text-emerald-300">
                            Terkumpul
                          </span>
                        )}
                      </div>

                      {isCollected ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-stone-300 leading-relaxed italic bg-black/30 p-2.5 rounded-xl border border-amber-900/40">
                            "{dest.postcardStory}"
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 pt-1">
                            <span>🌱</span>
                            <span>
                              <strong>Benih Suci:</strong> {dest.seed.name} (
                              {dest.seed.desc})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-black/20 text-center text-[11px] text-stone-500">
                          Jelajahi <strong>{dest.name}</strong> untuk membuka lukisan kenangan Ukiyo-e ini!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
