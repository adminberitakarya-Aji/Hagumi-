/**
 * src/components/matsuri/WanageGame.tsx
 * Diekstrak dari MatsuriGamesModal.tsx (Revisi 6, prioritas P3) tanpa perubahan
 * perilaku: sub-komponen mini-game mandiri ber-prop onReward, agar god component
 * mengecil dan tiap game bisa diuji terpisah.
 */
import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { hapticEngine } from '../../utils/hapticFeedback';
import {
  scoreWanageThrow,
  advancePowerMeter,
  calculateWanageReward,
} from '../../utils/matsuri/wanageLogic';

// --- MINI GAME 2: Wanage (Ring Toss) ---
export const WanageGame: React.FC<{ onReward: (coins: number, hap: number, disciplineGained?: number) => void }> = ({ onReward }) => {
  const [ringsLeft, setRingsLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [power, setPower] = useState(50);
  const [isAiming, setIsAiming] = useState(false);
  const [gameDone, setGameDone] = useState(false);

  // Oscillating power meter
  useEffect(() => {
    if (!isAiming || gameDone) return;
    const interval = setInterval(() => {
      setPower((p) => advancePowerMeter(p));
    }, 30);
    return () => clearInterval(interval);
  }, [isAiming, gameDone]);

  const handleThrow = () => {
    if (ringsLeft <= 0 || gameDone) return;
    soundEngine.playClick();

    // Calculate score based on power sweet spot (logika di utils/matsuri/wanageLogic.ts)
    const points = scoreWanageThrow(power);

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
      // Formula reward di utils/matsuri/wanageLogic.ts.
      const { coins, happiness, discipline } = calculateWanageReward(nextScore);
      onReward(coins, happiness, discipline);
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
