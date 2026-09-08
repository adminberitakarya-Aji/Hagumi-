/**
 * src/components/tatami/ResetConfirmDialog.tsx
 * Dialog konfirmasi "Mulai Generasi Baru" (reset pet) — aksi destruktif permanen.
 * Diekstrak dari TatamiRoom.tsx; punya DialogA11yWrapper sendiri karena dirender
 * DI LUAR wrapper modal utama (modal hanko sudah ditutup saat dialog ini muncul).
 */

import { DialogA11yWrapper } from '../../hooks/useDialogA11y';
import { soundEngine } from '../../utils/soundEngine';

interface ResetConfirmDialogProps {
  petName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmDialog({ petName, onConfirm, onCancel }: ResetConfirmDialogProps) {
  return (
    <DialogA11yWrapper isActive={true} onClose={onCancel} label="Konfirmasi Mulai Generasi Baru">
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-rose-950/70 backdrop-blur-sm animate-in fade-in select-none">
        <div className="relative max-w-md w-full rounded-2xl sm:rounded-3xl bg-stone-950/95 border-2 border-rose-500/80 p-5 sm:p-6 shadow-2xl space-y-4 text-stone-100">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-800/80 to-stone-950 border border-rose-400/80 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
              🕊️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-rose-200">
                Lepaskan {petName}?
              </h3>
              <p className="text-xs text-rose-300/80 font-['Shippori_Mincho',serif]">
                Upacara Perpisahan dari Kuil Inari
              </p>
            </div>
          </div>

          {/* Peringatan konsekuensi */}
          <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3.5 space-y-2 text-xs text-stone-200 leading-relaxed">
            <p>
              <strong className="text-rose-300">Tindakan ini PERMANEN</strong> dan tidak dapat
              dibatalkan. Melepas Kitsune ke kuil agung berarti:
            </p>
            <ul className="space-y-1.5 text-[11px] text-stone-300 list-disc list-inside">
              <li>Semua progres, level & EXP <strong>{petName}</strong> dihapus</li>
              <li>Koin Ryo, koleksi & dekorasi santuari ikut hilang</li>
              <li>Permata roh Hōju baru akan lahir sebagai Kitsune generasi berikutnya</li>
            </ul>
            <p className="text-[11px] text-amber-300/90">
              💾 Ingin menyimpan kenangan dulu? Gunakan <strong>Backup Santuari</strong> di
              Menu Fitur sebelum melanjutkan.
            </p>
          </div>

          {/* Tombol */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                onCancel();
              }}
              className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 font-bold text-xs active:scale-95 transition-all cursor-pointer text-center"
            >
              Batal, Tetap Rawat
            </button>
            <button
              onClick={onConfirm}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer text-center"
            >
              <span>🕊️ Ya, Lepaskan</span>
            </button>
          </div>
        </div>
      </div>
    </DialogA11yWrapper>
  );
}
