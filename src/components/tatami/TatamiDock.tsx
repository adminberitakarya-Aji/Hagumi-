/**
 * src/components/tatami/TatamiDock.tsx
 * Dock aksi klasik (8 tombol) + footer mode switcher. Dirender saat isDockMode.
 * Diekstrak dari TatamiRoom.tsx (langkah 4 refactor God component).
 */

import type { Dispatch, SetStateAction } from 'react';
import { PetData } from '../../types/game';
import { ModalKind } from './modalRegistry';
import { formatCountdown } from '../../hooks/useTimers';
import type { ShojiTransitionConfig } from '../ShojiTransition';
import { soundEngine } from '../../utils/soundEngine';

interface TatamiDockProps {
  pet: PetData;
  isDockMode: boolean;
  setActiveModal: Dispatch<SetStateAction<ModalKind | null>>;
  triggerShoji: (config: ShojiTransitionConfig) => void;
  handleSleepingActivityBlocked: (activityName: string) => void;
  handleOpenBathScene: () => void;
  handleSleepButtonClick: () => void;
  setIsDockMode: Dispatch<SetStateAction<boolean>>;
  setIsSensuOpen: Dispatch<SetStateAction<boolean>>;
  sleepRemainingSeconds: number;
}

export function TatamiDock({
  pet, isDockMode, setActiveModal, triggerShoji, handleSleepingActivityBlocked,
  handleOpenBathScene, handleSleepButtonClick, setIsDockMode, setIsSensuOpen,
  sleepRemainingSeconds,
}: TatamiDockProps) {
  return (
    <>
      {/* CARE ACTION BUTTONS: Classic Dock (4 cols on mobile, 8 cols on desktop) */}
      {/* CARE ACTION BUTTONS: Classic Dock (4 cols on mobile, 8 cols on desktop) */}
      {isDockMode && (
        <footer className="relative z-10 max-w-4xl mx-auto w-full bg-[#1e1612]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-amber-700/70 p-1.5 sm:p-2 shadow-2xl flex-shrink-0 mb-1">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2 w-full">
            {/* 1. Makan (Bento) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Makan');
                  return;
                }
                triggerShoji({
                  label: 'Kotak Bento Jubako',
                  kanji: '🍱 食',
                  sublabel: 'Perjamuan Kuliner & Khasiat Roh',
                  onMidpoint: () => setActiveModal('bento'),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-600/60 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Makan Bento'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🍙
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-300'}`}>
                {pet.isSleeping ? 'Makan 💤' : 'Makan'}
              </span>
            </button>

            {/* 2. Mandi / Bersihkan (Pindah ke Kamar Mandi Onsen) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Mandi');
                  return;
                }
                handleOpenBathScene();
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#1e2e38] to-[#121c22] hover:from-[#2a3f4c] hover:to-[#17242c] border border-cyan-600/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Pemandian Onsen'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🛁
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-cyan-300'}`}>
                {pet.isSleeping ? 'Mandi 💤' : 'Mandi'}
              </span>
            </button>

            {/* 3. Tidur (Pindah ke Kamar Tidur Futon atau Konfirmasi Tidur) */}
            <button
              onClick={handleSleepButtonClick}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group ${
                pet.isSleeping
                  ? 'bg-gradient-to-b from-purple-900/90 to-purple-950 border-purple-400/90 text-purple-100 shadow-purple-950/60 ring-1 ring-purple-400/50'
                  : 'bg-gradient-to-b from-[#2e1c3a] to-[#1c0f24] hover:from-[#3d254e] hover:to-[#24132f] border-purple-600/70 text-stone-100'
              }`}
              title={pet.isSleeping ? 'Lihat Kamar Tidur & Sisa Waktu' : 'Tidurkan Kitsune (15 Menit)'}
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                {pet.isSleeping ? '💤' : '🛏️'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-200 mt-0.5 whitespace-nowrap">
                {pet.isSleeping ? formatCountdown(sleepRemainingSeconds) : 'Tidur'}
              </span>
            </button>

            {/* 4. Lemari Busana & Aksesoris (Wardrobe) */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Busana');
                  return;
                }
                triggerShoji({
                  label: 'Lemari Busana Miyabi',
                  kanji: '👘 衣',
                  sublabel: 'Kimono & Aksesoris Roh Kitsune',
                  onMidpoint: () => setActiveModal('wardrobe'),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3d2319] to-[#26130d] hover:from-[#4c2d20] hover:to-[#311911] border border-amber-500/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Lemari Busana'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                👘
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-200'}`}>
                {pet.isSleeping ? 'Busana 💤' : 'Busana'}
              </span>
            </button>

            {/* 5. Kuil & Omikuji / AI Chat */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Kuil Inari');
                  return;
                }
                triggerShoji({
                  label: 'Kuil Inari Okami',
                  kanji: '⛩️ 社',
                  sublabel: 'Fushimi Inari • Kotodama & Ema',
                  onMidpoint: () => setActiveModal('shrine'),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#4a1b18] to-[#2b0e0c] hover:from-[#58211d] hover:to-[#34110f] border border-rose-600/70 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Kuil Inari'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                ⛩️
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-rose-300'}`}>
                {pet.isSleeping ? 'Kuil 💤' : 'Kuil'}
              </span>
            </button>

            {/* 6. Festival Mini-Games */}
            <button
              onClick={() => {
                if (pet.isSleeping) {
                  handleSleepingActivityBlocked('Festival Matsuri');
                  return;
                }
                triggerShoji({
                  label: 'Pekan Raya Matsuri',
                  kanji: '🏮 祭',
                  sublabel: 'Natsu Matsuri • Taiko & Mini-Games',
                  onMidpoint: () => setActiveModal('matsuri'),
                });
              }}
              className={`py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl flex flex-col items-center justify-center transition-all shadow-md group ${
                pet.isSleeping
                  ? 'bg-stone-900/60 border border-stone-700/50 text-stone-500 opacity-40 grayscale-[40%] cursor-not-allowed'
                  : 'bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-600/60 text-stone-100 active:scale-95 cursor-pointer'
              }`}
              title={pet.isSleeping ? 'Kitsune sedang tidur lelap (Zzz...)' : 'Festival Matsuri'}
            >
              <span className={`text-lg sm:text-2xl transition-transform ${!pet.isSleeping ? 'group-hover:scale-110' : ''}`}>
                🎏
              </span>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${pet.isSleeping ? 'text-stone-500' : 'text-amber-300'}`}>
                {pet.isSleeping ? 'Festival 💤' : 'Festival'}
              </span>
            </button>

            {/* 7. Toko Serba Ada Tanuki (TETAP BISA DIAKSES & BELANJA!) */}
            <button
              onClick={() => {
                triggerShoji({
                  label: 'Toko Serba Ada Tanuki',
                  kanji: '🏪 店',
                  sublabel: 'Minimarket Modern Istana Rubah',
                  onMidpoint: () => setActiveModal('shop'),
                });
              }}
              className="py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-500 text-stone-100 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group ring-1 ring-amber-500/50"
              title="Toko Serba Ada Tanuki (Buka Selalu)"
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                🏪
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mt-0.5">
                Toko
              </span>
            </button>

            {/* 8. Menu Fitur Santuari */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveModal('sanctuaryMenu');
              }}
              className="py-2 px-1 sm:py-2.5 sm:px-2 min-h-[44px] rounded-xl bg-gradient-to-b from-[#3a281e] to-[#251811] hover:from-[#483327] hover:to-[#2e1f16] border border-amber-500/80 text-stone-100 flex flex-col items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer group"
              title="Menu Fitur Santuari"
            >
              <span className="text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                🏮
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mt-0.5">
                Menu
              </span>
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-stone-400">
            <span>Mode Bilah Dock Klasik</span>
            <button
              onClick={() => {
                soundEngine.playSensuOpen();
                setIsDockMode(false);
                setIsSensuOpen(true);
              }}
              className="text-amber-300 hover:text-amber-100 font-bold underline cursor-pointer"
            >
              🪭 Beralih ke Menu Kipas Sensu
            </button>
          </div>
        </footer>
      )}
    </>
  );
}
