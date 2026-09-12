/**
 * src/components/tatami/StatusBanners.tsx
 * Banner status: toast notifikasi, peringatan sakit, tidur & odekake.
 * Diekstrak dari TatamiRoom.tsx (langkah 4 refactor God component).
 */

import type { Dispatch, SetStateAction } from 'react';
import { PetData } from '../../types/game';
import { ModalKind } from './modalRegistry';
import { formatCountdown } from '../../hooks/useTimers';
import { soundEngine } from '../../utils/soundEngine';

interface StatusBannersProps {
  pet: PetData;
  toastMessage: string | null;
  dismissToast: () => void;
  sleepRemainingSeconds: number;
  odekakeRemainingSeconds: number;
  setActiveModal: Dispatch<SetStateAction<ModalKind | null>>;
  handleOpenBedroomScene: () => void;
}

export function StatusBanners({
  pet, toastMessage, dismissToast, sleepRemainingSeconds,
  odekakeRemainingSeconds, setActiveModal, handleOpenBedroomScene,
}: StatusBannersProps) {
  return (
    <>
      {/* TOAST ALERT NOTIFICATION (5 detik, klik untuk menutup) */}
      {toastMessage && (
        <div className="relative z-20 max-w-sm mx-auto my-0.5 flex-shrink-0 animate-in fade-in slide-in-from-top-1 px-2">
          <div
            onClick={dismissToast}
            role="status"
            aria-live="polite"
            title="Ketuk untuk menutup"
            className="px-3 py-1 rounded-xl bg-amber-950/95 border border-amber-500/80 text-amber-200 text-[10px] sm:text-xs font-bold shadow-lg text-center cursor-pointer hover:bg-amber-900/95 transition-colors"
          >
            {toastMessage}
          </div>
        </div>
      )}

      {/* SICK BANNER ALERT */}
      {pet.isSick && (
        <div className="relative z-20 max-w-md mx-auto my-0.5 flex-shrink-0 animate-in fade-in">
          <div
            role="alert"
            className="px-3 py-1 rounded-xl bg-rose-950/90 border border-rose-500 text-rose-200 text-[10px] sm:text-xs flex items-center justify-between gap-2 shadow-lg"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span>🤒</span>
              <span className="truncate">{pet.name} demam roh! Butuh ramuan Yakusou.</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveModal('shop');
              }}
              className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] sm:text-[10px] whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              Beli Obat
            </button>
          </div>
        </div>
      )}

      {/* RESTING SLEEP STATUS BANNER (15 MENIT NYENYAK) */}
      {pet.isSleeping && (
        <div className="relative z-20 max-w-2xl mx-auto w-full px-2 sm:px-3 mb-1 animate-in fade-in slide-in-from-top-1">
          <div
            role="status"
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-purple-950/85 backdrop-blur-md border border-purple-500/70 text-purple-200 text-xs shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm animate-pulse">💤</span>
              <span className="text-[11px] sm:text-xs">
                <strong>{pet.name}</strong> sedang tidur lelap:{' '}
                <span className="font-mono font-bold text-amber-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-400/40">
                  ⏱️ {formatCountdown(sleepRemainingSeconds)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setActiveModal('shop')}
                className="px-2 py-0.5 rounded-lg bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-[10px] font-bold border border-amber-600/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                title="Toko Tanuki tetap buka dan bisa belanja kapan saja"
                aria-label="Buka Toko Tanuki"
              >
                <span>🏪</span>
                <span className="hidden xs:inline">Toko</span>
              </button>
              <button
                onClick={handleOpenBedroomScene}
                className="px-2 py-0.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-purple-100 text-[10px] font-bold border border-purple-400/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                title="Lihat Kitsune di kamar tidur futon"
                aria-label="Lihat Kitsune di kamar tidur futon"
              >
                <span>🛏️</span>
                <span className="hidden xs:inline">Futon</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ODEKAKE TRAVEL STATUS BANNER */}
      {pet.activeOdekake && (
        <div className="relative z-20 max-w-2xl mx-auto w-full px-2 sm:px-3 mb-1 animate-in fade-in slide-in-from-top-1">
          <div
            role="status"
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-[#26160e]/95 to-[#1c100a]/90 backdrop-blur-md border border-amber-500/70 text-amber-200 text-xs shadow-lg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm animate-bounce">🎒</span>
              <span className="text-[11px] sm:text-xs truncate">
                <strong>{pet.name}</strong> berkelana ke {pet.activeOdekake.destinationName}:{' '}
                <span className="font-mono font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-400/40">
                  ⏱️ {formatCountdown(odekakeRemainingSeconds)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveModal('odekake');
                }}
                className="px-2.5 py-0.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white text-[10px] font-bold border border-amber-400/60 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
              >
                <span>🧭</span>
                <span>Periksa Tabi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
