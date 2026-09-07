import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Smartphone, MousePointer, Sparkles, Check } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';
import { ParallaxMode } from '../utils/useParallax2D';

interface ParallaxSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ParallaxMode;
  onSetMode: (mode: ParallaxMode) => void;
  x: number;
  y: number;
  hasGyroscope: boolean;
  isGyroActive: boolean;
  onRequestGyroPermission: () => Promise<boolean>;
}

export const ParallaxSettingsModal: React.FC<ParallaxSettingsModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSetMode,
  x,
  y,
  hasGyroscope,
  isGyroActive,
  onRequestGyroPermission,
}) => {
  if (!isOpen) return null;

  const handleSelectMode = (newMode: ParallaxMode) => {
    soundEngine.playClick();
    if (newMode !== 'off') {
      hapticEngine.tap();
    }
    onSetMode(newMode);
  };

  const handleRequestPermission = async () => {
    soundEngine.playClick();
    const granted = await onRequestGyroPermission();
    if (granted) {
      hapticEngine.medium();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div
          className="absolute inset-0"
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-[#1a120c] border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#2c1a11] via-[#381f13] to-[#24130b] border-b border-amber-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-900/90 border border-amber-500 flex items-center justify-center text-xl shadow-inner">
                🪞
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-200 font-['Shippori_Mincho',serif] flex items-center gap-2">
                  <span>Sensasi Kedalaman Parallax 2.5D</span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">
                    (立体視)
                  </span>
                </h2>
                <p className="text-[10px] sm:text-[11px] text-stone-400">
                  Efek optik 3D berlapis merespons kemiringan ponsel & kursor mouse
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Live Visual Gyro / Cursor Compass Ball */}
            <div className="relative w-full h-28 bg-[#120c08] border border-amber-800/60 rounded-2xl p-3 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#451a03_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              <div className="absolute w-full h-[1px] bg-amber-700/30" />
              <div className="absolute h-full w-[1px] bg-amber-700/30" />
              <div className="absolute w-20 h-20 rounded-full border border-amber-700/20" />

              {/* Dynamic Target Ball */}
              <motion.div
                className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
                animate={{
                  x: x * 48,
                  y: y * 28,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.8)] border-2 border-white flex items-center justify-center text-xs">
                  🦊
                </div>
              </motion.div>

              {/* Coords overlay */}
              <div className="absolute bottom-1.5 right-3 flex items-center gap-2 text-[9px] font-mono text-amber-400/80 bg-stone-950/80 px-2 py-0.5 rounded-md border border-amber-800/40">
                <span>X: {(x * 100).toFixed(0)}%</span>
                <span>•</span>
                <span>Y: {(y * 100).toFixed(0)}%</span>
              </div>

              <div className="absolute top-1.5 left-3 text-[9px] font-bold text-stone-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Pratinjau Sensor Real-Time</span>
              </div>
            </div>

            {/* Mode Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Intensitas Kedalaman</span>
              </label>

              {/* 1. Dynamic Mode */}
              <button
                type="button"
                onClick={() => handleSelectMode('dynamic')}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  mode === 'dynamic'
                    ? 'bg-gradient-to-r from-amber-950/90 to-amber-900/60 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#150f0b] border-stone-800 hover:border-amber-700/60 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          mode === 'dynamic' ? 'text-amber-200' : 'text-stone-300'
                        }`}
                      >
                        Dinamis (Penuh 100%)
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold text-amber-300">
                        Disarankan
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Kedalaman optik 2.5D penuh dengan pergeseran latar Gunung Fuji, Shoji & Kitsune.
                    </p>
                  </div>
                </div>
                {mode === 'dynamic' && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              </button>

              {/* 2. Subtle Mode */}
              <button
                type="button"
                onClick={() => handleSelectMode('subtle')}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  mode === 'subtle'
                    ? 'bg-gradient-to-r from-amber-950/90 to-amber-900/60 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#150f0b] border-stone-800 hover:border-amber-700/60 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍃</span>
                  <div>
                    <span
                      className={`text-xs font-bold ${
                        mode === 'subtle' ? 'text-amber-200' : 'text-stone-300'
                      }`}
                    >
                      Lembut (Subtle 50%)
                    </span>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Pergeseran santai dan tenang bagi Anda yang lebih nyaman dengan pergerakan halus.
                    </p>
                  </div>
                </div>
                {mode === 'subtle' && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              </button>

              {/* 3. Off Mode */}
              <button
                type="button"
                onClick={() => handleSelectMode('off')}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  mode === 'off'
                    ? 'bg-gradient-to-r from-stone-900 to-stone-800 border-stone-400'
                    : 'bg-[#150f0b] border-stone-800 hover:border-amber-700/60 text-stone-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛑</span>
                  <div>
                    <span
                      className={`text-xs font-bold ${
                        mode === 'off' ? 'text-stone-200' : 'text-stone-300'
                      }`}
                    >
                      Nonaktif (Statis 0%)
                    </span>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Ruangan tatami dan panorama berdiri tegak tanpa pergerakan perspektif.
                    </p>
                  </div>
                </div>
                {mode === 'off' && <Check className="w-4 h-4 text-stone-300 flex-shrink-0" />}
              </button>
            </div>

            {/* Sensor Status Information */}
            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Sensor Giroskop Ponsel:</span>
                </span>
                <span className="font-bold">
                  {isGyroActive ? (
                    <span className="text-emerald-400">Aktif & Merespons</span>
                  ) : hasGyroscope ? (
                    <span className="text-amber-400">Tersedia</span>
                  ) : (
                    <span className="text-stone-400">Tidak Terdeteksi</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kursor Mouse Desktop:</span>
                </span>
                <span className="text-emerald-400 font-bold">Siap Digunakan</span>
              </div>

              {/* iOS Permission Button if needed */}
              {typeof window !== 'undefined' &&
                typeof (
                  DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
                ).requestPermission === 'function' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-sky-900/80 hover:bg-sky-800 border border-sky-600 text-sky-200 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Aktifkan Izin Gerak Sensor (iOS)</span>
                  </button>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-stone-950/80 border-t border-amber-900/40 flex items-center justify-end">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Simpan & Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
