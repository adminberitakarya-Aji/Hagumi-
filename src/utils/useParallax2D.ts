import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';

export type ParallaxMode = 'dynamic' | 'subtle' | 'off';

export interface ParallaxOffsets {
  // Normalized raw values (-1 to +1)
  x: number;
  y: number;
  // Specific transforms ready to apply to style.transform
  bgStyle: CSSProperties;      // Deep background (Fuji, Sky, Sun, Clouds)
  midBgStyle: CSSProperties;   // Mid background (Shoji screens, Kakemono, Engawa)
  tatamiStyle: CSSProperties;  // Tatami floor & room furniture
  petStyle: CSSProperties;     // Kitsune pet subject
  fgStyle: CSSProperties;      // Foreground (Andon lantern, Tansu chest, near motes)
  roomTiltStyle: CSSProperties;// Subtle 2.5D perspective room tilt
}

export function useParallax2D() {
  const [mode, setMode] = useState<ParallaxMode>(() => {
    try {
      const saved = localStorage.getItem('hagumi_parallax_mode');
      if (saved === 'dynamic' || saved === 'subtle' || saved === 'off') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'dynamic';
  });

  const [hasGyroscope, setHasGyroscope] = useState<boolean>(false);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const [offsets, setOffsets] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References for animation damping loop
  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const isMovingRef = useRef<boolean>(false);

  // Save mode changes to localStorage
  const updateMode = useCallback((newMode: ParallaxMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('hagumi_parallax_mode', newMode);
    } catch {
      // ignore
    }
    if (newMode === 'off') {
      targetRef.current = { x: 0, y: 0 };
      currentRef.current = { x: 0, y: 0 };
      setOffsets({ x: 0, y: 0 });
    }
  }, []);

  // Request Gyroscope Permission (for iOS 13+)
  const requestGyroPermission = useCallback(async (): Promise<boolean> => {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const perm = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        return perm === 'granted';
      } catch (err) {
        console.warn('Device orientation permission rejected:', err);
        return false;
      }
    }
    return true;
  }, []);

  // Animation frame loop with smooth LERP damping
  useEffect(() => {
    if (mode === 'off') return;

    let isRunning = true;
    const lerpFactor = 0.075; // Silky smooth response

    const loop = () => {
      if (!isRunning) return;

      const target = targetRef.current;
      const current = currentRef.current;

      const dx = target.x - current.x;
      const dy = target.y - current.y;

      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        current.x += dx * lerpFactor;
        current.y += dy * lerpFactor;
        setOffsets({ x: current.x, y: current.y });
        isMovingRef.current = true;
      } else if (isMovingRef.current) {
        current.x = target.x;
        current.y = target.y;
        setOffsets({ x: current.x, y: current.y });
        isMovingRef.current = false;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [mode]);

  // Desktop Mouse Move Tracking
  useEffect(() => {
    if (mode === 'off') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Do not override if active mobile gyroscope is in control
      if (isGyroActive) return;

      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      // Normalize: center is (0, 0), range is -1 to +1
      const rawX = (e.clientX / width - 0.5) * 2;
      const rawY = (e.clientY / height - 0.5) * 2;

      // Scale factor according to mode
      const scale = mode === 'subtle' ? 0.5 : 1.0;
      targetRef.current = {
        x: Math.max(-1, Math.min(1, rawX)) * scale,
        y: Math.max(-1, Math.min(1, rawY)) * scale,
      };
    };

    const handleMouseLeave = () => {
      if (!isGyroActive) {
        targetRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mode, isGyroActive]);

  // Mobile Gyroscope Tracking (DeviceOrientationEvent)
  useEffect(() => {
    if (mode === 'off' || typeof window === 'undefined') return;

    if (!('DeviceOrientationEvent' in window)) {
      setHasGyroscope(false);
      return;
    }

    setHasGyroscope(true);

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;

      setIsGyroActive(true);

      // gamma: Left-to-right tilt (-90 to +90)
      // Normal holding range: -30 to +30 deg
      const clampedGamma = Math.max(-35, Math.min(35, event.gamma));
      const normalizedX = clampedGamma / 35;

      // beta: Front-to-back tilt (-180 to +180)
      // Normal handheld angle is ~45 degrees pitch
      const pitchOffset = event.beta - 45;
      const clampedBeta = Math.max(-30, Math.min(30, pitchOffset));
      const normalizedY = clampedBeta / 30;

      const scale = mode === 'subtle' ? 0.5 : 1.0;
      targetRef.current = {
        x: normalizedX * scale,
        y: normalizedY * scale,
      };
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [mode]);

  // Multipliers for each depth layer
  const factor = mode === 'off' ? 0 : mode === 'subtle' ? 0.5 : 1.0;
  const { x, y } = offsets;

  // Background moves opposite to view direction with wider travel (-22px, -14px)
  const bgStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `translate3d(${(-x * 22 * factor).toFixed(2)}px, ${(-y * 14 * factor).toFixed(2)}px, 0px) scale(${1 + 0.04 * factor})`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  // Mid Background (Shoji screens, Kakemono scroll, Engawa edge) (-9px, -6px)
  const midBgStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `translate3d(${(-x * 9 * factor).toFixed(2)}px, ${(-y * 6 * factor).toFixed(2)}px, 0px)`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  // Tatami mat floor & furniture (+3px, +2px)
  const tatamiStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `translate3d(${(x * 4 * factor).toFixed(2)}px, ${(y * 2.5 * factor).toFixed(2)}px, 0px)`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  // Kitsune Pet Subject (+6px, +4px)
  const petStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `translate3d(${(x * 7 * factor).toFixed(2)}px, ${(y * 4 * factor).toFixed(2)}px, 0px)`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  // Foreground (Andon Lantern, Tansu Chest, Closest Dust Particles) (+16px, +10px)
  const fgStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `translate3d(${(x * 16 * factor).toFixed(2)}px, ${(y * 10 * factor).toFixed(2)}px, 0px)`,
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  // Subtle 2.5D perspective room tilt (gives a true diorama stereoscopic feeling)
  const roomTiltStyle: CSSProperties = {
    transform:
      factor === 0
        ? 'none'
        : `perspective(1000px) rotateY(${(x * 1.6 * factor).toFixed(2)}deg) rotateX(${(-y * 1.1 * factor).toFixed(2)}deg)`,
    transformStyle: 'preserve-3d',
    transition: 'transform 0.05s linear',
    willChange: 'transform',
  };

  return {
    mode,
    setMode: updateMode,
    x: offsets.x,
    y: offsets.y,
    hasGyroscope,
    isGyroActive,
    requestGyroPermission,
    bgStyle,
    midBgStyle,
    tatamiStyle,
    petStyle,
    fgStyle,
    roomTiltStyle,
  };
}
