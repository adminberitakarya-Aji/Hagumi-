import React, { useState, useEffect, useMemo } from 'react';
import { X, Coins, Sparkles, Clock, AlertCircle, BellRing, CheckCircle2, Sun, Moon } from 'lucide-react';
import { FOOD_ITEMS } from '../data/gameConfig';
import { FoodItem } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

// Modern Konbini Background Artworks (Day & Night)
import konbiniShopDay from '../assets/images/konbini_shop_day_1788724576199.webp';
import konbiniShopNight from '../assets/images/konbini_shop_night_1788724594548.webp';

interface TanukiShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  inventory: Record<string, number>;
  onBuyItem: (item: FoodItem) => void;
  onOpenWardrobe?: () => void;
}

type ShopCategory = 'all' | 'food' | 'dessert' | 'special';

export const TanukiShopModal: React.FC<TanukiShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  inventory,
  onBuyItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  // Atmosphere override so the user can freely toggle Day and Night views
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');

  // Update clock every 30 seconds & play entrance door chime
  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    soundEngine.playShopDoorChime();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Operational hours: 08:00 - 22:00
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const isShopOpen = currentHour >= 8 && currentHour < 22;

  // Visual lighting based on agreed rule: Daytime (06:00 - 17:59), Night (18:00 - 05:59)
  const naturalIsDay = currentHour >= 6 && currentHour < 18;
  const isDayVisual =
    atmosphereOverride === 'auto'
      ? naturalIsDay
      : atmosphereOverride === 'day';

  const currentBgImage = isDayVisual ? konbiniShopDay : konbiniShopNight;

  const itemsList = useMemo(() => Object.values(FOOD_ITEMS), []);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return itemsList;
    if (selectedCategory === 'food') {
      return itemsList.filter((item) =>
        ['aburaage', 'onigiri', 'inari'].includes(item.id)
      );
    }
    if (selectedCategory === 'dessert') {
      return itemsList.filter((item) =>
        ['dango', 'sakuramochi', 'ocha'].includes(item.id)
      );
    }
    if (selectedCategory === 'special') {
      return itemsList.filter((item) =>
        ['yakusou', 'omamori'].includes(item.id)
      );
    }
    return itemsList;
  }, [itemsList, selectedCategory]);

  if (!isOpen) return null;

  // Format current time as HH:MM
  const formattedTime = `${String(currentHour).padStart(2, '0')}:${String(
    currentMinute
  ).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in">
      {/* 1. FULL SCREEN BACKGROUND ARTWORK (Day & Night) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Toko Modern Tanuki Konbini Fullscreen"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 saturate-[1.1] transition-all duration-700"
        />
        {/* Soft edge darkening for aesthetic focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-stone-950/50 pointer-events-none" />
      </div>

      {/* 2. FLOATING KONBINI HUD CONTAINER (Centered Frosted Glass) */}
      <div className="relative z-10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/70 max-h-[95vh] flex flex-col bg-stone-950/85 backdrop-blur-xl text-stone-100">
        <div className="flex flex-col h-full max-h-[95vh] p-3 sm:p-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 gap-2 flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => {
                  soundEngine.playTanukiDrum();
                  hapticEngine.medium();
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-600/90 to-amber-950 border border-amber-400/80 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0 cursor-pointer hover:scale-110 active:scale-90 transition-transform"
                title="Tepuk gendang perut Tanuki (Poko-pon!)"
              >
                🏪
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-amber-200 tracking-wide drop-shadow">
                    Toko Serba Ada Tanuki
                  </h3>
                  <span className="text-[10px] sm:text-xs text-amber-300/90 font-['Shippori_Mincho',serif] hidden xs:inline">
                    狸のコンビニ (Tanuki Konbini)
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-300">
                  Minimarket modern istana rubah • Sajian segar & obat herbal
                </p>
              </div>
            </div>

            {/* Atmosphere Quick Toggle & Close Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
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
                title="Ganti Suasana Waktu Toko (Siang / Malam)"
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
                className="p-1.5 sm:p-2 rounded-full hover:bg-stone-800/80 text-stone-300 hover:text-stone-100 transition-all cursor-pointer"
                title="Tutup Toko"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader: Operational Hours Status & Player Ryo Coins */}
          <div className="flex items-center justify-between mt-2.5 mb-3 px-3 py-2 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md gap-2 flex-wrap flex-shrink-0 shadow-inner">
            {/* Status Jam Buka */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] shadow-sm ${
                  isShopOpen || isEmergencyUnlocked
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/60 animate-pulse'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isShopOpen || isEmergencyUnlocked ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>
                  {isShopOpen
                    ? `BUKA (08.00 - 22.00)`
                    : isEmergencyUnlocked
                    ? `LOKET DARURAT BUKA`
                    : `SEDANG TUTUP`}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Waktu Lokal: <strong className="text-amber-200">{formattedTime}</strong>
                </span>
              </div>
            </div>

            {/* Player Ryo Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-600/60 text-amber-300 font-extrabold text-xs sm:text-sm shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins} Ryo (両)</span>
            </div>
          </div>

          {/* SHOP OPEN: Category Filter Tabs & 2-Column Bento Grid */}
          {isShopOpen || isEmergencyUnlocked ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar flex-shrink-0">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102 font-extrabold'
                      : 'bg-black/50 text-stone-300 hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  <span>🍱</span>
                  <span>Semua ({itemsList.length})</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory('food');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    selectedCategory === 'food'
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102 font-extrabold'
                      : 'bg-black/50 text-stone-300 hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  <span>🍙</span>
                  <span>Makanan Utama</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory('dessert');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    selectedCategory === 'dessert'
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102 font-extrabold'
                      : 'bg-black/50 text-stone-300 hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  <span>🍡</span>
                  <span>Camilan & Teh</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory('special');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    selectedCategory === 'special'
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102 font-extrabold'
                      : 'bg-black/50 text-stone-300 hover:bg-stone-900 border border-stone-800'
                  }`}
                >
                  <span>🌿</span>
                  <span>Obat & Jimat</span>
                </button>
              </div>

              {/* Emergency Service Notice if active outside regular hours */}
              {isEmergencyUnlocked && !isShopOpen && (
                <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs flex items-center gap-2 flex-shrink-0">
                  <span>🔔</span>
                  <span className="text-[11px]">
                    <strong>Layanan Darurat Luar Jam Aktif:</strong> Pedagang Tanuki melayani
                    pembelian darurat Anda dengan senang hati.
                  </span>
                </div>
              )}

              {/* 2-Column Bento Shopping Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 auto-rows-max">
                  {filteredItems.map((item) => {
                    const ownedCount = inventory[item.id] || 0;
                    const canAfford = coins >= item.price;

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-black/60 hover:bg-black/75 border border-stone-800 hover:border-amber-500/60 backdrop-blur-md transition-all flex flex-col justify-between gap-2 shadow-md group relative overflow-hidden"
                      >
                        {/* Top: Icon, Titles, Owned Badge */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-950/90 to-stone-900 border border-amber-700/60 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                            {item.iconEmoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">
                                {item.name}
                              </h4>
                              {ownedCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-stone-900/90 border border-amber-500/50 text-[10px] text-amber-300 font-bold flex-shrink-0">
                                  Milik: {ownedCount}
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-amber-400/90 font-['Shippori_Mincho',serif] block -mt-0.5">
                              {item.japaneseName}
                            </span>

                            <p className="text-[11px] text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Middle: Buff Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold pt-1 border-t border-stone-800/80">
                          {item.hunger > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/70 text-emerald-300">
                              +{item.hunger} Kenyang
                            </span>
                          )}
                          {item.happiness > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-pink-950/80 border border-pink-700/70 text-pink-300">
                              +{item.happiness} Senang
                            </span>
                          )}
                          {item.energy && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/70 text-amber-300">
                              +{item.energy} Energi
                            </span>
                          )}
                          {item.exp && (
                            <span className="px-1.5 py-0.5 rounded-md bg-yellow-950/80 border border-yellow-700/70 text-yellow-300">
                              +{item.exp} EXP
                            </span>
                          )}
                          {item.curesSickness && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-950/90 border border-rose-600/80 text-rose-300 font-bold">
                              Obat Mujarab
                            </span>
                          )}
                        </div>

                        {/* Bottom: Price and Buy Button */}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 mt-0.5 gap-2">
                          <div className="flex items-center gap-1 text-amber-300 font-extrabold text-xs">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>{item.price} Ryo</span>
                          </div>

                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              soundEngine.playCoinTransaction();
                              hapticEngine.coinsRattle();
                              onBuyItem(item);
                            }}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 active:scale-95 shadow-amber-900/40'
                                : 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span>Beli</span>
                            <span>➔</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* SHOP CLOSED STATE (22.00 - 07.59) */
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto">
              <div className="max-w-md w-full p-6 rounded-3xl bg-black/75 border-2 border-rose-500/50 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-900/90 border border-rose-500/60 mx-auto flex items-center justify-center text-3xl shadow-lg">
                  🏮
                </div>

                <div className="space-y-1">
                  <div className="inline-block px-3 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 font-extrabold text-xs">
                    SEDANG TUTUP (CLOSED)
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold font-['Shippori_Mincho',serif] text-amber-200">
                    準備中 (Junbichū)
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Toko Serba Ada Tanuki buka setiap hari pukul{' '}
                  <strong className="text-amber-300">08.00 – 22.00</strong>.
                </p>

                <p className="text-xs text-stone-400">
                  Pedagang Tanuki sedang beristirahat dan menata stok bahan segar istana rubah untuk esok hari.
                  Toko akan buka kembali pukul <strong>08.00 pagi</strong>.
                </p>

                {/* Emergency Doorbell / Ketuk Kaca Toko */}
                <div className="pt-3 border-t border-stone-800">
                  <button
                    onClick={() => {
                      soundEngine.playSuzuChime();
                      setIsEmergencyUnlocked(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700/80 to-amber-900/90 hover:from-amber-600 hover:to-amber-800 border border-amber-500/60 text-amber-100 font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
                    <span>🔔 Ketuk Kaca Toko (Layanan Darurat Luar Jam)</span>
                  </button>
                  <p className="text-[10px] text-stone-400 mt-1.5">
                    Gunakan layanan darurat jika Kitsune-mu mendesak butuh makanan atau ramuan herbal sakit di malam hari.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
