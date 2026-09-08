/**
 * src/canvas/drawPoops.ts
 * Fungsi gambar canvas layer "drawPoops" (diekstrak dari KitsuneCanvas.tsx).
 */
// Draw Traditional Coiled Pixel Poops
export function drawPoops(ctx: CanvasRenderingContext2D, count: number, tick: number) {
  const poopPositions = [
    { x: 55, y: 250 },
    { x: 300, y: 250 },
    { x: 80, y: 275 },
    { x: 275, y: 275 },
  ];

  for (let i = 0; i < Math.min(count, 4); i++) {
    const pos = poopPositions[i];
    ctx.save();
    ctx.translate(pos.x, pos.y);

    // Poop base coil
    ctx.fillStyle = '#854d0e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;

    // Bottom tier
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Middle tier
    ctx.beginPath();
    ctx.ellipse(0, 1, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Top swirl tip
    ctx.beginPath();
    ctx.moveTo(-6, -3);
    ctx.quadraticCurveTo(0, -12, 4, -14);
    ctx.quadraticCurveTo(2, -6, 6, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute kawaii eyes on poop
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(-4, 0, 1.2, 0, Math.PI * 2);
    ctx.arc(4, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Buzzing fly
    const flyX = Math.sin(tick * 0.2 + i) * 12;
    const flyY = -22 + Math.cos(tick * 0.25 + i) * 6;
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(flyX, flyY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
