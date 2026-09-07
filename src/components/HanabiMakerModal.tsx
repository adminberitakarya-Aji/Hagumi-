import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Award,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HanabiMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSuccess: (score: number, coinsEarned: number, happinessEarned: number) => void;
}

type ColorFormula = 'red' | 'blue' | 'gold' | 'green' | 'purple';
type FireworkPattern = 'kiku' | 'kitsune' | 'crown' | 'heart';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

export const HanabiMakerModal: React.FC<HanabiMakerModalProps> = ({
  isOpen,
  onClose,
  onLaunchSuccess,
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorFormula>('gold');
  const [selectedPattern, setSelectedPattern] = useState<FireworkPattern>('kiku');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<'craft' | 'flying' | 'burst' | 'score'>('craft');
  const [lastScore, setLastScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Fireworks Color Palette Mapping
  const colorPalettes: Record<ColorFormula, { name: string; hex: string; desc: string }> = {
    red: { name: 'Merah Delima (Aka)', hex: '#f43f5e', desc: 'Garam Strontium berkobar hangat' },
    blue: { name: 'Biru Samudra (Ao)', hex: '#38bdf8', desc: 'Oksida Tembaga sejuk mistis' },
    gold: { name: 'Krisan Emas (Kin)', hex: '#facc15', desc: 'Besi & Natrium keemasan kekaisaran' },
    green: { name: 'Zamrud Hutan (Midori)', hex: '#34d399', desc: 'Barium cerah penolak bala' },
    purple: { name: 'Violet Roh (Murasaki)', hex: '#c084fc', desc: 'Campuran magis rubah roh' },
  };

  const patternDetails: Record<FireworkPattern, { name: string; emoji: string; desc: string }> = {
    kiku: { name: 'Bunga Krisan (菊花)', emoji: '🌸', desc: 'Kelopak menyebar sempurna 360°' },
    kitsune: { name: 'Wajah Kitsune (狐面)', emoji: '🦊', desc: 'Siluet telinga & moncong rubah' },
    crown: { name: 'Mahkota Torii (冠菊)', emoji: '⛩️', desc: 'Pecahan emas berantai gemerlap' },
    heart: { name: 'Hati Kasih Sayang (愛)', emoji: '💖', desc: 'Mekar berbentuk hati kasih' },
  };

  const handleLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setLaunchStage('flying');

    // 1. Sound: Whistle rocket rising
    soundEngine.playFireworksWhistle();

    // 2. Rocket ascents for 900ms then bursts
    setTimeout(() => {
      triggerBurst();
    }, 850);
  };

  const triggerBurst = () => {
    setLaunchStage('burst');
    soundEngine.playFireworksBurst();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.38;

    const baseColor = colorPalettes[selectedColor].hex;
    const newParticles: Particle[] = [];

    if (selectedPattern === 'kiku') {
      // 360 degree radial chrysanthemum
      const count = 72;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const speed = 2.5 + Math.random() * 3.8;
        newParticles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: i % 4 === 0 ? '#ffffff' : baseColor,
          alpha: 1,
          size: Math.random() * 2.5 + 2,
          decay: 0.012 + Math.random() * 0.008,
        });
      }
    } else if (selectedPattern === 'kitsune') {
      // Fox face pattern (ears + face center)
      const count = 65;
      for (let i = 0; i < count; i++) {
        let vx = (Math.random() - 0.5) * 4.5;
        let vy = (Math.random() - 0.5) * 4.5;
        // Ear accents
        if (i < 15) {
          vx = -2.2 + (Math.random() - 0.5) * 1.5;
          vy = -3.8 - Math.random() * 2;
        } else if (i < 30) {
          vx = 2.2 + (Math.random() - 0.5) * 1.5;
          vy = -3.8 - Math.random() * 2;
        }
        newParticles.push({
          x: centerX,
          y: centerY,
          vx,
          vy,
          color: i < 30 ? '#fbbf24' : baseColor,
          alpha: 1,
          size: 3,
          decay: 0.014,
        });
      }
    } else if (selectedPattern === 'heart') {
      // Parametric Heart curve
      const count = 60;
      for (let i = 0; i < count; i++) {
        const t = (i * 2 * Math.PI) / count;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        newParticles.push({
          x: centerX,
          y: centerY,
          vx: (hx / 16) * 3.8,
          vy: (hy / 16) * 3.8,
          color: baseColor,
          alpha: 1,
          size: 2.8,
          decay: 0.011,
        });
      }
    } else {
      // Torii Crown cascading willow
      const count = 80;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const speed = 1.8 + Math.random() * 4.2;
        newParticles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          color: i % 2 === 0 ? '#fde047' : baseColor,
          alpha: 1,
          size: 2.5,
          decay: 0.009,
        });
      }
    }

    particlesRef.current = newParticles;

    // Conclude launch and grant reward
    const score = Math.floor(Math.random() * 15 + 85); // 85 - 100 Artistry Score
    const coins = Math.floor(score / 5); // 17 - 20 Ryo
    const happiness = 25;
    setLastScore(score);

    setTimeout(() => {
      setLaunchStage('score');
      soundEngine.playSuzuChime();
      onLaunchSuccess(score, coins, happiness);
      setIsLaunching(false);
    }, 2400);
  };

  // Canvas animation loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      // Dark translucent clear for trail effect
      ctx.fillStyle = 'rgba(10, 10, 18, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint distant Mount Fuji silhouette in night
      ctx.fillStyle = '#171a29';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.15, canvas.height);
      ctx.quadraticCurveTo(canvas.width * 0.42, canvas.height * 0.85, canvas.width * 0.48, canvas.height * 0.62);
      ctx.lineTo(canvas.width * 0.52, canvas.height * 0.62);
      ctx.quadraticCurveTo(canvas.width * 0.58, canvas.height * 0.85, canvas.width * 0.85, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Draw snow cap
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.46, canvas.height * 0.68);
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.62);
      ctx.lineTo(canvas.width * 0.54, canvas.height * 0.68);
      ctx.lineTo(canvas.width * 0.51, canvas.height * 0.71);
      ctx.closePath();
      ctx.fill();

      // Rocket flight animation
      if (launchStage === 'flying') {
        const time = Date.now() * 0.006;
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        const rx = canvas.width / 2 + Math.sin(time) * 3;
        const ry = canvas.height * 0.88 - (Date.now() % 850) * 0.25;
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Rocket sparkle trail
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx, ry + 16);
        ctx.stroke();
      }

      // Render Burst Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.985; // Air drag
        p.vy *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle glow
        if (p.size > 2) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, launchStage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl max-h-[94vh] flex flex-col bg-[#14121a] border-2 border-amber-600/80 rounded-2xl shadow-2xl text-stone-200 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 border-b border-amber-600/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎆</span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-amber-200 tracking-wide flex items-center gap-1.5">
                Pengrajin Kembang Api (花火職人 • Hanabi Maker)
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400/80">
                Racik Bubuk Bunga Api Suci & Luncurkan di Atas Gunung Fuji
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

        {/* FIREWORKS NIGHT SKY CANVAS STAGE */}
        <div className="relative w-full h-48 sm:h-56 bg-slate-950 border-b border-stone-800 flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={520}
            height={260}
            className="w-full h-full object-cover"
          />

          {/* Overlay Status Badge during launch */}
          {launchStage === 'burst' && (
            <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-rose-600/80 border border-rose-400 text-white font-black text-xs shadow-lg animate-bounce">
                TAMAYA! (玉屋) 🎆
              </span>
            </div>
          )}

          {launchStage === 'score' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-3 animate-fade-in">
              <span className="text-2xl">✨</span>
              <div className="text-sm sm:text-base font-black text-amber-300">
                Karya Seni Kembang Api Agung!
              </div>
              <div className="text-xs text-stone-300 mt-0.5">
                Skor Keindahan: <strong className="text-emerald-400 font-bold">{lastScore} Poin</strong>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-amber-400 font-bold">🪙 +{Math.floor(lastScore / 5)} Ryo</span>
                <span className="text-rose-400 font-bold">💖 +25 Bahagia</span>
                <span className="text-indigo-300 font-bold">⭐ +40 EXP</span>
              </div>
            </div>
          )}
        </div>

        {/* CRAFTING WORKBENCH CONTROLS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#17141f]">
          {/* 1. Pilih Formula Bubuk Mineral */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              1. Pilih Campuran Garam Warna Mineral:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(Object.keys(colorPalettes) as ColorFormula[]).map((col) => {
                const isSelected = selectedColor === col;
                const info = colorPalettes[col];
                return (
                  <button
                    key={col}
                    disabled={isLaunching}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedColor(col);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-stone-900 shadow-md ring-2 ring-amber-500/30'
                        : 'border-stone-800 bg-stone-950/70 hover:bg-stone-900 text-stone-400'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: info.hex }}
                    />
                    <span className="text-[10px] font-bold text-stone-200 line-clamp-1">
                      {info.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pilih Pola Selubung Bunga Api */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              2. Bentuk Pola Ledakan (Warimono):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(patternDetails) as FireworkPattern[]).map((pat) => {
                const isSelected = selectedPattern === pat;
                const info = patternDetails[pat];
                return (
                  <button
                    key={pat}
                    disabled={isLaunching}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedPattern(pat);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-stone-900 shadow-md ring-2 ring-amber-500/30'
                        : 'border-stone-800 bg-stone-950/70 hover:bg-stone-900 text-stone-400'
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span className="text-[10px] font-bold text-stone-200 line-clamp-1">
                      {info.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Crafting Summary Box */}
          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-stone-400 text-[10px] block">Formula Bunga Api Siap Diluncurkan:</span>
              <span className="font-bold text-amber-200">
                {patternDetails[selectedPattern].name} • {colorPalettes[selectedColor].name}
              </span>
            </div>
            <span className="text-lg">{patternDetails[selectedPattern].emoji}</span>
          </div>
        </div>

        {/* FOOTER & LAUNCH BUTTON */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={handleLaunch}
            disabled={isLaunching}
            className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:brightness-110 disabled:opacity-50 text-white font-black text-xs tracking-wider shadow-lg cursor-pointer transition-all transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isLaunching ? 'Sedang Meluncur...' : 'SULUT & LUNCURKAN! 🎆'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
