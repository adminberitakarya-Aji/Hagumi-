import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Sparkles, Volume2, Check } from 'lucide-react';
import { hapticEngine, HapticIntensity, HapticProfile } from '../utils/hapticFeedback';
import { soundEngine } from '../utils/soundEngine';

interface HapticSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HapticSettingsModal: React.FC<HapticSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(hapticEngine.getConfig());
  const [lastTested, setLastTested] = useState<string | null>(null);

  useEffect(() => {
    return hapticEngine.subscribe((newCfg) => setConfig(newCfg));
  }, []);

  if (!isOpen) return null;

  const handleSelectIntensity = (intensity: HapticIntensity) => {
    hapticEngine.setIntensity(intensity);
    soundEngine.playClick();
  };

  const handleTest = (profile: HapticProfile, name: string, soundFn?: () => void) => {
    setLastTested(name);
    if (soundFn) soundFn();
    hapticEngine.trigger(profile);
    setTimeout(() => setLastTested(null), 800);
  };

  const testPresets: {
    id: HapticProfile;
    name: string;
    sublabel: string;
    icon: string;
    soundFn?: () => void;
  }[] = [
    {
      id: 'petPurr',
      name: 'Elusan & Dengkuran Kitsune',
      sublabel: 'Getaran ritmik lembut saat membelai bulu rubah',
      icon: '🦊',
      soundFn: () => soundEngine.playFoxChirp(),
    },
    {
      id: 'shojiClose',
      name: 'Pintu Shoji & Katup Kayu',
      sublabel: 'Gesekan kertas washi & ketukan kayu rapat',
      icon: '🚪',
      soundFn: () => {
        soundEngine.playShojiSlide();
        setTimeout(() => soundEngine.playShojiClose(), 200);
      },
    },
    {
      id: 'sensuOpen',
      name: 'Kibasan Kipas Lipat Sensu',
      sublabel: 'Hentakan staccato bilah bambu yang merekah',
      icon: '🪭',
      soundFn: () => soundEngine.playSensuOpen(),
    },
    {
      id: 'bell',
      name: 'Genta Suci Kuil Inari',
      sublabel: 'Resonansi dengung lonceng torii berkepanjangan',
      icon: '⛩️',
      soundFn: () => soundEngine.playShrineBell(),
    },
    {
      id: 'taiko',
      name: 'Tabuhan Gendang Taiko',
      sublabel: 'Pukulan bass berat bergetar festival Matsuri',
      icon: '🥁',
      soundFn: () => soundEngine.playTaikoDon(),
    },
    {
      id: 'omikuji',
      name: 'Kocokan Tabung Omikuji',
      sublabel: 'Gemerincing bilah bambu ramalan nasib',
      icon: '📜',
      soundFn: () => soundEngine.playClick(),
    },
    {
      id: 'evolution',
      name: 'Fanfare Evolusi Ekor Sembilan',
      sublabel: 'Gelombang getaran selebrasi bertahap',
      icon: '✨',
      soundFn: () => soundEngine.playEvolutionFanfare(),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#1c1410] border-2 border-amber-600/70 p-5 shadow-2xl text-stone-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-800/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-950/90 border border-amber-500/70 flex items-center justify-center text-amber-300 text-xl shadow-inner">
                📳
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-200 tracking-wide font-['Shippori_Mincho',serif] flex items-center gap-2">
                  Umpan Balik Taktil (Haptic)
                </h3>
                <p className="text-xs text-stone-400">
                  Sensasi getaran fisik untuk elusan, pintu shoji, & ritual
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto py-4 space-y-4 pr-1">
            {/* Device Support Status Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center gap-3 text-xs ${
                hapticEngine.isSupported
                  ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-600/60 text-amber-200'
              }`}
            >
              <Smartphone className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-bold">
                  {hapticEngine.isSupported
                    ? '✓ Perangkat Mendukung Motor Getar (Haptic Actuator Aktif)'
                    : 'ℹ️ Mode Simulasi Desktop / Browser'}
                </div>
                <div className="text-[11px] opacity-80">
                  {hapticEngine.isSupported
                    ? 'Ponsel cerdas / tablet Anda akan merespons sentuhan dengan getaran presisi.'
                    : 'Pada komputer desktop tanpa motor getar, efek suara procedural dan umpan visual tetap aktif.'}
                </div>
              </div>
            </div>

            {/* Intensity Selector */}
            <div>
              <label className="text-xs font-bold text-amber-300 tracking-wider uppercase block mb-2 font-['Shippori_Mincho',serif]">
                Kekuatan Getaran Taktil
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { id: 'off', label: 'Mati', sub: 'Nonaktif', icon: '📴' },
                    { id: 'soft', label: 'Lembut', sub: '0.6x', icon: '🍃' },
                    { id: 'medium', label: 'Seimbang', sub: '1.0x', icon: '⚖️' },
                    { id: 'strong', label: 'Kuat', sub: '1.45x', icon: '⚡' },
                  ] as const
                ).map((opt) => {
                  const isSelected = config.intensity === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectIntensity(opt.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-700/70 to-amber-900/90 border-amber-400 text-stone-100 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-[1.02]'
                          : 'bg-[#251a14]/80 border-stone-800 hover:border-amber-700/60 text-stone-300'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-bold mt-1">{opt.label}</span>
                      <span className="text-[10px] text-stone-400">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Presets Test Pad */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-300 tracking-wider uppercase font-['Shippori_Mincho',serif] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Uji Coba Gelombang Getar
                </label>
                {lastTested && (
                  <span className="text-[11px] text-emerald-400 font-bold animate-pulse flex items-center gap-1">
                    <Check className="w-3 h-3" /> {lastTested}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {testPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleTest(preset.id, preset.name, preset.soundFn)}
                    disabled={config.intensity === 'off'}
                    className={`w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                      config.intensity === 'off'
                        ? 'opacity-50 cursor-not-allowed bg-[#221711]/40 border-stone-800 text-stone-500'
                        : 'bg-gradient-to-r from-[#291b14] to-[#1e130e] hover:from-[#3a251b] hover:to-[#2b1b13] border-amber-700/60 hover:border-amber-400 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1.5 rounded-xl bg-black/40 border border-amber-900/60 group-hover:scale-110 transition-transform">
                        {preset.icon}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-amber-200 group-hover:text-amber-100">
                          {preset.name}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-stone-400 leading-tight">
                          {preset.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400/90 group-hover:text-amber-300 px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-700/60">
                      <Volume2 className="w-3 h-3" />
                      <span>Uji</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-3 border-t border-amber-800/60 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] text-stone-400">
              Kekuatan saat ini: <strong className="text-amber-300 capitalize">{config.intensity}</strong>
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 border border-amber-500/80 text-amber-100 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Simpan & Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
