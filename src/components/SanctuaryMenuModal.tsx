import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, Home, Scroll, Compass, Smartphone, Volume2, Shield } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface SanctuaryMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMemoryScroll: () => void;
  onOpenShrinePass: () => void;
  onOpenHanabi: () => void;
  onOpenDecor: () => void;
  onOpenHanko: () => void;
  onOpenHaptic: () => void;
  onOpenParallax: () => void;
  onTriggerShoji: () => void;
  onOpenWardrobe: () => void;
  onOpenShop: () => void;
  onOpenShrine: () => void;
  onOpenPrologue?: () => void;
  onOpenBackupRestore?: () => void;
}

export const SanctuaryMenuModal: React.FC<SanctuaryMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenMemoryScroll,
  onOpenShrinePass,
  onOpenHanabi,
  onOpenDecor,
  onOpenHanko,
  onOpenHaptic,
  onOpenParallax,
  onTriggerShoji,
  onOpenWardrobe,
  onOpenShop,
  onOpenShrine,
  onOpenPrologue,
  onOpenBackupRestore,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'prologue',
      title: 'Gerbang Torii & Prologue',
      kanji: '鳥居物語',
      desc: 'Panorama Gunung Fuji senja, silsilah evolusi 9 ekor, serta ritual doa Ema & Omamori.',
      icon: '⛩️',
      border: 'border-amber-400/90',
      badge: 'Gateway',
      action: () => {
        onClose();
        if (onOpenPrologue) {
          onOpenPrologue();
        }
      },
    },
    {
      id: 'backup-restore',
      title: 'Segel Cadangan Santuari',
      kanji: '御守護印',
      desc: 'Ekspor data Kitsune ke file .json atau salin teks segel Base64 untuk berpindah perangkat.',
      icon: '💾',
      border: 'border-cyan-500/80',
      badge: 'Cadangan',
      action: () => {
        onClose();
        if (onOpenBackupRestore) {
          onOpenBackupRestore();
        }
      },
    },
    {
      id: 'memory',
      title: 'Buku Harian Roh',
      kanji: '絵巻物',
      desc: 'Album kenangan Ukiyo-e, catatan harian & momen emas kitsune.',
      icon: '📜',
      border: 'border-amber-600/70',
      badge: 'Emakimono',
      action: () => {
        onClose();
        onOpenMemoryScroll();
      },
    },
    {
      id: 'shrine-pass',
      title: 'Paspor Ziarah Inari',
      kanji: '神社通',
      desc: 'Ziarah ke kuil teman, tukar berkah & persembahan ema.',
      icon: '⛩️',
      border: 'border-rose-600/70',
      badge: 'Ziarah',
      action: () => {
        onClose();
        onOpenShrinePass();
      },
    },
    {
      id: 'hanabi',
      title: 'Kembang Api Hanabi',
      kanji: '花火大会',
      desc: 'Rancang kembang api kustom di festival malam langit Matsuri.',
      icon: '🎆',
      border: 'border-indigo-500/70',
      badge: 'Taikai',
      action: () => {
        onClose();
        onOpenHanabi();
      },
    },
    {
      id: 'decor',
      title: 'Renovasi Tatami',
      kanji: '館改装',
      desc: 'Ubah tikar tatami, gulungan kakemono, dan ornamen altar zen.',
      icon: '🏡',
      border: 'border-emerald-600/70',
      badge: 'Sanctuari',
      action: () => {
        onClose();
        onOpenDecor();
      },
    },
    {
      id: 'hanko',
      title: 'Kitab Segel Hanko',
      kanji: '判子印',
      desc: 'Silsilah leluhur kitsune, stempel stempel berkah & arsip reinkarnasi.',
      icon: '🎴',
      border: 'border-amber-500/70',
      badge: 'Silsilah',
      action: () => {
        onClose();
        onOpenHanko();
      },
    },
    {
      id: 'wardrobe',
      title: 'Lemari Busana Miyabi',
      kanji: '衣裳箪笥',
      desc: 'Ganti kimono festival, topeng kitsune & aksesoris telinga.',
      icon: '👘',
      border: 'border-pink-600/70',
      badge: 'Busana',
      action: () => {
        onClose();
        onOpenWardrobe();
      },
    },
    {
      id: 'shoji',
      title: 'Gerbang Pintu Shoji',
      kanji: '障子戸',
      desc: 'Tutup & buka pintu geser kertas tradisional shoji / fusuma.',
      icon: '🚪',
      border: 'border-stone-500/70',
      badge: 'Fusuma',
      action: () => {
        onClose();
        onTriggerShoji();
      },
    },
    {
      id: 'haptic',
      title: 'Pengaturan Taktil',
      kanji: '触覚設定',
      desc: 'Atur sensitivitas getaran haptic lembut, seimbang, atau kuat.',
      icon: '📳',
      border: 'border-purple-500/70',
      badge: 'Haptic',
      action: () => {
        onClose();
        onOpenHaptic();
      },
    },
    {
      id: 'parallax',
      title: 'Parallax 2.5D',
      kanji: '立体視',
      desc: 'Sensasi kedalaman 3D berlapis (Gunung Fuji, Shoji & Tatami) dengan sensor giroskop & mouse.',
      icon: '🪞',
      border: 'border-amber-400/80',
      badge: 'Kedalaman 2.5D',
      action: () => {
        onClose();
        onOpenParallax();
      },
    },
  ];

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
          className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-[#1a120c] border-2 border-amber-600/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#2c1a11] via-[#381f13] to-[#24130b] border-b border-amber-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-900/90 border border-amber-500 flex items-center justify-center text-xl shadow-inner">
                🏮
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-wide flex items-center gap-2">
                  <span>Menu Fitur Santuari</span>
                  <span className="text-xs text-amber-400/80 font-['Shippori_Mincho',serif]">
                    (神社全機能)
                  </span>
                </h2>
                <p className="text-[11px] text-stone-300">
                  Akses cepat seluruh ritual, gulungan kenangan, dan dekorasi kamar
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-stone-900/80 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid of Features */}
          <div className="p-3 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playClick();
                  hapticEngine.tap();
                  item.action();
                }}
                className={`p-3 rounded-2xl bg-gradient-to-br from-[#261710] to-[#1c110b] hover:from-[#352016] hover:to-[#27170f] border ${item.border} text-left flex items-start gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer group`}
              >
                <div className="text-2xl sm:text-3xl p-2 rounded-xl bg-stone-900/70 border border-amber-900/50 group-hover:scale-110 transition-transform flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-amber-100 text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-400 font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-300 line-clamp-2 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-[#120b07] border-t border-amber-900/50 flex items-center justify-between text-[11px] text-stone-400 px-4">
            <span className="flex items-center gap-1">
              <span>🌸</span> Tekan di mana saja pada tikar tatami untuk berinteraksi dengan Kitsune
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold cursor-pointer text-xs"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
