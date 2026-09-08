/**
 * EmaTreeCanvas.tsx
 * Pohon Ema Virtual Bersama — visual canvas bergaya ukiyo-e
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShrineWish } from '../types/game';
import { soundEngine } from '../utils/soundEngine';

interface EmaTreeCanvasProps {
  wishes: ShrineWish[];
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  petName?: string;
  onRingBell?: (wishId: string) => void;
}

interface EmaPlaque {
  id: string;
  x: number; y: number; w: number; h: number;
  angle: number; swayOffset: number; swaySpeed: number;
  category: string; text: string; blessing?: string;
  color: string; accentColor: string;
  blessingBells: number;
  authorName?: string;
}

const CATEGORY_STYLES: Record<string, { color: string; accent: string; icon: string }> = {
  bonding: { color: '#c75b7a', accent: '#fce4ec', icon: '💖' },
  health:  { color: '#4caf85', accent: '#e8f5e9', icon: '🌿' },
  fortune: { color: '#c49a2e', accent: '#fff8e1', icon: '🪙' },
  wisdom:  { color: '#3a8fc1', accent: '#e3f2fd', icon: '📜' },
  peace:   { color: '#8b6ab5', accent: '#f3e5f5', icon: '🕊️' },
  default: { color: '#8b5e2a', accent: '#fff9e6', icon: '🎋' },
};

const BRANCH_ANCHORS_RATIO = [
  [0.18, 0.38], [0.26, 0.28], [0.34, 0.22], [0.22, 0.50],
  [0.72, 0.26], [0.64, 0.34], [0.80, 0.38], [0.76, 0.50],
  [0.44, 0.16], [0.56, 0.18], [0.50, 0.30], [0.50, 0.44],
];

const EmaTreeCanvas: React.FC<EmaTreeCanvasProps> = ({ wishes, season = 'autumn', petName = 'Kitsune', onRingBell }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const plaquesRef = useRef<EmaPlaque[]>([]);
  const [selectedWish, setSelectedWish] = useState<ShrineWish | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const buildPlaques = useCallback((cw: number, ch: number): EmaPlaque[] => {
    const pw = 74; const ph = 90;
    return wishes.slice(0, 12).map((w, i) => {
      const [rx, ry] = BRANCH_ANCHORS_RATIO[i % BRANCH_ANCHORS_RATIO.length];
      const style = CATEGORY_STYLES[w.category] ?? CATEGORY_STYLES.default;
      return {
        id: w.id, x: cw * rx - pw / 2, y: ch * ry + 18,
        w: pw, h: ph,
        angle: (Math.random() - 0.5) * 0.18,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.4 + Math.random() * 0.6,
        category: w.category, text: w.text, blessing: w.kitsuneBlessing,
        color: style.color, accentColor: style.accent,
        blessingBells: w.blessingBells ?? 0,
        authorName: w.authorName,
      };
    });
  }, [wishes]);

  useEffect(() => {
    plaquesRef.current = [];
  }, [wishes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cw = canvas.width; const ch = canvas.height;
    if (plaquesRef.current.length === 0 && wishes.length > 0) {
      plaquesRef.current = buildPlaques(cw, ch);
    }
    let startTime = performance.now();

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      // Sky
      const skyPairs: Record<string, string[]> = {
        spring: ['#1a0a2e', '#2d1b4e'], summer: ['#0a1628', '#162640'],
        autumn: ['#1c0e06', '#2e1908'], winter: ['#0d1520', '#1a2535'],
      };
      const [s1, s2] = skyPairs[season] ?? skyPairs.autumn;
      const bgGrd = ctx.createLinearGradient(0, 0, 0, ch);
      bgGrd.addColorStop(0, s1); bgGrd.addColorStop(1, s2);
      ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, cw, ch);
      // Stars
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137.508 + 42) % cw;
        const sy = (i * 97.3 + 17) % (ch * 0.55);
        ctx.globalAlpha = 0.3 + 0.4 * Math.sin(t * 1.2 + i);
        ctx.fillStyle = '#fffff0';
        ctx.beginPath(); ctx.arc(sx, sy, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Moon
      ctx.fillStyle = season === 'winter' ? '#dde8f0' : '#fef3cd';
      ctx.beginPath(); ctx.arc(cw * 0.82, ch * 0.12, 22, 0, Math.PI * 2); ctx.fill();
      // Ground
      const gGrd = ctx.createLinearGradient(0, ch * 0.82, 0, ch);
      gGrd.addColorStop(0, '#2d1a0e'); gGrd.addColorStop(1, '#150a04');
      ctx.fillStyle = gGrd; ctx.fillRect(0, ch * 0.82, cw, ch * 0.18);
      // Lantern
      const lx = cw * 0.5;
      ctx.fillStyle = '#6b5a42'; ctx.fillRect(lx - 8, ch * 0.68, 16, 26);
      ctx.fillStyle = '#8b7455'; ctx.fillRect(lx - 13, ch * 0.82, 26, 6); ctx.fillRect(lx - 10, ch * 0.63, 20, 7);
      ctx.fillStyle = '#c9a84c'; ctx.fillRect(lx - 16, ch * 0.59, 32, 5);
      const lGrd = ctx.createRadialGradient(lx, ch * 0.74, 2, lx, ch * 0.74, 12);
      lGrd.addColorStop(0, 'rgba(255,210,80,0.9)'); lGrd.addColorStop(1, 'rgba(255,170,20,0)');
      ctx.fillStyle = lGrd; ctx.fillRect(lx - 7, ch * 0.68, 14, 24);
      // Trunk
      const trGrd = ctx.createLinearGradient(cw * 0.43, 0, cw * 0.57, 0);
      trGrd.addColorStop(0, '#2e1a0a'); trGrd.addColorStop(0.4, '#5c3418'); trGrd.addColorStop(1, '#2e1a0a');
      ctx.fillStyle = trGrd;
      ctx.beginPath();
      ctx.moveTo(cw * 0.44, ch * 0.82);
      ctx.bezierCurveTo(cw * 0.43, ch * 0.65, cw * 0.44, ch * 0.52, cw * 0.50, ch * 0.42);
      ctx.bezierCurveTo(cw * 0.56, ch * 0.52, cw * 0.57, ch * 0.65, cw * 0.56, ch * 0.82);
      ctx.fill();
      // Branches
      ctx.strokeStyle = '#3d2210'; ctx.lineCap = 'round';
      [[cw*0.49,ch*0.48,cw*0.32,ch*0.40,cw*0.15,ch*0.44,10],
       [cw*0.51,ch*0.46,cw*0.68,ch*0.38,cw*0.85,ch*0.42,10]].forEach(([x1,y1,cx2,cy2,x2,y2,lw]) => {
        ctx.lineWidth = lw; ctx.beginPath();
        ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      ctx.lineWidth = 5;
      [[cw*0.50,ch*0.42,cw*0.47,ch*0.28,cw*0.45,ch*0.14],
       [cw*0.50,ch*0.42,cw*0.53,ch*0.28,cw*0.55,ch*0.16]].forEach(([x1,y1,cx2,cy2,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke();
      });
      ctx.lineWidth = 4;
      [[0.32,0.40,0.28,0.26],[0.22,0.42,0.18,0.32],[0.38,0.35,0.36,0.20],
       [0.68,0.38,0.72,0.23],[0.78,0.40,0.82,0.30],[0.62,0.36,0.60,0.20]].forEach(([x1r,y1r,x2r,y2r]) => {
        ctx.beginPath(); ctx.moveTo(cw*x1r,ch*y1r); ctx.lineTo(cw*x2r,ch*y2r); ctx.stroke();
      });
      // Foliage
      const leafPalette: Record<string, string[]> = {
        spring: ['#ff9bae','#ffb7c5','#ffd6e0'],
        summer: ['#2e7d32','#388e3c','#66bb6a'],
        autumn: ['#e65100','#f57c00','#ff8f00'],
        winter: ['#b0bec5','#eceff1','#90a4ae'],
      };
      const lp = leafPalette[season] ?? leafPalette.autumn;
      [[0.20,0.30],[0.30,0.20],[0.38,0.14],[0.50,0.10],[0.62,0.14],
       [0.70,0.20],[0.80,0.30],[0.16,0.42],[0.84,0.40]].forEach(([cx_,cy_],i) => {
        const r = 28 + (i % 3) * 10;
        const col = lp[i % lp.length];
        const cGrd = ctx.createRadialGradient(cw*cx_,ch*cy_,4,cw*cx_,ch*cy_,r);
        cGrd.addColorStop(0, col + 'dd'); cGrd.addColorStop(1, col + '22');
        ctx.fillStyle = cGrd; ctx.beginPath();
        ctx.arc(cw*cx_, ch*cy_, r, 0, Math.PI*2); ctx.fill();
      });
      // Plaques
      plaquesRef.current.forEach((p) => {
        const sway = Math.sin(t * p.swaySpeed + p.swayOffset) * 0.06;
        const totalAngle = p.angle + sway;
        const px = p.x + p.w / 2; const py = p.y + p.h / 2;
        ctx.save();
        ctx.translate(px, py); ctx.rotate(totalAngle);
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = hoveredId === p.id ? 16 : 6;
        ctx.shadowOffsetY = hoveredId === p.id ? 7 : 3;
        const wGrd = ctx.createLinearGradient(-p.w/2,-p.h/2,p.w/2,p.h/2);
        wGrd.addColorStop(0, p.accentColor); wGrd.addColorStop(1, '#e0c98a');
        ctx.fillStyle = wGrd;
        ctx.beginPath(); ctx.roundRect(-p.w/2,-p.h/2,p.w,p.h,6); ctx.fill();
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.moveTo(-p.w/2,-p.h/2+2); ctx.lineTo(0,-p.h/2-14); ctx.lineTo(p.w/2,-p.h/2+2); ctx.fill();
        ctx.strokeStyle = p.color; ctx.lineWidth = hoveredId===p.id?3:2;
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.roundRect(-p.w/2,-p.h/2,p.w,p.h,6); ctx.stroke();
        ctx.fillStyle = '#5a3a18'; ctx.beginPath(); ctx.arc(0,-p.h/2+10,4,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#c8a86b'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0,-p.h/2+6); ctx.lineTo(0,-p.h/2-20); ctx.stroke();
        const st = CATEGORY_STYLES[p.category] ?? CATEGORY_STYLES.default;
        ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.fillText(st.icon, 0, -p.h/2+28);
        ctx.fillStyle = '#2e1a08'; ctx.font = 'bold 8px serif'; ctx.textAlign = 'center';
        const words = p.text.split(' ');
        let line = ''; let lineY = -p.h/2+44;
        words.forEach((word) => {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > p.w-12 && line !== '') {
            if (lineY <= p.h/2-12) ctx.fillText(line.trim(), 0, lineY);
            line = word + ' '; lineY += 12;
          } else { line = test; }
        });
        if (lineY <= p.h/2-12) ctx.fillText(line.trim(), 0, lineY);
        ctx.font = 'bold 10px serif'; ctx.fillStyle = p.color+'cc'; ctx.fillText('奉', p.w/2-12, p.h/2-8);
        if (p.blessingBells > 0) {
          ctx.font = 'bold 8px sans-serif'; ctx.fillStyle = '#92400e'; ctx.textAlign = 'left';
          ctx.fillText(`🔔${p.blessingBells}`, -p.w/2+6, p.h/2-8);
        }
        ctx.restore();
      });
      animFrameRef.current = requestAnimationFrame(render);
    };
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, wishes, hoveredId]);

  const getHit = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    return plaquesRef.current.find((p) => {
      const dx = mx - (p.x+p.w/2); const dy = my - (p.y+p.h/2);
      return Math.abs(dx) < p.w/2+8 && Math.abs(dy) < p.h/2+14;
    }) ?? null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getHit(e);
    if (hit) { soundEngine.playClick(); setSelectedWish(wishes.find(w=>w.id===hit.id)??null); }
    else setSelectedWish(null);
  }, [getHit, wishes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const hit = getHit(e);
    setHoveredId(hit?.id ?? null);
  }, [getHit]);

  const CMAP: Record<string, {label:string;icon:string}> = {
    bonding:{label:'Ikatan Batin',icon:'💖'}, health:{label:'Kesehatan',icon:'🌿'},
    fortune:{label:'Rezeki',icon:'🪙'}, wisdom:{label:'Kebijaksanaan',icon:'📜'},
    peace:{label:'Kedamaian',icon:'🕊️'},
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <canvas ref={canvasRef} width={560} height={340} onClick={handleClick} onMouseMove={handleMouseMove}
        style={{ cursor: hoveredId ? 'pointer' : 'default' }}
        className="w-full rounded-2xl border border-amber-900/50 shadow-inner" />
      {wishes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-amber-300/70 text-xs font-serif text-center px-4">
            🌳 Tulis doa pertamamu untuk menggantungkan<br/>papan Ema di pohon kuil ini...
          </p>
        </div>
      )}
      {selectedWish && (
        <div className="absolute inset-x-4 top-4 bg-gradient-to-b from-[#faf5ee] to-[#f0e8d5] text-stone-900 rounded-2xl p-3.5 shadow-2xl border-2 border-amber-700 z-20 animate-in zoom-in-95 max-w-xs mx-auto" onClick={()=>setSelectedWish(null)}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{CMAP[selectedWish.category]?.icon??'🎋'}</span>
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full">{CMAP[selectedWish.category]?.label??'Doa Suci'}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
              <span>{selectedWish.authorName || 'Peziarah Kuil'}</span>
              <span>•</span>
              <span>{selectedWish.date}</span>
            </div>
          </div>
          <p className="text-xs font-serif font-bold text-stone-900 leading-snug mb-2 border-l-2 border-amber-600 pl-2">&ldquo;{selectedWish.text}&rdquo;</p>
          {selectedWish.kitsuneBlessing && (
            <div className="text-[11px] italic text-rose-900 bg-rose-50/80 rounded-xl p-2 flex gap-1.5 mb-2">
              <span className="shrink-0">🦊</span>
              <div><strong>{petName}:</strong> &ldquo;{selectedWish.kitsuneBlessing}&rdquo;</div>
            </div>
          )}

          {/* Lonceng Berkah Suzu Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onRingBell) {
                onRingBell(selectedWish.id);
                setSelectedWish((prev) => prev ? { ...prev, blessingBells: (prev.blessingBells ?? 0) + 1 } : null);
              }
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 mb-1"
          >
            <span className="text-sm">🔔</span>
            <span>Bunyikan Lonceng Berkah ({selectedWish.blessingBells ?? 0})</span>
            <span className="text-[9px] bg-black/30 text-amber-200 px-1.5 py-0.5 rounded-full">+2 💖</span>
          </button>
          <p className="text-[10px] text-stone-400 text-center">Ketuk di luar untuk menutup</p>
        </div>
      )}
      <div className="mt-1.5 text-[11px] text-amber-400/80 flex items-center gap-1.5">
        <span>🎋</span>
        <span>{wishes.length} papan doa tergantung di pohon kuil{wishes.length>12&&<span className="text-stone-500"> · Tampil 12 terbaru</span>}</span>
      </div>
    </div>
  );
};

export default EmaTreeCanvas;