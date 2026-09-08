/**
 * src/canvas/drawFox.ts
 * Fungsi gambar canvas layer "drawFox" (diekstrak dari KitsuneCanvas.tsx).
 */
import { PetData } from '../types/game';
import { drawTails } from './drawTails';
import { drawNeckAccessory } from './drawNeckAccessory';
import { drawHeadAccessory } from './drawHeadAccessory';

// Stage 2+: Fox (Anak, Remaja, Dewasa, Mistik)
export function drawFox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  action: string,
  pet: PetData,
  tick: number,
  isWalking: boolean = false
) {
  const isSleeping = pet.isSleeping || action === 'sleeping';
  const walkBob = isWalking ? Math.abs(Math.sin(tick * 0.3)) * 3.5 : 0;
  const breath = Math.sin(tick * 0.07) * (isSleeping ? 1.5 : 3.5);
  const tailWave = Math.sin(tick * (isWalking ? 0.2 : 0.08));

  ctx.save();
  ctx.translate(cx, cy + breath - walkBob);

  // Multi-tails behind body
  const tailCount = Math.max(1, Math.min(9, pet.tailCount || 2));
  drawTails(ctx, tailCount, element, tailWave, tick);

  // Body
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 26, 38, 34, 0, 0, Math.PI * 2);
  const bodyGrad = ctx.createRadialGradient(0, 15, 5, 0, 26, 40);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, element.secondaryColor);
  bodyGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // White Chest / Belly Bib Fur
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.quadraticCurveTo(16, 22, 10, 42);
  ctx.lineTo(-10, 42);
  ctx.quadraticCurveTo(-16, 22, 0, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Front Paws (with animated reciprocal trotting step when roaming)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  const leftPawOffset = isWalking ? Math.sin(tick * 0.3) * 5 : 0;
  const rightPawOffset = isWalking ? -Math.sin(tick * 0.3) * 5 : 0;

  // Left paw
  ctx.beginPath();
  ctx.ellipse(-18, 52 + leftPawOffset, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right paw
  ctx.beginPath();
  ctx.ellipse(18, 52 + rightPawOffset, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Neck Accessories (Suzu Bell, Magatama Jade, Inari Scarf, Shimenawa rope, or classic bib)
  drawNeckAccessory(ctx, pet, tick, isWalking, false);

  // Head
  const headY = -18;
  ctx.save();
  ctx.translate(0, headY);

  // Large Fox Ears
  const earBounce = action === 'happy' ? Math.sin(tick * 0.25) * 4 : 0;

  // Left Ear
  ctx.beginPath();
  ctx.moveTo(-26, -10);
  ctx.lineTo(-44 + earBounce, -58);
  ctx.lineTo(-10, -28);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Left Ear Inner
  ctx.beginPath();
  ctx.moveTo(-23, -16);
  ctx.lineTo(-37 + earBounce, -50);
  ctx.lineTo(-14, -28);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(26, -10);
  ctx.lineTo(44 - earBounce, -58);
  ctx.lineTo(10, -28);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Right Ear Inner
  ctx.beginPath();
  ctx.moveTo(23, -16);
  ctx.lineTo(37 - earBounce, -50);
  ctx.lineTo(14, -28);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Main Head Shape (Cute Cheek Tuft)
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.quadraticCurveTo(28, -30, 38, -6);
  ctx.quadraticCurveTo(46, 10, 32, 16); // right cheek tuft
  ctx.quadraticCurveTo(18, 24, 0, 24); // chin
  ctx.quadraticCurveTo(-18, 24, -32, 16); // left cheek tuft
  ctx.quadraticCurveTo(-46, 10, -38, -6);
  ctx.quadraticCurveTo(-28, -30, 0, -32);
  ctx.closePath();
  const headGrad = ctx.createRadialGradient(0, -5, 5, 0, 0, 42);
  headGrad.addColorStop(0, '#ffffff');
  headGrad.addColorStop(0.4, element.secondaryColor);
  headGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Cheek Fluff White Patches
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-26, 10, 12, 9, -0.2, 0, Math.PI * 2);
  ctx.ellipse(26, 10, 12, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Inari Red Eye Liner / Facial Markings (Zenko/Tenko/Mistik)
  if (pet.stage !== 'anak') {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    // Left eye flair
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.quadraticCurveTo(-38, -3, -42, 4);
    ctx.stroke();
    // Right eye flair
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.quadraticCurveTo(38, -3, 42, 4);
    ctx.stroke();
  }

  // Forehead Symbol / Star
  if (pet.form === 'tenko') {
    // Golden Star Tiara
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Sacred Inari Diamond / Flame
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(4, -18);
    ctx.lineTo(0, -12);
    ctx.lineTo(-4, -18);
    ctx.closePath();
    ctx.fill();
  }

  // Blushing cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-20, 10, 7, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(20, 10, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Expression
  const blink = tick % 130 > 122 && !isSleeping;

  if (isSleeping) {
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-16, 2, 7, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 2, 7, Math.PI, 0);
    ctx.stroke();
  } else if (pet.isSick || action === 'sick') {
    // Swirly eyes
    ctx.strokeStyle = '#6b21a8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-16, 2, 6, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 2, 6, 0, Math.PI * 1.6);
    ctx.stroke();
  } else if (blink) {
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-10, 2);
    ctx.moveTo(10, 2);
    ctx.lineTo(22, 2);
    ctx.stroke();
  } else {
    // Large expressive anime fox eyes
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(-16, 1, 6, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 1, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-18, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(14, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(-14, 4, 1.2, 0, Math.PI * 2);
    ctx.arc(18, 4, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Black Nose
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(0, 11, 3.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Mouth
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  if (action === 'eating') {
    const chomp = tick % 16 > 8 ? 4 : 8;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, 17, 5, chomp, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (action === 'happy') {
    ctx.beginPath();
    ctx.moveTo(-6, 15);
    ctx.quadraticCurveTo(-3, 19, 0, 16);
    ctx.quadraticCurveTo(3, 19, 6, 15);
    ctx.stroke();
  } else if (pet.stats.hunger < 30) {
    ctx.beginPath();
    ctx.arc(0, 19, 5, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 15, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Head Accessories (Sakura Blossom Pin, Kitsune Mask, Tanuki Leaf)
  drawHeadAccessory(ctx, pet, tick, earBounce, false);

  ctx.restore();

  // Floating Kitsunebi Spirit Orbs for Remaja & Mistik
  if (pet.stage === 'remaja' || pet.stage === 'dewasa' || pet.stage === 'mistik') {
    const orbCount = pet.stage === 'mistik' ? 3 : 2;
    for (let i = 0; i < orbCount; i++) {
      const angle = tick * 0.04 + (i * Math.PI * 2) / orbCount;
      const ox = Math.cos(angle) * 75;
      const oy = Math.sin(angle) * 35 - 15;

      const orbGlow = ctx.createRadialGradient(ox, oy, 2, ox, oy, 16);
      orbGlow.addColorStop(0, '#ffffff');
      orbGlow.addColorStop(0.5, element.secondaryColor);
      orbGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(ox, oy, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
