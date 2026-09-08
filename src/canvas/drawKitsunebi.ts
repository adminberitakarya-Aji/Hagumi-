/**
 * src/canvas/drawKitsunebi.ts
 * Fungsi gambar canvas layer "drawKitsunebi" (diekstrak dari KitsuneCanvas.tsx).
 */
import { PetData } from '../types/game';
import { drawNeckAccessory } from './drawNeckAccessory';
import { drawHeadAccessory } from './drawHeadAccessory';

// Stage 1: Kitsunebi (Spirit Fox Fireball)
export function drawKitsunebi(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  action: string,
  pet: PetData,
  tick: number,
  isWalking: boolean = false
) {
  const floatSpeed = isWalking ? 0.18 : 0.08;
  const floatAmp = isWalking ? 12 : 8;
  const floatY = Math.sin(tick * floatSpeed) * floatAmp;
  const isSleeping = pet.isSleeping || action === 'sleeping';
  const isBathing = action === 'bathing';

  ctx.save();
  ctx.translate(cx, cy + floatY);

  // Outer spirit aura
  const aura = ctx.createRadialGradient(0, 0, 15, 0, 0, 65);
  aura.addColorStop(0, element.auraColor);
  aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 65, 0, Math.PI * 2);
  ctx.fill();

  // Waving Fireball Tail behind
  const tailWave = Math.sin(tick * (isWalking ? 0.22 : 0.12)) * (isWalking ? 18 : 14);
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.quadraticCurveTo(35 + tailWave, -10, 20 + tailWave, -45);
  ctx.quadraticCurveTo(5, -20, 0, 15);
  ctx.fillStyle = element.primaryColor;
  ctx.fill();

  // Main Cute Orb Body
  ctx.beginPath();
  ctx.arc(0, 5, 36, 0, Math.PI * 2);
  const orbGrad = ctx.createRadialGradient(-10, -5, 5, 0, 5, 36);
  orbGrad.addColorStop(0, '#ffffff');
  orbGrad.addColorStop(0.4, element.secondaryColor);
  orbGrad.addColorStop(1, element.primaryColor);
  ctx.fillStyle = orbGrad;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();

  // Fox Ears on top of orb
  const earWiggle = action === 'happy' ? Math.sin(tick * 0.3) * 3 : 0;

  // Left Ear
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.lineTo(-38 + earWiggle, -42);
  ctx.lineTo(-12, -26);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // Left Ear Inner fluff
  ctx.beginPath();
  ctx.moveTo(-26, -16);
  ctx.lineTo(-33 + earWiggle, -36);
  ctx.lineTo(-16, -24);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(28, -12);
  ctx.lineTo(38 - earWiggle, -42);
  ctx.lineTo(12, -26);
  ctx.closePath();
  ctx.fillStyle = element.primaryColor;
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // Right Ear Inner fluff
  ctx.beginPath();
  ctx.moveTo(26, -16);
  ctx.lineTo(33 - earWiggle, -36);
  ctx.lineTo(16, -24);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Forehead Spirit Flame Mark
  ctx.fillStyle = element.primaryColor;
  ctx.beginPath();
  ctx.ellipse(0, -12, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Expression
  const blink = tick % 140 > 132 && !isSleeping;

  if (isSleeping) {
    // Sleeping happy curves
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-14, 4, 6, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 4, 6, Math.PI, 0);
    ctx.stroke();
  } else if (pet.isSick || action === 'sick') {
    // Swirly / sad eyes
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-14, 4, 5, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 4, 5, 0, Math.PI * 1.5);
    ctx.stroke();
  } else if (blink) {
    // Blinking horizontal slits
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.lineTo(-8, 4);
    ctx.moveTo(8, 4);
    ctx.lineTo(18, 4);
    ctx.stroke();
  } else {
    // Normal / cute big sparkling eyes
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.ellipse(-13, 3, 5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(13, 3, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye catch sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-15, 1, 2.5, 0, Math.PI * 2);
    ctx.arc(11, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheek Blushes
  ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-22, 12, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(22, 12, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute Little Mouth
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.5;
  if (action === 'eating') {
    // Eating open mouth
    const chomp = (tick % 20 > 10 ? 4 : 8);
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.ellipse(0, 14, 5, chomp, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (action === 'happy') {
    // Joyful cat smile :3
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.quadraticCurveTo(-3, 16, 0, 13);
    ctx.quadraticCurveTo(3, 16, 6, 12);
    ctx.stroke();
  } else if (pet.stats.hunger < 30) {
    // Pouty mouth
    ctx.beginPath();
    ctx.arc(0, 16, 5, Math.PI, 0);
    ctx.stroke();
  } else {
    // Gentle smile
    ctx.beginPath();
    ctx.arc(0, 12, 4, 0, Math.PI);
    ctx.stroke();
  }

  // Draw Head & Neck Accessories for Spirit Baby (floating gracefully)
  drawHeadAccessory(ctx, pet, tick, earWiggle, true);
  drawNeckAccessory(ctx, pet, tick, isWalking, true);

  ctx.restore();
}
