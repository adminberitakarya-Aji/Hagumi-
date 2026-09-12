/**
 * src/components/matsuri/TaikoRhythmGame.tsx
 * Diekstrak dari MatsuriGamesModal.tsx (Revisi 6, prioritas P3) tanpa perubahan
 * perilaku: sub-komponen mini-game mandiri ber-prop onReward, agar god component
 * mengecil dan tiap game bisa diuji terpisah.
 */
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Coins } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';
import {
  findClosestUnhitNote,
  judgeTaikoHit,
  nextSpawnType,
  calculateTaikoReward,
  HIT_TARGET_X,
  MISS_LINE_X,
  type TaikoNote,
} from '../../utils/matsuri/taikoLogic';

export const TaikoRhythmGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
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

    // T2 (Revisi 8): logika judgment diekstrak ke utils/matsuri/taikoLogic.ts
    const closest = findClosestUnhitNote(notesRef.current, HIT_TARGET_X);
    if (closest) {
      const result = judgeTaikoHit(closest.note.type, hitType, closest.distance, combo);
      closest.note.hit = true;
      if (result.judgment === 'wrong-type') {
        // Wrong drum hit type!
        setCombo(0);
        setMissCount((m) => m + 1);
        setLastJudgment({ text: '不可 MISS', color: 'text-rose-400' });
      } else {
        setScore((s) => s + result.points);
        setCombo((c) => {
          const next = result.nextCombo;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
        if (result.judgment === 'perfect') {
          // PERFECT / 良 (Ryou)
          setPerfectCount((p) => p + 1);
          setLastJudgment({ text: '良！PERFECT', color: 'text-amber-300' });
        } else {
          // GOOD / 可 (Ka)
          setGoodCount((g) => g + 1);
          setLastJudgment({ text: '可！GOOD', color: 'text-sky-300' });
        }
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

        // Calculate rewards (formula di utils/matsuri/taikoLogic.ts)
        const finalScore = score;
        const { coins: rewardCoins, happiness: rewardHap } = calculateTaikoReward(finalScore);
        onReward(rewardCoins, rewardHap);
        return;
      }

      // Spawn new notes in musical patterns
      const spawnInterval = 750; // ms per note
      if (now - lastSpawnTimeRef.current >= spawnInterval) {
        lastSpawnTimeRef.current = now;
        // 65% chance DON, 35% chance KA (logika di utils/matsuri/taikoLogic.ts)
        const type: 'don' | 'ka' = nextSpawnType();
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
        if (!note.hit && note.x < MISS_LINE_X) {
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
