/**
 * src/canvas/drawStatusFX.ts
 * Fungsi gambar canvas layer "drawStatusFX" (diekstrak dari KitsuneCanvas.tsx).
 */
import { PetData } from '../types/game';

// Draw Status Overlays (Floating Hearts, Bath Bubbles, Zzz Sleep runes)
export function drawStatusFX(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  action: string,
  pet: PetData,
  tick: number
) {
  // Bathing Bubbles
  if (action === 'bathing') {
    for (let i = 0; i < 6; i++) {
      const bx = cx + Math.sin(tick * 0.05 + i * 2) * 55;
      const by = cy - 20 - ((tick * 1.5 + i * 25) % 90);
      const bSize = 6 + (i % 4) * 3;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, bSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Bubble highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - bSize * 0.3, by - bSize * 0.3, bSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Floating Zzz on Sleeping
  if (pet.isSleeping || action === 'sleeping') {
    const zProgress = (tick * 0.03) % 1;
    const zx = cx + 45 + zProgress * 25;
    const zy = cy - 40 - zProgress * 50;

    ctx.save();
    ctx.font = 'bold 22px "Zen Maru Gothic", sans-serif';
    ctx.fillStyle = 'rgba(167, 139, 250, 0.9)';
    ctx.fillText('Z', zx, zy);
    ctx.font = 'bold 16px "Zen Maru Gothic", sans-serif';
    ctx.fillText('z', zx - 12, zy + 15);
    ctx.font = 'bold 12px "Zen Maru Gothic", sans-serif';
    ctx.fillText('z', zx - 22, zy + 28);
    ctx.restore();
  }

  // Hearts on Happy / Petting
  if (action === 'happy') {
    for (let i = 0; i < 3; i++) {
      const hx = cx + (i - 1) * 35;
      const hy = cy - 70 - ((tick * 1.2 + i * 20) % 50);
      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.fillText('💖', hx, hy);
      ctx.restore();
    }
  }

  // Eating food crumbs
  if (action === 'eating') {
    const biteTick = tick % 15;
    if (biteTick < 6) {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx - 20, cy + 5, 3, 0, Math.PI * 2);
      ctx.arc(cx + 22, cy + 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Sick purple poison bubble
  if (pet.isSick) {
    const sx = cx + 45;
    const sy = cy - 50 + Math.sin(tick * 0.1) * 6;
    ctx.save();
    ctx.font = '22px sans-serif';
    ctx.fillText('🟣', sx, sy);
    ctx.font = '14px sans-serif';
    ctx.fillText('💧', sx - 85, sy + 10);
    ctx.restore();
  }
}

// --- WARDROBE & ACCESSORIES RENDERING ENGINE ---
