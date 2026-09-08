/**
 * src/canvas/drawNeckAccessory.ts
 * Fungsi gambar canvas layer "drawNeckAccessory" (diekstrak dari KitsuneCanvas.tsx).
 */
import { PetData } from '../types/game';

// Neck Accessories (Suzu bell, Magatama jade, Inari Scarf, Shimenawa, or classic bib)
export function drawNeckAccessory(
  ctx: CanvasRenderingContext2D,
  pet: PetData,
  tick: number,
  isWalking: boolean,
  isBaby: boolean = false
) {
  const neckAcc = pet.accessories?.neck || 'none';
  const stage = pet.stage;

  ctx.save();

  if (neckAcc === 'suzu') {
    // Pita Lonceng Emas (Suzu Bell with red ribbon)
    const bellY = isBaby ? 32 : 30;
    const sway = Math.sin(tick * (isWalking ? 0.25 : 0.12)) * 2;

    // Vermilion Ribbon collar
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = isBaby ? 3.5 : 4.5;
    ctx.beginPath();
    ctx.ellipse(0, isBaby ? 24 : 16, isBaby ? 20 : 22, isBaby ? 8 : 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Ribbon bow wings
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(-6, bellY - 8, 5, 3, -0.4, 0, Math.PI * 2);
    ctx.ellipse(6, bellY - 8, 5, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Golden Suzu Bell with shine
    ctx.save();
    ctx.translate(sway, bellY);

    // Warm golden glow
    const bellGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
    bellGlow.addColorStop(0, 'rgba(250, 204, 21, 0.5)');
    bellGlow.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = bellGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    // Bell sphere
    const bellGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 8);
    bellGrad.addColorStop(0, '#fef08a');
    bellGrad.addColorStop(0.4, '#facc15');
    bellGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bellGrad;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, isBaby ? 6.5 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horizontal sound slit & bottom round hole
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, 1, 8, 1.5);
    ctx.beginPath();
    ctx.arc(0, 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Metallic gleam highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (neckAcc === 'magatama') {
    // Kalung Giok Magatama (Sacred curved emerald jade bead)
    const cordY = isBaby ? 24 : 16;
    const beadY = isBaby ? 32 : 28;
    const sway = Math.sin(tick * (isWalking ? 0.2 : 0.08)) * 2;

    // Dark braided holy cord
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, cordY, isBaby ? 20 : 22, isBaby ? 7 : 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(sway, beadY);

    // Jade spiritual green glow
    const jadeGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    jadeGlow.addColorStop(0, 'rgba(52, 211, 153, 0.6)');
    jadeGlow.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = jadeGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Authentic curved Magatama comma geometry
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(6, -6, 6, 0);
    ctx.quadraticCurveTo(6, 6, 2, 8);
    ctx.quadraticCurveTo(-4, 10, -2, 4);
    ctx.quadraticCurveTo(-1, 0, -6, 0);
    ctx.quadraticCurveTo(-6, -6, 0, -6);
    ctx.closePath();

    const jadeGrad = ctx.createLinearGradient(-5, -6, 5, 8);
    jadeGrad.addColorStop(0, '#a7f3d0');
    jadeGrad.addColorStop(0.5, '#10b981');
    jadeGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = jadeGrad;
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.8;
    ctx.fill();
    ctx.stroke();

    // Sacred eyelet hole
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(0, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (neckAcc === 'scarf') {
    // Syal Merah Inari (Warm fluttering crimson scarf)
    const scarfY = isBaby ? 22 : 14;
    const wave = Math.sin(tick * (isWalking ? 0.28 : 0.12)) * (isWalking ? 7 : 3.5);

    // Scarf wrap around neck
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, scarfY, isBaby ? 24 : 26, isBaby ? 10 : 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bright fold highlight
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, scarfY + 2, isBaby ? 22 : 23, isBaby ? 7 : 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Trailing fluttering tail waving in wind
    ctx.save();
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(12, scarfY + 6);
    ctx.quadraticCurveTo(24 + wave, scarfY + 18, 30 + wave * 1.3, scarfY + 32);
    ctx.lineTo(22 + wave * 1.3, scarfY + 34);
    ctx.quadraticCurveTo(16 + wave, scarfY + 20, 6, scarfY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden fringe at tip
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22 + wave * 1.3, scarfY + 34);
    ctx.lineTo(30 + wave * 1.3, scarfY + 32);
    ctx.stroke();

    ctx.restore();
  } else if (neckAcc === 'shimenawa') {
    // Tali Suci Shimenawa (Braided holy rope with paper streamers)
    const ropeY = isBaby ? 22 : 16;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, ropeY, isBaby ? 22 : 24, isBaby ? 8 : 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Dark straw twist texture
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    [-14, -7, 0, 7, 14].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x - 2, ropeY - 4);
      ctx.lineTo(x + 2, ropeY + 4);
      ctx.stroke();
    });

    // Hanging White Shide Paper Streamers
    [-10, 0, 10].forEach((x, idx) => {
      const sway = Math.sin(tick * 0.1 + idx) * 1.5;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3 + sway, ropeY + 3);
      ctx.lineTo(x + 3 + sway, ropeY + 3);
      ctx.lineTo(x + 1 + sway, ropeY + 11);
      ctx.lineTo(x + 3 + sway, ropeY + 16);
      ctx.lineTo(x - 2 + sway, ropeY + 20);
      ctx.lineTo(x - 4 + sway, ropeY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else {
    // 'none' - If stage is remaja / dewasa / mistik, show traditional classic bib
    if (!isBaby && (stage === 'remaja' || stage === 'dewasa' || stage === 'mistik')) {
      ctx.fillStyle = '#dc2626'; // Vermilion Red
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 12);
      ctx.lineTo(18, 12);
      ctx.lineTo(12, 28);
      ctx.lineTo(0, 34);
      ctx.lineTo(-12, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Bell on Collar
      ctx.beginPath();
      ctx.arc(0, 32, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}
