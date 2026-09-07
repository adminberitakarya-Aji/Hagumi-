import React from 'react';
import { X, Moon, Sun, Sparkles, Coins, Heart } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface OfflineReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutesAway: number;
  petName: string;
  bonusCoins: number;
}

export const OfflineReturnModal: React.FC<OfflineReturnModalProps> = ({
  isOpen,
  onClose,
  minutesAway,
  petName,
  bonusCoins,
}) => {
  if (!isOpen) return null;

  const hours = Math.floor(minutesAway / 60);
  const mins = Math.floor(minutesAway % 60);
  const timeText = hours > 0 ? `${hours} jam ${mins} menit` : `${mins} menit`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2a1d17] via-[#1c1410] to-[#120c09] text-stone-100 rounded-3xl p-6 shadow-2xl border-2 border-amber-600/70 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-950/70 border-2 border-amber-500/70 flex items-center justify-center text-3xl shadow-xl mb-3 animate-bounce">
          🏮
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold mb-2">
          <span>⛩️</span>
          <span>Laporan Kepulangan Pengasuh</span>
        </div>

        <h3 className="text-xl font-bold font-['Shippori_Mincho',serif] text-amber-200">
          Selamat Datang Kembali!
        </h3>
        <p className="text-xs text-stone-300 mt-1">
          Kamu telah bepergian selama <strong className="text-amber-400">{timeText}</strong>.
        </p>

        {/* Narrative Box */}
        <div className="my-4 p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs text-left space-y-2 text-stone-300">
          <p>
            ✨ Selama kamu pergi, <strong className="text-amber-300">{petName}</strong> bermain di pelataran tatami dan menyambut lentera malam.
          </p>
          <p>
            🍃 Roh-roh kecil kuil membawakan persembahan berkah koin ryo untukmu!
          </p>
        </div>

        {/* Reward pill */}
        <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center gap-2 text-sm font-extrabold text-amber-300 mb-5">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>+{bonusCoins} Koin Ryo Didapatkan!</span>
        </div>

        <button
          onClick={() => {
            soundEngine.playCoin();
            onClose();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          Masuk ke Ruangan Tatami
        </button>
      </div>
    </div>
  );
};
