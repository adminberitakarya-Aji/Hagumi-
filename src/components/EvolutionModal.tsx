import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { PetData } from '../types/game';
import { EvolutionTarget } from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';

interface EvolutionModalProps {
  isOpen: boolean;
  evolutionTarget: EvolutionTarget;
  pet: PetData;
  onConfirmEvolution: () => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen,
  evolutionTarget,
  pet,
  onConfirmEvolution,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playEvolutionFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#dc2626', '#e0e7ff', '#fbbf24'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#381e13] via-[#20130d] to-[#120a06] text-stone-100 rounded-3xl p-6 shadow-2xl border-4 border-amber-500 text-center">
        {/* Shimenawa Torii Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500 text-amber-300 text-xs font-bold mb-3 shadow-md">
          <span>⛩️</span>
          <span>Upacara Kebangkitan Roh • Shinka (進化)</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-['Shippori_Mincho',serif] text-amber-200 tracking-wide">
          Evolusi Spiritual Terwujud!
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
          Kasih sayang dan ketulusanmu merawat {pet.name} membuka simpul kekuatan suci Kitsune!
        </p>

        {/* Evolution Transition Cards */}
        <div className="my-6 flex items-center justify-center gap-3">
          {/* Current Form */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-700 flex flex-col items-center w-36">
            <span className="text-2xl mb-1">🦊</span>
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Sebelum
            </span>
            <span className="text-sm font-bold text-stone-200 capitalize">
              {pet.stage}
            </span>
            <span className="text-[10px] text-amber-400 mt-0.5">
              {pet.tailCount} Ekor
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shadow-lg text-stone-950">
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </div>

          {/* New Form */}
          <div className="p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-400 flex flex-col items-center w-36 shadow-xl">
            <span className="text-3xl mb-1 animate-bounce">✨</span>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Wujud Baru
            </span>
            <span className="text-sm font-extrabold text-amber-100 font-['Shippori_Mincho',serif]">
              {evolutionTarget.name}
            </span>
            <span className="text-[10px] font-bold text-amber-300 mt-0.5">
              {evolutionTarget.tailCount} Ekor Suci!
            </span>
          </div>
        </div>

        {/* Description Box */}
        <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 mb-6 text-left">
          <p className="font-bold text-amber-300 font-['Shippori_Mincho',serif] mb-1">
            Tentang Wujud Baru {evolutionTarget.japanese}:
          </p>
          <p className="leading-relaxed text-stone-400">
            {evolutionTarget.description}
          </p>
        </div>

        {/* Accept Button */}
        <button
          onClick={() => {
            soundEngine.playShrineBell();
            onConfirmEvolution();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Sambut Wujud Suci {pet.name}!</span>
        </button>
      </div>
    </div>
  );
};
