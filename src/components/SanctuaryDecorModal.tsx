import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, Coins, Palette, Scroll, Home } from 'lucide-react';
import {
  SanctuaryDecorations,
  TatamiStyle,
  KakemonoStyle,
  RoomAccent,
  DecorItem,
} from '../types/game';
import {
  SANCTUARY_DECOR_CATALOG,
  DEFAULT_SANCTUARY_DECOR,
  DEFAULT_UNLOCKED_DECOR,
} from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';

interface SanctuaryDecorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDecor: SanctuaryDecorations;
  coins: number;
  petLevel: number;
  unlockedDecor?: string[];
  onUpdateDecor: (newDecor: SanctuaryDecorations) => void;
  onBuyDecor: (item: DecorItem) => void;
}

type DecorCategoryTab = 'tatami' | 'kakemono' | 'accent';

export const SanctuaryDecorModal: React.FC<SanctuaryDecorModalProps> = ({
  isOpen,
  onClose,
  currentDecor,
  coins,
  petLevel,
  unlockedDecor = DEFAULT_UNLOCKED_DECOR,
  onUpdateDecor,
  onBuyDecor,
}) => {
  const [activeTab, setActiveTab] = useState<DecorCategoryTab>('tatami');
  const [previewDecor, setPreviewDecor] = useState<SanctuaryDecorations>(currentDecor);

  if (!isOpen) return null;

  const catalogItems = SANCTUARY_DECOR_CATALOG.filter((item) => item.category === activeTab);

  const isItemUnlocked = (id: string) => {
    return unlockedDecor.includes(id);
  };

  const isEquipped = (item: DecorItem) => {
    if (item.category === 'tatami') return currentDecor.tatami === item.key;
    if (item.category === 'kakemono') return currentDecor.kakemono === item.key;
    if (item.category === 'accent') return currentDecor.accent === item.key;
    return false;
  };

  const handleSelect = (item: DecorItem) => {
    soundEngine.playClick();
    const nextDecor = { ...previewDecor };
    if (item.category === 'tatami') nextDecor.tatami = item.key as TatamiStyle;
    if (item.category === 'kakemono') nextDecor.kakemono = item.key as KakemonoStyle;
    if (item.category === 'accent') nextDecor.accent = item.key as RoomAccent;

    setPreviewDecor(nextDecor);

    // If already unlocked, apply immediately
    if (isItemUnlocked(item.id)) {
      soundEngine.playAccessoryEquip();
      onUpdateDecor(nextDecor);
    }
  };

  const handleBuy = (item: DecorItem) => {
    if (coins < item.price) {
      soundEngine.playMiss();
      return;
    }
    if (petLevel < item.unlockLevel) {
      soundEngine.playMiss();
      return;
    }
    soundEngine.playBuy();
    onBuyDecor(item);

    // Auto equip upon purchase
    const nextDecor = { ...currentDecor };
    if (item.category === 'tatami') nextDecor.tatami = item.key as TatamiStyle;
    if (item.category === 'kakemono') nextDecor.kakemono = item.key as KakemonoStyle;
    if (item.category === 'accent') nextDecor.accent = item.key as RoomAccent;
    onUpdateDecor(nextDecor);
    setPreviewDecor(nextDecor);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#241a13] via-[#1a120c] to-[#100b07] text-stone-100 rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-amber-700/80 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-600/70 flex items-center justify-center text-xl shadow-inner">
              🏡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-['Shippori_Mincho',serif] text-amber-200">
                  Renovasi Sanctuary Tatami
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                  座敷改装
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Ubah corak anyaman tatami, gulungan kaligrafi dinding & perabot altar kuil Inari.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Coins indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold text-xs shadow">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins} Ryo</span>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Room Miniature Preview */}
        <div className="mb-4 rounded-2xl p-3 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="relative w-full sm:w-56 h-28 rounded-xl overflow-hidden border border-amber-800/60 shadow flex flex-col justify-between">
            {/* Shoji Wall & Scroll */}
            <div className="h-14 bg-[#3d2719] relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
              {/* Miniature Scroll */}
              <div className="w-8 h-10 bg-[#f7f2e7] border-x-2 border-amber-950 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-black text-rose-700">
                  {previewDecor.kakemono === 'fuku' && '福'}
                  {previewDecor.kakemono === 'ai' && '愛'}
                  {previewDecor.kakemono === 'enso' && '◯'}
                  {previewDecor.kakemono === 'fuji' && '🗻'}
                </span>
                <span className="text-[6px] text-stone-600">掛軸</span>
              </div>
            </div>

            {/* Engawa divider */}
            <div className="h-1 bg-[#26150b] border-y border-amber-600/40" />

            {/* Tatami Floor */}
            <div
              className={`h-13 relative flex items-center justify-between px-3 ${
                previewDecor.tatami === 'golden'
                  ? 'bg-[#3b2b16]'
                  : previewDecor.tatami === 'indigo'
                  ? 'bg-[#161c2b]'
                  : previewDecor.tatami === 'sakura'
                  ? 'bg-[#361e24]'
                  : 'bg-[#2b301e]'
              }`}
            >
              {/* Accent Furniture Preview */}
              <div className="text-sm">
                {previewDecor.accent === 'chabudai' && '🍵'}
                {previewDecor.accent === 'bonsai' && '🪴'}
                {previewDecor.accent === 'koro' && '🪔'}
                {previewDecor.accent === 'shishi_odoshi' && '🎋'}
                {previewDecor.accent === 'none' && '✨'}
              </div>

              {/* Kitsune small silhouette */}
              <div className="text-base animate-bounce">🦊</div>
            </div>
          </div>

          {/* Current Decor Summary */}
          <div className="flex-1 w-full text-xs space-y-1 text-stone-300">
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <span className="text-stone-400">Anyaman Tatami:</span>
              <span className="font-bold text-amber-200">
                {SANCTUARY_DECOR_CATALOG.find(
                  (i) => i.category === 'tatami' && i.key === previewDecor.tatami
                )?.name || 'Klasik'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <span className="text-stone-400">Lukisan Dinding (Kakemono):</span>
              <span className="font-bold text-rose-300">
                {SANCTUARY_DECOR_CATALOG.find(
                  (i) => i.category === 'kakemono' && i.key === previewDecor.kakemono
                )?.name || 'Fuku'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Hiasan Altar Ruangan:</span>
              <span className="font-bold text-emerald-300">
                {SANCTUARY_DECOR_CATALOG.find(
                  (i) => i.category === 'accent' && i.key === previewDecor.accent
                )?.name || 'Ruang Bebas'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900/90 border border-stone-800 mb-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('tatami');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'tatami'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>1. Anyaman Tatami</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('kakemono');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'kakemono'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>2. Lukisan Kakemono</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('accent');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'accent'
                ? 'bg-amber-600 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>3. Hiasan Altar</span>
          </button>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[44vh]">
          {catalogItems.map((item) => {
            const unlocked = isItemUnlocked(item.id);
            const equipped = isEquipped(item);
            const isSelected =
              (item.category === 'tatami' && previewDecor.tatami === item.key) ||
              (item.category === 'kakemono' && previewDecor.kakemono === item.key) ||
              (item.category === 'accent' && previewDecor.accent === item.key);
            const canAfford = coins >= item.price;
            const levelMet = petLevel >= item.unlockLevel;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  equipped
                    ? 'bg-amber-950/40 border-amber-500 shadow-md'
                    : isSelected
                    ? 'bg-stone-800/80 border-amber-600/80'
                    : 'bg-stone-900/60 border-stone-800/80 hover:border-amber-800/50'
                }`}
              >
                {/* Item Icon & Details */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-stone-950 border border-amber-900/50 flex items-center justify-center text-2xl shadow shrink-0">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-100 truncate">
                        {item.name}
                      </h4>
                      {equipped && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold shrink-0 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Terpasang
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-400/90 font-serif">
                      {item.japaneseName}
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <div className="text-[10px] text-emerald-300/90 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span className="truncate">{item.blessingText}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action: Equip / Buy / Level Lock */}
                <div className="shrink-0 flex flex-col items-end gap-1.5 ml-2">
                  {unlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        equipped
                          ? 'bg-stone-800 text-stone-400 cursor-default'
                          : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow'
                      }`}
                    >
                      {equipped ? 'Aktif' : 'Pasang'}
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      {levelMet ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuy(item);
                          }}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{item.price} Ryo</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 text-[10px]">
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Buka di Lv.{item.unlockLevel}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
