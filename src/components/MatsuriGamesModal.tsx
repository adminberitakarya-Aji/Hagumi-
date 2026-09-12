import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Coins, RotateCcw, Play, Heart, Sparkles, Award, Sun, Moon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

// Matsuri Festival Grounds Artworks (Day & Night)
import matsuriFestivalDay from '../assets/images/matsuri_festival_day_1789148968329.webp';
import matsuriFestivalNight from '../assets/images/matsuri_festival_night_1789148981495.webp';
import { TaikoRhythmGame } from './matsuri/TaikoRhythmGame';
import { KingyoSukuiGame } from './matsuri/KingyoSukuiGame';
import { WanageGame } from './matsuri/WanageGame';
import { KitsuneDashGame } from './matsuri/KitsuneDashGame';


interface MatsuriGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** disciplineGained (opsional): bonus disiplin khusus Wanage performa bagus (Revisi 4 bug #5). */
  onReward: (coinsEarned: number, happinessGained: number, disciplineGained?: number) => void;
}

type MiniGameTab = 'kingyo' | 'wanage' | 'dash' | 'taiko';

export const MatsuriGamesModal: React.FC<MatsuriGamesModalProps> = ({
  isOpen,
  onClose,
  onReward,
}) => {
  const [activeTab, setActiveTab] = useState<MiniGameTab>('taiko');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  // Atmosphere toggle: auto (by local clock), day, or night
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Day / Night cycle based on agreed rule: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const currentHour = currentTime.getHours();
  const naturalIsDay = currentHour >= 6 && currentHour < 18;
  const isDayVisual =
    atmosphereOverride === 'auto'
      ? naturalIsDay
      : atmosphereOverride === 'day';

  const currentBgImage = isDayVisual
    ? matsuriFestivalDay
    : matsuriFestivalNight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in">
      {/* 1. FULL SCREEN BACKGROUND ARTWORK (Day & Night Matsuri Festival) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Lapangan Festival Matsuri Fullscreen"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 saturate-[1.05] transition-all duration-700"
        />
        {/* Soft edge darkening for aesthetic focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-stone-950/50 pointer-events-none" />
      </div>

      {/* 2. FLOATING MATSURI PANEL (Centered Frosted Glass) */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-950/85 backdrop-blur-xl text-stone-100 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-amber-600/70 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/50 mb-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEngine.playTaikoFestivalRoll();
                hapticEngine.taiko();
              }}
              className="w-10 h-10 rounded-2xl bg-amber-900/60 hover:bg-amber-800 border border-amber-600/60 flex items-center justify-center text-xl shadow-inner cursor-pointer hover:scale-110 active:scale-95 transition-all"
              title="Tabuh Gendang Festival (Taiko Matsuri Roll)"
aria-label="Tabuh Gendang Festival (Taiko Matsuri Roll)"
            >
              🥁
            </button>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-['Shippori_Mincho',serif] text-amber-200 leading-tight">
                Festival Rakyat Matsuri
              </h3>
              <p className="text-xs text-stone-400">
                Mainkan mini-game tradisional untuk mendapat koin Ryo, EXP & membahagiakan kitsune!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 border border-amber-500/50 text-[11px] font-bold text-amber-200 transition-all cursor-pointer shadow-sm"
              title="Ganti Suasana Waktu Festival (Siang / Malam)"
aria-label="Ganti Suasana Waktu Festival (Siang / Malam)"
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
                <span className="text-[9px] text-amber-400 font-normal">●</span>
              )}
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-stone-900/80 border border-stone-800 mb-4">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('taiko');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'taiko'
                ? 'bg-rose-600 text-white shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🥁</span>
            <span>Taiko Beat</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('kingyo');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'kingyo'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🐟</span>
            <span>Kingyo-sukui</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('wanage');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'wanage'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🎯</span>
            <span>Wanage</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('dash');
            }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dash'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🦊</span>
            <span>Kitsune Dash</span>
          </button>
        </div>

        {/* Game Container */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          {activeTab === 'taiko' && <TaikoRhythmGame onReward={onReward} />}
          {activeTab === 'kingyo' && <KingyoSukuiGame onReward={onReward} />}
          {activeTab === 'wanage' && <WanageGame onReward={onReward} />}
          {activeTab === 'dash' && <KitsuneDashGame onReward={onReward} />}
        </div>
      </div>
    </div>
  );
};
