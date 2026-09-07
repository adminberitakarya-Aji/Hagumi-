import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coins, Heart, Gift, Award, ArrowRight } from 'lucide-react';
import { OdekakeReward } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface OdekakeReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  destinationName: string;
  destinationKanji: string;
  reward: OdekakeReward;
  onClaim: () => void;
}

export const OdekakeReturnModal: React.FC<OdekakeReturnModalProps> = ({
  isOpen,
  onClose,
  petName,
  destinationName,
  destinationKanji,
  reward,
  onClaim,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="relative max-w-lg w-full rounded-3xl bg-gradient-to-b from-[#2e1c12] via-[#20130d] to-[#140b07] border-2 border-amber-500/80 shadow-2xl p-5 sm:p-6 text-stone-100 font-['Shippori_Mincho',serif] space-y-4"
      >
        {/* Glowing Aura Effect */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Sambutan Kepulangan */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold shadow-md">
            <span>⛩️</span>
            <span>おかえりなさい • Kitsune Okaeri!</span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-amber-200 mt-1">
            {petName} Telah Kembali dari Berkelana!
          </h2>
          <p className="text-xs text-amber-400/80 font-mono">
            {destinationName} ({destinationKanji})
          </p>
        </div>

        {/* Ukiyo-e Postcard Souvenir Card */}
        <div className="relative rounded-2xl bg-[#1c120c] border border-amber-600/70 p-4 shadow-inner space-y-2.5 overflow-hidden">
          {/* Decorative Corner Seals */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-900/80 border border-rose-500/60 text-[9px] font-bold text-rose-200 uppercase tracking-widest font-mono">
            Ukiyo-e 浮世絵
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl">🎴</span>
            <div>
              <h3 className="font-bold text-sm text-amber-200">
                {reward.postcardTitle}
              </h3>
              <p className="text-[10px] text-amber-400 font-mono">
                {reward.postcardKanji}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-amber-900/50">
            "{reward.postcardStory}"
          </p>

          {/* Benih Suci jika ada */}
          {reward.seedName && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-200 text-xs">
              <span className="text-lg">🌱</span>
              <div>
                <p className="font-bold">
                  Oleh-oleh Benih Suci: {reward.seedName} ({reward.seedKanji})
                </p>
                <p className="text-[10px] text-emerald-300/80">{reward.seedDesc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hasil Perolehan Harta Karun */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-600/60">
            <div className="flex items-center justify-center text-amber-400 text-base mb-0.5">
              <Coins className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-amber-200">
              +{reward.coins}
            </div>
            <div className="text-[9px] text-amber-400/80">Koin Ryo</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-600/60">
            <div className="flex items-center justify-center text-cyan-400 text-base mb-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-cyan-200">
              +{reward.exp}
            </div>
            <div className="text-[9px] text-cyan-400/80">EXP Batin</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-600/60">
            <div className="flex items-center justify-center text-rose-400 text-base mb-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-rose-200">
              +{reward.bondingPoints}
            </div>
            <div className="text-[9px] text-rose-400/80">Ikatan Kizuna</div>
          </div>
        </div>

        {/* Tombol Terima Hadiah & Peluk Kitsune */}
        <button
          onClick={() => {
            soundEngine.playChime();
            hapticEngine.evolution();
            onClaim();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-500 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-950/80 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border border-amber-300"
        >
          <span>🙏 Simpan ke Album & Peluk {petName}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
