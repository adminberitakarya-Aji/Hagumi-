import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Droplets,
  Zap,
  Wind,
  Sun,
  Moon,
  Check,
  Egg,
  Heart,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { KitsuneElement, PetData } from '../types/game';
import {
  ELEMENTS_CONFIG,
  HANKO_KANJI_OPTIONS,
  DEFAULT_SANCTUARY_DECOR,
  DEFAULT_UNLOCKED_DECOR,
  DEFAULT_SHRINE_WISHES,
} from '../data/gameConfig';
import { KitsuneCanvas } from './KitsuneCanvas';
import { soundEngine } from '../utils/soundEngine';
import { BackupRestoreModal } from './BackupRestoreModal';

interface EggAltarModalProps {
  onHatchComplete: (newPet: PetData) => void;
}

export const EggAltarModal: React.FC<EggAltarModalProps> = ({ onHatchComplete }) => {
  const [step, setStep] = useState<'choose_element' | 'name_hanko' | 'incubate_hatch'>('choose_element');
  const [selectedElement, setSelectedElement] = useState<KitsuneElement>('fire');
  const [petName, setPetName] = useState('Hagumi');
  const [selectedKanji, setSelectedKanji] = useState('福');
  const [tapCount, setTapCount] = useState(0);
  const [isHatching, setIsHatching] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  // Temporary pet data for egg canvas rendering
  const dummyEggPet: PetData = {
    id: 'new_pet',
    name: petName,
    element: selectedElement,
    stage: 'egg',
    form: `egg_${selectedElement}` as any,
    tailCount: 0,
    stats: { hunger: 100, energy: 100, cleanliness: 100, happiness: 100, discipline: 50, health: 100 },
    weight: 250,
    ageDays: 0,
    exp: 0,
    level: 1,
    careScore: 100,
    careMistakes: 0,
    hankoSignature: selectedKanji,
    birthTimestamp: Date.now(),
    lastInteractionTime: Date.now(),
    lastDecayTime: Date.now(),
    isSleeping: false,
    isSick: false,
    poopCount: 0,
    coins: 50,
    inventory: { onigiri: 3, ocha: 2 },
    favoriteFood: 'aburaage',
    generation: 1,
    totalMiniGamesWon: 0,
    accessories: { neck: 'none', head: 'none' },
    unlockedAccessories: ['neck_none', 'head_none', 'head_leaf'],
    sanctuaryDecor: DEFAULT_SANCTUARY_DECOR,
    unlockedDecor: DEFAULT_UNLOCKED_DECOR,
    caretakerName: 'Pengasuh',
    bondingPoints: 100,
    bondingLevel: 1,
    bondingTitle: 'Kenalan Kuil',
    shrineWishes: DEFAULT_SHRINE_WISHES,
  };

  const handleEggTap = () => {
    if (isHatching) return;
    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);
    soundEngine.playClick();

    if (nextTaps >= 3) {
      setIsHatching(true);
      soundEngine.playHatch();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          ELEMENTS_CONFIG[selectedElement].primaryColor,
          ELEMENTS_CONFIG[selectedElement].secondaryColor,
          '#facc15',
          '#ffffff',
        ],
      });

      setTimeout(() => {
        const finalBabyPet: PetData = {
          ...dummyEggPet,
          id: `kitsune_${Date.now()}`,
          name: petName.trim() || 'Hagumi',
          stage: 'bayi',
          form: 'kitsunebi',
          tailCount: 1,
          stats: {
            hunger: 90,
            energy: 90,
            cleanliness: 100,
            happiness: 100,
            discipline: 50,
            health: 100,
          },
          weight: 450,
          birthTimestamp: Date.now(),
          lastInteractionTime: Date.now(),
          lastDecayTime: Date.now(),
        };

        soundEngine.playFoxChirp();
        onHatchComplete(finalBabyPet);
      }, 1200);
    }
  };

  const elementIcons: Record<KitsuneElement, React.ReactNode> = {
    fire: <Flame className="w-5 h-5 text-orange-500" />,
    water: <Droplets className="w-5 h-5 text-sky-500" />,
    thunder: <Zap className="w-5 h-5 text-amber-500" />,
    wind: <Wind className="w-5 h-5 text-emerald-500" />,
    light: <Sun className="w-5 h-5 text-rose-300" />,
    shadow: <Moon className="w-5 h-5 text-purple-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#29221d] via-[#1c1815] to-[#120f0d] text-stone-100 rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-amber-600/70">
        {/* Top Torii Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-amber-900/50 border border-amber-600/50 text-amber-300 text-xs font-semibold mb-2">
            <span>⛩️</span>
            <span>Kuil Suci Inari Okami • Altar Permata Roh Hōju (宝珠)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Shippori_Mincho',serif] text-amber-200 tracking-wide">
            HAGUMI (育み)
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-md mx-auto">
            Takdir membawamu ke altar suci kuil. Bangunkan roh rubah suci (*Kitsune*) dari batu permata Hōju dengan kehangatan kasih sayangmu.
          </p>
        </div>

        {/* STEP 1: Choose Element */}
        {step === 'choose_element' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-base font-bold text-amber-300">
                Pilih Elemen Batu Permata Roh Inari (Hōju / 宝珠):
              </h3>
              <p className="text-xs text-stone-400">
                Setiap permata menyimpan esensi roh elemen unik yang menuntun kepribadian dan wujud evolusi sang Kitsune kelak.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {(Object.keys(ELEMENTS_CONFIG) as KitsuneElement[]).map((elemKey) => {
                const cfg = ELEMENTS_CONFIG[elemKey];
                const isSelected = selectedElement === elemKey;

                return (
                  <button
                    key={elemKey}
                    type="button"
                    onClick={() => {
                      setSelectedElement(elemKey);
                      soundEngine.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/50 shadow-lg'
                        : 'bg-stone-900/80 border-stone-700/80 hover:border-stone-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-stone-800/80 flex items-center justify-center">
                        {elementIcons[elemKey]}
                      </div>
                      <span className="text-xl font-bold font-['Shippori_Mincho',serif] text-amber-300/80">
                        {cfg.kanji}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-100 flex items-center gap-1">
                        <span>{cfg.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium line-clamp-1">
                        {cfg.gemstoneName || cfg.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Element Detail Preview Box */}
            <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-700 text-xs text-stone-300 flex items-start gap-3">
              <span className="text-2xl font-bold font-['Shippori_Mincho',serif] text-amber-400 mt-0.5">
                {ELEMENTS_CONFIG[selectedElement].kanji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 text-sm">
                    {ELEMENTS_CONFIG[selectedElement].hojuTitle || ELEMENTS_CONFIG[selectedElement].name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-600/40 font-medium">
                    {ELEMENTS_CONFIG[selectedElement].gemstoneName}
                  </span>
                </div>
                <p className="mt-1 leading-relaxed text-stone-400">
                  {ELEMENTS_CONFIG[selectedElement].description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setIsRestoreOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-amber-600/60 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>💾</span>
                <span>Punya Berkas Cadangan? Pulihkan Santuari</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setStep('name_hanko');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-extrabold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Langkah Berikutnya: Beri Nama & Cap Hanko</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Name & Hanko Stamp Selection */}
        {step === 'name_hanko' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-base font-bold text-amber-300">
                Beri Nama & Tentukan Cap Hanko Pelindung:
              </h3>
              <p className="text-xs text-stone-400">
                Nama adalah mantra pertama yang mengikat ikatan batinmu dengan sang Kitsune.
              </p>
            </div>

            {/* Name Input */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-700">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                Nama Kitsune Pilihanmu:
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                maxLength={16}
                placeholder="Contoh: Hagumi, Kohaku, Yuzu, Sora..."
                className="w-full px-4 py-3 rounded-xl bg-stone-800 text-amber-100 font-bold text-base border border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Hanko Stamp Selection */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-700">
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Pilih Cap Hanko (Stempel Perlindungan Kasih):</span>
                <span className="text-[11px] text-amber-400/80 normal-case">
                  Terpilih: {selectedKanji}
                </span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {HANKO_KANJI_OPTIONS.map((item) => (
                  <button
                    key={item.kanji}
                    type="button"
                    onClick={() => {
                      setSelectedKanji(item.kanji);
                      soundEngine.playClick();
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedKanji === item.kanji
                        ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-400/50 shadow-md scale-105'
                        : 'bg-stone-800/80 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {/* Traditional Red Hanko Seal Box */}
                    <div className="w-8 h-8 rounded-md bg-rose-600 border border-rose-400 text-white font-['Shippori_Mincho',serif] font-bold text-lg flex items-center justify-center shadow-inner">
                      {item.kanji}
                    </div>
                    <span className="text-[10px] text-stone-300 font-bold mt-1">
                      {item.reading}
                    </span>
                    <span className="text-[8px] text-stone-400 text-center line-clamp-1">
                      {item.meaning}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('choose_element')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-400 hover:text-stone-200 transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={!petName.trim()}
                onClick={() => {
                  soundEngine.playShrineBell();
                  setStep('incubate_hatch');
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-stone-950 font-extrabold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Bawa ke Altar Permata Hōju</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Incubate & Awakening Interaction */}
        {step === 'incubate_hatch' && (
          <div className="space-y-4 text-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                Upacara Kebangkitan Roh • {ELEMENTS_CONFIG[selectedElement].hojuTitle || ELEMENTS_CONFIG[selectedElement].name}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-['Shippori_Mincho',serif] text-stone-100 mt-0.5">
                Sentuh Permata Hōju untuk Menyalurkan Kehangatan Jiwamu!
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Ketuk batu permata suci ini sebanyak 3 kali agar pendaran roh Kitsune terbangun dan mewujud keluar.
              </p>
            </div>

            {/* Interactive Canvas Hōju Jewel */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div
                onClick={handleEggTap}
                className="transition-transform active:scale-95 cursor-pointer"
              >
                <KitsuneCanvas
                  pet={dummyEggPet}
                  eggCrackCount={tapCount}
                  actionState="idle"
                  onPetClick={handleEggTap}
                />
              </div>

              {/* Tap Counter Progress Bar */}
              <div className="w-48 mx-auto mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1">
                  <span>Energi Kebangkitan:</span>
                  <span>{tapCount} / 3</span>
                </div>
                <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden border border-stone-700 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (tapCount / 3) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Quick Tap Button */}
              <button
                type="button"
                onClick={handleEggTap}
                className="mt-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>💎</span>
                <span>Bangunkan Permata Hōju ({tapCount} / 3)</span>
              </button>
            </div>

            <p className="text-xs text-amber-400/90 font-medium animate-pulse">
              {tapCount === 0 && '👉 Klik batu permata Hōju di atas atau tombol di bawah!'}
              {tapCount === 1 && '✨ Permata mulai bergetar hangat & pendaran batin pertama terpancar!'}
              {tapCount === 2 && '⚡ Sinar cahaya suci merekah terang dari dalam kristal! 1 ketukan lagi!'}
              {tapCount >= 3 && '🎉 Cahaya spiritual meledak megah! Lahirlah roh Kitsune!'}
            </p>
          </div>
        )}
      </div>

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        pet={null}
        onRestore={(restoredPet) => {
          setIsRestoreOpen(false);
          onHatchComplete(restoredPet);
        }}
      />
    </div>
  );
};
