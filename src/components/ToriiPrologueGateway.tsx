import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ArrowRight, 
  Flame, 
  Check, 
  Compass, 
  Sun, 
  Moon, 
  Heart,
  Scroll,
  Bell
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

// Image assets
import fujiToriiGateway from '../assets/images/fuji_torii_gateway_1788711184860.webp';
import kitsuneNineTails from '../assets/images/kitsune_nine_tails_1788711198603.webp';
import kitsunePup from '../assets/images/kitsune_spirit_pup_1788711085047.webp';
import autumnShrineNight from '../assets/images/autumn_shrine_night_1788711140696.webp';
import shrineEmaAnimeArt from '../assets/images/shrine_ema_anime_art_1788711484322.webp';

export interface ToriiPrologueGatewayProps {
  isOpen: boolean;
  onEnterSanctuary: () => void;
  onClose?: () => void;
  onClaimBlessingReward?: (coins: number) => void;
  onSaveEmaPrayer?: (prayer: string) => void;
}

type PrologueChapter = 'gateway' | 'evolution' | 'seasons' | 'artifacts';
type SeasonTheme = 'spring' | 'autumn';
type SpiritPreviewStage = 'pup' | 'kyubi';

export const ToriiPrologueGateway: React.FC<ToriiPrologueGatewayProps> = ({
  isOpen,
  onEnterSanctuary,
  onClose,
  onClaimBlessingReward,
  onSaveEmaPrayer,
}) => {
  const [activeChapter, setActiveChapter] = useState<PrologueChapter>('gateway');
  const [seasonTheme, setSeasonTheme] = useState<SeasonTheme>('spring');
  const [spiritStage, setSpiritStage] = useState<SpiritPreviewStage>('kyubi');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [emaPrayerText, setEmaPrayerText] = useState<string>('');
  const [isEmaHung, setIsEmaHung] = useState<boolean>(false);
  const [hasClaimedBlessing, setHasClaimedBlessing] = useState<boolean>(() => {
    return localStorage.getItem('hagumi_prologue_blessing_claimed') === 'true';
  });
  const [skipNextTime, setSkipNextTime] = useState<boolean>(() => {
    return localStorage.getItem('hagumi_skip_prologue_auto') === 'true';
  });
  const [isBellRinging, setIsBellRinging] = useState<boolean>(false);

  // Subtle mouse/parallax movement
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 15;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isOpen) return null;

  // Ring the sacred Suzu shrine bell
  const handleRingBell = () => {
    setIsBellRinging(true);
    soundEngine.playShrineBell();
    hapticEngine.heavy();
    setTimeout(() => setIsBellRinging(false), 1200);
  };

  // Hang the player's personal Ema prayer tablet
  const handleHangEma = () => {
    if (!emaPrayerText.trim()) return;
    soundEngine.playClick();
    soundEngine.playShrineBell();
    hapticEngine.evolution();
    setIsEmaHung(true);
    if (onSaveEmaPrayer) {
      onSaveEmaPrayer(emaPrayerText.trim());
    }
    // Save to localStorage as a memorable keepsake
    const savedPrayers = JSON.parse(localStorage.getItem('hagumi_ema_prayers') || '[]');
    savedPrayers.push({
      date: new Date().toLocaleDateString('id-ID'),
      text: emaPrayerText.trim(),
    });
    localStorage.setItem('hagumi_ema_prayers', JSON.stringify(savedPrayers));
  };

  // Claim initial Omamori fortune blessing (+50 Ryo)
  const handleClaimBlessing = () => {
    if (hasClaimedBlessing) return;
    soundEngine.playCoin();
    hapticEngine.heavy();
    setHasClaimedBlessing(true);
    localStorage.setItem('hagumi_prologue_blessing_claimed', 'true');
    if (onClaimBlessingReward) {
      onClaimBlessingReward(50);
    }
  };

  // Toggle remember choice for auto skipping
  const handleToggleSkipNextTime = () => {
    const nextVal = !skipNextTime;
    setSkipNextTime(nextVal);
    localStorage.setItem('hagumi_skip_prologue_auto', nextVal ? 'true' : 'false');
    soundEngine.playClick();
    hapticEngine.tap();
  };

  // Final confirmation to step through the Torii into the Tatami Sanctuary
  const handleProceedIntoSanctuary = () => {
    soundEngine.playShrineBell();
    hapticEngine.evolution();
    localStorage.setItem('hagumi_seen_prologue', 'true');
    onEnterSanctuary();
  };

  // Background image depending on chosen season
  const activeBg = seasonTheme === 'spring' ? fujiToriiGateway : autumnShrineNight;

  const chapters: { id: PrologueChapter; title: string; kanji: string; icon: string }[] = [
    { id: 'gateway', title: 'Gerbang Torii & Fuji', kanji: '鳥居・富士', icon: '⛩️' },
    { id: 'evolution', title: 'Silsilah Roh Kitsune', kanji: '九尾の道', icon: '🦊' },
    { id: 'seasons', title: 'Empat Musim Santuari', kanji: '四季の社', icon: '🍂' },
    { id: 'artifacts', title: 'Artefak Ema & Omamori', kanji: '絵馬・守り', icon: '📿' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[60] w-full h-full overflow-hidden bg-[#0e0906] select-none font-['Zen_Maru_Gothic',sans-serif]"
      >
        {/* Parallax Background Visual */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out transform scale-105"
          style={{
            backgroundImage: `url(${activeBg})`,
            transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0) scale(1.06)`,
          }}
        />

        {/* Ambient Dark Atmospheric Gradient Overlays for high readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a07] via-[#0e0a07]/60 to-[#0e0a07]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#000000]/30 to-[#000000]/70 pointer-events-none" />

        {/* Floating Petal / Embers Particle Canvas (Visual CSS Effect) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full pointer-events-none ${
                seasonTheme === 'spring'
                  ? 'bg-rose-300/40 shadow-[0_0_8px_rgba(244,114,182,0.6)]'
                  : 'bg-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              }`}
              style={{
                width: `${6 + (i % 5) * 3}px`,
                height: `${6 + (i % 5) * 3}px`,
                left: `${(i * 7.5 + 4) % 100}%`,
                top: `${(i * 11 + 6) % 100}%`,
              }}
              animate={{
                y: [0, -35, 10, 0],
                x: [0, (i % 2 === 0 ? 20 : -20), 0],
                opacity: [0.3, 0.8, 0.4, 0.3],
                scale: [0.8, 1.2, 0.9, 0.8],
              }}
              transition={{
                duration: 6 + (i % 4) * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* TOP HEADER: Title, Kanji, Audio & Quick Exit */}
        <div className="relative z-20 w-full px-4 py-3 sm:px-8 sm:py-5 flex items-center justify-between backdrop-blur-xs border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-800/90 to-amber-950 border-2 border-amber-500/80 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              ⛩️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-amber-100 tracking-wider">
                  HAGUMI 育み
                </span>
                <span className="text-[10px] sm:text-xs font-['Shippori_Mincho',serif] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 font-bold">
                  Kuil Suci Inari Okami
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden xs:block font-medium">
                Prologue Gerbang Torii & Santuari Penjaga Roh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Shrine Bell Sound Effect Button */}
            <button
              onClick={handleRingBell}
              title="Bunyikan Lonceng Suci Kuil (Suzu)"
aria-label="Bunyikan Lonceng Suci Kuil (Suzu)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                isBellRinging
                  ? 'bg-amber-500 text-stone-950 border-amber-300 scale-105 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                  : 'bg-stone-900/80 border-amber-700/60 text-amber-200 hover:border-amber-400 hover:bg-stone-800'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isBellRinging ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Lonceng Suzu</span>
            </button>

            {/* BGM Toggle */}
            <button
              onClick={() => {
                const active = soundEngine.toggleAmbientBGM();
                setIsAudioPlaying(active);
              }}
              title={isAudioPlaying ? 'Jeda Musik Zen Kuil' : 'Putar Musik Zen Kuil'}
aria-label={isAudioPlaying ? 'Jeda Musik Zen Kuil' : 'Putar Musik Zen Kuil'}
              className="p-2 rounded-xl bg-stone-900/80 border border-amber-700/60 text-amber-300 hover:text-amber-100 hover:border-amber-400 transition-all cursor-pointer"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Skip / Enter Button */}
            {onClose ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-stone-900/80 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-white transition-all cursor-pointer"
                title="Tutup Prologue"
aria-label="Tutup Prologue"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProceedIntoSanctuary}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-600/60 text-amber-300 hover:bg-amber-900/60 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Lewati</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* MAIN INTERACTIVE PROLOGUE WORKSPACE */}
        <div className="relative z-10 w-full h-[calc(100%-140px)] sm:h-[calc(100%-150px)] max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-col justify-between overflow-y-auto">
          
          {/* NAVIGATION TABS (4 DIMENSIONS OF HAGUMI) */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap mb-2">
            {chapters.map((ch) => {
              const isActive = activeChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    soundEngine.playClick();
                    hapticEngine.tap();
                    setActiveChapter(ch.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-extrabold border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-[#1e130c]/90 border border-amber-800/70 text-amber-200/90 hover:bg-[#2e1c12] hover:text-amber-100'
                  }`}
                >
                  <span className="text-sm sm:text-base">{ch.icon}</span>
                  <span>{ch.title}</span>
                  <span className="text-[10px] opacity-80 font-['Shippori_Mincho',serif] hidden md:inline">
                    ({ch.kanji})
                  </span>
                </button>
              );
            })}
          </div>

          {/* DYNAMIC CONTENT PER CHAPTER */}
          <div className="flex-1 flex items-center justify-center p-1 sm:p-2">
            <AnimatePresence mode="wait">
              
              {/* CHAPTER 1: TORII GATEWAY & MOUNT FUJI */}
              {activeChapter === 'gateway' && (
                <motion.div
                  key="chap-gateway"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-3xl bg-[#1a110a]/90 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-8 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Visual Portrait Preview */}
                  <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex-shrink-0 group">
                    <img
                      src={fujiToriiGateway}
                      alt="Gerbang Torii Inari & Gunung Fuji"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                      <span className="text-[10px] tracking-widest text-amber-300 font-bold uppercase font-['Shippori_Mincho',serif]">
                        ⛩️ 鳥居参道 • 富士遠景
                      </span>
                    </div>
                  </div>

                  {/* Lore & Story Narrative */}
                  <div className="flex-1 text-left space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 text-xs font-bold">
                      <span>✨</span>
                      <span>Selamat Datang di Ambang Batas Suci</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-amber-100 leading-tight">
                      Di Balik Gerbang Torii, Ikatan Batin Roh Dimulai
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      Lentera batu <em>(Tōrō)</em> menyala memandu jalan setapak berbatu di tengah kelopak sakura yang gugur. 
                      Di kaki Gunung Fuji yang agung, bersemayam santuari damai tempat jiwa-jiwa roh rubah suci Inari 
                      menunggu seorang pengasuh yang tulus hati.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700 text-xs text-stone-300">
                        <span>🍃</span>
                        <span>Harmoni Wabi-Sabi</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700 text-xs text-stone-300">
                        <span>🎵</span>
                        <span>Audio Suzu & Shakuhachi</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-700 text-xs text-stone-300">
                        <span>🪞</span>
                        <span>Kedalaman Parallax 2.5D</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CHAPTER 2: SPIRIT EVOLUTION & COMPANION SHOWCASE */}
              {activeChapter === 'evolution' && (
                <motion.div
                  key="chap-evolution"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-3xl bg-[#1a110a]/90 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Spirit Stage Switcher & Visual */}
                  <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] bg-stone-950">
                      <img
                        src={spiritStage === 'pup' ? kitsunePup : kitsuneNineTails}
                        alt="Wujud Kitsune"
                        className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-2">
                        <span className="text-[11px] font-extrabold text-amber-200">
                          {spiritStage === 'pup' ? '🐾 Tahap Bayi (Ekor 1)' : '🔥 Tahap Kyūbi (Ekor 9)'}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-600 text-amber-300 font-mono">
                          {spiritStage === 'pup' ? 'Stage I' : 'Puncak'}
                        </span>
                      </div>
                    </div>

                    {/* Stage Toggle Switch */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-950 border border-amber-800/80">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          hapticEngine.tap();
                          setSpiritStage('pup');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          spiritStage === 'pup'
                            ? 'bg-amber-600 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Bayi (Ekor 1)
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          hapticEngine.tap();
                          setSpiritStage('kyubi');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          spiritStage === 'kyubi'
                            ? 'bg-amber-600 text-stone-950 shadow-xs'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Kyūbi (Ekor 9)
                      </button>
                    </div>
                  </div>

                  {/* Lore Narrative */}
                  <div className="flex-1 text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 text-xs font-bold">
                      <span>🦊</span>
                      <span>Siklus Reinkarnasi & Ikatan Batin (Kizuna)</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-amber-100 leading-tight">
                      {spiritStage === 'pup'
                        ? 'Kelahiran Anak Rubah yang Menggemaskan'
                        : 'Transendensi Roh Pelindung Langit Sembilan Ekor'}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {spiritStage === 'pup'
                        ? 'Roh Kitsune bangkit dari pendaran batu permata roh Hōju suci Inari dengan seutas ekor mungil dan lonceng suzu kecil di lehernya. Ia membutuhkan suapan Bento lezat (Aburaage & Onigiri), kehangatan mandi air mata air, serta kasih sayang tulus Anda.'
                        : 'Melalui disiplin perawatan dan ikatan batin yang erat, setiap helai ekor baru akan tumbuh hingga mencapai puncaknya: Kyūbi no Kitsune keemasan yang memancarkan api kitsunebi hangat sebagai pelindung santuari abadi.'}
                    </p>

                    <div className="p-3 rounded-2xl bg-[#241710] border border-amber-700/60 flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">
                          Metode Perkembangan
                        </span>
                        <span className="text-xs text-amber-200 font-bold">
                          Kotak Bento Jubako • Main Festival • Doa Kuil
                        </span>
                      </div>
                      <span className="text-2xl">🍙</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CHAPTER 3: SEASONS & TIME VARIATION */}
              {activeChapter === 'seasons' && (
                <motion.div
                  key="chap-seasons"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-3xl bg-[#1a110a]/90 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Season Image Comparison */}
                  <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                      <img
                        src={seasonTheme === 'spring' ? fujiToriiGateway : autumnShrineNight}
                        alt="Musim Santuari"
                        className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                        <span className="text-xs font-bold text-amber-200">
                          {seasonTheme === 'spring' ? '🌸 Senja Musim Semi (Haru)' : '🍁 Malam Musim Gugur (Aki)'}
                        </span>
                      </div>
                    </div>

                    {/* Season Switcher */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          hapticEngine.tap();
                          setSeasonTheme('spring');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          seasonTheme === 'spring'
                            ? 'bg-rose-900/80 border-rose-500 text-rose-200 shadow-sm'
                            : 'bg-stone-900/80 border-stone-700 text-stone-400'
                        }`}
                      >
                        <span>🌸</span>
                        <span>Musim Semi</span>
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          hapticEngine.tap();
                          setSeasonTheme('autumn');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          seasonTheme === 'autumn'
                            ? 'bg-amber-900/80 border-amber-500 text-amber-200 shadow-sm'
                            : 'bg-stone-900/80 border-stone-700 text-stone-400'
                        }`}
                      >
                        <span>🍁</span>
                        <span>Musim Gugur</span>
                      </button>
                    </div>
                  </div>

                  {/* Lore Narrative */}
                  <div className="flex-1 text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 text-xs font-bold">
                      <span>⛩️</span>
                      <span>Siklus Alam & Kesejukan Tradisional</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-amber-100 leading-tight">
                      Santuari yang Bernapas Bersama Siklus Waktu
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      Kuil Hagumi tidak pernah statis. Saat fajar menyingsing, kabut pegunungan menyelimuti Gunung Fuji. 
                      Di siang hari, cahaya matahari menyinari taman bambu. Dan di malam hari, bulan purnama menerangi dedaunan 
                      maple <em>(Momiji)</em> yang merah menyala sembari suara jangkrik dan lonceng bambu menemani tidur sang Kitsune.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-stone-900/70 border border-amber-900/50 flex items-center gap-2">
                        <span className="text-base">🌅</span>
                        <div>
                          <span className="font-bold text-amber-200 block">4 Fase Waktu</span>
                          <span className="text-[10px] text-stone-400">Pagi, Siang, Senja, Malam</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-900/70 border border-amber-900/50 flex items-center gap-2">
                        <span className="text-base">🎆</span>
                        <div>
                          <span className="font-bold text-amber-200 block">Festival Matsuri</span>
                          <span className="text-[10px] text-stone-400">Kembang api Hanabi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CHAPTER 4: ARTIFACTS, EMA & OMAMORI INTERACTION */}
              {activeChapter === 'artifacts' && (
                <motion.div
                  key="chap-artifacts"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-3xl bg-[#1a110a]/90 border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Artifact Art Illustration */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] flex-shrink-0 group">
                    <img
                      src={shrineEmaAnimeArt}
                      alt="Ema & Omamori Artefak Kuil Inari"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center">
                      <span className="text-[11px] font-bold text-amber-200 font-['Shippori_Mincho',serif]">
                        絵馬と御守り • Plakat Doa & Jimat Berkah
                      </span>
                    </div>
                  </div>

                  {/* Interactive Ritual Controls */}
                  <div className="flex-1 text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-600/70 text-amber-300 text-xs font-bold">
                      <span>📿</span>
                      <span>Ritual Permohonan Doa Pertama</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-amber-100 leading-tight">
                      Tuliskan Niat Murni di Plakat Kayu Ema
                    </h2>

                    {/* Ema Input Box or Hung Confirmation */}
                    {!isEmaHung ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={emaPrayerText}
                            onChange={(e) => setEmaPrayerText(e.target.value)}
                            placeholder="Contoh: Semoga kitsune selalu sehat & santuari penuh kedamaian..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/90 border border-amber-700 text-amber-100 placeholder:text-stone-500 text-xs focus:outline-none focus:border-amber-400"
                            maxLength={80}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleHangEma}
                            disabled={!emaPrayerText.trim()}
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <span>⛩️</span>
                            <span>Gantungkan Plakat Doa Ema</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/80 flex items-center gap-3">
                        <span className="text-2xl">🎋</span>
                        <div className="text-left flex-1">
                          <span className="text-xs font-bold text-amber-200 block">
                            Plakat Ema Tergantung di Dinding Kuil!
                          </span>
                          <span className="text-[11px] text-stone-300 italic">
                            "{emaPrayerText}"
                          </span>
                        </div>
                        <Check className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      </div>
                    )}

                    {/* Omamori Blessing Claim */}
                    <div className="pt-1 flex items-center justify-between p-2.5 rounded-2xl bg-stone-950/80 border border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧧</span>
                        <div>
                          <span className="text-xs font-bold text-amber-100 block">
                            Jimat Perlindungan Omamori
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {hasClaimedBlessing
                              ? 'Berkah 50 Ryo telah diterima di dompetmu'
                              : 'Ambil berkah awal +50 Ryo untuk belanja toko'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleClaimBlessing}
                        disabled={hasClaimedBlessing}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          hasClaimedBlessing
                            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                        }`}
                      >
                        {hasClaimedBlessing ? 'Diterima ✓' : 'Ambil Berkah'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* BOTTOM BAR: Auto-skip Toggle & Grand Enter Button */}
          <div className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            {/* Auto-skip Checkbox */}
            <button
              onClick={handleToggleSkipNextTime}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#140d08]/80 border border-amber-900/60 hover:border-amber-600/60 text-xs text-stone-300 transition-all cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  skipNextTime
                    ? 'bg-amber-600 border-amber-400 text-stone-950'
                    : 'border-stone-600 bg-stone-900'
                }`}
              >
                {skipNextTime && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-[11px] sm:text-xs">
                Langsung ke Kamar Tatami pada kunjungan berikutnya
              </span>
            </button>

            {/* Main Call to Action Button: STEP INTO SANCTUARY */}
            <button
              onClick={handleProceedIntoSanctuary}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-black text-sm sm:text-base tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:shadow-[0_0_40px_rgba(245,158,11,0.9)] hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5 border-2 border-amber-200"
            >
              <span>⛩️</span>
              <span>Melangkah Masuk ke Santuari</span>
              <span className="text-xs opacity-90 font-['Shippori_Mincho',serif] hidden xs:inline">
                (神社へ進む)
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </motion.div>
    </AnimatePresence>
  );
};
