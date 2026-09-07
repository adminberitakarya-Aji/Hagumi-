import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Shield, RefreshCw, Volume2, Wind } from 'lucide-react';
import { PetData } from '../types/game';
import { soundEngine } from '../utils/soundEngine';
import { hapticEngine } from '../utils/hapticFeedback';

interface ZenGardenModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData;
  setPet: React.Dispatch<React.SetStateAction<PetData>>;
  showToast: (msg: string) => void;
}

interface KoiFish {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  targetX: number;
  targetY: number;
  length: number;
  type: 'kohaku' | 'sanke' | 'ogon' | 'showa' | 'tancho';
  tailPhase: number;
}

interface FoodPellet {
  id: number;
  x: number;
  y: number;
  life: number; // 0 to 1
}

interface WaterRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const ZenGardenModal: React.FC<ZenGardenModalProps> = ({
  isOpen,
  onClose,
  pet,
  setPet,
  showToast,
}) => {
  const [activeZone, setActiveZone] = useState<'koi' | 'sand'>('koi');

  // KOI POND STATE
  const pondCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const koiFishRef = useRef<KoiFish[]>([]);
  const foodPelletsRef = useRef<FoodPellet[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const animFramePondRef = useRef<number | null>(null);

  const [totalKoiFed, setTotalKoiFed] = useState(0);

  // ZEN SAND GARDEN (KARESANSUI) STATE
  const sandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingSandRef = useRef(false);
  const lastSandPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastRakeSoundTimeRef = useRef<number>(0);
  const [rakeTines, setRakeTines] = useState<3 | 5>(3);
  const [sandMeditateCount, setSandMeditateCount] = useState(0);

  // Initialize Koi Fish simulation
  useEffect(() => {
    if (!isOpen || activeZone !== 'koi') return;

    const canvas = pondCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    // Spawn 5 traditional Japanese Nishikigoi
    const types: Array<'kohaku' | 'sanke' | 'ogon' | 'showa' | 'tancho'> = [
      'kohaku',
      'sanke',
      'ogon',
      'showa',
      'tancho',
    ];
    koiFishRef.current = types.map((type, idx) => ({
      id: idx,
      x: 100 + Math.random() * (width - 200),
      y: 100 + Math.random() * (height - 200),
      angle: Math.random() * Math.PI * 2,
      speed: 1.2 + Math.random() * 0.8,
      targetX: Math.random() * width,
      targetY: Math.random() * height,
      length: 42 + Math.random() * 12,
      type,
      tailPhase: Math.random() * Math.PI * 2,
    }));

    let running = true;

    const loop = () => {
      if (!running) return;

      // 1. Draw pond background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a2328');
      grad.addColorStop(0.5, '#0e343d');
      grad.addColorStop(1, '#071b1f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle pond bottom stones
      ctx.fillStyle = 'rgba(15, 30, 35, 0.45)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 137) % width);
        const sy = ((i * 249) % height);
        ctx.beginPath();
        ctx.ellipse(sx, sy, 16, 11, (i * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Update & Draw Food Pellets
      const pellets = foodPelletsRef.current;
      for (let i = pellets.length - 1; i >= 0; i--) {
        const p = pellets[i];
        p.life -= 0.0018;

        ctx.fillStyle = 'rgba(180, 110, 50, 0.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(230, 180, 90, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (p.life <= 0) {
          pellets.splice(i, 1);
        }
      }

      // 3. Update & Draw Ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.8;
        r.alpha -= 0.012;

        ctx.strokeStyle = `rgba(180, 240, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 4. Update & Draw Koi Fish
      const fishList = koiFishRef.current;
      fishList.forEach((fish) => {
        // Check nearest pellet target
        let targetX = fish.targetX;
        let targetY = fish.targetY;

        if (pellets.length > 0) {
          let nearestDist = Infinity;
          let nearestPelletIdx = -1;

          pellets.forEach((p, pIdx) => {
            const dx = p.x - fish.x;
            const dy = p.y - fish.y;
            const d = Math.hypot(dx, dy);
            if (d < nearestDist) {
              nearestDist = d;
              nearestPelletIdx = pIdx;
            }
          });

          if (nearestPelletIdx !== -1) {
            targetX = pellets[nearestPelletIdx].x;
            targetY = pellets[nearestPelletIdx].y;

            // Eat pellet if close enough
            if (nearestDist < 16) {
              soundEngine.playKoiFeeding();
              hapticEngine.tap();
              pellets.splice(nearestPelletIdx, 1);
              setTotalKoiFed((c) => c + 1);

              // Spawn feeding ripple
              ripples.push({
                id: Date.now() + Math.random(),
                x: fish.x,
                y: fish.y,
                radius: 4,
                maxRadius: 28,
                alpha: 0.7,
              });

              // Reward stats subtly
              setPet((prev) => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  happiness: Math.min(100, prev.stats.happiness + 0.5),
                },
                bondingPoints: (prev.bondingPoints || 0) + 1,
              }));
            }
          }
        } else {
          // Wander around casually
          const distToWander = Math.hypot(fish.targetX - fish.x, fish.targetY - fish.y);
          if (distToWander < 40) {
            fish.targetX = 60 + Math.random() * (width - 120);
            fish.targetY = 60 + Math.random() * (height - 120);
          }
        }

        // Steer angle towards target
        const desiredAngle = Math.atan2(targetY - fish.y, targetX - fish.x);
        let diff = desiredAngle - fish.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        fish.angle += diff * 0.06;

        // Move fish
        const currentSpeed = pellets.length > 0 ? fish.speed * 1.5 : fish.speed;
        fish.x += Math.cos(fish.angle) * currentSpeed;
        fish.y += Math.sin(fish.angle) * currentSpeed;
        fish.tailPhase += 0.14 * currentSpeed;

        // Draw Koi Body
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.rotate(fish.angle);

        const l = fish.length;
        const w = l * 0.32;
        const tailSway = Math.sin(fish.tailPhase) * 6;

        // Shadow under water
        ctx.fillStyle = 'rgba(3, 15, 18, 0.45)';
        ctx.beginPath();
        ctx.ellipse(4, 6, l * 0.45, w * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main body base (white/golden)
        ctx.beginPath();
        ctx.moveTo(l * 0.5, 0); // nose
        ctx.quadraticCurveTo(l * 0.1, -w, -l * 0.4, -w * 0.4); // left flank
        ctx.quadraticCurveTo(-l * 0.55 + tailSway * 0.5, 0, -l * 0.4, w * 0.4); // rear
        ctx.quadraticCurveTo(l * 0.1, w, l * 0.5, 0); // right flank
        ctx.closePath();

        if (fish.type === 'ogon') {
          ctx.fillStyle = '#f59e0b'; // Golden yellow
        } else if (fish.type === 'showa') {
          ctx.fillStyle = '#1c1917'; // Black base
        } else {
          ctx.fillStyle = '#f8fafc'; // Pearlescent white base
        }
        ctx.fill();

        // Color Patches (Hi / Red & Sumi / Black)
        if (fish.type === 'kohaku' || fish.type === 'sanke') {
          ctx.fillStyle = '#dc2626'; // Vermilion red
          ctx.beginPath();
          ctx.ellipse(l * 0.1, 0, l * 0.22, w * 0.65, 0.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(-l * 0.2, 0, l * 0.14, w * 0.5, -0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (fish.type === 'sanke') {
          ctx.fillStyle = '#0f172a'; // Sumi black patches
          ctx.beginPath();
          ctx.ellipse(0, -w * 0.25, 4, 3, 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(-l * 0.25, w * 0.2, 5, 3.5, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        if (fish.type === 'tancho') {
          // Pure white body with single vermilion crown circle on head
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(l * 0.22, 0, w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        if (fish.type === 'showa') {
          // Black body with white and red accents
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.ellipse(l * 0.15, 0, l * 0.2, w * 0.6, 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(-l * 0.15, 0, l * 0.15, w * 0.5, -0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fins (Pectoral fins)
        ctx.fillStyle =
          fish.type === 'ogon' ? 'rgba(251, 191, 36, 0.65)' : 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(l * 0.15, -w * 0.9, l * 0.16, w * 0.4, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(l * 0.15, w * 0.9, l * 0.16, w * 0.4, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Tail fin (wagging)
        ctx.beginPath();
        ctx.moveTo(-l * 0.45, 0);
        ctx.quadraticCurveTo(-l * 0.7 + tailSway, -w * 0.7, -l * 0.8 + tailSway, -w * 0.3);
        ctx.lineTo(-l * 0.75 + tailSway, 0);
        ctx.lineTo(-l * 0.8 + tailSway, w * 0.3);
        ctx.quadraticCurveTo(-l * 0.7 + tailSway, w * 0.7, -l * 0.45, 0);
        ctx.fill();

        ctx.restore();
      });

      // 5. Draw decorative Lily Pads (Daun Teratai)
      ctx.fillStyle = '#15803d';
      const lilyPads = [
        { x: width * 0.12, y: height * 0.2, r: 36, cut: 0.6 },
        { x: width * 0.85, y: height * 0.3, r: 42, cut: 2.2 },
        { x: width * 0.88, y: height * 0.82, r: 32, cut: 4.1 },
        { x: width * 0.15, y: height * 0.85, r: 28, cut: 1.1 },
      ];
      lilyPads.forEach((pad) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pad.x, pad.y, pad.r, pad.cut + 0.35, pad.cut - 0.35, false);
        ctx.lineTo(pad.x, pad.y);
        ctx.closePath();
        ctx.fillStyle = '#14532d';
        ctx.fill();
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Lotus flower on the first lily pad
        if (pad.r > 38) {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(pad.x + 8, pad.y - 6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.arc(pad.x + 8, pad.y - 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animFramePondRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      running = false;
      if (animFramePondRef.current) {
        cancelAnimationFrame(animFramePondRef.current);
      }
    };
  }, [isOpen, activeZone, setPet]);

  // Handle clicking on Koi Pond (Drop pellet & create water ripple)
  const handlePondClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = pondCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    soundEngine.playBubblePop();
    hapticEngine.tap();

    // Spawn 1-2 pellets
    foodPelletsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      life: 1.0,
    });

    // Spawn water ripple
    ripplesRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      radius: 5,
      maxRadius: 40 + Math.random() * 20,
      alpha: 0.85,
    });
  };

  // Scatter full bait pack
  const handleScatterFullBait = () => {
    const canvas = pondCanvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    soundEngine.playWaterSplashLadle();
    hapticEngine.heavy();

    for (let i = 0; i < 7; i++) {
      const rx = 100 + Math.random() * (width - 200);
      const ry = 80 + Math.random() * (height - 160);
      foodPelletsRef.current.push({
        id: Date.now() + i,
        x: rx,
        y: ry,
        life: 1.0,
      });
      ripplesRef.current.push({
        id: Date.now() + i * 10,
        x: rx,
        y: ry,
        radius: 4,
        maxRadius: 35,
        alpha: 0.75,
      });
    }

    showToast('🌾 Menaburkan butir pelet pakan Koi! Ikan-ikan berenang berkumpul.');
  };

  // Initialize Zen Sand Garden Canvas
  const initSandGarden = () => {
    const canvas = sandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    // Warm, fine Japanese Zen gravel sand base
    ctx.fillStyle = '#d6cbbe';
    ctx.fillRect(0, 0, width, height);

    // Subtle fine sand noise texture
    ctx.fillStyle = 'rgba(160, 145, 130, 0.08)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 2, 1.5);
    }

    // Pre-rake horizontal gentle parallel lines
    ctx.strokeStyle = '#b8aa99';
    ctx.lineWidth = 3;
    const step = 24;
    for (let y = step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();

      // Top ridge highlight
      ctx.strokeStyle = '#eae4dc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, y - 2);
      ctx.lineTo(width - 20, y - 2);
      ctx.stroke();

      ctx.strokeStyle = '#b8aa99';
      ctx.lineWidth = 3;
    }

    // Draw 3 Sacred Zen Rocks (San-Zon-Seki) with green moss edges
    const rocks = [
      { x: width * 0.3, y: height * 0.45, rx: 34, ry: 24 },
      { x: width * 0.38, y: height * 0.52, rx: 20, ry: 16 },
      { x: width * 0.72, y: height * 0.38, rx: 40, ry: 28 },
    ];

    rocks.forEach((rock) => {
      // Concentric raked ripples around stones
      ctx.strokeStyle = '#b4a594';
      ctx.lineWidth = 2.5;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.ellipse(rock.x, rock.y, rock.rx + r * 12, rock.ry + r * 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Moss ring
      ctx.fillStyle = '#3f5732';
      ctx.beginPath();
      ctx.ellipse(rock.x, rock.y, rock.rx + 5, rock.ry + 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone body
      const stoneGrad = ctx.createRadialGradient(
        rock.x - 8,
        rock.y - 8,
        5,
        rock.x,
        rock.y,
        rock.rx
      );
      stoneGrad.addColorStop(0, '#78716c');
      stoneGrad.addColorStop(0.7, '#44403c');
      stoneGrad.addColorStop(1, '#292524');
      ctx.fillStyle = stoneGrad;

      ctx.beginPath();
      ctx.ellipse(rock.x, rock.y, rock.rx, rock.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (isOpen && activeZone === 'sand') {
      // Wait next tick so DOM layout has computed dimensions
      setTimeout(initSandGarden, 50);
    }
  }, [isOpen, activeZone]);

  // Sand raking mouse/touch handlers
  const handleSandStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingSandRef.current = true;
    const canvas = sandCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastSandPosRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleSandMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSandRef.current) return;
    const canvas = sandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const curX = clientX - rect.left;
    const curY = clientY - rect.top;

    if (!lastSandPosRef.current) {
      lastSandPosRef.current = { x: curX, y: curY };
      return;
    }

    // Play sand rake sound throttled (every 140ms)
    const now = Date.now();
    if (now - lastRakeSoundTimeRef.current > 140) {
      soundEngine.playSandRake();
      lastRakeSoundTimeRef.current = now;
    }

    const prevX = lastSandPosRef.current.x;
    const prevY = lastSandPosRef.current.y;
    const angle = Math.atan2(curY - prevY, curX - prevX);
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);

    // Draw multi-tine rake grooves
    const spacing = 10;
    const count = rakeTines;
    const half = Math.floor(count / 2);

    for (let i = -half; i <= half; i++) {
      const ox = normalX * (i * spacing);
      const oy = normalY * (i * spacing);

      // Deep groove
      ctx.strokeStyle = '#a89886';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevX + ox, prevY + oy);
      ctx.lineTo(curX + ox, curY + oy);
      ctx.stroke();

      // Ridge highlight
      ctx.strokeStyle = '#ede8e1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(prevX + ox - normalX * 1.5, prevY + oy - normalY * 1.5);
      ctx.lineTo(curX + ox - normalX * 1.5, curY + oy - normalY * 1.5);
      ctx.stroke();
    }

    lastSandPosRef.current = { x: curX, y: curY };
  };

  const handleSandEnd = () => {
    isDrawingSandRef.current = false;
    lastSandPosRef.current = null;
  };

  // Meditate session (Shishi-odoshi sound + stat blessing)
  const handleZenMeditation = () => {
    soundEngine.playShishiOdoshi();
    hapticEngine.heavy();
    setSandMeditateCount((c) => c + 1);

    setPet((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 12),
        discipline: Math.min(100, prev.stats.discipline + 15),
      },
      lastInteractionTime: Date.now(),
    }));

    showToast('🎍 "Thunk!" Bambu Shishi-odoshi memukul batu... Ketenangan batin meresap (+12 Bahagia, +15 Disiplin).');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative max-w-3xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-[#16120e]/95 border-2 border-amber-600/70 shadow-2xl overflow-hidden text-stone-100 font-['Shippori_Mincho',serif]"
      >
        {/* Header Tradisional Engawa */}
        <div className="relative px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#281810] via-[#352015] to-[#1c110b] border-b border-amber-700/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-950 border border-emerald-400/80 flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0">
              {activeZone === 'koi' ? '🐟' : '🪨'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-200 tracking-wide">
                  Engawa & Taman Zen Santuari
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-amber-900/80 border border-amber-500/60 text-[10px] text-amber-300 font-bold">
                  縁側 • 枯山水
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                Beranda kayu santuari menghadap kolam ikan Koi & pasir batu meditatif
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-amber-600/50 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zone Selector Tabs */}
        <div className="grid grid-cols-2 bg-[#120d09] border-b border-amber-800/40 p-1 gap-1 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveZone('koi');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeZone === 'koi'
                ? 'bg-gradient-to-r from-teal-900/90 to-emerald-900/90 text-emerald-100 shadow-md border border-emerald-400/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span className="text-base">🐟</span>
            <span>Kolam Ikan Koi (錦鯉の池)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveZone('sand');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeZone === 'sand'
                ? 'bg-gradient-to-r from-amber-900/90 to-stone-800 text-amber-100 shadow-md border border-amber-400/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span className="text-base">🪨</span>
            <span>Pasir Batu Karesansui (枯山水)</span>
          </button>
        </div>

        {/* Main Canvas Stage */}
        <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 space-y-3 overflow-hidden">
          {/* ZONE 1: KOI POND */}
          {activeZone === 'koi' && (
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <div className="relative flex-1 min-h-[300px] w-full rounded-2xl overflow-hidden border-2 border-teal-600/60 shadow-2xl bg-black cursor-crosshair">
                <canvas
                  ref={pondCanvasRef}
                  onClick={handlePondClick}
                  className="w-full h-full block"
                />

                {/* Floating overlay guide */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-teal-500/40 text-[10px] text-teal-200 flex items-center gap-1.5">
                  <span className="animate-pulse">💧</span>
                  <span>Ketuk permukaan air untuk menabur pakan pelet</span>
                </div>

                <div className="absolute top-2.5 right-2.5 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/40 text-[10px] text-amber-300 flex items-center gap-1.5">
                  <span>🎏 Pakan Dimakan:</span>
                  <span className="font-bold font-mono">{totalKoiFed}x</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#201712] border border-amber-900/60 text-xs">
                <div className="flex items-center gap-1.5 text-stone-300 text-[11px]">
                  <span>✨ Memberi makan Koi mempererat ikatan batin Kitsune (+Kizuna & +Bahagia).</span>
                </div>

                <button
                  onClick={handleScatterFullBait}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-extrabold text-xs shadow-md border border-teal-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>🌾 Tabur Pakan Banyak</span>
                </button>
              </div>
            </div>
          )}

          {/* ZONE 2: ZEN SAND GARDEN (KARESANSUI) */}
          {activeZone === 'sand' && (
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <div className="relative flex-1 min-h-[300px] w-full rounded-2xl overflow-hidden border-2 border-amber-700/60 shadow-2xl bg-[#d6cbbe] cursor-grab active:cursor-grabbing">
                <canvas
                  ref={sandCanvasRef}
                  onMouseDown={handleSandStart}
                  onMouseMove={handleSandMove}
                  onMouseUp={handleSandEnd}
                  onMouseLeave={handleSandEnd}
                  onTouchStart={handleSandStart}
                  onTouchMove={handleSandMove}
                  onTouchEnd={handleSandEnd}
                  className="w-full h-full block touch-none"
                />

                {/* Floating overlay guide */}
                <div className="absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/40 text-[10px] text-amber-200 flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-amber-300 animate-spin" />
                  <span>Seret jari / mouse untuk menyisir alur pasir Zen</span>
                </div>
              </div>

              {/* Sand Garden Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#201712] border border-amber-900/60 text-xs">
                {/* Rake Tines Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-300 font-bold">Mata Sisir Rake:</span>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setRakeTines(3);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      rakeTines === 3
                        ? 'bg-amber-700 text-white border-amber-400 shadow'
                        : 'bg-stone-900/70 border-stone-700 text-stone-400'
                    }`}
                  >
                    3 Garis (Mitsu-ba)
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setRakeTines(5);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      rakeTines === 5
                        ? 'bg-amber-700 text-white border-amber-400 shadow'
                        : 'bg-stone-900/70 border-stone-700 text-stone-400'
                    }`}
                  >
                    5 Garis (Go-ba)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      initSandGarden();
                      showToast('🧹 Pasir disapu kembali rapi dengan pola gelombang air awal.');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sapu Bersih</span>
                  </button>

                  <button
                    onClick={handleZenMeditation}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md border border-amber-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span>🎍 Meditasi Zen (+Disiplin)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
