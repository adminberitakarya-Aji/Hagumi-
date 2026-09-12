import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SeasonType } from '../types/game';

interface SeasonParticlesProps {
  season: SeasonType;
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  driftOffset: number;
  driftSpeed: number;
  opacity: number;
  opacitySpeed: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  scaleX: number;
  type: 'fall' | 'rise' | 'drift';
}

const SEASON_CONFIG: Record<SeasonType, {
  emojis: string[];
  count: number;
  colors: string[];
  type: Particle['type'];
  speedRange: [number, number];
  sizeRange: [number, number];
  driftRange: [number, number];
  glowEffect?: boolean;
  ambientGlow?: string;
}> = {
  spring: {
    emojis: ['🌸', '🌸', '🌸', '🌸', '🌺', '🍃'],
    count: 22,
    colors: ['#ffb7c5', '#ff8fab', '#ffc8d3', '#ff6b95'],
    type: 'fall',
    speedRange: [0.4, 1.2],
    sizeRange: [12, 22],
    driftRange: [0.3, 1.0],
    glowEffect: false,
    ambientGlow: 'rgba(255, 183, 197, 0.04)',
  },
  summer: {
    emojis: ['\u2728', '\u{1F7E2}', '\u2728', '\u{1F33F}', '\u2728'],
    count: 18,
    colors: ['#a8ff78', '#78ffd6', '#b8ffb0', '#c6ffdd'],
    type: 'rise',
    speedRange: [0.3, 0.9],
    sizeRange: [8, 16],
    driftRange: [0.5, 1.5],
    glowEffect: true,
    ambientGlow: 'rgba(168, 255, 120, 0.04)',
  },
  autumn: {
    emojis: ['\u{1F341}', '\u{1F342}', '\u{1F341}', '\u{1F342}', '\u{1F343}'],
    count: 20,
    colors: ['#ff6b35', '#f7931e', '#d4380d', '#fa8c16'],
    type: 'drift',
    speedRange: [0.5, 1.5],
    sizeRange: [14, 24],
    driftRange: [0.8, 2.0],
    glowEffect: false,
    ambientGlow: 'rgba(255, 107, 53, 0.04)',
  },
  winter: {
    emojis: ['\u2744\uFE0F', '\u2744\uFE0F', '\u2744\uFE0F', '\u{1F328}\uFE0F', '\u2744\uFE0F', '\u2B50'],
    count: 28,
    colors: ['#e8f4fd', '#bee3f8', '#ebf8ff', '#c3dafe'],
    type: 'fall',
    speedRange: [0.2, 0.7],
    sizeRange: [8, 18],
    driftRange: [0.2, 0.8],
    glowEffect: true,
    ambientGlow: 'rgba(190, 227, 248, 0.06)',
  },
};

const createParticle = (
  id: number,
  season: SeasonType,
  canvasWidth: number,
  canvasHeight: number,
  isInitial: boolean
): Particle => {
  const config = SEASON_CONFIG[season];
  const emoji = config.emojis[Math.floor(Math.random() * config.emojis.length)];
  const [minSpeed, maxSpeed] = config.speedRange;
  const [minSize, maxSize] = config.sizeRange;
  const [minDrift, maxDrift] = config.driftRange;

  const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
  const size = minSize + Math.random() * (maxSize - minSize);
  const drift = (minDrift + Math.random() * (maxDrift - minDrift)) * (Math.random() > 0.5 ? 1 : -1);

  let x = Math.random() * canvasWidth;
  let y: number;

  if (config.type === 'rise') {
    y = isInitial ? Math.random() * canvasHeight : canvasHeight + size;
  } else if (config.type === 'fall') {
    y = isInitial ? Math.random() * canvasHeight : -size;
  } else {
    x = isInitial ? Math.random() * canvasWidth : canvasWidth + size;
    y = Math.random() * canvasHeight;
  }

  return {
    id, x, y, size, speed, drift,
    driftOffset: Math.random() * Math.PI * 2,
    driftSpeed: 0.01 + Math.random() * 0.02,
    opacity: 0.5 + Math.random() * 0.5,
    opacitySpeed: 0.008 + Math.random() * 0.012,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    emoji, scaleX: 1,
    type: config.type,
  };
};

export const SeasonParticles: React.FC<SeasonParticlesProps> = ({ season, intensity = 'medium', className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const counterRef = useRef(0);
  const timeRef = useRef(0);
  const intensityMultiplier = intensity === 'light' ? 0.5 : intensity === 'heavy' ? 1.6 : 1.0;

  // A11y: hormati prefers-reduced-motion — canvas partikel musim TIDAK tercakup
  // oleh guard CSS global (animasinya berjalan via requestAnimationFrame).
  // Saat pengguna memilih mengurangi gerak, partikel digambar sebagai satu
  // bingkai statis (tanpa loop RAF). Preferensi dilacak real-time via listener.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    const config = SEASON_CONFIG[season];
    const count = Math.floor(config.count * intensityMultiplier);
    particlesRef.current = [];
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(counterRef.current++, season, canvas.width, canvas.height, true));
    }
  }, [season, intensityMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth || window.innerWidth; canvas.height = parent.clientHeight || window.innerHeight; }
    };
    updateSize();
    initParticles(canvas);

    const resizeObs = new ResizeObserver(updateSize);
    if (canvas.parentElement) resizeObs.observe(canvas.parentElement);

    const config = SEASON_CONFIG[season];
    const particleCount = Math.floor(config.count * intensityMultiplier);

    // ─── A11y: mode reduced-motion — bingkai statis tanpa RAF loop ──────────
    if (prefersReducedMotion) {
      const drawStaticFrame = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (config.ambientGlow) {
          ctx.fillStyle = config.ambientGlow;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        particlesRef.current.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          if (config.glowEffect) { ctx.shadowBlur = p.size * 1.5; ctx.shadowColor = config.colors[0]; }
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        });
      };
      drawStaticFrame();
      const resizeObsStatic = new ResizeObserver(() => {
        updateSize();
        drawStaticFrame();
      });
      if (canvas.parentElement) resizeObsStatic.observe(canvas.parentElement);
      return () => resizeObsStatic.disconnect();
    }

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (config.ambientGlow) {
        ctx.fillStyle = config.ambientGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      particlesRef.current.forEach((p, idx) => {
        if (p.type === 'fall') {
          p.y += p.speed;
          p.x += Math.sin(timeRef.current * p.driftSpeed + p.driftOffset) * p.drift;
          p.rotation += p.rotationSpeed;
        } else if (p.type === 'rise') {
          p.y -= p.speed;
          p.x += Math.sin(timeRef.current * p.driftSpeed + p.driftOffset) * p.drift;
          p.opacity = 0.4 + Math.sin(timeRef.current * 2 + p.driftOffset) * 0.4;
        } else {
          p.x -= p.speed;
          p.y += Math.sin(timeRef.current * p.driftSpeed + p.driftOffset) * p.drift * 0.5;
          p.rotation += p.rotationSpeed;
        }

        let offScreen = false;
        if (p.type === 'fall' && p.y > canvas.height + p.size) offScreen = true;
        if (p.type === 'rise' && p.y < -p.size) offScreen = true;
        if (p.type === 'drift' && p.x < -p.size) offScreen = true;

        if (offScreen) {
          particlesRef.current[idx] = createParticle(counterRef.current++, season, canvas.width, canvas.height, false);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        if (config.glowEffect) { ctx.shadowBlur = p.size * 1.5; ctx.shadowColor = config.colors[0]; }
        ctx.font = p.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (particlesRef.current.length < particleCount) {
        particlesRef.current.push(createParticle(counterRef.current++, season, canvas.width, canvas.height, false));
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animFrameRef.current); resizeObs.disconnect(); };
  }, [season, initParticles, intensityMultiplier, prefersReducedMotion]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={className} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }} />
  );
};

export default SeasonParticles;
