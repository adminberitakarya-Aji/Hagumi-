/**
 * src/canvas/drawHeadAccessory.ts
 * Fungsi gambar canvas layer "drawHeadAccessory" (diekstrak dari KitsuneCanvas.tsx).
 */
import { PetData } from '../types/game';

// Head Accessories (Sakura Blossom Pin, Kitsune Mask, Tanuki Leaf)
export function drawHeadAccessory(
  ctx: CanvasRenderingContext2D,
  pet: PetData,
  tick: number,
  earBounce: number,
  isBaby: boolean = false
) {
  const headAcc = pet.accessories?.head || 'none';
  if (headAcc === 'none') return;

  ctx.save();

  if (headAcc === 'sakura') {
    // Jepit Bunga Sakura (Pinned gracefully at base of ear)
    const px = isBaby ? 20 : 24;
    const py = (isBaby ? -20 : -26) + earBounce * 0.7;

    ctx.translate(px, py);

    // Subtle gentle petal float
    const petalWobble = Math.sin(tick * 0.08) * 0.08;
    ctx.rotate(petalWobble);

    // 5-Petal Sakura Blossom
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-4, -6, -3, -10);
      ctx.quadraticCurveTo(0, -8.5, 3, -10);
      ctx.quadraticCurveTo(4, -6, 0, 0);
      ctx.closePath();

      const pGrad = ctx.createRadialGradient(0, -5, 1, 0, -5, 8);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.4, '#fbcfe8');
      pGrad.addColorStop(1, '#f472b6');
      ctx.fillStyle = pGrad;
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Golden Stamen pistil center
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  } else if (headAcc === 'kitsune_mask') {
    // Topeng Rubah Kuil (Kitsune-men half-mask perched sideways)
    const mx = isBaby ? 22 : 28;
    const my = (isBaby ? -22 : -28) + earBounce * 0.6;

    ctx.translate(mx, my);
    ctx.rotate(0.25); // Stylish slant

    // Mask Porcelain Body
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(12, -12, 14, 0);
    ctx.quadraticCurveTo(10, 14, 0, 16);
    ctx.quadraticCurveTo(-10, 14, -14, 0);
    ctx.quadraticCurveTo(-12, -12, 0, -14);
    ctx.closePath();

    const maskGrad = ctx.createLinearGradient(-10, -10, 10, 10);
    maskGrad.addColorStop(0, '#ffffff');
    maskGrad.addColorStop(1, '#f5f5f4');
    ctx.fillStyle = maskGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Mask Fox Ears
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.5;
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-4, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.lineTo(14, -18);
    ctx.lineTo(4, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Inari Swirl Markings on Mask
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, -1);
    ctx.quadraticCurveTo(-4, -4, 0, -1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -1);
    ctx.quadraticCurveTo(4, -4, 0, -1);
    ctx.stroke();

    // Cheek whiskers
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.lineTo(-4, 4);
    ctx.moveTo(10, 4);
    ctx.lineTo(4, 4);
    ctx.stroke();

    // Snout
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 8, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Red Tassel Cord hanging down with little gold bead
    const tasselSway = Math.sin(tick * 0.12) * 2;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.quadraticCurveTo(-14 + tasselSway, 14, -12 + tasselSway, 22);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(-12 + tasselSway, 22, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (headAcc === 'leaf') {
    // Daun Mistis Tanuki (Magical Transformation Leaf on Forehead)
    const lx = 0;
    const ly = (isBaby ? -28 : -32) + earBounce * 0.3;

    ctx.translate(lx, ly);
    ctx.rotate(Math.sin(tick * 0.08) * 0.06);

    // Leaf body
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(9, -7, 7, 2);
    // Leaf notch cutout (traditional folklore tanuki leaf style)
    ctx.lineTo(4, 1);
    ctx.lineTo(6, 6);
    ctx.quadraticCurveTo(0, 10, -6, 6);
    ctx.lineTo(-4, 1);
    ctx.lineTo(-7, 2);
    ctx.quadraticCurveTo(-9, -7, 0, -12);
    ctx.closePath();

    const leafGrad = ctx.createLinearGradient(0, -12, 0, 10);
    leafGrad.addColorStop(0, '#86efac');
    leafGrad.addColorStop(0.5, '#22c55e');
    leafGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = leafGrad;
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    // Leaf center vein
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 7);
    ctx.stroke();
  }

  ctx.restore();
}
