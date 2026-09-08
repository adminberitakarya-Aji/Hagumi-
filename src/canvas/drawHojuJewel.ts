/**
 * src/canvas/drawHojuJewel.ts
 * Fungsi gambar canvas layer "drawHojuJewel" (diekstrak dari KitsuneCanvas.tsx).
 */
// Sacred Inari Hōju Jewel (宝珠) - Cintamani Wish-Fulfilling Sacred Gemstone
export function drawHojuJewel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  element: any,
  cracks: number,
  tick: number
) {
  const tapCount = cracks;
  const wobble = tapCount > 0 ? Math.sin(tick * 0.4) * (tapCount * 2) : 0;
  const levitate = tapCount > 0 ? Math.sin(tick * 0.08) * (tapCount * 3.5) - (tapCount * 4) : 0;
  const pulse = Math.sin(tick * 0.06) * 5;

  ctx.save();
  ctx.translate(cx + wobble, cy + levitate);

  // 1. Divine Aura Glow (Kaen Flame Halo)
  const auraRadius = 80 + pulse + tapCount * 12;
  const glow = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRadius);
  glow.addColorStop(0, element.auraColor || 'rgba(234, 88, 12, 0.45)');
  glow.addColorStop(0.7, 'rgba(254, 240, 138, 0.18)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sacred Wooden Sanbō Altar Stand (三方台座)
  ctx.save();
  ctx.translate(0, -levitate); // pedestal stays on ground
  // Altar tabletop
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-48, 56, 96, 12);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-44, 58, 88, 8);
  // Gold gilded corners
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-48, 56, 8, 12);
  ctx.fillRect(40, 56, 8, 12);
  // Altar column / foot
  ctx.fillStyle = '#292524';
  ctx.fillRect(-28, 68, 56, 10);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-36, 78, 72, 6);
  ctx.restore();

  // 3. Sacred Swirling Flames of the Hōju (火焔宝珠 - Kaen Tails)
  ctx.save();
  const flameWiggle = Math.sin(tick * 0.1) * 3;
  ctx.fillStyle = element.secondaryColor;
  ctx.globalAlpha = 0.55;
  // Left flame tongue
  ctx.beginPath();
  ctx.moveTo(-36, 20);
  ctx.bezierCurveTo(-55 + flameWiggle, 0, -50 - flameWiggle, -35, -20, -50);
  ctx.bezierCurveTo(-30, -30, -32, -10, -28, 20);
  ctx.fill();
  // Right flame tongue
  ctx.beginPath();
  ctx.moveTo(36, 20);
  ctx.bezierCurveTo(55 - flameWiggle, 0, 50 + flameWiggle, -35, 20, -50);
  ctx.bezierCurveTo(30, -30, 32, -10, 28, 20);
  ctx.fill();
  ctx.restore();

  // 4. Sacred Hōju Jewel (Teardrop / Flame-Tipped Gemstone Body)
  ctx.beginPath();
  ctx.moveTo(0, -54); // Tip of jewel
  ctx.bezierCurveTo(24, -30, 50, -5, 48, 24); // Right hip
  ctx.bezierCurveTo(46, 52, 24, 58, 0, 58); // Bottom base
  ctx.bezierCurveTo(-24, 58, -46, 52, -48, 24); // Left hip
  ctx.bezierCurveTo(-50, -5, -24, -30, 0, -54); // Back to tip
  ctx.closePath();

  // Rich Gemstone Gradient
  const gemGrad = ctx.createRadialGradient(-12, -15, 6, 0, 8, 54);
  gemGrad.addColorStop(0, '#ffffff'); // Glinting highlight
  gemGrad.addColorStop(0.2, element.secondaryColor);
  gemGrad.addColorStop(0.65, element.primaryColor);
  gemGrad.addColorStop(1, '#1c1917');
  ctx.fillStyle = gemGrad;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  // 5. Crystalline Facet Reflections (Diamond / Jewel Cut)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  // Facet lines
  ctx.beginPath();
  ctx.moveTo(0, -54);
  ctx.lineTo(-24, 8);
  ctx.lineTo(0, 38);
  ctx.lineTo(24, 8);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-24, 8);
  ctx.lineTo(-44, 22);
  ctx.moveTo(24, 8);
  ctx.lineTo(44, 22);
  ctx.moveTo(0, 38);
  ctx.lineTo(0, 58);
  ctx.stroke();

  // Specular gleam highlight spot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.ellipse(-14, -20, 10, 5, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Sacred Shimenawa Rope around base of Hōju
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 36, 42, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hanging White Paper Talismans (Shide - 紙垂)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1;
  [-20, 0, 20].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x - 5, 42);
    ctx.lineTo(x + 5, 42);
    ctx.lineTo(x, 56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 7. Glowing Inscribed Elemental Kanji in the Core
  ctx.save();
  ctx.shadowColor = element.secondaryColor;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Shippori Mincho", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(element.kanji, 0, 10);
  ctx.restore();

  // 8. Awakening Energy & Spiritual Sparkles (on tap)
  if (tapCount > 0) {
    ctx.save();
    ctx.strokeStyle = element.secondaryColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, 0.9 - tapCount * 0.15);
    ctx.beginPath();
    ctx.arc(0, 10, 58 + ((tick * 2) % 30), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Orbiting Elemental Crystals / Sparks
    const sparkCount = tapCount * 4;
    for (let i = 0; i < sparkCount; i++) {
      const angle = tick * 0.08 + (i * Math.PI * 2) / sparkCount;
      const dist = 56 + Math.sin(tick * 0.15 + i) * 16;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * (dist * 0.65) + 5;

      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : element.secondaryColor;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const r = 3 + tapCount * 0.8;
      ctx.moveTo(sx, sy - r);
      ctx.lineTo(sx + r * 0.6, sy);
      ctx.lineTo(sx, sy + r);
      ctx.lineTo(sx - r * 0.6, sy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}
