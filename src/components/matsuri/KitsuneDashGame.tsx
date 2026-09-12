/**
 * src/components/matsuri/KitsuneDashGame.tsx
 * Diekstrak dari MatsuriGamesModal.tsx (Revisi 6, prioritas P3) tanpa perubahan
 * perilaku: sub-komponen mini-game mandiri ber-prop onReward, agar god component
 * mengecil dan tiap game bisa diuji terpisah.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Coins } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';

// --- MINI GAME 3: Kitsune Dash (Runner / Jumper) ---
export const KitsuneDashGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
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
