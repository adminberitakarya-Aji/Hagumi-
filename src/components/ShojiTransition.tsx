import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

export interface ShojiTransitionConfig {
  label?: string;
  kanji?: string;
  sublabel?: string;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

interface ShojiTransitionProps {
  isActive: boolean;
  config: ShojiTransitionConfig | null;
  onFinished: () => void;
}

export const ShojiTransition: React.FC<ShojiTransitionProps> = ({
  isActive,
  config,
  onFinished,
}) => {
  // Phase: 'idle' | 'entering' | 'holding' | 'exiting'
  const [phase, setPhase] = useState<'idle' | 'entering' | 'holding' | 'exiting'>('idle');

  // Keep latest callbacks in refs so re-renders do not invalidate timers
  const configRef = useRef(config);
  configRef.current = config;

  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  };

  const finishTransition = () => {
    clearAllTimers();
    setPhase('idle');
    if (configRef.current?.onComplete) {
      try {
        configRef.current.onComplete();
      } catch (err) {
        console.error('Shoji onComplete error:', err);
      }
    }
    onFinishedRef.current();
  };

  // Trigger sequence strictly when isActive transitions to true
  useEffect(() => {
    if (!isActive) {
      clearAllTimers();
      setPhase('idle');
      return;
    }

    // Begin sequence
    clearAllTimers();
    setPhase('entering');

    try {
      soundEngine.playShojiSlide();
      hapticEngine.shojiSlide();
    } catch {
      // safe fallback
    }

    // 1. Doors slide to center and meet (340ms)
    const t1 = setTimeout(() => {
      setPhase('holding');
      try {
        soundEngine.playShojiClose();
        hapticEngine.shojiClose();
      } catch {
        // safe fallback
      }

      // Midpoint callback (e.g. switch modal behind closed doors)
      if (configRef.current?.onMidpoint) {
        try {
          configRef.current.onMidpoint();
        } catch (err) {
          console.error('Shoji onMidpoint error:', err);
        }
      }

      // 2. Hold momentarily for traditional seal aesthetic (220ms)
      const t2 = setTimeout(() => {
        setPhase('exiting');
        try {
          soundEngine.playShojiOpen();
        } catch {
          // safe fallback
        }

        // 3. Doors fully slide open (340ms)
        const t3 = setTimeout(() => {
          finishTransition();
        }, 340);
        timerRefs.current.push(t3);
      }, 220);
      timerRefs.current.push(t2);
    }, 340);
    timerRefs.current.push(t1);

    // 4. Absolute fail-safe: automatically dismiss after 1.2s regardless of any freeze
    const safetyTimer = setTimeout(() => {
      finishTransition();
    }, 1200);
    timerRefs.current.push(safetyTimer);

    return () => {
      clearAllTimers();
    };
  }, [isActive]);

  if (!isActive && phase === 'idle') return null;

  const isClosedOrHolding = phase === 'entering' || phase === 'holding';

  return (
    <div
      id="shoji-transition-overlay"
      className="fixed inset-0 z-[100] overflow-hidden flex cursor-pointer"
      onClick={finishTransition}
      title="Klik untuk membuka pintu shoji"
    >
      {/* Top Camber / Ranma Wooden Track Bar */}
      <div className="absolute top-0 inset-x-0 h-4 sm:h-5 bg-[#20140e] border-b border-[#3b2318] z-20 shadow-md flex items-center justify-around px-8 pointer-events-none">
        <div className="w-full h-1 bg-[#150c08] rounded-full opacity-70" />
      </div>

      {/* Bottom Sill / Shikii Wooden Rail */}
      <div className="absolute bottom-0 inset-x-0 h-5 sm:h-6 bg-[#1a0f0a] border-t border-[#3d2417] z-20 shadow-inner flex items-center justify-around px-6 pointer-events-none">
        <div className="w-full h-1.5 bg-[#0e0705] rounded-full opacity-80" />
      </div>

      {/* LEFT SHOJI DOOR */}
      <motion.div
        className="relative w-1/2 h-full bg-[#18100c] border-r-2 border-[#120a07] shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{
          x: isClosedOrHolding ? '0%' : '-100%',
        }}
        transition={{
          duration: phase === 'entering' ? 0.32 : 0.34,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Door Outer Wooden Frame (Cedar/Hinoki) */}
        <div className="absolute inset-0 border-y-8 border-l-8 sm:border-y-12 sm:border-l-12 border-[#2b1a12] pointer-events-none z-10 shadow-inner" />

        {/* Kumiko Paper Grid (Translucent Washi) */}
        <div className="relative flex-1 m-3 sm:m-5 bg-[#fbf7ee] bg-opacity-[0.96] rounded-sm overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Subtle Washi Paper Texture overlay */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#d6c7ab 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />

          {/* Warm backlighting gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#ffe8cb]/40 via-transparent to-[#ffdca8]/30 pointer-events-none" />

          {/* Kumiko Wooden Lattice Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-5 grid-rows-8 sm:grid-rows-10 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`left-grid-${i}`}
                className="border-r border-b border-[#8a5d3b]/35 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              />
            ))}
          </div>

          {/* Traditional Maki-e Gold Cloud Motifs (Suyari-gasumi) on Lower Paper */}
          <div className="absolute bottom-16 sm:bottom-24 left-4 right-4 h-16 pointer-events-none opacity-45 flex items-end">
            <svg viewBox="0 0 200 40" className="w-full h-10 text-amber-700/60 fill-current">
              <path d="M0 25 Q30 10, 60 25 T120 25 T180 20 T200 25 L200 40 L0 40 Z" opacity="0.6" />
              <path d="M10 32 Q40 18, 70 30 T130 28 T190 26 L200 40 L10 40 Z" opacity="0.4" />
            </svg>
          </div>

          {/* Solid Wood Bottom Kickplate (Koshizaka) */}
          <div className="relative z-10 mt-auto h-24 sm:h-32 bg-gradient-to-t from-[#20130d] via-[#2f1c13] to-[#3a2217] border-t-4 border-[#1c100a] px-3 py-2 flex flex-col justify-center items-center shadow-lg">
            <div className="w-full h-full border border-amber-900/40 rounded flex items-center justify-center bg-[#180e09]/40">
              <span className="text-amber-600/30 text-2xl tracking-widest font-['Shippori_Mincho',serif] select-none">
                ⛩️ 伏見
              </span>
            </div>
          </div>
        </div>

        {/* Traditional Recessed Circular Door Handle (Hikite) on Right Edge */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-16 sm:h-20 rounded-full bg-gradient-to-r from-[#170e0a] to-[#2b1b13] border-2 border-[#573724] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),2px_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
          <div className="w-5 sm:w-6 h-11 sm:h-14 rounded-full bg-[#110906] border border-amber-700/40 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-6 bg-gradient-to-b from-amber-600/60 to-amber-800/40 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* RIGHT SHOJI DOOR */}
      <motion.div
        className="relative w-1/2 h-full bg-[#18100c] border-l-2 border-[#120a07] shadow-[10px_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden"
        initial={{ x: '100%' }}
        animate={{
          x: isClosedOrHolding ? '0%' : '100%',
        }}
        transition={{
          duration: phase === 'entering' ? 0.35 : 0.38,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Door Outer Wooden Frame (Cedar/Hinoki) */}
        <div className="absolute inset-0 border-y-8 border-r-8 sm:border-y-12 sm:border-r-12 border-[#2b1a12] pointer-events-none z-10 shadow-inner" />

        {/* Kumiko Paper Grid (Translucent Washi) */}
        <div className="relative flex-1 m-3 sm:m-5 bg-[#fbf7ee] bg-opacity-[0.96] rounded-sm overflow-hidden flex flex-col justify-between shadow-inner">
          {/* Subtle Washi Paper Texture overlay */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#d6c7ab 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />

          {/* Warm backlighting gradient */}
          <div className="absolute inset-0 bg-gradient-to-tl from-[#ffe8cb]/40 via-transparent to-[#ffdca8]/30 pointer-events-none" />

          {/* Kumiko Wooden Lattice Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-5 grid-rows-8 sm:grid-rows-10 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`right-grid-${i}`}
                className="border-l border-b border-[#8a5d3b]/35 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              />
            ))}
          </div>

          {/* Traditional Maki-e Gold Cloud Motifs (Suyari-gasumi) on Lower Paper */}
          <div className="absolute bottom-16 sm:bottom-24 left-4 right-4 h-16 pointer-events-none opacity-45 flex items-end justify-end">
            <svg viewBox="0 0 200 40" className="w-full h-10 text-amber-700/60 fill-current">
              <path d="M200 25 Q170 10, 140 25 T80 25 T20 20 T0 25 L0 40 L200 40 Z" opacity="0.6" />
              <path d="M190 32 Q160 18, 130 30 T70 28 T10 26 L0 40 L190 40 Z" opacity="0.4" />
            </svg>
          </div>

          {/* Solid Wood Bottom Kickplate (Koshizaka) */}
          <div className="relative z-10 mt-auto h-24 sm:h-32 bg-gradient-to-t from-[#20130d] via-[#2f1c13] to-[#3a2217] border-t-4 border-[#1c100a] px-3 py-2 flex flex-col justify-center items-center shadow-lg">
            <div className="w-full h-full border border-amber-900/40 rounded flex items-center justify-center bg-[#180e09]/40">
              <span className="text-amber-600/30 text-2xl tracking-widest font-['Shippori_Mincho',serif] select-none">
                稲荷 🌾
              </span>
            </div>
          </div>
        </div>

        {/* Traditional Recessed Circular Door Handle (Hikite) on Left Edge */}
        <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-16 sm:h-20 rounded-full bg-gradient-to-r from-[#2b1b13] to-[#170e0a] border-2 border-[#573724] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),-2px_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
          <div className="w-5 sm:w-6 h-11 sm:h-14 rounded-full bg-[#110906] border border-amber-700/40 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-6 bg-gradient-to-b from-amber-600/60 to-amber-800/40 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* CENTER CREST / HANKO CALLIGRAPHY SEAL AT MIDPOINT */}
      <AnimatePresence>
        {phase === 'holding' && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Center Vermillion Seal & Plaque */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Outer Golden Aura Glow */}
              <div className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />

              {/* Decorative Red Cord & Inari Tassel */}
              <div className="w-1 h-8 bg-gradient-to-b from-rose-700 to-rose-900 shadow-md" />

              {/* Central Inari Vermillion Seal Plaque */}
              <div className="px-6 py-4 sm:px-8 sm:py-5 rounded-2xl bg-gradient-to-b from-[#881337] via-[#500724] to-[#380417] border-2 border-amber-500/90 shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.2)] flex flex-col items-center gap-1.5 text-center">
                {/* Kanji Seal */}
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-200 tracking-widest font-['Shippori_Mincho',serif] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {config?.kanji || '⛩️ 縁'}
                </div>

                {/* Primary Destination Label */}
                <div className="text-sm sm:text-base font-black text-amber-100 tracking-wider">
                  {config?.label || 'Gerbang Spiritual Terbuka'}
                </div>

                {/* Subtitle / Japanese Calligraphy Hint */}
                <div className="text-[10px] sm:text-xs text-amber-300/80 font-medium tracking-widest">
                  {config?.sublabel || 'Hagumi • Inari Sanctuary'}
                </div>
              </div>

              {/* Bottom Hanging Tassel */}
              <div className="w-1 h-6 bg-gradient-to-b from-rose-800 to-amber-700/80" />
              <div className="w-4 h-4 rounded-full bg-amber-600 border border-amber-300 shadow-sm flex items-center justify-center text-[8px] text-amber-950 font-bold">
                ✦
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
