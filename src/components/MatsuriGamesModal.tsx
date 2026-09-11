import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Coins, RotateCcw, Play, Heart, Sparkles, Award, Sun, Moon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

// Matsuri Festival Grounds Artworks (Day & Night)
import matsuriFestivalDay from '../assets/images/matsuri_festival_day_1789148968329.webp';
import matsuriFestivalNight from '../assets/images/matsuri_festival_night_1789148981495.webp';

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

// --- MINI GAME 0: Taiko Rhythm Beat (太鼓の達人 祭り拍子) ---
interface TaikoNote {
  id: number;
  type: 'don' | 'ka';
  x: number; // 0 to 100%
  hit: boolean;
}

const TaikoRhythmGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
  onReward,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lastJudgment, setLastJudgment] = useState<{ text: string; color: string } | null>(null);
  const [drumEffect, setDrumEffect] = useState<'don' | 'ka' | null>(null);

  const notesRef = useRef<TaikoNote[]>([]);
  const [, setRerender] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const gameEndTimeRef = useRef<number>(0);
  const nextNoteIdRef = useRef<number>(1);

  const HIT_TARGET_X = 20; // 20% from the left

  // Start Taiko Game
  const startGame = () => {
    soundEngine.playClick();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectCount(0);
    setGoodCount(0);
    setMissCount(0);
    setTimeLeft(30);
    setLastJudgment(null);
    setDrumEffect(null);

    notesRef.current = [];
    nextNoteIdRef.current = 1;
    lastSpawnTimeRef.current = performance.now();
    gameEndTimeRef.current = performance.now() + 30000;

    // Drum opening festive roll
    soundEngine.playTaikoFestivalRoll();
  };

  // Hit logic
  const handleHit = (hitType: 'don' | 'ka') => {
    if (!isPlaying || gameOver) return;

    if (hitType === 'don') {
      soundEngine.playTaikoDon();
      hapticEngine.taiko();
      setDrumEffect('don');
    } else {
      soundEngine.playTaikoKa();
      hapticEngine.tap();
      setDrumEffect('ka');
    }
    setTimeout(() => setDrumEffect(null), 100);

    // Find closest unhit note
    const unhitNotes = notesRef.current.filter((n) => !n.hit);
    let bestNote: TaikoNote | null = null;
    let minDistance = 999;

    for (const note of unhitNotes) {
      const dist = Math.abs(note.x - HIT_TARGET_X);
      if (dist < minDistance && dist < 14) {
        minDistance = dist;
        bestNote = note;
      }
    }

    if (bestNote) {
      if (bestNote.type === hitType) {
        bestNote.hit = true;
        if (minDistance <= 4.5) {
          // PERFECT / 良 (Ryou)
          const pts = 100 + Math.min(combo * 5, 100);
          setScore((s) => s + pts);
          setCombo((c) => {
            const next = c + 1;
            setMaxCombo((m) => Math.max(m, next));
            return next;
          });
          setPerfectCount((p) => p + 1);
          setLastJudgment({ text: '良！PERFECT', color: 'text-amber-300' });
        } else {
          // GOOD / 可 (Ka)
          const pts = 50 + Math.min(combo * 2, 50);
          setScore((s) => s + pts);
          setCombo((c) => {
            const next = c + 1;
            setMaxCombo((m) => Math.max(m, next));
            return next;
          });
          setGoodCount((g) => g + 1);
          setLastJudgment({ text: '可！GOOD', color: 'text-sky-300' });
        }
      } else {
        // Wrong drum hit type!
        bestNote.hit = true;
        setCombo(0);
        setMissCount((m) => m + 1);
        setLastJudgment({ text: '不可 MISS', color: 'text-rose-400' });
      }
    }
  };

  // Keyboard controls listener (D/F or Space for DON, J/K for KA)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      const key = e.key.toLowerCase();
      if (key === 'd' || key === 'f' || key === ' ') {
        e.preventDefault();
        handleHit('don');
      } else if (key === 'j' || key === 'k') {
        e.preventDefault();
        handleHit('ka');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, gameOver, combo]);

  // Main rhythm game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let lastFrameTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // Update remaining time
      const remainingMs = Math.max(0, gameEndTimeRef.current - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      setTimeLeft(remainingSec);

      if (remainingMs <= 0) {
        // End game!
        setIsPlaying(false);
        setGameOver(true);
        soundEngine.playShinobueFlute();
        setTimeout(() => soundEngine.playEvolutionFanfare(), 380);

        // Calculate rewards
        const finalScore = score;
        const rewardCoins = Math.min(50, Math.max(15, Math.floor(finalScore / 70)));
        const rewardHap = Math.min(45, Math.max(20, Math.floor(finalScore / 80)));
        onReward(rewardCoins, rewardHap);
        return;
      }

      // Spawn new notes in musical patterns
      const spawnInterval = 750; // ms per note
      if (now - lastSpawnTimeRef.current >= spawnInterval) {
        lastSpawnTimeRef.current = now;
        // 65% chance DON, 35% chance KA
        const type: 'don' | 'ka' = Math.random() > 0.35 ? 'don' : 'ka';
        notesRef.current.push({
          id: nextNoteIdRef.current++,
          type,
          x: 100, // starts at right
          hit: false,
        });
      }

      // Move notes to left
      const noteSpeed = 36; // % per second
      for (const note of notesRef.current) {
        note.x -= noteSpeed * dt;
        // Miss condition: note passed target zone without being hit
        if (!note.hit && note.x < HIT_TARGET_X - 7) {
          note.hit = true;
          setCombo(0);
          setMissCount((m) => m + 1);
          setLastJudgment({ text: '不可 MISS', color: 'text-rose-400' });
        }
      }

      // Prune offscreen notes
      notesRef.current = notesRef.current.filter((n) => n.x > -10);

      setRerender(now);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, gameOver, score, onReward]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-stone-900/90 rounded-2xl border border-stone-800 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300 font-mono">
            ⏱️ {timeLeft}s
          </span>
          <span className="text-stone-500">|</span>
          <span className="text-stone-300">
            Skor: <strong className="text-amber-200 text-sm font-mono">{score}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {combo > 2 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-black animate-pulse text-[11px]">
              🔥 {combo} COMBO!
            </div>
          )}
          <div className="text-[11px] text-stone-400">
            Maks: <span className="text-stone-200 font-bold">{maxCombo}</span>
          </div>
        </div>
      </div>

      {/* RHYTHM HIGHWAY TRACK */}
      <div className="relative w-full h-24 sm:h-28 bg-[#18110b] rounded-2xl border-2 border-amber-700/70 shadow-inner overflow-hidden flex items-center mb-3">
        {/* Matsuri Lanterns Background Deco */}
        <div className="absolute top-1 left-0 right-0 flex justify-between px-4 opacity-30 pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={`lantern-${i}`} className="text-xs">🏮</span>
          ))}
        </div>

        {/* Center Track Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-amber-900/40" />

        {/* HIT TARGET CIRCLE (Left Zone) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-amber-300/80 bg-stone-950/60 shadow-[0_0_12px_rgba(251,191,36,0.5)] flex items-center justify-center z-10"
          style={{ left: `${HIT_TARGET_X}%` }}
        >
          <div className="w-4 h-4 rounded-full border border-amber-400/40" />
        </div>

        {/* SCROLLING BEAT NOTES */}
        {notesRef.current.map((note) => {
          if (note.hit) return null;
          const isDon = note.type === 'don';
          return (
            <div
              key={note.id}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg flex items-center justify-center text-xs font-black transition-transform ${
                isDon
                  ? 'bg-rose-600 border-2 border-white text-white shadow-rose-600/60'
                  : 'bg-sky-500 border-2 border-white text-white shadow-sky-500/60'
              }`}
              style={{ left: `${note.x}%` }}
            >
              <span>{isDon ? 'ドン' : 'カッ'}</span>
            </div>
          );
        })}

        {/* REALTIME JUDGMENT FEEDBACK POPUP */}
        {lastJudgment && (
          <div
            key={Math.random()}
            className={`absolute top-2 left-1/4 -translate-x-1/2 font-black text-xs sm:text-sm tracking-wider animate-bounce pointer-events-none drop-shadow-md ${lastJudgment.color}`}
          >
            {lastJudgment.text}
          </div>
        )}
      </div>

      {/* INTERACTIVE TAIKO DRUM CONTROLLER */}
      <div className="w-full flex flex-col items-center justify-center relative p-2">
        {/* Taiko Drum Visual */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          {/* Outer Rim (KA - Blue) */}
          <button
            onClick={() => handleHit('ka')}
            className={`absolute inset-0 rounded-full border-8 border-[#3b2314] shadow-2xl transition-all cursor-pointer flex items-center justify-between px-3 ${
              drumEffect === 'ka'
                ? 'bg-sky-500/40 ring-4 ring-sky-400 scale-98'
                : 'bg-gradient-to-b from-[#2a170d] to-[#170a05] hover:border-sky-600'
            }`}
          >
            {/* Studs */}
            <span className="text-sky-300 text-xs font-black tracking-wider">KA (カッ)</span>
            <span className="text-sky-300 text-xs font-black tracking-wider">KA (カッ)</span>
          </button>

          {/* Inner Drum Skin (DON - Red) */}
          <button
            onClick={() => handleHit('don')}
            className={`relative w-28 h-28 sm:w-34 sm:h-34 rounded-full border-4 border-amber-900 shadow-inner transition-all cursor-pointer flex flex-col items-center justify-center ${
              drumEffect === 'don'
                ? 'bg-rose-600 text-white ring-4 ring-rose-400 scale-95'
                : 'bg-[#f7eed9] text-stone-900 hover:bg-rose-50'
            }`}
          >
            {/* Mitsudomoe Spiral Motif */}
            <span className="text-xl sm:text-2xl font-bold">🔴</span>
            <span className="text-xs sm:text-sm font-black font-serif mt-0.5">
              DON (ドン)
            </span>
          </button>
        </div>

        {/* Keyboard Instructions Guide */}
        <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-3">
          <span>
            🔴 DON: <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-200">Space</kbd> / <kbd className="px-1 py-0.5 bg-stone-800 rounded border border-stone-700">D</kbd> / <kbd className="px-1 py-0.5 bg-stone-800 rounded border border-stone-700">F</kbd>
          </span>
          <span>
            🔵 KA: <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-sky-200">J</kbd> / <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-sky-200">K</kbd>
          </span>
        </div>
      </div>

      {/* START / GAME OVER OVERLAYS */}
      {!isPlaying && !gameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30">
          <div className="text-4xl mb-2 animate-bounce">🥁</div>
          <h4 className="text-lg sm:text-xl font-bold font-['Shippori_Mincho',serif] text-amber-300 mb-1">
            Taiko Rhythm Beat (太鼓の達人)
          </h4>
          <p className="text-xs text-stone-300 mb-4 max-w-sm leading-relaxed">
            Pukul tabuh gendang sesuai ritme saat bulatan nada menyentuh lingkaran target!
            Pukul <strong className="text-rose-400">DON (Tengah)</strong> atau <strong className="text-sky-400">KA (Pinggir)</strong>.
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl cursor-pointer flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Mulai Tabuh Taiko!</span>
          </button>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in">
          <div className="text-4xl mb-2">🏮🎊</div>
          <h4 className="text-xl font-bold font-['Shippori_Mincho',serif] text-amber-300 mb-1">
            Festival Taiko Selesai!
          </h4>
          <p className="text-xs text-stone-300 mb-3">
            Sorak penonton matsuri menyambut pukulan drum kitsune Anda!
          </p>

          {/* Stats Sheet */}
          <div className="w-full max-w-xs bg-stone-900/90 border border-amber-900/60 rounded-2xl p-3 mb-4 text-xs space-y-1.5 shadow-inner">
            <div className="flex justify-between items-center pb-1 border-b border-stone-800">
              <span className="text-stone-400">Skor Akhir:</span>
              <span className="font-black text-amber-300 text-sm">{score} Poin</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400">良 (Perfect):</span>
              <span className="font-bold text-stone-200">{perfectCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sky-400">可 (Good):</span>
              <span className="font-bold text-stone-200">{goodCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-rose-400">不可 (Miss):</span>
              <span className="font-bold text-stone-200">{missCount}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-stone-800">
              <span className="text-stone-400">Kombo Maksimal:</span>
              <span className="font-bold text-rose-400">{maxCombo} Combo 🔥</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-6 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Main Taiko Lagi</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- MINI GAME 1: Kingyo-sukui (Goldfish Scooping) ---
const KingyoSukuiGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
  onReward,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [poiDurability, setPoiDurability] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [fishes, setFishes] = useState<
    Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }>
  >([]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const startGame = () => {
    soundEngine.playClick();
    setScore(0);
    setPoiDurability(100);
    setGameOver(false);
    setIsPlaying(true);

    // Spawn 7 swimming goldfish
    const initialFish = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 240,
      y: 40 + Math.random() * 160,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      color: i % 2 === 0 ? '#ea580c' : '#dc2626',
      size: 14 + Math.random() * 8,
    }));
    setFishes(initialFish);
  };

  // Move fish tick
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setFishes((prev) =>
        prev.map((f) => {
          let nextX = f.x + f.vx;
          let nextY = f.y + f.vy;
          let nextVx = f.vx;
          let nextVy = f.vy;

          if (nextX < 20 || nextX > 320) nextVx = -nextVx;
          if (nextY < 20 || nextY > 200) nextVy = -nextVy;

          return { ...f, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  const handleTubClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || gameOver) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    soundEngine.playMatsuriPoiScoop();
    hapticEngine.water();

    // Damage paper poi
    const newDurability = Math.max(0, poiDurability - 18);
    setPoiDurability(newDurability);

    // Check hit fish
    let caughtFishId = -1;
    for (const fish of fishes) {
      const dist = Math.hypot(fish.x - clickX, fish.y - clickY);
      if (dist < 28) {
        caughtFishId = fish.id;
        break;
      }
    }

    if (caughtFishId !== -1) {
      soundEngine.playShinobueFlute();
      hapticEngine.tap();
      const newScore = score + 1;
      setScore(newScore);
      // Respawn fish
      setFishes((prev) =>
        prev.map((f) =>
          f.id === caughtFishId
            ? {
                ...f,
                x: 40 + Math.random() * 240,
                y: 40 + Math.random() * 160,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
              }
            : f
        )
      );
    }

    if (newDurability <= 0) {
      // Game over!
      setGameOver(true);
      setIsPlaying(false);
      const coinsWon = score * 8 + 5;
      const hapGained = score * 5 + 10;
      soundEngine.playEvolutionFanfare();
      onReward(coinsWon, hapGained);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* HUD */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-bold">
        <div className="flex items-center gap-1 text-amber-300">
          <span>🐟 Ikan Tertangkap:</span>
          <span className="text-base text-white">{score}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-stone-300">Ketahanan Kertas Poi:</span>
          <div className="w-24 h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
            <div
              className={`h-full transition-all ${
                poiDurability > 50
                  ? 'bg-emerald-500'
                  : poiDurability > 25
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${poiDurability}%` }}
            />
          </div>
        </div>
      </div>

      {/* Wooden Water Tub */}
      <div
        ref={containerRef}
        onClick={handleTubClick}
        className="relative w-full h-[240px] max-w-[460px] rounded-3xl bg-gradient-to-b from-sky-800/90 to-blue-950 border-4 border-amber-800 shadow-2xl overflow-hidden cursor-crosshair select-none flex items-center justify-center"
      >
        {/* Water Ripple Details */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0,transparent_70%)] pointer-events-none" />

        {/* Swimming Goldfish */}
        {isPlaying &&
          fishes.map((f) => (
            <div
              key={f.id}
              className="absolute pointer-events-none transition-transform"
              style={{
                left: `${f.x}px`,
                top: `${f.y}px`,
                transform: `rotate(${Math.atan2(f.vy, f.vx) * (180 / Math.PI)}deg)`,
              }}
            >
              {/* Goldfish SVG */}
              <div
                className="rounded-full shadow-md flex items-center justify-center"
                style={{
                  width: `${f.size}px`,
                  height: `${f.size * 0.55}px`,
                  backgroundColor: f.color,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900 ml-auto mr-1" />
              </div>
            </div>
          ))}

        {/* Not Playing Overlay */}
        {!isPlaying && !gameOver && (
          <div className="text-center p-6 bg-black/60 backdrop-blur-xs rounded-2xl border border-amber-500/50">
            <h4 className="text-base font-bold text-amber-300 mb-1 font-['Shippori_Mincho',serif]">
              Kingyo-sukui (金魚すくい)
            </h4>
            <p className="text-xs text-stone-300 max-w-xs mb-3">
              Klik pada ikan mas yang berenang untuk menyiduknya sebelum jaring kertas *poi* robek terkena air!
            </p>
            <button
              onClick={startGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Mulai Tangkap Ikan!
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="text-center p-5 bg-black/75 backdrop-blur-sm rounded-2xl border border-amber-500">
            <h4 className="text-lg font-bold text-amber-300 mb-1 font-['Shippori_Mincho',serif]">
              Jaring Kertas Robek!
            </h4>
            <p className="text-xs text-stone-200 mb-2">
              Kamu berhasil menangkap <strong className="text-amber-400">{score} ikan mas</strong>!
            </p>
            <div className="flex items-center justify-center gap-3 text-xs font-bold text-amber-300 mb-3">
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" /> +{score * 8 + 5} Ryo
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-400" /> +{score * 5 + 10} Bahagia
              </span>
            </div>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Main Lagi</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MINI GAME 2: Wanage (Ring Toss) ---
const WanageGame: React.FC<{ onReward: (coins: number, hap: number, disciplineGained?: number) => void }> = ({ onReward }) => {
  const [ringsLeft, setRingsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [power, setPower] = useState(50);
  const [isAiming, setIsAiming] = useState(false);
  const [gameDone, setGameDone] = useState(false);

  // Oscillating power meter
  useEffect(() => {
    if (!isAiming || gameDone) return;
    const interval = setInterval(() => {
      setPower((p) => {
        const next = (p + 4) % 100;
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isAiming, gameDone]);

  const handleThrow = () => {
    if (ringsLeft <= 0 || gameDone) return;
    soundEngine.playClick();

    // Calculate score based on power sweet spot (targets at 30, 60, 85)
    let points = 0;
    if (Math.abs(power - 30) < 10) points = 10; // Small Daruma
    else if (Math.abs(power - 60) < 10) points = 25; // Tanuki Doll
    else if (Math.abs(power - 85) < 8) points = 50; // Kitsune Golden Mask!

    if (points > 0) {
      soundEngine.playCoin();
    }

    const nextScore = score + points;
    setScore(nextScore);
    const nextRings = ringsLeft - 1;
    setRingsLeft(nextRings);

    if (nextRings <= 0) {
      setGameDone(true);
      setIsAiming(false);
      soundEngine.playEvolutionFanfare();
      // Bonus disiplin: ketangkasan Wanage melatih fokus Kitsune (Revisi 4 bug #5).
      // +8 jika tancapan bagus (skor ≥ 25), +4 jika cukup (≥ 12).
      const disciplineBonus = nextScore >= 25 ? 8 : nextScore >= 12 ? 4 : 0;
      onReward(Math.floor(nextScore * 0.8) + 10, nextScore + 15, disciplineBonus);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-bold">
        <span className="text-amber-300">Skor Festival: {score}</span>
        <span className="text-stone-300">Gelang Rotan: {ringsLeft} / 5</span>
      </div>

      <div className="relative w-full h-[240px] max-w-[460px] rounded-3xl bg-gradient-to-b from-[#2e1f18] to-[#1a110c] border-4 border-amber-800 shadow-2xl p-4 flex flex-col justify-between items-center select-none">
        {/* Targets on Matsuri Stall Shelf */}
        <div className="w-full flex items-end justify-around h-32 border-b-4 border-amber-900/80 pb-2">
          {/* Target 1: Daruma */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 mb-1">10 pt</span>
            <div className="w-12 h-14 rounded-full bg-rose-600 border-2 border-rose-800 flex items-center justify-center text-lg shadow-md">
              👺
            </div>
            <span className="text-[10px] text-stone-400 mt-1">Daruma</span>
          </div>

          {/* Target 2: Tanuki */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 mb-1">25 pt</span>
            <div className="w-14 h-16 rounded-2xl bg-amber-700 border-2 border-amber-900 flex items-center justify-center text-xl shadow-md">
              🦝
            </div>
            <span className="text-[10px] text-stone-400 mt-1">Tanuki</span>
          </div>

          {/* Target 3: Kitsune Mask */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 mb-1">50 pt</span>
            <div className="w-12 h-14 rounded-2xl bg-stone-100 border-2 border-rose-500 flex items-center justify-center text-xl shadow-md">
              🦊
            </div>
            <span className="text-[10px] text-stone-400 mt-1">Topeng Emas</span>
          </div>
        </div>

        {/* Power Meter & Throw Action */}
        {!gameDone ? (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full max-w-xs h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-600 relative">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 transition-all duration-75"
                style={{ width: `${power}%` }}
              />
              {/* Sweet spot markers */}
              <div className="absolute top-0 bottom-0 left-[30%] w-1 bg-white opacity-80" />
              <div className="absolute top-0 bottom-0 left-[60%] w-1 bg-white opacity-80" />
              <div className="absolute top-0 bottom-0 left-[85%] w-1 bg-white opacity-80" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAiming(!isAiming)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isAiming ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {isAiming ? 'Bidik Bergerak...' : 'Mulai Bidik'}
              </button>
              <button
                onClick={handleThrow}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Lempar Gelang!
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-3 bg-black/80 rounded-2xl border border-amber-500">
            <h4 className="font-bold text-amber-300 text-sm">Permainan Selesai!</h4>
            <p className="text-xs text-stone-300">
              Total Skor: <strong className="text-white">{score}</strong>
            </p>
            <button
              onClick={() => {
                setRingsLeft(5);
                setScore(0);
                setGameDone(false);
                setIsAiming(true);
              }}
              className="mt-2 px-4 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
            >
              Main Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MINI GAME 3: Kitsune Dash (Runner / Jumper) ---
const KitsuneDashGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
  onReward,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [foxY, setFoxY] = useState(0); // 0 is ground
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [hurdleX, setHurdleX] = useState(400);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    soundEngine.playClick();
    setScore(0);
    setFoxY(0);
    setHurdleX(400);
    setGameOver(false);
    setIsPlaying(true);
  };

  const jump = () => {
    if (!isPlaying || isJumping || gameOver) return;
    soundEngine.playFoxChirp();
    setIsJumping(true);
    setFoxY(65);

    setTimeout(() => {
      setFoxY(0);
      setIsJumping(false);
    }, 450);
  };

  // Refs to avoid stale closures and avoid side-effects inside state updater
  const foxYRef = useRef(foxY);
  foxYRef.current = foxY;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Loop game
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setHurdleX((prevX) => {
        const nextX = prevX - 6;

        if (nextX <= -20) {
          // Passed hurdle
          soundEngine.playCoin();
          setScore((s) => s + 1);
          return 400 + Math.random() * 50;
        }

        // Collision check (fox at x=40, width=30)
        if (nextX > 25 && nextX < 65 && foxYRef.current < 30) {
          // Crash! Trigger outside of updater
          setTimeout(() => {
            setGameOver(true);
            setIsPlaying(false);
            soundEngine.playEvolutionFanfare();
            onReward(scoreRef.current * 6 + 10, scoreRef.current * 4 + 15);
          }, 0);
          return nextX;
        }

        return nextX;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, onReward]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs font-bold">
        <span className="text-amber-300">Gerbang Torii Dilewati: {score}</span>
        <span className="text-stone-300">Spasi atau Klik untuk Lompat</span>
      </div>

      <div
        onClick={jump}
        className="relative w-full h-[240px] max-w-[460px] rounded-3xl bg-gradient-to-b from-[#1c182a] to-[#0f0c18] border-4 border-amber-800 shadow-2xl overflow-hidden cursor-pointer select-none flex flex-col justify-end"
      >
        {/* Night Sky Stars */}
        <div className="absolute top-4 left-8 text-yellow-200 text-xs">✨</div>
        <div className="absolute top-10 right-16 text-yellow-200 text-xs">✨</div>
        <div className="absolute top-6 left-1/2 text-rose-300 text-xs">🌸</div>

        {/* Running Fox */}
        <div
          className="absolute left-8 transition-all duration-150"
          style={{ bottom: `${28 + foxY}px` }}
        >
          <div className="text-3xl animate-bounce">🦊</div>
        </div>

        {/* Moving Stone Lantern / Torii Hurdle */}
        <div className="absolute" style={{ left: `${hurdleX}px`, bottom: '28px' }}>
          <div className="w-7 h-12 bg-amber-700 border-2 border-amber-950 rounded-sm flex flex-col items-center justify-center text-[10px] text-yellow-200 font-bold shadow-md">
            ⛩️
          </div>
        </div>

        {/* Ground */}
        <div className="w-full h-7 bg-gradient-to-r from-amber-900 to-amber-950 border-t-2 border-amber-600" />

        {/* Overlays */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
            <h4 className="text-base font-bold text-amber-300 mb-1 font-['Shippori_Mincho',serif]">
              Kitsune Dash (狐ダッシュ)
            </h4>
            <p className="text-xs text-stone-300 mb-3 max-w-xs">
              Klik layar untuk melompati rintangan gerbang torii dan kumpulkan koin ryo!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-lg cursor-pointer"
            >
              Mulai Berlari!
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center">
            <h4 className="text-lg font-bold text-rose-400 mb-1">Tabrakan Rintangan!</h4>
            <p className="text-xs text-stone-200 mb-3">
              Berhasil melewati <strong className="text-amber-400">{score} gerbang</strong>!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
            >
              Lari Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
