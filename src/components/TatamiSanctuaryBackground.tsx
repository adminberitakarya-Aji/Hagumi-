import React, { useMemo, useState } from 'react';
import { DayPhase, SanctuaryDecorations, SeasonType } from '../types/game';
import { soundEngine } from '../utils/soundEngine';

// Authentic Illustrated Anime Sanctuary Background Assets
import tatamiNightBg from '../assets/images/tatami_sanctuary_night_bg_1788712133951.webp';
import tatamiSunsetBg from '../assets/images/tatami_sanctuary_sunset_bg_1788712117321.webp';

interface TatamiSanctuaryBackgroundProps {
  timePhase: DayPhase;
  isLanternOn: boolean;
  isSleeping: boolean;
  sanctuaryDecor?: SanctuaryDecorations;
  season?: SeasonType;
  onCycleSeason?: () => void;
  bgParallaxStyle?: React.CSSProperties;
  midBgParallaxStyle?: React.CSSProperties;
  tatamiParallaxStyle?: React.CSSProperties;
}

export const TatamiSanctuaryBackground: React.FC<TatamiSanctuaryBackgroundProps> = ({
  timePhase,
  isLanternOn,
  isSleeping,
  season = 'autumn',
  bgParallaxStyle,
}) => {
  // Kesepakatan waktu: 06.00 - 17.59 = Day, 18.00 - 05.59 = Night
  const isNightVisual = timePhase === 'night';
  const currentBgImage = isNightVisual ? tatamiNightBg : tatamiSunsetBg;

  // Generate stable golden dust motes & spiritual particles
  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${(i * 19 + 7) % 94 + 3}%`,
      top: `${(i * 23 + 11) % 80 + 10}%`,
      size: (i % 3) + 2,
      duration: 3 + (i % 4) * 1.5,
      delay: (i % 5) * 0.7,
      opacity: 0.15 + (i % 4) * 0.1,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. FULL-SCREEN ILLUSTRATED ANIME SANCTUARY ROOM & GARDEN */}
      <div className="absolute inset-0 bg-stone-950 overflow-hidden">
        {/* Parallax Depth Container */}
        <div
          style={bgParallaxStyle}
          className="absolute -inset-2 sm:-inset-4 transition-transform will-change-transform pointer-events-none"
        >
          {/* Main Panorama Artwork */}
          <img
            src={currentBgImage}
            alt="Santuari Tatami & Gunung Fuji"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-[1.02] transition-all duration-1000"
            style={{
              filter: isNightVisual
                ? 'brightness(0.96) saturate(1.05)'
                : 'brightness(1.05) saturate(1.15)',
            }}
          />

          {/* Seamless Atmospheric Vignette & Depth Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/30 pointer-events-none" />

          {/* DYNAMIC SEASONAL PARTICLES (Sakura, Fireflies, Momiji, Snow) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Spring: Drifting Sakura Petals */}
            {season === 'spring' && (
              <>
                <div className="absolute top-6 left-[15%] w-2 h-1 bg-pink-300/60 rounded-full rotate-45 animate-bounce" />
                <div className="absolute top-12 left-[45%] w-2.5 h-1.5 bg-pink-200/50 rounded-full rotate-12 animate-pulse" />
                <div className="absolute top-8 right-[25%] w-2 h-1 bg-pink-300/55 rounded-full -rotate-30 animate-bounce" />
                <div className="absolute top-18 right-[40%] w-1.5 h-1 bg-pink-200/40 rounded-full rotate-45 animate-pulse" />
                <div className="absolute top-24 left-[30%] w-2 h-1.5 bg-pink-300/40 rounded-full rotate-12" />
              </>
            )}

            {/* Summer: Glowing Fireflies (Hotaru) & Willow Flutter */}
            {season === 'summer' && (
              <>
                <div className="absolute top-8 left-[20%] w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_8px_#34d399] animate-ping" />
                <div className="absolute top-14 left-[50%] w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a] animate-pulse" />
                <div className="absolute top-6 right-[30%] w-1.5 h-1.5 bg-lime-300 rounded-full shadow-[0_0_8px_#bef264] animate-ping" />
                <div className="absolute top-20 right-[15%] w-1 h-1 bg-emerald-200 rounded-full animate-pulse" />
              </>
            )}

            {/* Autumn: Swirling Scarlet Momiji (Japanese Maple) Leaves */}
            {season === 'autumn' && (
              <>
                <svg className="absolute top-6 left-[18%] w-4 h-4 text-red-600/80 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2 L14,7 L19,5 L16,10 L21,12 L16,14 L18,19 L13,16 L12,22 L11,16 L6,18 L8,14 L3,12 L8,10 L5,5 L10,7 Z" />
                </svg>
                <svg className="absolute top-14 left-[42%] w-3.5 h-3.5 text-amber-600/75 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2 L14,7 L19,5 L16,10 L21,12 L16,14 L18,19 L13,16 L12,22 L11,16 L6,18 L8,14 L3,12 L8,10 L5,5 L10,7 Z" />
                </svg>
                <svg className="absolute top-8 right-[22%] w-4.5 h-4.5 text-rose-700/85 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2 L14,7 L19,5 L16,10 L21,12 L16,14 L18,19 L13,16 L12,22 L11,16 L6,18 L8,14 L3,12 L8,10 L5,5 L10,7 Z" />
                </svg>
                <svg className="absolute top-20 right-[38%] w-3 h-3 text-orange-600/70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2 L14,7 L19,5 L16,10 L21,12 L16,14 L18,19 L13,16 L12,22 L11,16 L6,18 L8,14 L3,12 L8,10 L5,5 L10,7 Z" />
                </svg>
              </>
            )}

            {/* Winter: Falling Snowflakes (Yuki) */}
            {season === 'winter' && (
              <>
                <div className="absolute top-4 left-[12%] w-1.5 h-1.5 bg-white/90 rounded-full shadow-[0_0_4px_#fff] animate-pulse" />
                <div className="absolute top-10 left-[28%] w-2 h-2 bg-white/80 rounded-full animate-bounce" />
                <div className="absolute top-7 left-[52%] w-1.5 h-1.5 bg-white/95 rounded-full" />
                <div className="absolute top-16 left-[68%] w-2 h-2 bg-white/85 rounded-full animate-pulse" />
                <div className="absolute top-6 right-[14%] w-1 h-1 bg-white/90 rounded-full" />
                <div className="absolute top-22 right-[32%] w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" />
              </>
            )}
          </div>

          {/* Night Stars & Sacred Fireflies in Mountain Air */}
          {isNightVisual && (
            <div className="absolute inset-0 opacity-50">
              <div className="absolute top-3 left-1/4 w-1 h-1 bg-amber-100 rounded-full animate-pulse" />
              <div className="absolute top-7 left-1/2 w-1.5 h-1.5 bg-amber-200 rounded-full animate-ping" />
              <div className="absolute top-5 right-1/3 w-1 h-1 bg-yellow-100 rounded-full animate-pulse" />
              <div className="absolute top-10 left-1/6 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute top-2 right-1/4 w-1 h-1 bg-amber-50 rounded-full" />
              <div className="absolute top-9 left-[38%] w-1 h-1 bg-cyan-100 rounded-full animate-pulse" />
              <div className="absolute top-4 right-[15%] w-1 h-1 bg-indigo-100 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* 2. WARM AMBIENT LIGHTING: ANDON LANTERN GLOW */}
      {isLanternOn && (
        <div
          className="absolute top-[32%] left-[4%] sm:left-[8%] w-72 sm:w-96 h-72 sm:h-96 rounded-full pointer-events-none transition-opacity duration-700 animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.12) 40%, rgba(180, 83, 9, 0.04) 70%, transparent 100%)',
            filter: 'blur(16px)',
          }}
        />
      )}

      {/* 3. CENTER SANCTUARY AURA GLOW (Surrounding Kitsune Platform) */}
      <div
        className="absolute top-[48%] left-1/2 -translate-x-1/2 w-64 sm:w-80 h-44 rounded-full pointer-events-none opacity-40"
        style={{
          background: isLanternOn
            ? 'radial-gradient(ellipse, rgba(251, 191, 36, 0.15) 0%, rgba(180, 83, 9, 0.05) 60%, transparent 100%)'
            : 'radial-gradient(ellipse, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 4. FLOATING SPIRIT GOLDEN DUST PARTICLES */}
      {isLanternOn && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={`dust-${p.id}`}
              className="absolute rounded-full bg-amber-300"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)',
                animation: `pulse ${p.duration}s infinite ease-in-out ${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
