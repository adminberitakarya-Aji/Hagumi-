/**
 * src/canvas/drawTails.ts
 * Fungsi gambar canvas layer "drawTails" (diekstrak dari KitsuneCanvas.tsx).
 */
// Draw Multiple Bushy Tails waving harmoniously
export function drawTails(
  ctx: CanvasRenderingContext2D,
  count: number,
  element: any,
  tailWave: number,
  tick: number
) {
  // Angle spread based on tail count
  const spread = Math.min(Math.PI * 0.9, (count - 1) * 0.22);
  const startAngle = -Math.PI / 2 - spread / 2;
  const step = count > 1 ? spread / (count - 1) : 0;

  for (let i = 0; i < count; i++) {
    const baseAngle = startAngle + i * step;
    const waveOffset = Math.sin(tick * 0.09 + i * 0.6) * 12;
    const tailLength = 80 + Math.sin(i) * 10;

    ctx.save();
    ctx.translate(0, 28);
    ctx.rotate(baseAngle + (waveOffset * Math.PI) / 180);

    // Fluffy Curved Tail
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(24, -tailLength * 0.5, 8, -tailLength);
    ctx.quadraticCurveTo(-22, -tailLength * 0.6, 0, 0);
    ctx.closePath();

    const tailGrad = ctx.createLinearGradient(0, 0, 0, -tailLength);
    tailGrad.addColorStop(0, element.primaryColor);
    tailGrad.addColorStop(0.7, element.secondaryColor);
    tailGrad.addColorStop(1, '#ffffff'); // White tip on tails
    ctx.fillStyle = tailGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
