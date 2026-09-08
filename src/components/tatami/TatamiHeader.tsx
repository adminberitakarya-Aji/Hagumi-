/**
 * src/components/tatami/TatamiHeader.tsx
 * Header HUD (identitas, EXP, Kizuna, koin, kontrol cepat) + meter vital 6 stat.
 * Diekstrak dari TatamiRoom.tsx (langkah 4 refactor God component).
 */

import type { Dispatch, SetStateAction } from 'react';
import { PetData, SeasonType, DayPhase } from '../../types/game';
import { getRequiredExp, getBondingLevelInfo } from '../../data/gameConfig';
import { Coins, Volume2, VolumeX } from 'lucide-react';
import { formatCountdown } from '../../hooks/useTimers';
import { useParallax2D } from '../../utils/useParallax2D';
import type { ShojiTransitionConfig } from '../ShojiTransition';
import { ModalKind } from './modalRegistry';
import { soundEngine } from '../../utils/soundEngine';

interface TatamiHeaderProps {
  pet: PetData;
  bondInfo: ReturnType<typeof getBondingLevelInfo>;
  setActiveModal: Dispatch<SetStateAction<ModalKind | null>>;
  triggerShoji: (config: ShojiTransitionConfig) => void;
  showToast: (msg: string) => void;
  parallax: ReturnType<typeof useParallax2D>;
  isBgmActive: boolean;
  toggleBgm: () => boolean;
  isMuted: boolean;
  toggleMute: () => boolean;
  timePhase: DayPhase;
  season: SeasonType;
  odekakeRemainingSeconds: number;
  onOpenPrologue?: () => void;
  handleCycleSeason: () => void;
  isDockMode: boolean;
  setIsDockMode: Dispatch<SetStateAction<boolean>>;
  setIsSensuOpen: Dispatch<SetStateAction<boolean>>;
}

export function TatamiHeader({
  pet, bondInfo, setActiveModal, triggerShoji, showToast, parallax,
  isBgmActive, toggleBgm, isMuted, toggleMute, timePhase, season,
  odekakeRemainingSeconds, onOpenPrologue, handleCycleSeason,
  isDockMode, setIsDockMode, setIsSensuOpen,
}: TatamiHeaderProps) {
  return (
    <>
      {/* TOP HEADER: Pet Identity, Level, Coins & Time Indicator */}
      <header className="relative z-10 max-w-4xl mx-auto w-full bg-[#201813]/90 backdrop-blur-md rounded-2xl border border-amber-700/60 px-2 py-1.5 sm:px-4 sm:py-2 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Pet Identity & Hanko Stamp */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveModal('hanko');
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
                  onMidpoint: () => setActiveModal('shrine'),
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
                  onMidpoint: () => setActiveModal('shop'),
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
                setActiveModal('parallax');
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
              aria-label="Mode Parallax 2.5D"
            >
              <span>🪞</span>
              <span className="hidden sm:inline">2.5D</span>
            </button>

            {/* Quick Audio Toggle - Compact on mobile, expanded on desktop */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-stone-900/90 border border-stone-700/80 flex-shrink-0">
              {/* Music BGM Toggle */}
              <button
                onClick={() => {
                  const active = toggleBgm();
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
                aria-label={isBgmActive ? 'Jeda Musik Zen' : 'Putar Musik Zen'}
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
                role="img"
                aria-label={`Fase Waktu: ${timePhase}`}
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
                  const muted = toggleMute();
                  showToast(muted ? '🔇 Seluruh Audio Santuari Dibisukan' : '🔊 Audio Santuari Aktif');
                }}
                className={`p-1 sm:p-1.5 rounded-lg transition-all cursor-pointer ${
                  isMuted ? 'text-red-400 hover:text-red-300' : 'text-stone-400 hover:text-stone-200'
                }`}
                title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
                aria-label={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
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
                aria-label="Buka Gerbang Torii & Prologue"
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
                setActiveModal('odekake');
              }}
              title={
                pet.activeOdekake
                  ? `Sedang Berkelana ke ${pet.activeOdekake.destinationName} (${formatCountdown(odekakeRemainingSeconds)})`
                  : 'Petualangan Berkelana Roh (O-dekake / Tabi)'
              }
              aria-label="Petualangan Berkelana Odekake"
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-xs font-extrabold shadow-sm transition-all cursor-pointer flex-shrink-0 ${
                pet.activeOdekake
                  ? 'bg-gradient-to-r from-amber-700 to-amber-900 border-amber-400 text-amber-100 ring-1 ring-amber-400/60 animate-pulse'
                  : 'bg-gradient-to-r from-[#3a2216] to-[#25150d] border-amber-600/80 text-amber-200 hover:brightness-110'
              }`}
            >
              <span className="text-xs">{pet.activeOdekake ? '🚶' : '🎒'}</span>
              <span className="font-bold hidden xs:inline">
                {pet.activeOdekake
                  ? `Tabi ${formatCountdown(odekakeRemainingSeconds)}`
                  : 'Berkelana'}
              </span>
            </button>

            {/* Quick Taman Zen & Kolam Koi Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveModal('zenGarden');
              }}
              title="Engawa & Taman Zen Santuari (Kolam Ikan Koi & Pasir Karesansui)"
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-teal-950/90 to-emerald-950 border border-teal-500/80 text-teal-200 font-extrabold text-[10px] sm:text-xs shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
            >
              <span className="text-xs">🐟</span>
              <span className="font-bold hidden xs:inline">Taman Zen</span>
            </button>

            {/* Season Switcher Quick Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                handleCycleSeason();
              }}
              title={`Ganti Musim: ${season === 'spring' ? '🌸 Haru (Semi)' : season === 'summer' ? '🏮 Natsu (Panas)' : season === 'autumn' ? '🍁 Aki (Gugur)' : '❄️ Fuyu (Dingin)'} → Musim Selanjutnya`}
              className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[10px] sm:text-xs font-extrabold shadow-sm hover:brightness-110 transition-all cursor-pointer flex-shrink-0 ${
                season === 'spring' ? 'bg-gradient-to-r from-pink-950/90 to-rose-950 border-pink-500/80 text-pink-200'
                : season === 'summer' ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950 border-green-500/80 text-green-200'
                : season === 'autumn' ? 'bg-gradient-to-r from-orange-950/90 to-red-950 border-orange-500/80 text-orange-200'
                : 'bg-gradient-to-r from-blue-950/90 to-indigo-950 border-blue-400/80 text-blue-200'
              }`}
            >
              <span className="text-xs">
                {season === 'spring' ? '🌸' : season === 'summer' ? '🏮' : season === 'autumn' ? '🍁' : '❄️'}
              </span>
              <span className="font-bold hidden sm:inline">
                {season === 'spring' ? 'Haru' : season === 'summer' ? 'Natsu' : season === 'autumn' ? 'Aki' : 'Fuyu'}
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
    </>
  );
}
