import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

export interface SensuItem {
  id: string;
  label: string;
  kanji: string;
  sublabel: string;
  icon: string;
  color: string;
  border: string;
  badge?: string | number;
  onClick: () => void;
}

interface SensuFanHUDProps {
  items: SensuItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  isDockMode: boolean;
  onToggleDockMode: () => void;
}

export const SensuFanHUD: React.FC<SensuFanHUDProps> = ({
  items,
  isOpen,
  onToggle,
  onClose,
  isDockMode,
  onToggleDockMode,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // UX: penjelasan satu kali untuk pemain yang baru pertama kali membuka
  // Menu Sensu (radial fan) — mengurangi kebingungan dua mode navigasi.
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hagumi_sensu_intro_seen') !== 'true';
    } catch {
      return false;
    }
  });

  const handleDismissIntro = () => {
    soundEngine.playClick();
    try {
      localStorage.setItem('hagumi_sensu_intro_seen', 'true');
    } catch {
      /* penyimpanan gagal diabaikan — intro tetap ditutup untuk sesi ini */
    }
    setShowIntro(false);
  };

  const handleTrigger = () => {
    if (isOpen) {
      soundEngine.playSensuClose();
      hapticEngine.sensuClose();
      onClose();
    } else {
      soundEngine.playSensuOpen();
      hapticEngine.sensuOpen();
      onToggle();
    }
  };

  const handleSelect = (item: SensuItem) => {
    soundEngine.playSensuClose();
    hapticEngine.tap();
    onClose();
    item.onClick();
  };

  // Upward fan arc: from left (195 deg) to right (345 deg)
  // Total span = 150 degrees, centered at 270 deg (straight up)
  const totalItems = items.length;
  const startAngle = 195;
  const endAngle = 345;
  const angleStep = totalItems > 1 ? (endAngle - startAngle) / (totalItems - 1) : 0;

  return (
    <>
      {/* Dimmed atmospheric backdrop when fan is unfolded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-all cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              soundEngine.playSensuClose();
              hapticEngine.sensuClose();
              onClose();
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Fan HUD Container fixed at bottom center */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none pointer-events-none">
        {/* The Radial Fan Blades when opened */}
        <AnimatePresence>
          {isOpen && (
            <div
              id="sensu-fan-menu"
              className="relative w-0 h-0 pointer-events-auto"
              role="menu"
              aria-label="Menu Kipas Sensu"
            >
              {/* Fan Washi Paper Arc Background Webbing */}
              <motion.div
                className="absolute left-1/2 bottom-4 -translate-x-1/2 origin-bottom pointer-events-none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="w-72 h-44 sm:w-96 sm:h-56 rounded-t-full bg-gradient-to-t from-[#2a170f]/95 via-[#3d2217]/90 to-[#5a3220]/80 border-t-2 border-x-2 border-amber-500/50 shadow-[0_-10px_35px_rgba(0,0,0,0.8),inset_0_2px_8px_rgba(245,158,11,0.2)] overflow-hidden"
                  style={{
                    clipPath: 'polygon(50% 100%, 0% 15%, 5% 0%, 95% 0%, 100% 15%)',
                  }}
                >
                  {/* Subtle traditional seigaiha / gold cloud shimmer */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />
                  <div className="absolute top-2 inset-x-0 flex justify-center opacity-40">
                    <span className="text-amber-300 text-xs tracking-[0.5em] font-['Shippori_Mincho',serif]">
                      ⛩️ 八咫烏 • 稲荷大明神 🌾
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Fan Blades (Ribs) radiating out */}
              {items.map((item, index) => {
                const angleDeg = startAngle + index * angleStep;
                const angleRad = (angleDeg * Math.PI) / 180;
                // Responsive distance: 115px on small screens, 128px on mobile, 175px on tablet/desktop
                const distanceMobile = typeof window !== 'undefined' && window.innerWidth < 380 ? 115 : 128;
                const distanceDesktop = 175;
                const distance = typeof window !== 'undefined' && window.innerWidth < 640 ? distanceMobile : distanceDesktop;

                const isHovered = hoveredIdx === index;

                return (
                  <motion.div
                    key={item.id}
                    className="absolute left-0 bottom-0 pointer-events-auto"
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      x: Math.cos(angleRad) * distance,
                      y: Math.sin(angleRad) * distance,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 0,
                      transition: { duration: 0.18 },
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 24,
                      delay: index * 0.022,
                    }}
                  >
                    {/* Centered blade card */}
                    <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <button
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => {
                          setHoveredIdx(index);
                          soundEngine.playSensuRibHover();
                          hapticEngine.softTap();
                        }}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className={`group relative flex flex-col items-center justify-center p-1.5 xs:p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b ${item.color} ${item.border} border-2 shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all transform active:scale-90 hover:scale-115 hover:-translate-y-1 cursor-pointer w-13 xs:w-14 sm:w-16 h-14 xs:h-15 sm:h-17`}
                        title={`${item.label} (${item.sublabel})`}
                        aria-label={`${item.label} — ${item.sublabel}`}
                      >
                        {/* Bamboo rib connector line back to pivot */}
                        <div
                          className="absolute w-0.5 h-16 bg-gradient-to-b from-amber-700/80 to-transparent pointer-events-none -z-10"
                          style={{
                            top: '100%',
                            left: '50%',
                            transformOrigin: 'top center',
                            transform: `rotate(${-(angleDeg - 270)}deg)`,
                          }}
                        />

                        {/* Top Kanji Crest */}
                        <span className="text-[10px] sm:text-xs font-black text-amber-300 font-['Shippori_Mincho',serif] drop-shadow-sm leading-none">
                          {item.kanji}
                        </span>

                        {/* Center Icon */}
                        <span className="text-xl sm:text-2xl filter drop-shadow group-hover:rotate-6 transition-transform">
                          {item.icon}
                        </span>

                        {/* Bottom Short Label */}
                        <span className="text-[9px] sm:text-[10px] font-bold text-stone-200 tracking-tight leading-none mt-0.5 whitespace-nowrap">
                          {item.label}
                        </span>

                        {/* Badge if present */}
                        {item.badge !== undefined && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-extrabold text-[9px] border border-rose-300 shadow-md">
                            {item.badge}
                          </span>
                        )}

                        {/* Gold Aura on Hover */}
                        {isHovered && (
                          <motion.div
                            layoutId="sensu-aura"
                            className="absolute -inset-1 rounded-2xl border border-amber-300/80 shadow-[0_0_15px_rgba(245,158,11,0.6)] pointer-events-none"
                          />
                        )}
                      </button>

                      {/* Tooltip description hovering below blade */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-1.5 px-2 py-0.5 rounded-lg bg-black/90 border border-amber-500/70 text-amber-200 text-[10px] whitespace-nowrap shadow-lg pointer-events-none z-30 font-medium"
                        >
                          {item.sublabel}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* The Sensu Pivot / Kaname Handle Button: Only rendered when NOT in Dock Mode */}
        {!isDockMode && (
          <div className="relative pointer-events-auto flex flex-col items-center gap-2">
            {/* UX: caption penjelasan — tampil hanya saat pertama kali kipas terbuka */}
            {isOpen && showIntro && (
              <div
                role="status"
                className="flex items-center gap-2 max-w-[340px] px-3 py-1.5 rounded-xl bg-black/90 border border-amber-500/70 text-amber-200 text-[11px] shadow-lg animate-in fade-in"
              >
                <span aria-hidden="true">🪭</span>
                <span className="leading-snug">
                  Menu Sensu — semua ritual santuari ada di kipas ini. Tekan{' '}
                  <strong className="text-amber-100">📱 Dock Mode</strong> untuk kembali ke bilah aksi klasik.
                </span>
                <button
                  onClick={handleDismissIntro}
                  aria-label="Tutup penjelasan Menu Sensu"
                  title="Tutup penjelasan"
                  className="p-1 rounded-lg bg-stone-900/80 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-white cursor-pointer flex-shrink-0"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            )}
            <div className="relative flex items-center gap-1.5 sm:gap-2">
            {/* Main Sensu Trigger Button */}
            <motion.button
              onClick={handleTrigger}
              whileTap={{ scale: 0.9 }}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 rounded-full border-2 transition-all shadow-[0_10px_25px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.25)] cursor-pointer group ${
                isOpen
                  ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-rose-400 text-amber-100'
                  : 'bg-gradient-to-r from-[#2e1a11] via-[#422518] to-[#26150e] border-amber-500 hover:border-amber-300 text-amber-200 hover:brightness-110'
              }`}
              title={isOpen ? 'Tutup Kipas Sensu' : 'Buka Menu Kipas Sensu (Sensu Radial Fan HUD)'}
              aria-label={isOpen ? 'Tutup Kipas Sensu' : 'Buka Menu Kipas Sensu'}
              aria-expanded={isOpen}
              aria-controls="sensu-fan-menu"
            >
              {/* Pulsing Gold Halo when closed */}
              {!isOpen && (
                <span className="absolute -inset-1 rounded-full bg-amber-500/20 blur-sm animate-pulse pointer-events-none" />
              )}

              {/* Left Fan/Sensu Icon */}
              <span
                className={`text-lg xs:text-xl sm:text-2xl transition-transform duration-300 ${
                  isOpen ? 'rotate-90 scale-110 text-rose-300' : 'group-hover:rotate-12'
                }`}
              >
                🪭
              </span>

              {/* Middle Label */}
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[9px] xs:text-[10px] text-amber-400/90 tracking-wider xs:tracking-widest font-['Shippori_Mincho',serif] font-bold">
                  {isOpen ? '閉じる • TUTUP' : '扇子 • SENSU'}
                </span>
                <span className="text-[11px] xs:text-xs sm:text-sm font-black text-stone-100 tracking-wide">
                  {isOpen ? 'Tutup Kipas' : 'Menu Ritual'}
                </span>
              </div>

              {/* Right Pivot Pin (Kaname) Motif */}
              <div className="w-4 h-4 xs:w-5 xs:h-5 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 border border-amber-300 flex items-center justify-center shadow-inner ml-0.5 xs:ml-1">
                <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-[#1e100a]" />
              </div>

              {/* Traditional Tassel Hanging below Kaname */}
              <div className="absolute -bottom-2.5 xs:-bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="w-0.5 h-2.5 xs:h-3 bg-gradient-to-b from-rose-600 to-amber-600" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
              </div>
            </motion.button>

            {/* Quick Toggle: Switch back to Classic Dock */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleDockMode();
              }}
              title="Beralih ke Bilah Dock Klasik"
              aria-label="Beralih ke Bilah Dock Klasik"
              className="px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-3 sm:py-2.5 rounded-full bg-[#1d120c]/90 border border-amber-600/70 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 cursor-pointer backdrop-blur-sm"
            >
              <span>📱</span>
              <span className="hidden sm:inline text-[10px]">
                Dock Mode
              </span>
            </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
