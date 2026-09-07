import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Navigation,
  Flame,
  Award,
  BookMarked,
  Gift,
  Heart,
  Download,
} from 'lucide-react';
import { PetData, ShrinePassData } from '../types/game';
import {
  generateShrineCode,
  SPIRITUAL_VISITOR_SHRINES,
  ELEMENTS_CONFIG,
} from '../data/gameConfig';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';
import { generateShrinePassportPng } from '../utils/shrinePassportCanvas';

interface ShrinePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  onReceivePilgrimageBlessing: (coins: number, exp: number, giftName: string) => void;
  visitedShrines: string[];
  setVisitedShrines: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ShrinePassModal: React.FC<ShrinePassModalProps> = ({
  isOpen,
  onClose,
  pet,
  onReceivePilgrimageBlessing,
  visitedShrines,
  setVisitedShrines,
}) => {
  const [activeTab, setActiveTab] = useState<'my_pass' | 'pilgrimage'>('my_pass');
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [customVisitShrine, setCustomVisitShrine] = useState<ShrinePassData | null>(null);
  const [activeVisitingShrine, setActiveVisitingShrine] = useState<ShrinePassData | null>(null);
  const [hasPrayedCurrent, setHasPrayedCurrent] = useState(false);

  if (!isOpen) return null;

  const myShrineCode = generateShrineCode(pet.name, pet.element, pet.level, pet.tailCount);
  const elementConfig = ELEMENTS_CONFIG[pet.element];

  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(myShrineCode);
    setCopied(true);
    soundEngine.playChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPassport = () => {
    soundEngine.playSuzuChime();
    hapticEngine.medium();
    setIsDownloading(true);

    try {
      const dataUrl = generateShrinePassportPng(pet, myShrineCode, elementConfig);
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `Hagumi_Paspor_Kuil_${pet.name}_${myShrineCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      soundEngine.playEvolutionFanfare();
      hapticEngine.evolution();
    } catch (e) {
      console.error('Failed to export passport PNG:', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;

    const query = codeInput.trim().toUpperCase();
    // Check if matching traveler shrine
    const foundTraveler = SPIRITUAL_VISITOR_SHRINES.find(
      (s) => s.shrineCode.toUpperCase() === query
    );

    if (foundTraveler) {
      soundEngine.playChime();
      setActiveVisitingShrine(foundTraveler);
      setHasPrayedCurrent(visitedShrines.includes(foundTraveler.shrineCode));
      return;
    }

    // Generate dynamic player shrine from valid code pattern
    // e.g. SHRINE-TAMAMO-FIR3T-1234
    const parts = query.split('-');
    if (parts.length >= 3) {
      const gName = parts[1] || 'Sora';
      const syntheticShrine: ShrinePassData = {
        shrineCode: query,
        shrineName: `Kuil Suci Penjaga ${gName}`,
        guardianName: `Kitsune ${gName}`,
        element: pet.element,
        tailCount: Math.min(9, Math.max(1, parseInt(parts[2]?.slice(3, 4) || '3', 10) || 3)),
        level: Math.max(5, pet.level - 1),
        hankoSignature: '和',
        greeting: `Salam damai dari kuil kami! Roh kami menyambut kunjunganmu dengan hangat.`,
        offeringGift: 'Berkah Teh Hijau Inari (+8 Ryo, +35 EXP)',
        visitorsCount: 42,
      };
      soundEngine.playChime();
      setActiveVisitingShrine(syntheticShrine);
      setHasPrayedCurrent(visitedShrines.includes(query));
    } else {
      soundEngine.playMiss();
    }
  };

  const handlePrayAtShrine = (shrine: ShrinePassData) => {
    if (hasPrayedCurrent || visitedShrines.includes(shrine.shrineCode)) {
      soundEngine.playMiss();
      return;
    }

    soundEngine.playSuzuChime();
    setHasPrayedCurrent(true);
    setVisitedShrines((prev) => [...prev, shrine.shrineCode]);
    onReceivePilgrimageBlessing(10, 45, shrine.offeringGift);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col bg-[#1c1815] border-2 border-red-800/80 rounded-2xl shadow-2xl text-stone-200 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 border-b border-red-700/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛩️</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-amber-200 tracking-wide flex items-center gap-1.5">
                Buku Segel Kuil (神社手帳 • Shrine Pass)
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80">
                Kartu Paspor Ziarah Inari & Kunjungan Kuil Spiritual
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS HEADER */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('my_pass');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-t border-x ${
              activeTab === 'my_pass'
                ? 'bg-[#261f1a] text-amber-300 border-red-700/60 border-b-0'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Paspor Kuil Saya</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('pilgrimage');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-t border-x ${
              activeTab === 'pilgrimage'
                ? 'bg-[#261f1a] text-amber-300 border-red-700/60 border-b-0'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Ziarah Kuil Teman ({visitedShrines.length})</span>
          </button>
        </div>

        {/* TAB 1: MY SHRINE PASS */}
        {activeTab === 'my_pass' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Traditional Certificate Card */}
            <div className="relative p-4 sm:p-5 rounded-xl bg-gradient-to-b from-[#2e1d15] via-[#21150f] to-[#170e0a] border-2 border-red-700/80 shadow-2xl overflow-hidden">
              {/* Background Torii watermark */}
              <div className="absolute right-3 bottom-0 opacity-10 pointer-events-none">
                <span className="text-9xl">⛩️</span>
              </div>

              {/* Certificate Ribbon */}
              <div className="flex items-center justify-between border-b border-red-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-700 border border-red-500 text-white font-black text-sm flex items-center justify-center shadow">
                    {pet.hankoSignature || '福'}
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      INARI GUARDIAN CERTIFICATE
                    </div>
                    <h3 className="text-base font-extrabold text-amber-100">
                      Kuil Suci {pet.name} (稲荷神社)
                    </h3>
                  </div>
                </div>

                <div className="px-2 py-1 rounded bg-stone-900/80 border border-stone-700 text-[11px] font-bold text-amber-300">
                  Lv.{pet.level} • {pet.tailCount} Ekor
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Afinitas Elemen Roh:</span>
                  <span className="font-extrabold text-amber-200 flex items-center gap-1 mt-0.5">
                    <span className="text-sm">✨</span>
                    {elementConfig.name}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Segel Cap Hanko:</span>
                  <span className="font-extrabold text-red-400 flex items-center gap-1 mt-0.5">
                    <span className="text-sm">🏮</span>
                    Cap Keberuntungan ({pet.hankoSignature || '福'})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Persembahan Kuil:</span>
                  <span className="font-bold text-amber-300 mt-0.5 block">
                    Bento Inari & Wagashi Manis
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                  <span className="text-stone-400 text-[10px] block">Kunjungan Diterima:</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {pet.careScore * 3 + 12} Peziarah
                  </span>
                </div>
              </div>

              {/* Shareable Code Box */}
              <div className="mt-2 p-3 rounded-lg bg-stone-950 border border-red-900/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                    Kode Paspor Kuil (Bagikan ke Teman):
                  </span>
                  <div className="text-xs sm:text-sm font-mono font-extrabold text-amber-300 tracking-wider">
                    {myShrineCode}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-600/70 text-amber-200 font-bold text-xs shadow cursor-pointer transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadPassport}
                    disabled={isDownloading}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 hover:brightness-110 active:scale-95 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all disabled:opacity-50"
                    title="Unduh Kartu Paspor Ziarah Tradisional (.PNG) beresolusi tinggi"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Mencetak...' : 'Unduh Paspor (.PNG)'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-400 leading-relaxed">
              💡 <strong className="text-amber-200">Tips Ziarah Kuil:</strong> Bagikan kode paspor kuilmu kepada teman! Teman yang berziarah ke kuilmu akan menyalakan dupa doa dan memberimu berkah koin Ryo serta EXP tambahan.
            </div>
          </div>
        )}

        {/* TAB 2: PILGRIMAGE (ZIARAH KUIL TEMAN & REGIONAL) */}
        {activeTab === 'pilgrimage' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Search or Enter Code Form */}
            <form onSubmit={handleSearchCode} className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Masukkan Kode Kuil (Contoh: INARI-KYOTO-777)..."
                className="flex-1 px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-red-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={!codeInput.trim()}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-700 hover:brightness-110 disabled:opacity-40 text-white font-bold text-xs shadow cursor-pointer transition-all flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Ziarah</span>
              </button>
            </form>

            {/* CURRENT ACTIVE VISIT VIEW */}
            {activeVisitingShrine && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#2c1a14] to-[#1e130e] border border-red-600/80 shadow-lg space-y-2.5 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-red-700 border border-red-500 text-white font-bold text-xs flex items-center justify-center shadow">
                      {activeVisitingShrine.hankoSignature}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-amber-200">
                        {activeVisitingShrine.shrineName}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Penjaga: {activeVisitingShrine.guardianName} (Lv.{activeVisitingShrine.level} • {activeVisitingShrine.tailCount} Ekor)
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveVisitingShrine(null)}
                    className="text-stone-400 hover:text-white text-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <p className="text-xs text-stone-300 italic bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                  "{activeVisitingShrine.greeting}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hadiah: {activeVisitingShrine.offeringGift}</span>
                  </div>

                  <button
                    onClick={() => handlePrayAtShrine(activeVisitingShrine)}
                    disabled={hasPrayedCurrent || visitedShrines.includes(activeVisitingShrine.shrineCode)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      hasPrayedCurrent || visitedShrines.includes(activeVisitingShrine.shrineCode)
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 opacity-80'
                        : 'bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white shadow cursor-pointer'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>
                      {hasPrayedCurrent || visitedShrines.includes(activeVisitingShrine.shrineCode)
                        ? 'Telah Didoakan ✓'
                        : 'Nyalakan Dupa & Berdoa'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* REGIONAL SPIRITUAL SHRINES LIST */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider px-1">
                Kuil Penjaga Roh Legendaris Jepang:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SPIRITUAL_VISITOR_SHRINES.map((shrine) => {
                  const isVisited = visitedShrines.includes(shrine.shrineCode);
                  return (
                    <div
                      key={shrine.shrineCode}
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveVisitingShrine(shrine);
                        setHasPrayedCurrent(isVisited);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                        isVisited
                          ? 'border-stone-800 bg-stone-900/60 opacity-80'
                          : 'border-red-900/70 hover:border-red-600 bg-stone-900/90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">⛩️</span>
                          <span className="text-xs font-bold text-amber-200 line-clamp-1">
                            {shrine.shrineName}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {shrine.shrineCode}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-stone-400">{shrine.guardianName}</span>
                        {isVisited ? (
                          <span className="text-emerald-400 font-bold">Telah Diziarahi ✓</span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-red-400" />
                            Kunjungi
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>Harmoni Kuil Ziarah Inari</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
