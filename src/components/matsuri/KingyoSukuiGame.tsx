/**
 * src/components/matsuri/KingyoSukuiGame.tsx
 * Diekstrak dari MatsuriGamesModal.tsx (Revisi 6, prioritas P3) tanpa perubahan
 * perilaku: sub-komponen mini-game mandiri ber-prop onReward, agar god component
 * mengecil dan tiap game bisa diuji terpisah.
 */
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Heart, Coins } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';

// --- MINI GAME 1: Kingyo-sukui (Goldfish Scooping) ---
export const KingyoSukuiGame: React.FC<{ onReward: (coins: number, hap: number) => void }> = ({
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
