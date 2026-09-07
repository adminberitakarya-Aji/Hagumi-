import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Droplets,
  Sun,
  Moon,
  Heart,
  CheckCircle2,
  Waves,
  Smile,
} from 'lucide-react';
import { PetData } from '../types/game';
import { KitsuneCanvas } from './KitsuneCanvas';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

import onsenBathDay from '../assets/images/onsen_empty_day_1788753903822.jpg';
import onsenBathNight from '../assets/images/onsen_empty_night_1788753919598.jpg';

interface OnsenBathModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onFinishBath: (expGain: number, happinessGain: number) => void;
}

interface FoamParticle {
  id: number;
  x: number; // percentage relative to center
  y: number;
  size: number;
  delay: number;
}

interface SplashParticle {
  id: number;
  vx: number;
  vy: number;
  scale: number;
}

export const OnsenBathModal: React.FC<OnsenBathModalProps> = ({
  isOpen,
  onClose,
  pet,
  onFinishBath,
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');
  const [bathAction, setBathAction] = useState<'soaking' | 'scrubbing' | 'splashing' | 'rinsed'>('soaking');
  const [soapBubbles, setSoapBubbles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [cleanlinessProgress, setCleanlinessProgress] = useState(pet.stats.cleanliness);

  // Dynamic interactive particle states
  const [activeFoams, setActiveFoams] = useState<FoamParticle[]>([]);
  const [activeSplashes, setActiveSplashes] = useState<SplashParticle[]>([]);
  const [showSpongeAnimation, setShowSpongeAnimation] = useState(false);
  const [showLadleAnimation, setShowLadleAnimation] = useState(false);
  const [showSparkleClean, setShowSparkleClean] = useState(false);
  const [actionFeedbackText, setActionFeedbackText] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    setCleanlinessProgress(pet.stats.cleanliness);
    setBathAction('soaking');
    setActiveFoams([]);
    setActiveSplashes([]);
    setShowSpongeAnimation(false);
    setShowLadleAnimation(false);
    setShowSparkleClean(false);

    // Initial ambient soap bubbles
    const initialBubbles = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: 15 + Math.random() * 70,
      y: 35 + Math.random() * 45,
      size: 16 + Math.random() * 26,
    }));
    setSoapBubbles(initialBubbles);

    soundEngine.playWaterSplashLadle();

    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timeTimer);
  }, [isOpen, pet.stats.cleanliness]);

  if (!isOpen) return null;

  // Day & Night detection based on agreed rule: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const currentHour = currentTime.getHours();
  const naturalIsDay = currentHour >= 6 && currentHour < 18;
  const isDayVisual =
    atmosphereOverride === 'auto' ? naturalIsDay : atmosphereOverride === 'day';
  const currentBgImage = isDayVisual ? onsenBathDay : onsenBathNight;

  // 1. Gosok Sabun (Scrub Soap) with Rich Visual Effects
  const handleScrubSoap = () => {
    soundEngine.playSoapScrub();
    hapticEngine.medium();
    setBathAction('scrubbing');
    setShowSpongeAnimation(true);
    setShowSparkleClean(false);

    setActionFeedbackText(`🫧 Menggosok busa sabun melati wangi ke bulu ${pet.name}!`);

    // Generate playful foam burst around Kitsune
    const newFoams: FoamParticle[] = Array.from({ length: 22 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: -45 + Math.random() * 90,
      y: -50 + Math.random() * 80,
      size: 18 + Math.random() * 32,
      delay: Math.random() * 0.4,
    }));
    setActiveFoams(newFoams);

    // Also spawn floating interactive bubbles
    const newAmbientBubble = {
      id: Date.now() + Math.random(),
      x: 25 + Math.random() * 50,
      y: 40 + Math.random() * 30,
      size: 20 + Math.random() * 26,
    };
    setSoapBubbles((prev) => [...prev.slice(-18), newAmbientBubble]);

    setCleanlinessProgress((prev) => Math.min(100, prev + 20));

    setTimeout(() => {
      setShowSpongeAnimation(false);
    }, 1500);

    setTimeout(() => {
      setBathAction('soaking');
      setActionFeedbackText(null);
    }, 2400);
  };

  // 2. Bilas Air (Rinse Water) with Cascading Droplets & Sparkle Finish
  const handleSplashWater = () => {
    soundEngine.playWaterSplashLadle();
    hapticEngine.heavy();
    setBathAction('splashing');
    setShowLadleAnimation(true);
    setShowSpongeAnimation(false);

    setActionFeedbackText(`💦 Byuurrr! Guyuran air hangat kayu cemara membilas bersih ${pet.name}!`);

    // Splashing water particles flying in arc
    const newSplashes: SplashParticle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      vx: (Math.random() - 0.5) * 160,
      vy: -60 - Math.random() * 120,
      scale: 0.7 + Math.random() * 0.9,
    }));
    setActiveSplashes(newSplashes);

    // Wash away foam
    setTimeout(() => {
      setActiveFoams([]);
      setShowSparkleClean(true);
      soundEngine.playChime();
    }, 800);

    setCleanlinessProgress((prev) => Math.min(100, prev + 15));

    setTimeout(() => {
      setShowLadleAnimation(false);
    }, 1400);

    setTimeout(() => {
      setBathAction('soaking');
      setShowSparkleClean(false);
      setActionFeedbackText(null);
    }, 2800);
  };

  // Pop bubble fun
  const handlePopBubble = (id: number) => {
    soundEngine.playBubblePop();
    hapticEngine.tap();
    setSoapBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  // Finish Bath & Return to Tatami
  const handleComplete = () => {
    soundEngine.playChime();
    hapticEngine.heavy();
    const expGain = 20;
    const happinessGain = 18;
    onFinishBath(expGain, happinessGain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-2 sm:p-4 overflow-hidden animate-in fade-in select-none">
      {/* 1. FULLSCREEN BACKGROUND (Pure Empty Hinoki Bathhouse - NO HUMANS) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Pemandian Onsen Hinoki Asli (Tanpa Manusia)"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 saturate-[1.1] transition-all duration-700"
        />
        {/* Warm ambient steam & light vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/45 via-transparent to-stone-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/20 to-stone-950/60 pointer-events-none" />
      </div>

      {/* 2. FLOATING STEAM CLOUDS */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute bottom-12 left-1/4 w-80 h-80 bg-amber-100/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-100/15 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
      </div>

      {/* Interactive Soap Bubbles Floating */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {soapBubbles.map((bubble) => (
          <button
            key={bubble.id}
            onClick={() => handlePopBubble(bubble.id)}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
            className="absolute rounded-full bg-gradient-to-tr from-cyan-300/40 via-white/80 to-pink-300/40 border border-white/90 backdrop-blur-[1px] shadow-sm animate-bounce cursor-pointer hover:scale-130 active:scale-90 transition-transform"
            title="Klik untuk memecahkan gelembung!"
          />
        ))}
      </div>

      {/* 3. TOP BAR: Header, Atmosphere Toggle & Back Button */}
      <header className="relative z-30 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full px-3 py-2.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/50 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/90 to-blue-950 border border-cyan-400/80 flex items-center justify-center text-xl shadow-lg flex-shrink-0">
            🛁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-cyan-200 tracking-wide drop-shadow">
                Pemandian Onsen Hinoki
              </h2>
              <span className="text-[10px] text-cyan-400/90 font-['Shippori_Mincho',serif] hidden xs:inline">
                檜風呂 (Hinoki Buro)
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              {pet.name} berendam di bak kayu cemara berair hangat dengan aroma buah yuzu
            </p>
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 border border-cyan-500/50 text-[11px] font-bold text-cyan-200 transition-all cursor-pointer shadow-sm"
            title="Ganti Suasana Waktu Pemandian (Siang / Malam)"
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
              <span className="text-[9px] text-cyan-400 font-normal">●</span>
            )}
          </button>

          {/* Quick Exit */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800/80 text-stone-300 hover:text-stone-100 transition-all cursor-pointer"
            title="Kembali ke Ruang Tatami"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 4. CENTER STAGE: KITSUNE POSITIONED NATURALLY IN HINOKI TUB */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 pointer-events-none translate-y-4 sm:translate-y-8">
        <div className="relative flex flex-col items-center justify-center">

          {/* Hot Spring Water Glow & Ripples beneath Kitsune */}
          <div className="absolute -bottom-8 w-80 sm:w-[28rem] h-28 rounded-full bg-gradient-to-t from-cyan-500/40 via-teal-400/25 to-transparent border-t-2 border-cyan-300/70 blur-[2px] pointer-events-none animate-pulse" />

          {/* Kitsune Canvas Animated Render in Bathing State */}
          <div className="pointer-events-auto relative transform scale-110 sm:scale-125 transition-transform cursor-pointer">
            <KitsuneCanvas
              pet={pet}
              actionState="bathing"
              onPetClick={handleScrubSoap}
            />

            {/* Floating Folded Washcloth on Pet Head */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-stone-100/95 text-[9px] font-bold text-stone-800 shadow-md border border-stone-300 animate-bounce pointer-events-none whitespace-nowrap">
              ♨️ Handuk Hangat
            </div>

            {/* Floating Yuzu Fruit in bath water beside Kitsune */}
            <div className="absolute -bottom-1 -left-10 text-2xl animate-bounce pointer-events-none drop-shadow" title="Buah Yuzu Hangat">
              🍋
            </div>
            <div className="absolute 0 -right-12 text-xl animate-bounce delay-300 pointer-events-none drop-shadow" title="Buah Yuzu Hangat">
              🍋
            </div>

            {/* --- VISUAL EFFECT: FOAM LAYER ON KITSUNE --- */}
            {activeFoams.length > 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {activeFoams.map((foam) => (
                  <div
                    key={foam.id}
                    style={{
                      transform: `translate(${foam.x}px, ${foam.y}px)`,
                      width: `${foam.size}px`,
                      height: `${foam.size}px`,
                      animationDelay: `${foam.delay}s`,
                    }}
                    className="absolute rounded-full bg-gradient-to-tr from-cyan-100 via-white to-sky-100 border border-white/90 shadow-md animate-bounce opacity-95"
                  />
                ))}
              </div>
            )}

            {/* --- VISUAL EFFECT: ANIMATED SPONGE SCRUBBING --- */}
            {showSpongeAnimation && (
              <div className="absolute -top-4 -right-6 pointer-events-none animate-spin origin-bottom-left transition-all">
                <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 border-2 border-amber-600 shadow-2xl text-stone-900 font-black text-xs flex items-center gap-1 animate-pulse">
                  <span>🧽</span>
                  <span>Gosok Busa!</span>
                </div>
              </div>
            )}

            {/* --- VISUAL EFFECT: ANIMATED BAMBOO WATER LADLE POURING --- */}
            {showLadleAnimation && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-300 shadow-2xl text-white font-extrabold text-xs flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-200 animate-bounce" />
                  <span>Guyuran Air Hangat!</span>
                </div>
                {/* Water Stream Cascading Down */}
                <div className="w-24 h-28 bg-gradient-to-b from-cyan-300/80 via-cyan-400/50 to-transparent blur-[1px] animate-pulse rounded-b-full mt-1" />
              </div>
            )}

            {/* --- VISUAL EFFECT: WATER SPLASH PARTICLES --- */}
            {activeSplashes.length > 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {activeSplashes.map((splash) => (
                  <div
                    key={splash.id}
                    style={{
                      transform: `translate(${splash.vx}px, ${splash.vy}px) scale(${splash.scale})`,
                    }}
                    className="absolute w-3 h-3 rounded-full bg-cyan-200 border border-white shadow-lg animate-out fade-out duration-1000"
                  />
                ))}
              </div>
            )}

            {/* --- VISUAL EFFECT: SPARKLE CLEAN STARBURST --- */}
            {showSparkleClean && (
              <div className="absolute -inset-4 pointer-events-none flex items-center justify-center animate-in zoom-in-50 duration-500">
                <div className="w-48 h-48 rounded-full bg-gradient-to-r from-amber-300/30 via-cyan-300/30 to-pink-300/30 blur-md animate-ping" />
                <div className="absolute px-4 py-1.5 rounded-full bg-stone-950/90 border-2 border-amber-400 text-amber-200 font-extrabold text-xs shadow-2xl flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Bulu Bersih Berkilau & Harum Semerbak! ✨</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Action Feedback Banner */}
          {actionFeedbackText && (
            <div className="mt-5 px-4 py-1.5 rounded-full bg-stone-950/90 border-2 border-cyan-400 text-cyan-100 text-xs sm:text-sm font-bold shadow-2xl animate-bounce pointer-events-none flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>{actionFeedbackText}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM CONTROL DOCK & FINISH BUTTON */}
      <footer className="relative z-30 max-w-xl mx-auto w-full px-3.5 py-3 rounded-2xl sm:rounded-3xl bg-stone-950/90 backdrop-blur-xl border-2 border-cyan-500/70 shadow-2xl space-y-2.5">
        {/* Cleanliness Progress Indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-cyan-200">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Tingkat Kebersihan Bulu:</span>
              <span className="text-cyan-300 font-extrabold">
                {cleanlinessProgress >= 100
                  ? 'Bulu Berkilau Bersih 100%! ✨'
                  : `${Math.round(cleanlinessProgress)}%`}
              </span>
            </div>
            <span className="text-stone-300 text-[11px]">
              {cleanlinessProgress >= 100 ? 'Sempurna' : 'Gosok sabun & bilas'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-cyan-800/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${cleanlinessProgress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons: Scrub Soap, Splash Water & Finish Bath (USING RELIABLE SVG ICONS) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Gosok Sabun Button */}
          <button
            onClick={handleScrubSoap}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-b from-cyan-900/90 to-stone-900 hover:from-cyan-800 hover:to-stone-800 border-2 border-cyan-500/80 text-cyan-100 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-center">
              <span className="block leading-none font-bold">Gosok Sabun</span>
              <span className="text-[9px] text-cyan-400 font-normal leading-none">Busa Melati</span>
            </div>
          </button>

          {/* Bilas Air Button */}
          <button
            onClick={handleSplashWater}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-b from-blue-900/90 to-stone-900 hover:from-blue-800 hover:to-stone-800 border-2 border-blue-500/80 text-blue-100 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets className="w-4 h-4 text-blue-300" />
            </div>
            <div className="text-center">
              <span className="block leading-none font-bold">Bilas Air</span>
              <span className="text-[9px] text-blue-400 font-normal leading-none">Air Cemara</span>
            </div>
          </button>

          {/* Selesai Mandi Button */}
          <button
            onClick={handleComplete}
            className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-950/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-stone-950" />
            </div>
            <div className="text-center">
              <span className="block leading-none font-extrabold">Selesai Mandi</span>
              <span className="text-[9px] text-emerald-950 font-semibold leading-none">Ke Tatami</span>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-center text-stone-400">
          Klik sabun untuk memunculkan busa wangi atau tekan <strong>Selesai Mandi</strong> untuk kembali membawa {pet.name} ke beranda tatami!
        </p>
      </footer>
    </div>
  );
};
