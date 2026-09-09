import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Sparkles, BatteryCharging, BedDouble, Clock, ShoppingBag } from 'lucide-react';
import { PetData } from '../types/game';
import { KitsuneCanvas } from './KitsuneCanvas';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

import bedroomFutonDay from '../assets/images/bedroom_futon_day_1788772630602.webp';
import bedroomFutonNight from '../assets/images/bedroom_futon_night_1788772606785.webp';

interface FutonBedroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onWakeUp: (energyGain: number, expGain: number) => void;
  onOpenShop?: () => void;
}

export const FutonBedroomModal: React.FC<FutonBedroomModalProps> = ({
  isOpen,
  onClose,
  pet,
  onWakeUp,
  onOpenShop,
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');
  const [energyProgress, setEnergyProgress] = useState(pet.stats.energy);
  const [isLightsDimmed, setIsLightsDimmed] = useState(true);
  const [zzzParticles, setZzzParticles] = useState<Array<{ id: number; x: number; y: number; scale: number }>>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (pet.sleepUntilTimestamp) {
      return Math.max(0, Math.ceil((pet.sleepUntilTimestamp - Date.now()) / 1000));
    }
    return 15 * 60;
  });

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    setEnergyProgress(pet.stats.energy);
    soundEngine.playFutonRustle();
    soundEngine.playSleepLullaby();

    // 1-second countdown timer for the 15-minute sleep duration
    const countdownTimer = setInterval(() => {
      setCurrentTime(new Date());
      if (pet.sleepUntilTimestamp) {
        const diff = Math.max(0, Math.ceil((pet.sleepUntilTimestamp - Date.now()) / 1000));
        setRemainingSeconds(diff);

        // Smooth energy interpolation across the 15 minutes (900 seconds)
        const totalDuration = 15 * 60;
        const elapsed = Math.max(0, totalDuration - diff);
        const ratio = Math.min(1, elapsed / totalDuration);
        const calcEnergy = Math.min(100, Math.round(pet.stats.energy + (100 - pet.stats.energy) * ratio));
        setEnergyProgress(calcEnergy);

        if (diff === 0) {
          handleWakeUp();
        }
      }
    }, 1000);

    // Spawn rhythmic floating "Zzz" & gentle breathing sound
    const zzzInterval = setInterval(() => {
      soundEngine.playSleepBreathe();
      setZzzParticles((prev) => [
        ...prev.slice(-8),
        {
          id: Date.now() + Math.random(),
          x: 46 + (Math.random() * 12 - 6),
          y: 44,
          scale: 0.8 + Math.random() * 0.6,
        },
      ]);
    }, 2800);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(zzzInterval);
    };
  }, [isOpen, pet.sleepUntilTimestamp, pet.stats.energy]);

  if (!isOpen) return null;

  // Day & Night detection based on agreed rule: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const currentHour = currentTime.getHours();
  const naturalIsDay = currentHour >= 6 && currentHour < 18;
  const isDayVisual =
    atmosphereOverride === 'auto' ? naturalIsDay : atmosphereOverride === 'day';
  const currentBgImage = isDayVisual ? bedroomFutonDay : bedroomFutonNight;

  // Wake Up action & return to tatami room
  const handleWakeUp = () => {
    soundEngine.playEvolutionFanfare();
    hapticEngine.heavy();
    const energyGain = Math.max(25, 100 - pet.stats.energy);
    const expGain = 14;
    onWakeUp(energyGain, expGain);
    onClose();
  };

  // Pat gentle head during sleep
  const handleGentlePet = () => {
    soundEngine.playFoxChirp();
    hapticEngine.petPurr();
    setEnergyProgress((prev) => Math.min(100, prev + 4));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-2 sm:p-4 overflow-hidden animate-in fade-in select-none">
      {/* 1. FULLSCREEN BACKGROUND (Futon Bedroom Tatami Sanctuary) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Kamar Tidur Futon Tatami"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-all duration-700 ${
            isLightsDimmed ? 'filter brightness-90 saturate-[1.05]' : 'filter brightness-100 saturate-[1.1]'
          }`}
        />
        {/* Soft cozy darkness gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/20 to-stone-950/60 pointer-events-none" />
      </div>

      {/* 2. FLOATING DREAM "Zzz" & SLEEP PARTICLES */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {zzzParticles.map((zzz) => (
          <div
            key={zzz.id}
            style={{
              left: `${zzz.x}%`,
              top: `${zzz.y}%`,
              transform: `scale(${zzz.scale})`,
            }}
            className="absolute text-purple-300 font-extrabold text-xl sm:text-2xl drop-shadow-[0_2px_10px_rgba(168,85,247,0.8)] animate-out fade-out slide-out-to-top-20 duration-3000 pointer-events-none"
          >
            Zzz...
          </div>
        ))}
      </div>

      {/* 3. TOP BAR: Header, Atmosphere Toggle & Back Button */}
      <header className="relative z-30 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full px-3 py-2.5 rounded-2xl bg-stone-950/80 backdrop-blur-xl border border-amber-500/50 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700/90 to-purple-950 border border-purple-400/80 flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            🛏️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-purple-200 tracking-wide drop-shadow">
                Kamar Peraduan Futon
              </h2>
              <span className="text-[10px] text-purple-400/90 font-['Shippori_Mincho',serif] hidden xs:inline">
                寝室 (Shinshitsu)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-300">
              <span>{pet.name} tidur lelap 15 menit</span>
              <span className="text-purple-400">•</span>
              <span className="font-mono font-bold text-amber-300 flex items-center gap-1 bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-500/50">
                <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Day / Night Atmosphere Selector */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setAtmosphereOverride((prev) => {
                if (prev === 'auto') return naturalIsDay ? 'night' : 'day';
                if (prev === 'day') return 'night';
                return 'auto';
              });
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 border border-purple-500/50 text-[11px] font-bold text-purple-200 transition-all cursor-pointer shadow-sm"
            title="Ganti Suasana Waktu Kamar Tidur (Siang / Malam)"
          >
            {isDayVisual ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Siang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden xs:inline">Malam</span>
              </>
            )}
            {atmosphereOverride !== 'auto' && (
              <span className="text-[9px] text-purple-400 font-normal">●</span>
            )}
          </button>

          {/* Quick Exit to tatami room */}
          <button
            onClick={() => {
              soundEngine.playClick();
              hapticEngine.softTap();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white transition-all cursor-pointer text-xs font-semibold shadow-sm active:scale-95"
            title="Kembali ke Beranda Tatami (Biarkan Kitsune Istirahat)"
          >
            <ArrowLeft className="w-4 h-4 text-stone-400" />
            <span>Ke Beranda</span>
          </button>
        </div>
      </header>

      {/* 4. CENTER STAGE: KITSUNE SLEEPING ON FUTON */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 my-auto pointer-events-none">
        <div className="relative flex flex-col items-center justify-center">
          {/* Soft Futon Glow & Warm Sleeping Pillow Aura */}
          <div className="absolute -bottom-8 w-80 sm:w-96 h-28 rounded-full bg-indigo-900/30 border-t border-purple-400/30 blur-md pointer-events-none animate-pulse" />

          {/* Kitsune Canvas Animated Render in Sleeping State */}
          <div className="pointer-events-auto relative transform scale-110 sm:scale-125 transition-transform cursor-pointer">
            <KitsuneCanvas
              pet={{ ...pet, isSleeping: true }}
              actionState="sleeping"
              onPetClick={handleGentlePet}
            />

            {/* Cozy Warm Futon Blanket Edge Representation */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-950/85 border border-purple-400/50 text-[10px] font-bold text-purple-200 shadow-lg pointer-events-none">
              👘 Selimut Futon Hangat
            </div>
          </div>

          {/* Cozy Sleeping Status Tag */}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-stone-950/90 border border-purple-500/60 backdrop-blur-md text-purple-200 text-xs font-bold shadow-xl flex items-center gap-2 pointer-events-none">
            <span className="animate-spin text-sm">✨</span>
            <span>Napas teratur & mimpi indah • Toko Tanuki tetap buka untuk belanja santai</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM CONTROL DOCK & WAKE UP BUTTON */}
      <footer className="relative z-30 max-w-xl mx-auto w-full px-3.5 py-3 rounded-2xl sm:rounded-3xl bg-stone-950/90 backdrop-blur-xl border-2 border-purple-500/70 shadow-2xl space-y-2.5">
        {/* Energy Charging Indicator & Countdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-purple-200">
              <BatteryCharging className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Pemulihan Energi:</span>
              <span className="text-purple-300">
                {energyProgress >= 100
                  ? 'Energi 100%! ⚡'
                  : `${Math.round(energyProgress)}%`}
              </span>
            </div>
            <span className="font-mono text-amber-300 bg-black/40 px-2 py-0.5 rounded text-[11px] border border-amber-500/40">
              ⏱️ {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')} tersisa
            </span>
          </div>

          {/* Energy Progress Bar */}
          <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-purple-800/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${energyProgress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons: Dim Light, Back to Tatami / Shop & WAKE UP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Redupkan / Nyalakan Lentera */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsLightsDimmed((prev) => !prev);
            }}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-b from-purple-950/80 to-stone-900 hover:from-purple-900 hover:to-stone-800 border border-purple-500/60 text-purple-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {isLightsDimmed ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-purple-300" />
            )}
            <span className="text-[11px]">{isLightsDimmed ? 'Terangkan' : 'Redupkan'}</span>
          </button>

          {/* Kembali ke Beranda / Belanja di Toko */}
          <button
            onClick={() => {
              onClose();
              if (onOpenShop) {
                onOpenShop();
              }
            }}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-b from-amber-950/80 to-stone-900 hover:from-amber-900 hover:to-stone-800 border border-amber-600/70 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Toko Tanuki 🏪</span>
          </button>

          {/* SELESAI TIDUR / BANGUNKAN */}
          <button
            onClick={handleWakeUp}
            className={`col-span-2 sm:col-span-1 py-2 px-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer ${
              remainingSeconds === 0 || energyProgress >= 100
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-stone-950 shadow-purple-950/60'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {remainingSeconds === 0 ? 'Bangunkan Segar' : 'Bangunkan Awal'}
            </span>
          </button>
        </div>

        <p className="text-[10px] text-center text-stone-400">
          Durasi tidur 15 menit. Kamu bebas berbelanja di Toko Tanuki atau menikmati musik sementara {pet.name} beristirahat.
        </p>
      </footer>
    </div>
  );
};
