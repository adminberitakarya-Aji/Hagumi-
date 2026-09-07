import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MessageCircle,
  Send,
  Scroll,
  Bell,
  Loader2,
  Heart,
  User,
  Check,
  Plus,
  Flame,
  Award,
  Utensils,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import { PetData, OmikujiResult, ShrineWish, WishCategory } from '../types/game';
import {
  BONDING_MILESTONES,
  getBondingLevelInfo,
  DEFAULT_SHRINE_WISHES,
} from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface ShrineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  setPet?: React.Dispatch<React.SetStateAction<PetData>>;
  showToast?: (msg: string) => void;
  onOmikujiDrawn: (bonusCoins: number, bonusHappiness: number) => void;
}

export const ShrineModal: React.FC<ShrineModalProps> = ({
  isOpen,
  onClose,
  pet,
  setPet,
  showToast,
  onOmikujiDrawn,
}) => {
  const [tab, setTab] = useState<'omikuji' | 'ema' | 'chat' | 'kizuna'>('omikuji');

  // Omikuji State
  const [omikuji, setOmikuji] = useState<OmikujiResult | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Ema Wish State
  const [isWritingWish, setIsWritingWish] = useState(false);
  const [wishText, setWishText] = useState('');
  const [wishCategory, setWishCategory] = useState<WishCategory>('bonding');
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);

  // Kizuna / Caretaker Profile State
  const [caretakerInput, setCaretakerInput] = useState(pet.caretakerName || 'Pengasuh');
  const [isEditingCaretaker, setIsEditingCaretaker] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'pet'; text: string }>>([
    {
      role: 'pet',
      text: `Kon kon! Salam hangat untuk ${pet.caretakerName || 'Pengasuh'}ku tercinta! Ada yang ingin kamu ceritakan atau tanyakan kepadaku hari ini? Kyuu~ ✨`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  const currentBondInfo = getBondingLevelInfo(pet.bondingPoints ?? 120);

  // Helper to add bonding points
  const addBondingPoints = (points: number, reason: string) => {
    if (!setPet) return;
    setPet((prev) => {
      const oldPts = prev.bondingPoints ?? 120;
      const newPts = oldPts + points;
      const oldInfo = getBondingLevelInfo(oldPts);
      const newInfo = getBondingLevelInfo(newPts);

      if (newInfo.level > oldInfo.level) {
        soundEngine.playEvolutionFanfare();
        if (showToast) {
          showToast(`💖 Ikatan Batin Naik! Kini Level ${newInfo.level}: ${newInfo.currentMilestone.title}!`);
        }
      } else if (showToast) {
        showToast(`💖 +${points} Poin Ikatan Batin (${reason})!`);
      }

      return {
        ...prev,
        bondingPoints: newPts,
        bondingLevel: newInfo.level,
        bondingTitle: newInfo.currentMilestone.title,
      };
    });
  };

  // 1. Draw Omikuji
  const handleDrawOmikuji = async () => {
    if (isDrawing) return;
    setIsDrawing(true);

    // Sacred ritual: Shake bamboo fortune cylinder + two-hand prayer clap (Kashiwade)
    soundEngine.playOmikujiShake();
    setTimeout(() => {
      soundEngine.playKashiwade();
    }, 380);
    hapticEngine.omikuji();

    try {
      const res = await fetch('/api/kitsune/omikuji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setOmikuji(data);

      // Sacred Inari Suzu bell chime & divine fanfare
      soundEngine.playSuzuShrineBell();
      setTimeout(() => {
        soundEngine.playEvolutionFanfare();
      }, 350);
      hapticEngine.evolution();
      onOmikujiDrawn(15, 20);
      addBondingPoints(15, 'Doa Ramalan Omikuji');
    } catch (err) {
      console.error(err);
      setOmikuji({
        blessing: 'Daikichi (Berkah Agung)',
        poem: 'Cahaya rubah menerangi senja berkabut,\nKetulusan hatimu mengundang bahagia tanpa surut.',
        advice: 'Beri makan kitsune-mu tahu goreng aburaage hari ini!',
        luckyItem: 'Aburaage & Teh Hijau',
      });
      soundEngine.playSuzuShrineBell();
      setTimeout(() => {
        soundEngine.playEvolutionFanfare();
      }, 350);
      hapticEngine.evolution();
      onOmikujiDrawn(15, 20);
      addBondingPoints(15, 'Doa Ramalan Omikuji');
    } finally {
      setIsDrawing(false);
    }
  };

  // 2. Submit new wish to Ema board
  const handleHangEmaWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim() || isSubmittingWish) return;

    setIsSubmittingWish(true);

    // Sacred offering: Coin tossed into Saisen-bako + two-hand prayer claps
    soundEngine.playSaisenCoin();
    setTimeout(() => {
      soundEngine.playKashiwade();
    }, 350);
    hapticEngine.bell();

    const userWishText = wishText.trim();
    setWishText('');

    try {
      const res = await fetch('/api/kitsune/ema-blessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish: userWishText,
          category: wishCategory,
          petName: pet.name,
          caretakerName: pet.caretakerName || 'Pengasuh',
        }),
      });
      const data = await res.json();
      const blessingText = data.blessing || `Kon kon! Doa sucimu telah dipersembahkan ke hadapan Inari Okami! ✨`;

      const newWish: ShrineWish = {
        id: `wish_${Date.now()}`,
        text: userWishText,
        category: wishCategory,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        fulfilled: false,
        kitsuneBlessing: blessingText,
      };

      if (setPet) {
        setPet((prev) => {
          const currentWishes = prev.shrineWishes || [];
          return {
            ...prev,
            shrineWishes: [newWish, ...currentWishes],
          };
        });
      }

      soundEngine.playSuzuShrineBell();
      setTimeout(() => {
        soundEngine.playEvolutionFanfare();
      }, 300);
      addBondingPoints(30, 'Menggantung Doa di Ema');
      setIsWritingWish(false);

      if (showToast) {
        showToast(`🎋 Doa Ema berhasil digantung di Kuil Inari! (+30 Poin Ikatan)`);
      }
    } catch (err) {
      console.error(err);
      setIsWritingWish(false);
    } finally {
      setIsSubmittingWish(false);
    }
  };

  // 3. Save Caretaker Name
  const handleSaveCaretaker = () => {
    const trimmed = caretakerInput.trim();
    if (!trimmed) return;

    if (setPet) {
      setPet((prev) => ({
        ...prev,
        caretakerName: trimmed,
      }));
    }

    soundEngine.playFoxChirp();
    setIsEditingCaretaker(false);
    if (showToast) {
      showToast(`✨ ${pet.name} kini akan memanggilmu: "${trimmed}"!`);
    }

    // Add immediate cute response in chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'pet',
        text: `Kon kon! Mulai saat ini aku akan selalu memanggilmu "${trimmed}" dengan bangga! Kyuu~ 🦊💕`,
      },
    ]);
  };

  // 4. Send Message in Chat
  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || inputMessage).trim();
    if (!userText || isChatLoading) return;

    setInputMessage('');
    soundEngine.playClick();

    const newMsgs = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMsgs);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/kitsune/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          pet: {
            name: pet.name,
            stage: pet.stage,
            form: pet.form,
            element: pet.element,
            stats: pet.stats,
            careScore: pet.careScore,
            caretakerName: pet.caretakerName || 'Pengasuh',
            favoriteFood: pet.favoriteFood || 'Aburaage',
            shrineWishes: pet.shrineWishes || [],
            bondingLevel: currentBondInfo.level,
            bondingTitle: currentBondInfo.currentMilestone.title,
            season: pet.season || 'autumn',
            recentDiaryNote: pet.customDiaryNotes && pet.customDiaryNotes.length > 0 ? pet.customDiaryNotes[0].text : undefined,
          },
          history: newMsgs.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      soundEngine.playFoxChirp();
      setMessages((prev) => [...prev, { role: 'pet', text: data.reply }]);

      // Rewarding dialogue interaction
      addBondingPoints(10, 'Percakapan Jiwa Kotodama');
    } catch (err) {
      console.error(err);
      const caretaker = pet.caretakerName || 'Pengasuh';
      setMessages((prev) => [
        ...prev,
        {
          role: 'pet',
          text: `Kon kon, ${caretaker}! *mengibaskan ekor lembut ke tanganmu* Aku selalu senang berada di sampingmu, kyuu~ ✨`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const wishCategories: Array<{ id: WishCategory; label: string; icon: string; color: string }> = [
    { id: 'bonding', label: 'Ikatan Batin', icon: '💖', color: 'border-pink-500 text-pink-300' },
    { id: 'health', label: 'Kesehatan & Keselamatan', icon: '🌿', color: 'border-emerald-500 text-emerald-300' },
    { id: 'fortune', label: 'Rezeki & Keberuntungan', icon: '🪙', color: 'border-amber-500 text-amber-300' },
    { id: 'wisdom', label: 'Kebijaksanaan & Belajar', icon: '📜', color: 'border-cyan-500 text-cyan-300' },
    { id: 'peace', label: 'Kedamaian Jiwa', icon: '🕊️', color: 'border-purple-500 text-purple-300' },
  ];

  const quickPrompts = [
    { label: 'Doa di Ema', prompt: 'Apakah kamu mengingat doa yang kugantung di papan Ema kuil?' },
    { label: 'Makanan Favorit', prompt: 'Apa makanan favoritmu yang paling lezat?' },
    { label: 'Musim Ini', prompt: 'Bagaimana perasaanmu menikmati musim saat ini di beranda kuil?' },
    { label: 'Ikatan Kita', prompt: 'Bagaimana ikatan batin kita saat ini, wahai roh rubahku?' },
  ];

  const activeWishes = pet.shrineWishes || DEFAULT_SHRINE_WISHES;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2a1d17] via-[#1c1410] to-[#120c09] text-stone-100 rounded-3xl p-3.5 sm:p-6 shadow-2xl border-2 border-amber-600/70 max-h-[96vh] flex flex-col">
        {/* Top Shrine Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/50 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                soundEngine.playSuzuShrineBell();
                setTimeout(() => soundEngine.playKashiwade(), 360);
                hapticEngine.bell();
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-900/80 hover:bg-rose-800 border border-rose-600/80 flex items-center justify-center text-2xl shadow-inner cursor-pointer hover:scale-110 active:scale-95 transition-all"
              title="Tarik Tali Genta Suzu & Tepukan Doa (Kashiwade)"
            >
              ⛩️
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-['Shippori_Mincho',serif] text-amber-200">
                  Kuil Penjaga Inari & Ikatan Jiwa
                </h3>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-[10px] text-amber-300 font-semibold">
                  絆 Kizuna Lv.{currentBondInfo.level}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Ramalan, papan doa kayu Ema, dialog batin berdaya memori, dan profil pengasuh.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (4 Tabs) */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 rounded-2xl bg-stone-900/80 border border-stone-800 mb-3 text-center">
          <button
            onClick={() => {
              soundEngine.playClick();
              setTab('omikuji');
            }}
            className={`py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              tab === 'omikuji'
                ? 'bg-rose-700 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="truncate">Omikuji</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setTab('ema');
            }}
            className={`py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              tab === 'ema'
                ? 'bg-amber-700 text-amber-100 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>🎋</span>
            <span className="truncate">Papan Ema ({activeWishes.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setTab('chat');
            }}
            className={`py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              tab === 'chat'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="truncate">Dialog Batin</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setTab('kizuna');
            }}
            className={`py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              tab === 'kizuna'
                ? 'bg-rose-900/90 text-rose-200 border border-rose-500 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="truncate">Profil Ikatan</span>
          </button>
        </div>

        {/* TAB 1: OMIKUJI */}
        {tab === 'omikuji' && (
          <div className="flex-1 flex flex-col items-center justify-center py-2 text-center overflow-y-auto">
            {!omikuji ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-amber-950/60 border-2 border-amber-600/70 flex items-center justify-center text-4xl sm:text-5xl shadow-xl animate-pulse">
                  🎋
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-amber-200 font-['Shippori_Mincho',serif]">
                    Kocok Silinder Bambu Omikuji
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-400 mt-1 leading-relaxed">
                    Petunjuk hari ini dari roh Inari Okami. Dapatkan berkah peruntungan, sajak haiku kitsune, +15 Ryo, dan +15 Poin Ikatan Batin!
                  </p>
                </div>
                <button
                  disabled={isDrawing}
                  onClick={handleDrawOmikuji}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                  {isDrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengocok Silinder Bambu...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Bunyikan Genta & Tarik Ramalan</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md bg-[#faf5ee] text-stone-900 rounded-2xl p-4 sm:p-5 shadow-2xl border-4 border-rose-700 animate-in zoom-in-95 text-center relative my-auto">
                <div className="absolute top-3 right-3 w-10 h-10 border-2 border-rose-700 rounded-lg text-rose-700 font-['Shippori_Mincho',serif] font-bold text-sm flex items-center justify-center">
                  伏見
                </div>

                <div className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold mb-1.5">
                  御神籤 • OMIKUJI
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold font-['Shippori_Mincho',serif] text-rose-800">
                  {omikuji.blessing}
                </h3>

                <div className="my-2.5 p-3 rounded-xl bg-stone-100 border-l-4 border-rose-600 text-xs italic font-serif leading-relaxed text-stone-800 whitespace-pre-line">
                  "{omikuji.poem}"
                </div>

                <div className="text-left text-xs space-y-1 pt-1 text-stone-700">
                  <p>
                    <strong className="text-stone-900">Nasihat Hari Ini:</strong> {omikuji.advice}
                  </p>
                  <p>
                    <strong className="text-stone-900">Benda Keberuntungan:</strong>{' '}
                    <span className="text-rose-700 font-bold">{omikuji.luckyItem}</span>
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-stone-300 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700">
                    +15 Ryo & +15 Poin Ikatan!
                  </span>
                  <button
                    onClick={() => setOmikuji(null)}
                    className="px-3 py-1 rounded-xl bg-stone-800 text-white font-bold text-xs hover:bg-stone-700 cursor-pointer"
                  >
                    Tarik Lagi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAPAN DOA KAYU EMA (絵馬) */}
        {tab === 'ema' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h4 className="text-xs sm:text-sm font-bold font-['Shippori_Mincho',serif] text-amber-200 flex items-center gap-1.5">
                  <span>🎋 Papan Doa Kayu Ema (絵馬掛け)</span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-stone-400">
                  Gantungkan harapanmu. {pet.name} akan selalu mengingat dan mendoakannya di altar.
                </p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsWritingWish(!isWritingWish);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all cursor-pointer"
              >
                {isWritingWish ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isWritingWish ? 'Tutup' : 'Tulis Doa (+30 Poin)'}</span>
              </button>
            </div>

            {/* Wish Creation Form */}
            {isWritingWish && (
              <form
                onSubmit={handleHangEmaWish}
                className="mb-3 p-3 rounded-2xl bg-[#251b14] border border-amber-600/60 animate-in slide-in-from-top-3"
              >
                <label className="block text-[11px] font-bold text-amber-300 mb-1.5">
                  Tuliskan Harapan atau Doa Hatimu:
                </label>
                <textarea
                  rows={2}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder={`Contoh: Semoga ${pet.name} selalu ceria, dan kita selalu berbahagia bersama...`}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none mb-2"
                />

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {wishCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setWishCategory(c.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        wishCategory === c.id
                          ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-sm'
                          : 'bg-stone-900/80 text-stone-400 border-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingWish(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!wishText.trim() || isSubmittingWish}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isSubmittingWish ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mempersembahkan Doa...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5" />
                        <span>Gantung di Rak Ema</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Ema Rack / Grid */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {activeWishes.map((w) => {
                const catObj = wishCategories.find((c) => c.id === w.category);
                return (
                  <div
                    key={w.id}
                    className="relative bg-gradient-to-r from-[#ecd8b9] via-[#f7ecd9] to-[#ebd5b5] text-stone-900 rounded-2xl p-3.5 shadow-md border-2 border-amber-800/60 overflow-hidden"
                  >
                    {/* Hanging String Ribbon */}
                    <div className="absolute top-0 left-6 w-3 h-2 bg-red-700 rounded-b-md shadow-xs" />
                    <div className="flex items-start justify-between gap-2 pl-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">{catObj?.icon || '🎋'}</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-950 bg-amber-300/60 px-1.5 py-0.5 rounded-md">
                            {catObj?.label || 'Doa Suci'}
                          </span>
                          <span className="text-[10px] text-stone-600">{w.date}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-serif font-bold text-stone-900 leading-snug">
                          "{w.text}"
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg border border-red-700/80 text-red-800 font-['Shippori_Mincho',serif] font-bold text-xs flex items-center justify-center shrink-0">
                        奉納
                      </div>
                    </div>

                    {/* Kitsune Spiritual Blessing Note */}
                    {w.kitsuneBlessing && (
                      <div className="mt-2 pt-2 border-t border-amber-800/20 text-[11px] text-rose-950 flex items-start gap-1.5 bg-rose-50/60 p-2 rounded-xl">
                        <span className="text-xs shrink-0">🦊</span>
                        <div className="italic leading-relaxed">
                          <strong>Pemberkatan {pet.name}:</strong> "{w.kitsuneBlessing}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DIALOG BATIN & MEMORI KONTEKSTUAL (KOTODAMA) */}
        {tab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Contextual Status Bar */}
            <div className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 mb-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">Pengasuh: {pet.caretakerName || 'Pengasuh'}</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-300">💖 {currentBondInfo.currentMilestone.title}</span>
              </div>
              <div className="text-[10px] text-stone-400">
                Memori Aktif: {activeWishes.length} Doa Ema
              </div>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.prompt)}
                  disabled={isChatLoading}
                  className="px-2.5 py-1 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-amber-200 text-[10px] sm:text-[11px] whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
                >
                  💬 {q.label}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 p-2 rounded-2xl bg-stone-950/70 border border-stone-800 mb-2.5 min-h-[190px] max-h-[250px]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-600 text-stone-950 font-medium rounded-br-xs'
                        : 'bg-stone-800/90 text-stone-100 border border-stone-700 rounded-bl-xs'
                    }`}
                  >
                    {m.role === 'pet' && (
                      <div className="text-[10px] font-bold text-amber-300 mb-0.5 flex items-center gap-1">
                        <span>🦊 {pet.name}</span>
                        <span className="text-stone-400 font-normal">({pet.stage})</span>
                      </div>
                    )}
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="px-3 py-1.5 rounded-2xl bg-stone-800 text-xs text-stone-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{pet.name} sedang mendengarkan isi hatimu...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Bicaralah dengan ${pet.name}... (+10 Poin Ikatan)`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PROFIL IKATAN & PENGASUH (KIZUNA) */}
        {tab === 'kizuna' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Caretaker Nickname Card */}
            <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-amber-600/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-200">Nama Panggilan Pengasuh</span>
                </div>
                {!isEditingCaretaker && (
                  <button
                    onClick={() => setIsEditingCaretaker(true)}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Ubah Panggilan
                  </button>
                )}
              </div>

              {isEditingCaretaker ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={caretakerInput}
                    onChange={(e) => setCaretakerInput(e.target.value)}
                    placeholder="Contoh: Kakak, Tuanku, Master Yuki..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleSaveCaretaker}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setCaretakerInput(pet.caretakerName || 'Pengasuh');
                      setIsEditingCaretaker(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-800 text-stone-400 text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <p className="text-stone-300">
                    {pet.name} memanggilmu dengan penuh kasih: <strong className="text-amber-300">"{pet.caretakerName || 'Pengasuh'}"</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Bonding Level & Progress Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#24131b] via-[#1c1218] to-[#160c14] border border-rose-500/50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span className="text-xs font-bold text-rose-200">
                      Tingkat Ikatan Batin: {currentBondInfo.currentMilestone.japaneseTitle}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-amber-200 mt-0.5">
                    Level {currentBondInfo.level} — {currentBondInfo.currentMilestone.title}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-300">
                    {pet.bondingPoints ?? 120} Pts
                  </span>
                  {currentBondInfo.nextMilestone && (
                    <p className="text-[10px] text-stone-400">
                      Target Lv.{currentBondInfo.nextMilestone.level}: {currentBondInfo.nextMilestone.minPoints} Pts
                    </p>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden border border-stone-800 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${currentBondInfo.progressPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-stone-300 italic mb-2">
                "{currentBondInfo.currentMilestone.description}"
              </p>

              <div className="p-2 rounded-xl bg-black/40 border border-rose-900/50 text-[10px] text-rose-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Kemampuan Terbuka:</strong> {currentBondInfo.currentMilestone.unlockedPerk}</span>
              </div>
            </div>

            {/* Favorite Food Sanctuary Memory */}
            <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600 flex items-center justify-center text-xl">
                  🍣
                </div>
                <div>
                  <h5 className="text-xs font-bold text-amber-200">Makanan Favorit Jiwa</h5>
                  <p className="text-[11px] text-stone-300 capitalize">
                    {pet.favoriteFood === 'aburaage' ? 'Tahu Goreng Aburaage (Kuil Emas)' : pet.favoriteFood}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-1 rounded-lg border border-amber-800">
                +15 Poin Ikatan saat disuapkan!
              </span>
            </div>

            {/* All Bonding Milestones List */}
            <div>
              <h5 className="text-xs font-bold text-stone-400 mb-2 font-['Shippori_Mincho',serif]">
                Jenjang Ikatan Roh (Kizuna Milestones):
              </h5>
              <div className="space-y-1.5">
                {BONDING_MILESTONES.map((m) => {
                  const isUnlocked = (pet.bondingPoints ?? 120) >= m.minPoints;
                  return (
                    <div
                      key={m.level}
                      className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                        isUnlocked
                          ? 'bg-stone-900/80 border-amber-600/50 text-stone-200'
                          : 'bg-stone-950/40 border-stone-800/60 text-stone-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{isUnlocked ? '💖' : '🔒'}</span>
                        <span className="font-bold">
                          Lv.{m.level} {m.title} ({m.japaneseTitle})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        {m.minPoints} Pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
