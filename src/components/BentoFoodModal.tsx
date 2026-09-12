import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Sun,
  Moon,
  Sparkles,
  Heart,
  Utensils,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import { FOOD_ITEMS } from '../data/gameConfig';
import { FoodItem, PetData } from '../types/game';
import { KitsuneCanvas } from './KitsuneCanvas';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

// Modern Bento Dining Veranda Artworks (Day & Night)
import bentoDiningDay from '../assets/images/bento_dining_day_1788725227743.webp';
import bentoDiningNight from '../assets/images/bento_dining_night_1788725605115.webp';

interface BentoFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  onFeedItem: (item: FoodItem) => void;
  onOpenShop: () => void;
  hunger?: number;
  happiness?: number;
  petName?: string;
  coins?: number;
  pet?: PetData;
  onFinishDining?: () => void;
}

interface CrumbParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
}

export const BentoFoodModal: React.FC<BentoFoodModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onFeedItem,
  onOpenShop,
  hunger = 50,
  happiness = 50,
  petName = 'Hagumi',
  coins = 0,
  pet,
  onFinishDining,
}) => {
  const [hoveredItem, setHoveredItem] = useState<FoodItem | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  // Atmosphere toggle: auto (by local clock), day, or night
  const [atmosphereOverride, setAtmosphereOverride] = useState<'auto' | 'day' | 'night'>('auto');

  // Dining interaction & animation states
  const [diningState, setDiningState] = useState<'idle' | 'serving' | 'chewing' | 'finished'>('idle');
  const [activeServedItem, setActiveServedItem] = useState<FoodItem | null>(null);
  const [isFavoriteServed, setIsFavoriteServed] = useState(false);
  const [crumbs, setCrumbs] = useState<CrumbParticle[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<HeartParticle[]>([]);
  const [biteProgress, setBiteProgress] = useState(100); // 100 -> 60 -> 30 -> 0

  useEffect(() => {
    if (!isOpen) return;
    setCurrentTime(new Date());
    setDiningState('idle');
    setActiveServedItem(null);
    setCrumbs([]);
    setFloatingHearts([]);
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

  const currentBgImage = isDayVisual ? bentoDiningDay : bentoDiningNight;

  const ownedItems = Object.keys(inventory)
    .filter((id) => (inventory[id] || 0) > 0)
    .map((id) => ({ item: FOOD_ITEMS[id], count: inventory[id] }))
    .filter((entry) => entry.item);

  // Projected hunger on hover
  const projectedHunger = hoveredItem
    ? Math.min(100, hunger + (hoveredItem.hunger || 0))
    : hunger;

  // Status hunger description
  const getHungerStatus = () => {
    if (hunger >= 100) return { label: 'Perut Kenyang Sempurna 🥰', color: 'text-emerald-400' };
    if (hunger >= 70) return { label: 'Cukup Kenyang & Bugar ✨', color: 'text-emerald-300' };
    if (hunger >= 40) return { label: 'Mulai Lapar 🥣', color: 'text-amber-300' };
    return { label: 'Sangat Lapar! Perlu Segera Makan ⚠️', color: 'text-rose-400' };
  };

  const hungerStatus = getHungerStatus();

  // Handle serving food item to Kitsune
  const handleServeFood = (item: FoodItem) => {
    soundEngine.playFeed(item);
    hapticEngine.medium();

    const isFav =
      pet?.favoriteFood === item.id ||
      (pet?.favoriteFood === 'aburaage' && (item.id === 'aburaage' || item.id === 'inari'));

    setActiveServedItem(item);
    setIsFavoriteServed(!!isFav);
    setDiningState('serving');
    setBiteProgress(100);

    // Call game logic
    onFeedItem(item);

    // Spawn burst of tasty food crumbs
    const newCrumbs: CrumbParticle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -20 - Math.random() * 40,
      color: ['#fbbf24', '#f59e0b', '#ec4899', '#10b981', '#ffffff'][i % 5],
    }));
    setCrumbs(newCrumbs);

    // Spawn floating love hearts
    const newHearts: HeartParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: -50 - Math.random() * 60,
      scale: 0.7 + Math.random() * 0.6,
    }));
    setFloatingHearts(newHearts);

    // Step 1: Chewing stage
    setTimeout(() => {
      setDiningState('chewing');
      setBiteProgress(60);
    }, 400);

    // Step 2: Second bite / continuous eating
    setTimeout(() => {
      setBiteProgress(20);
      if (item.id === 'ocha') {
        soundEngine.playSipTea();
      } else {
        soundEngine.playChewBite();
      }
    }, 1200);

    // Step 3: Finished and satisfied
    setTimeout(() => {
      setDiningState('finished');
      setBiteProgress(0);
      soundEngine.playFoxChirp();
      soundEngine.playChime();
    }, 2100);

    // Step 4: Back to calm idle at table
    setTimeout(() => {
      setDiningState('idle');
      setActiveServedItem(null);
      setCrumbs([]);
      setFloatingHearts([]);
    }, 3200);
  };

  // Close or finish dining back to Tatami Room
  const handleDone = () => {
    soundEngine.playChime();
    hapticEngine.heavy();
    if (onFinishDining) {
      onFinishDining();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-2 sm:p-4 overflow-hidden animate-in fade-in select-none">
      {/* 1. FULL SCREEN BACKGROUND ARTWORK (Day & Night Veranda Garden) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentBgImage}
          alt="Meja Santapan Bento Veranda Fullscreen"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 saturate-[1.05] transition-all duration-700"
        />
        {/* Soft edge darkening for aesthetic focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/20 to-stone-950/50 pointer-events-none" />
      </div>

      {/* 2. TOP BAR: Header, Atmosphere Quick Toggle, Selesai Makan & Exit */}
      <header className="relative z-30 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full px-3 py-2 sm:py-2.5 rounded-2xl bg-stone-950/85 backdrop-blur-xl border border-amber-500/50 shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-600/90 to-amber-950 border border-amber-400/80 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
            🍱
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-amber-200 tracking-wide drop-shadow">
                Meja Santapan Bento
              </h2>
              <span className="text-[10px] sm:text-xs text-amber-300/90 font-['Shippori_Mincho',serif] hidden xs:inline">
                狐の御膳 (Kitsune no Gozen)
              </span>
            </div>
            <p className="text-[11px] text-stone-300 line-clamp-1">
              {petName} duduk di atas bantal zabuton menikmati hidangan lezat hangat
            </p>
          </div>
        </div>

        {/* Action controls */}
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
            title="Ganti Suasana Waktu Meja (Siang / Malam)"
aria-label="Ganti Suasana Waktu Meja (Siang / Malam)"
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

          {/* Selesai Makan (Gochisousama) Top Button */}
          <button
            onClick={handleDone}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>Selesai Makan</span>
          </button>

          {/* Quick Exit */}
          <button
            onClick={handleDone}
            className="p-1.5 rounded-full hover:bg-stone-800/80 text-stone-300 hover:text-stone-100 transition-all cursor-pointer"
            title="Kembali ke Ruang Tatami"
aria-label="Kembali ke Ruang Tatami"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3. CENTER STAGE: KITSUNE GROUNDED ON VERANDA WITH ZABUTON & DINING TRAY */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 pointer-events-none translate-y-6 sm:translate-y-10 py-1">
        <div className="relative flex flex-col items-center justify-center">

          {/* Underneath: Authentic Japanese Zabuton Cushion on Veranda Floor */}
          <div className="absolute -bottom-4 w-52 sm:w-64 h-14 rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border-2 border-amber-600/70 shadow-2xl pointer-events-none flex items-center justify-center">
            {/* Golden corner tassels representation */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-[9px] font-bold text-amber-300/80 font-['Shippori_Mincho',serif] tracking-widest uppercase">
              座布団 (Zabuton)
            </span>
          </div>

          {/* Kitsune Canvas Animated Render */}
          {pet ? (
            <div className="pointer-events-auto relative transform scale-100 sm:scale-115 transition-transform z-10">
              <KitsuneCanvas
                pet={pet}
                actionState={diningState === 'chewing' ? 'eating' : 'idle'}
              />

              {/* Floating Crumbs when eating */}
              {crumbs.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {crumbs.map((crumb) => (
                    <div
                      key={crumb.id}
                      style={{
                        transform: `translate(${crumb.x}px, ${crumb.y}px)`,
                        backgroundColor: crumb.color,
                      }}
                      className="absolute w-2 h-2 rounded-full shadow-sm animate-ping duration-700"
                    />
                  ))}
                </div>
              )}

              {/* Floating Hearts of Joy */}
              {floatingHearts.length > 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {floatingHearts.map((heart) => (
                    <div
                      key={heart.id}
                      style={{
                        transform: `translate(${heart.x}px, ${heart.y}px) scale(${heart.scale})`,
                      }}
                      className="absolute text-pink-400 fill-pink-400 drop-shadow animate-bounce duration-1000"
                    >
                      <Heart className="w-4 h-4 fill-pink-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-6xl">
              🦊
            </div>
          )}

          {/* PHYSICAL JAPANESE LOW DINING TRAY (Ozen / Chabudai) IN FRONT OF KITSUNE */}
          <div className="relative z-20 -mt-6 sm:-mt-8 w-64 sm:w-72 h-20 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-700/80 shadow-2xl p-2 flex items-center justify-between pointer-events-auto backdrop-blur-md">
            {/* Left: Warm Steaming Teacup (Yunomi) */}
            <div className="flex flex-col items-center">
              <div className="relative w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center shadow-inner">
                <span className="text-xs">🍵</span>
                {/* Steam wisps */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white/40 rounded-full blur-[1px] animate-pulse pointer-events-none" />
              </div>
              <span className="text-[8px] text-emerald-400 font-semibold mt-0.5">Ocha</span>
            </div>

            {/* Center: The Serving Plate where the dish actively sits */}
            <div className="flex-1 flex flex-col items-center justify-center mx-2">
              <div className="relative w-28 sm:w-32 h-11 rounded-xl bg-stone-900 border border-amber-500/50 shadow-inner flex items-center justify-center overflow-hidden">
                {activeServedItem ? (
                  <div className="flex items-center gap-1.5 animate-in zoom-in-75 duration-300">
                    <span className="text-2xl filter drop-shadow animate-bounce">
                      {activeServedItem.iconEmoji}
                    </span>
                    <div className="text-left">
                      <span className="text-[10px] font-extrabold text-amber-200 block truncate max-w-[70px]">
                        {activeServedItem.name}
                      </span>
                      {diningState === 'chewing' && (
                        <span className="text-[9px] text-pink-300 font-black animate-pulse block">
                          Nyam-nyam!
                        </span>
                      )}
                      {diningState === 'finished' && (
                        <span className="text-[9px] text-emerald-300 font-black flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 inline" /> Habis!
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-stone-500 text-[10px] font-semibold">
                    <Utensils className="w-3 h-3" />
                    <span>Piring Santap</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Chopsticks on ceramic rest (Hashioki) */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-8 flex flex-col items-center justify-center gap-0.5">
                <div className="w-6 h-0.5 bg-amber-600 rounded-full shadow-sm rotate-12" />
                <div className="w-6 h-0.5 bg-amber-600 rounded-full shadow-sm rotate-12" />
                <div className="w-4 h-1.5 rounded-sm bg-stone-700 border border-amber-500/40 mt-1" />
              </div>
              <span className="text-[8px] text-stone-400 font-semibold mt-0.5">Hashi</span>
            </div>
          </div>

          {/* Interactive Eating Reaction Banner */}
          {activeServedItem && (
            <div className="absolute -top-10 px-4 py-1.5 rounded-full bg-stone-950/95 border-2 border-amber-400 text-amber-100 text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none z-30">
              <span className="text-base">{activeServedItem.iconEmoji}</span>
              <span>
                {diningState === 'chewing' ? (
                  <>
                    Nyam nyam! {petName} sedang lahap menyantap{' '}
                    <strong>{activeServedItem.name}</strong>!
                  </>
                ) : (
                  <>
                    🙏 <strong>Gochisousama!</strong> {activeServedItem.name} habis disantap!
                  </>
                )}
              </span>
              {isFavoriteServed && (
                <span className="text-pink-300 font-extrabold flex items-center gap-0.5">
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 inline" /> Favorit!
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM FLOATING BENTO MENU HUD & CONTROLS */}
      <footer className="relative z-30 max-w-2xl mx-auto w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/70 bg-stone-950/90 backdrop-blur-xl text-stone-100 p-3 sm:p-4 flex flex-col max-h-[46vh] sm:max-h-[48vh] flex-shrink-0 space-y-2">
        {/* Interactive Live Hunger Bar with Hover Preview */}
        <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/30 backdrop-blur-md flex-shrink-0 space-y-1 shadow-inner">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-stone-200">
              <span className="text-sm">🍙</span>
              <span>Tingkat Kenyang {petName}:</span>
              <span className={hungerStatus.color}>{hungerStatus.label}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300 font-extrabold">
              <span>{hunger}/100</span>
              {hoveredItem && (hoveredItem.hunger || 0) > 0 && (
                <span className="text-emerald-400 text-[11px] font-black animate-pulse">
                  ➔ {projectedHunger} (+{hoveredItem.hunger})
                </span>
              )}
            </div>
          </div>

          {/* Hunger Progress Bar */}
          <div className="relative w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-700/80 shadow-inner">
            {/* Projected Fill (Ghost Bar) */}
            {hoveredItem && projectedHunger > hunger && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-emerald-500/40 transition-all duration-300 rounded-full"
                style={{ width: `${projectedHunger}%` }}
              />
            )}
            {/* Actual Current Hunger Fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hunger < 40
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400'
              }`}
              style={{ width: `${hunger}%` }}
            />
          </div>
        </div>

        {/* Scrollable Bento Dishes Platter */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[120px]">
          {ownedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 auto-rows-max">
              {ownedItems.map(({ item, count }) => {
                const isFull = hunger >= 100 && (item.hunger || 0) > 0 && !item.curesSickness;
                const isCurrentlyServed = activeServedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between gap-1.5 shadow-md group relative overflow-hidden ${
                      isCurrentlyServed
                        ? 'bg-amber-950/80 border-amber-400 shadow-amber-900/50 scale-[1.01]'
                        : 'bg-black/60 hover:bg-black/80 border-stone-800 hover:border-amber-500/60'
                    }`}
                  >
                    {/* Top Row: Icon, Name, Portion Badge */}
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-950/90 to-stone-900 border border-amber-700/60 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                        {item.iconEmoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">
                            {item.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/70 text-[10px] text-amber-300 font-extrabold flex-shrink-0">
                            Sisa: {count}
                          </span>
                        </div>

                        <span className="text-[10px] text-amber-400/90 font-['Shippori_Mincho',serif] block -mt-0.5">
                          {item.japaneseName}
                        </span>

                        <p className="text-[10px] text-stone-300 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Stat Buff Preview Tags */}
                    <div className="flex items-center gap-1 flex-wrap text-[9px] font-semibold">
                      {item.hunger > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/70 text-emerald-300">
                          +{item.hunger} Kenyang
                        </span>
                      )}
                      {item.happiness > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-pink-950/80 border border-pink-700/70 text-pink-300">
                          +{item.happiness} Senang
                        </span>
                      )}
                      {item.curesSickness && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-600/80 text-rose-300 font-bold">
                          Obat Sakit
                        </span>
                      )}
                    </div>

                    {/* Feed Action Button */}
                    <button
                      disabled={isFull || diningState === 'serving' || diningState === 'chewing'}
                      onClick={() => handleServeFood(item)}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isFull
                          ? 'bg-stone-900/90 text-stone-500 border border-stone-800 cursor-not-allowed opacity-60'
                          : isCurrentlyServed
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-black animate-pulse'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 active:scale-98 shadow-amber-900/30'
                      }`}
                    >
                      {isFull ? (
                        <span>Perut Sudah Kenyang</span>
                      ) : isCurrentlyServed ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-stone-950 animate-spin" />
                          <span>Sedang Disantap...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5" />
                          <span>Sajikan ke {petName}</span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY BENTO STATE */
            <div className="py-4 text-center space-y-2 px-3 my-auto bg-stone-950/60 rounded-2xl border border-amber-500/40 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-stone-900/90 border border-amber-500/40 mx-auto flex items-center justify-center text-2xl shadow-lg">
                🍱
              </div>
              <h4 className="text-sm font-bold font-['Shippori_Mincho',serif] text-stone-200">
                Kotak Bekal Sedang Kosong!
              </h4>
              <p className="text-[11px] text-stone-300 max-w-xs mx-auto">
                Beli tahu aburaage segar, onigiri, atau dango di Toko Tanuki.
              </p>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                  onOpenShop();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-extrabold text-xs shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buka Toko Tanuki</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar: Finish Dining Button */}
        <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              onOpenShop();
            }}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer text-xs flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ke Toko Tanuki</span>
          </button>

          {/* Selesai Makan (Gochisousama) Button */}
          <button
            onClick={handleDone}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Selesai Makan (Kembali ke Ruang Tatami)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
