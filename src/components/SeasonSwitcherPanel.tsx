import React from 'react';
import { SeasonType } from '../types/game';

interface SeasonSwitcherPanelProps {
  season: SeasonType;
  onCycleSeason: () => void;
  className?: string;
}

const SEASON_META: Record<SeasonType, {
  kanji: string;
  name: string;
  nameJp: string;
  desc: string;
  icon: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  particles: string;
}> = {
  spring: {
    kanji: '春',
    name: 'Haru',
    nameJp: '春 — Musim Semi',
    desc: 'Sakura mekar, angin sejuk berbisik',
    icon: '🌸',
    gradient: 'linear-gradient(135deg, rgba(255,183,197,0.85) 0%, rgba(255,107,149,0.6) 100%)',
    textColor: '#8B3A4E',
    borderColor: 'rgba(255,107,149,0.5)',
    particles: '🌸 🌺 🍃',
  },
  summer: {
    kanji: '夏',
    name: 'Natsu',
    nameJp: '夏 — Musim Panas',
    desc: 'Kunang-kunang hotaru bersinar di malam',
    icon: '🏮',
    gradient: 'linear-gradient(135deg, rgba(168,255,120,0.5) 0%, rgba(0,180,120,0.65) 100%)',
    textColor: '#1a4731',
    borderColor: 'rgba(0,180,120,0.5)',
    particles: '✨ 🌿 🍃',
  },
  autumn: {
    kanji: '秋',
    name: 'Aki',
    nameJp: '秋 — Musim Gugur',
    desc: 'Daun momiji merah berguguran di angin',
    icon: '🍁',
    gradient: 'linear-gradient(135deg, rgba(255,107,53,0.75) 0%, rgba(210,55,0,0.55) 100%)',
    textColor: '#5c1a00',
    borderColor: 'rgba(210,55,0,0.4)',
    particles: '🍁 🍂 🍃',
  },
  winter: {
    kanji: '冬',
    name: 'Fuyu',
    nameJp: '冬 — Musim Dingin',
    desc: 'Salju lembut turun di lembah Fuji',
    icon: '❄️',
    gradient: 'linear-gradient(135deg, rgba(190,227,248,0.75) 0%, rgba(120,180,220,0.55) 100%)',
    textColor: '#1a3a5c',
    borderColor: 'rgba(120,180,220,0.5)',
    particles: '❄️ ⭐ 🌨️',
  },
};

const NEXT_SEASON: Record<SeasonType, SeasonType> = {
  spring: 'summer',
  summer: 'autumn',
  autumn: 'winter',
  winter: 'spring',
};

export const SeasonSwitcherPanel: React.FC<SeasonSwitcherPanelProps> = ({
  season,
  onCycleSeason,
  className = '',
}) => {
  const meta = SEASON_META[season];
  const nextMeta = SEASON_META[NEXT_SEASON[season]];

  return (
    <div
      className={'season-switcher-panel ' + className}
      style={{
        background: meta.gradient,
        border: '1.5px solid ' + meta.borderColor,
        borderRadius: 14,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 18px ' + meta.borderColor + ', inset 0 1px 0 rgba(255,255,255,0.25)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.35s ease',
        minWidth: 200,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onCycleSeason}
      onKeyDown={(e) => {
        // A11y: panel jimat musim dapat diaktifkan via keyboard
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleSeason();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={'Berganti musim ke ' + nextMeta.nameJp}
      title={'Klik untuk berganti musim → ' + nextMeta.nameJp}
    >
      {/* Kanji watermark */}
      <div style={{
        position: 'absolute',
        right: 8,
        top: -4,
        fontSize: 52,
        opacity: 0.07,
        fontFamily: 'serif',
        fontWeight: 900,
        color: meta.textColor,
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {meta.kanji}
      </div>

      {/* Season icon */}
      <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: meta.textColor, fontFamily: 'serif', letterSpacing: 1 }}>
          {meta.kanji} {meta.name}
        </div>
        <div style={{ fontSize: 11, color: meta.textColor, opacity: 0.8, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta.desc}
        </div>
        <div style={{ fontSize: 10, color: meta.textColor, opacity: 0.6, marginTop: 3 }}>
          Tap → {nextMeta.icon} {nextMeta.name}
        </div>
      </div>
    </div>
  );
};

export default SeasonSwitcherPanel;
