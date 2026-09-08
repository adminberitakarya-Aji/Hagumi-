/**
 * src/canvas/drawThoughtBubble.ts
 * Fungsi gambar canvas layer "drawThoughtBubble" (diekstrak dari KitsuneCanvas.tsx).
 */
import { IdleThought } from '../types/game';

export function drawThoughtBubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  thought: IdleThought,
  alpha: number,
  tick: number
): { x: number; y: number; w: number; h: number } {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Gentle floating bob animation
  const bob = Math.sin(tick * 0.04) * 2.5;
  const drawY = cy + bob;

  // --- Measure text to determine bubble size ---
  const mainFont = 'bold 13px "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif';
  const flairFont = '10px "Segoe UI", "Hiragino Kaku Gothic ProN", sans-serif';
  ctx.font = mainFont;
  const mainW = ctx.measureText(thought.emoji + ' ' + thought.text).width;
  ctx.font = flairFont;
  const flairW = ctx.measureText(thought.japaneseFlair).width;

  const contentW = Math.max(mainW, flairW) + 28;
  const contentH = 50;
  const bx = Math.max(10, Math.min(cx - contentW / 2, 350 - contentW)); // keep on canvas
  const by = drawY - contentH;

  // --- Bubble body (rounded rect) ---
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + contentW - r, by);
  ctx.arcTo(bx + contentW, by, bx + contentW, by + r, r);
  ctx.lineTo(bx + contentW, by + contentH - r);
  ctx.arcTo(bx + contentW, by + contentH, bx + contentW - r, by + contentH, r);
  ctx.lineTo(bx + r, by + contentH);
  ctx.arcTo(bx, by + contentH, bx, by + contentH - r, r);
  ctx.lineTo(bx, by + r);
  ctx.arcTo(bx, by, bx + r, by, r);
  ctx.closePath();

  ctx.fillStyle = thought.bubbleColor;
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = thought.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // --- Cute bubble tail (pointing down toward Kitsune) ---
  const tailX = cx; // Center of bubble tail near pet position
  const clampedTailX = Math.max(bx + 20, Math.min(tailX, bx + contentW - 20));
  ctx.beginPath();
  ctx.moveTo(clampedTailX - 7, by + contentH - 1);
  ctx.lineTo(clampedTailX, by + contentH + 14); // Tail tip
  ctx.lineTo(clampedTailX + 7, by + contentH - 1);
  ctx.fillStyle = thought.bubbleColor;
  ctx.fill();
  ctx.strokeStyle = thought.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cover the jagged joint between tail and bubble body
  ctx.beginPath();
  ctx.rect(clampedTailX - 6, by + contentH - 3, 13, 5);
  ctx.fillStyle = thought.bubbleColor;
  ctx.fill();

  // --- Emoji ---
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", serif';
  ctx.fillText(thought.emoji, bx + 10, by + 22);

  // --- Main text ---
  ctx.font = mainFont;
  ctx.fillStyle = '#1c1917';
  ctx.fillText(thought.text, bx + 30, by + 23);

  // --- Japanese flair (smaller, muted) ---
  ctx.font = flairFont;
  ctx.fillStyle = '#78716c';
  ctx.fillText(thought.japaneseFlair, bx + 30, by + 39);

  // --- Tap hint glow if actionHint exists (subtle pulsing rim) ---
  if (thought.actionHint) {
    const pulse = 0.3 + Math.abs(Math.sin(tick * 0.07)) * 0.4;
    ctx.strokeStyle = thought.accentColor;
    ctx.globalAlpha = alpha * pulse;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + contentW - r, by);
    ctx.arcTo(bx + contentW, by, bx + contentW, by + r, r);
    ctx.lineTo(bx + contentW, by + contentH - r);
    ctx.arcTo(bx + contentW, by + contentH, bx + contentW - r, by + contentH, r);
    ctx.lineTo(bx + r, by + contentH);
    ctx.arcTo(bx, by + contentH, bx, by + contentH - r, r);
    ctx.lineTo(bx, by + r);
    ctx.arcTo(bx, by, bx + r, by, r);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
  return { x: bx, y: by, w: contentW, h: contentH + 14 };
}
