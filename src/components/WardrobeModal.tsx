import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Lock, Coins, ShieldCheck, Sun, Moon } from 'lucide-react';
import { PetData, NeckAccessory, HeadAccessory, AccessoryItem } from '../types/game';
import { ACCESSORIES_CATALOG, DEFAULT_UNLOCKED_ACCESSORIES } from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { KitsuneCanvas } from './KitsuneCanvas';

// Modern Wardrobe Dressing Room Artworks (Day & Night)
import wardrobeDressingDay from '../assets/images/wardrobe_dressing_day_1789148128674.webp';
import wardrobeDressingNight from '../assets/images/wardrobe_dressing_night_1789148147452.webp';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  setPet: React.Dispatch<React.SetStateAction<PetData>>;
  showToast: (msg: string) => void;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  isOpen,
  onClose,
  pet,
  setPet,
  showToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<'neck' | 'head'>('neck');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  // Atmosphere toggle: auto (by local clock), day, or night
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // Day / Night cycle based on agreed rule: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const currentHour = currentTime.getHours();
  const naturalIsDay = currentHour >= 6 && currentHour < 18;
  const isDayVisual =
    atmosphereOverride === 'auto'
      ? naturalIsDay
      : atmosphereOverride === 'day';

  const currentBgImage = isDayVisual
    ? wardrobeDressingDay
    : wardrobeDressingNight;

  const unlockedList = pet.unlockedAccessories || DEFAULT_UNLOCKED_ACCESSORIES;
  const currentNeck = pet.accessories?.neck || 'none';
  const currentHead = pet.accessories?.head || 'none';

  const categoryItems = ACCESSORIES_CATALOG.filter(
    (item) => item.category === activeCategory
  );

  // Equip an accessory
  const handleEquip = (item: AccessoryItem) => {
    if (item.key === 'suzu') {
      soundEngine.playSuzuChime();
    } else {
      soundEngine.playAccessoryEquip();
    }

    setPet((prev) => {
      const currentAccessories = prev.accessories || { neck: 'none', head: 'none' };
      const updatedAccessories = {
        ...currentAccessories,
        [activeCategory]: item.key,
      };

      return {
        ...prev,
        accessories: updatedAccessories,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 4),
        },
      };
    });

    if (item.key === 'none') {
      showToast(`Melepaskan aksesoris ${activeCategory === 'neck' ? 'leher' : 'kepala'}.`);
    } else {
      showToast(`✨ Memasang ${item.name}! ${item.blessingText}`);
    }
  };

  // Buy and unlock an accessory
  const handleBuy = (item: AccessoryItem) => {
    if (pet.coins < item.price) {
      soundEngine.playClick();
      showToast(`Koin Ryo tidak cukup! Butuh ${item.price} Ryo.`);
      return;
    }

    soundEngine.playBuy();

    setPet((prev) => {
      const existingUnlocked = prev.unlockedAccessories || DEFAULT_UNLOCKED_ACCESSORIES;
      const newUnlocked = Array.from(new Set([...existingUnlocked, item.id]));
      const currentAccessories = prev.accessories || { neck: 'none', head: 'none' };
      const updatedAccessories = {
        ...currentAccessories,
        [activeCategory]: item.key,
      };

      return {
        ...prev,
        coins: prev.coins - item.price,
        unlockedAccessories: newUnlocked,
        accessories: updatedAccessories,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + 8),
        },
      };
    });

    if (item.key === 'suzu') {
      soundEngine.playSuzuChime();
    }

    showToast(`🎉 Berhasil membeli & memasang ${item.name}! (-${item.price} Ryo)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in">
      {/* 1. FULL SCREEN BACKGROUND ARTWORK (Day & Night Wardrobe Dressing) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Ruang Ganti Lemari Busana Kitsune Fullscreen"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 saturate-[1.05] transition-all duration-700"
        />
        {/* Soft edge darkening for aesthetic focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-stone-950/50 pointer-events-none" />
      </div>

      {/* 2. FLOATING WARDROBE PANEL (Centered Frosted Glass) */}
      <div className="relative z-10 w-full max-w-2xl bg-stone-950/85 backdrop-blur-xl border-2 border-amber-600/70 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#2a1b14] via-[#352219] to-[#2a1b14] border-b border-amber-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-900/60 border border-amber-500/70 flex items-center justify-center text-xl sm:text-2xl shadow-inner">
              👘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-200 font-['Shippori_Mincho',serif] tracking-wide">
                  Lemari Busana & Aksesoris
                </h3>
                <span className="text-[10px] sm:text-xs text-amber-400/80 font-mono hidden xs:inline">
                  (狐の衣裳箪笥)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-300">
                Hias Kitsune-mu dengan lonceng suci, kalung giok, syal kuil, & hiasan kepala
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coins Balance Indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-600/60 text-amber-300 font-extrabold text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{pet.coins} Ryo</span>
            </div>

            {/* Day / Night Atmosphere Selector */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setAtmosphereOverride((prev) => {
                  if (prev === 'auto') return naturalIsDay ? 'night' : 'day';
                  if (prev === 'day') return 'night';
                  return 'auto';
                });
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 border border-amber-500/50 text-[11px] font-bold text-amber-200 transition-all cursor-pointer shadow-sm"
              title="Ganti Suasana Waktu Lemari (Siang / Malam)"
            >
              {isDayVisual ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">Siang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden xs:inline">Malam</span>
                </>
              )}
              {atmosphereOverride !== 'auto' && (
                <span className="text-[9px] text-amber-400 font-normal">●</span>
              )}
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Fitting Room Preview Bar */}
        <div className="bg-[#140e0b] px-3 py-2 border-b border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Live Canvas Fitting Preview */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#231914] border border-amber-700/50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              <div className="scale-50 origin-center">
                <KitsuneCanvas pet={pet} actionState="happy" />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Tampilan Busana Saat Ini:
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-xs">
                <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-200 border border-stone-700 text-[10px] sm:text-[11px]">
                  Leher: <strong className="text-amber-300">{ACCESSORIES_CATALOG.find(i => i.category === 'neck' && i.key === currentNeck)?.name || 'Tanpa Aksesoris'}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-200 border border-stone-700 text-[10px] sm:text-[11px]">
                  Kepala: <strong className="text-rose-300">{ACCESSORIES_CATALOG.find(i => i.category === 'head' && i.key === currentHead)?.name || 'Tanpa Hiasan'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-stone-400 block">Tingkat Roh</span>
            <span className="text-xs font-bold text-amber-300">Level {pet.level}</span>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex border-b border-stone-800 bg-[#17120e]">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveCategory('neck');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeCategory === 'neck'
                ? 'border-amber-500 text-amber-300 bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>📿</span>
            <span>Aksesoris Leher</span>
            <span className="text-[10px] opacity-75 font-mono">(首飾り)</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveCategory('head');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              activeCategory === 'head'
                ? 'border-rose-500 text-rose-300 bg-rose-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🌸</span>
            <span>Hiasan Kepala</span>
            <span className="text-[10px] opacity-75 font-mono">(頭飾り)</span>
          </button>
        </div>

        {/* Accessory Catalog Grid */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5 max-h-[55dvh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryItems.map((item) => {
              const isOwned = unlockedList.includes(item.id) || item.price === 0;
              const isEquipped =
                (activeCategory === 'neck' && currentNeck === item.key) ||
                (activeCategory === 'head' && currentHead === item.key);
              const isLevelLocked = pet.level < item.unlockLevel;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
                      : isOwned
                      ? 'bg-[#231a15] border-stone-700/80 hover:border-amber-600/60'
                      : isLevelLocked
                      ? 'bg-[#181310] border-stone-800 opacity-60'
                      : 'bg-[#231a15] border-stone-700 hover:border-amber-600/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-stone-100 truncate">
                          {item.name}
                        </h4>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black flex items-center gap-0.5 flex-shrink-0">
                            <Check className="w-3 h-3" /> Dipakai
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-amber-400 font-mono italic">
                        {item.japaneseName}
                      </p>
                      <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Spiritual Blessing Card */}
                  <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.blessingText}</span>
                    </span>

                    {/* Action Button: Equip / Buy / Locked */}
                    <div className="ml-2 flex-shrink-0">
                      {isEquipped ? (
                        item.key !== 'none' ? (
                          <button
                            onClick={() => {
                              const noneItem = ACCESSORIES_CATALOG.find(
                                (i) => i.category === activeCategory && i.key === 'none'
                              );
                              if (noneItem) handleEquip(noneItem);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Lepas
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">Alami</span>
                        )
                      ) : isOwned ? (
                        <button
                          onClick={() => handleEquip(item)}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-900 text-[10px] font-black shadow transition-all cursor-pointer active:scale-95"
                        >
                          Pakai
                        </button>
                      ) : isLevelLocked ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-800/80 text-stone-500 text-[10px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>Butuh Lv.{item.unlockLevel}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={pet.coins < item.price}
                          className={`px-3 py-1 rounded-lg font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                            pet.coins >= item.price
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 hover:brightness-110 shadow-sm'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3 h-3" />
                          <span>Beli {item.price} Ryo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#17120e] border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Aksesoris yang dibeli tersimpan permanen di lemari silsilah Kitsune.</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-all cursor-pointer"
          >
            Tutup Lemari
          </button>
        </div>
      </div>
    </div>
  );
};
