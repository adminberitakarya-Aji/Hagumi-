/**
 * src/components/tatami/SleepConfirmDialog.tsx
 * Dialog konfirmasi tidur 15 menit — diekstrak dari TatamiRoom.tsx.
 * CATATAN: komponen ini dirender DI DALAM DialogA11yWrapper utama TatamiRoom
 * (karena sleepConfirm adalah ModalKind), jadi sengaja tanpa wrapper sendiri
 * agar tidak terjadi focus trap bersarang.
 */

import { soundEngine } from '../../utils/soundEngine';

interface SleepConfirmDialogProps {
  petName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SleepConfirmDialog({ petName, onConfirm, onCancel }: SleepConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative max-w-md w-full rounded-2xl sm:rounded-3xl bg-stone-950/95 border-2 border-purple-500/70 p-5 sm:p-6 shadow-2xl space-y-4 text-stone-100">
        {/* Header Dialog */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-700/80 to-purple-950 border border-purple-400/80 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
            🌙
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-purple-200">
              Tidurkan {petName}?
            </h3>
            <p className="text-xs text-purple-300/80 font-['Shippori_Mincho',serif]">
              Peraduan Kasur Futon Hangat (15 Menit)
            </p>
          </div>
        </div>

        {/* Content & Details */}
        <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3.5 space-y-2.5 text-xs text-stone-200 leading-relaxed">
          <p>
            Apakah kamu ingin menidurkan <strong>{petName}</strong> di atas kasur futon?
          </p>
          <div className="space-y-1.5 pt-1 text-[11px] text-stone-300">
            <div className="flex items-center gap-2 text-purple-200 font-semibold">
              <span>⏱️</span>
              <span><strong>Durasi Tidur:</strong> 15 Menit waktu nyata</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <span>⚡</span>
              <span><strong>Pemulihan:</strong> Energi terisi penuh 100% saat bangun</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200 font-semibold">
              <span>🏪</span>
              <span><strong>Toko Tanuki:</strong> Tetap BUKA & bisa kamu kunjungi untuk belanja!</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400">
              <span>🔒</span>
              <span><strong>Menu Aktivitas Fisik:</strong> Makan, Mandi, Kuil, dan Festival diistirahatkan sejenak</span>
            </div>
          </div>
        </div>

        {/* Confirmation Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              onCancel();
            }}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs active:scale-95 transition-all cursor-pointer text-center"
          >
            Nanti Saja
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-purple-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer text-center"
          >
            <span>💤 Ya, Tidurkan (15 Menit)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
