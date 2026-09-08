import React from 'react';
import { X, Award, Calendar, Heart, Shield, RefreshCw, Trophy, Flame } from 'lucide-react';
import { PetData } from '../types/game';
import { ELEMENTS_CONFIG, getRequiredExp } from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';

interface HankoAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onResetPet: () => void;
}

export const HankoAlbumModal: React.FC<HankoAlbumModalProps> = ({
  isOpen,
  onClose,
  pet,
  onResetPet,
}) => {
  if (!isOpen) return null;

  const elementInfo = ELEMENTS_CONFIG[pet.element] || ELEMENTS_CONFIG.fire;
  const birthDate = new Date(pet.birthTimestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#281f18] via-[#1c1511] to-[#120d09] text-stone-100 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-600/70 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/50 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-900/80 border border-amber-600/80 flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
            <div>
              <h3 className="text-lg font-bold font-['Shippori_Mincho',serif] text-amber-200">
                Buku Silsilah & Cap Hanko
              </h3>
              <p className="text-xs text-stone-400">
                Sertifikat Ikatan Jiwa Kuil Inari Okami
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Traditional Washi Scroll Certificate */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-[#faf5ee] text-stone-900 border-4 border-amber-800 shadow-inner space-y-4">
          {/* Certificate Title & Red Hanko Seal */}
          <div className="flex items-start justify-between border-b-2 border-stone-300 pb-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-800">
                Inari Jinja • Shinsho No Akashi
              </div>
              <h4 className="text-2xl font-bold font-['Shippori_Mincho',serif] text-stone-900 mt-0.5">
                {pet.name}
              </h4>
              <span className="text-xs text-stone-600 font-medium">
                Kitsune Roh Elemen {elementInfo.name}
              </span>
            </div>

            {/* Official Hanko Stamp */}
            <div className="w-14 h-14 rounded-xl bg-rose-600 border-2 border-rose-700 text-white font-['Shippori_Mincho',serif] font-bold text-2xl flex items-center justify-center shadow-md rotate-[-4deg]">
              {pet.hankoSignature || '福'}
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">TAHAP PERKEMBANGAN:</span>
              <span className="font-bold text-stone-900 text-sm capitalize">
                {pet.stage} ({pet.form})
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">JUMLAH EKOR SUCI:</span>
              <span className="font-bold text-rose-700 text-sm">
                {pet.tailCount} Ekor (尾)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">TINGKAT KEKUATAN ROH (LVL):</span>
              <span className="font-bold text-amber-800 text-sm">
                Level {pet.level} ({pet.exp}/{getRequiredExp(pet.level)} EXP)
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">SKOR PERAWATAN:</span>
              <span className="font-bold text-emerald-800 text-sm">
                {pet.careScore} / 100 Poin
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">BOBOT & USIA:</span>
              <span className="font-bold text-stone-800 text-sm">
                {pet.weight}g • {pet.ageDays} Hari
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100/90 border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">KEMENANGAN FESTIVAL:</span>
              <span className="font-bold text-stone-800 text-sm">
                {pet.totalMiniGamesWon} Kali
              </span>
            </div>
          </div>

          {/* Birthday stamp */}
          <div className="text-[11px] text-stone-500 pt-1 flex items-center justify-between">
            <span>Dilahirkan pada: {birthDate}</span>
            <span>Generasi Ke-{pet.generation}</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              // Konfirmasi ditangani dialog khusus di TatamiRoom (bukan window.confirm)
              soundEngine.playClick();
              onResetPet();
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mulai Generasi Baru (Permata Hōju Baru)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer"
          >
            Tutup Album
          </button>
        </div>
      </div>
    </div>
  );
};
