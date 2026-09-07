import { PetData } from '../types/game';
import { ElementInfo } from '../types/game';

export const generateShrinePassportPng = (
  pet: PetData,
  shrineCode: string,
  elementConfig: ElementInfo
): string => {
  const canvas = document.createElement('canvas');
  const width = 640;
  const height = 920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Background Parchment Washi
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#2d1810');
  bgGrad.addColorStop(0.5, '#1e100a');
  bgGrad.addColorStop(1, '#120805');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Washi paper grain texture lines
  ctx.strokeStyle = 'rgba(255, 200, 150, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < height; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i + (Math.sin(i * 0.05) * 4));
    ctx.stroke();
  }

  // 2. Double Traditional Golden / Vermilion Frame
  ctx.strokeStyle = '#8B2500'; // Vermilion red
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = '#d4a373'; // Warm Gold
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Corner Ornaments
  const drawCorner = (cx: number, cy: number) => {
    ctx.strokeStyle = '#e9c46a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawCorner(34, 34);
  drawCorner(width - 34, 34);
  drawCorner(34, height - 34);
  drawCorner(width - 34, height - 34);

  // 3. Header Torii & Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Torii Emoji or Symbol
  ctx.font = '36px serif';
  ctx.fillText('⛩️', width / 2, 70);

  ctx.fillStyle = '#f4a261';
  ctx.font = 'bold 12px sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('• INARI GUARDIAN PASSPORT •', width / 2, 115);

  ctx.fillStyle = '#fff3b0';
  ctx.font = 'bold 24px serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('稲荷大神 守護聖印手帳', width / 2, 145);

  ctx.fillStyle = 'rgba(244, 162, 97, 0.7)';
  ctx.font = 'italic 12px serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Paspor Spiritual Ziarah Santuari Hagumi', width / 2, 172);

  // Divider
  ctx.strokeStyle = 'rgba(244, 162, 97, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 195);
  ctx.lineTo(width - 60, 195);
  ctx.stroke();

  // 4. Hanko Seal Centerpiece
  const hankoX = width / 2;
  const hankoY = 270;
  const hankoSize = 80;

  // Outer red seal box
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(hankoX - hankoSize / 2, hankoY - hankoSize / 2, hankoSize, hankoSize);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.strokeRect(hankoX - hankoSize / 2, hankoY - hankoSize / 2, hankoSize, hankoSize);

  // Hanko character
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px serif';
  ctx.fillText(pet.hankoSignature || '福', hankoX, hankoY + 2);

  // 5. Pet Name & Stage
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px serif';
  ctx.fillText(pet.name, width / 2, 345);

  ctx.fillStyle = '#f4a261';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`Roh Kitsune ${pet.stage.toUpperCase()} • ${pet.tailCount} Ekor Sakral`, width / 2, 375);

  // 6. Attributes Table / Badge Grid
  const gridY = 415;
  const colW = (width - 120) / 2;

  const drawCard = (x: number, y: number, label: string, val: string, icon: string) => {
    ctx.fillStyle = 'rgba(20, 10, 6, 0.7)';
    ctx.fillRect(x, y, colW, 58);
    ctx.strokeStyle = 'rgba(212, 163, 115, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, colW, 58);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#a8a29e';
    ctx.font = '10px sans-serif';
    ctx.fillText(label, x + 12, y + 18);

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${icon} ${val}`, x + 12, y + 40);
  };

  drawCard(60, gridY, 'AFINITAS ELEMEN', `${elementConfig.name} (${elementConfig.kanji || '気'})`, '✨');
  drawCard(60 + colW + 10, gridY, 'TINGKAT KESAKTIAN', `Level ${pet.level} (${pet.exp} EXP)`, '⚡');
  drawCard(60, gridY + 68, 'SKOR PERAWATAN', `${pet.careScore} / 100 Poin`, '💖');
  drawCard(60 + colW + 10, gridY + 68, 'PENGASUH KUIL', pet.caretakerName || 'Pengasuh Utama', '🎋');

  // 7. Shrine Code Box
  const codeBoxY = 575;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(60, codeBoxY, width - 120, 80);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, codeBoxY, width - 120, 80);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('KODE ZIARAH KUIL RESMI (SHRINE PASSPORT CODE)', width / 2, codeBoxY + 22);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(shrineCode, width / 2, codeBoxY + 52);

  // 8. Sacred Blessing Quote / Verse
  ctx.fillStyle = '#e7e5e4';
  ctx.font = 'italic 12px serif';
  ctx.fillText('「風鈴の音色、神狐の加護、心清らかなる者に福来たる」', width / 2, 700);
  ctx.fillStyle = '#d6d3d1';
  ctx.font = '11px serif';
  ctx.fillText('"Dentingan genta suzu membawa berkah ketenteraman,', width / 2, 725);
  ctx.fillText('ikatan batin suci abadi bersama sang Kitsune penjaga."', width / 2, 742);

  // 9. Footer Watermark & Timestamp
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  ctx.strokeStyle = 'rgba(244, 162, 97, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 780);
  ctx.lineTo(width - 60, 780);
  ctx.stroke();

  ctx.fillStyle = '#78716c';
  ctx.font = '10px sans-serif';
  ctx.fillText(`Diterbitkan pada: ${dateStr} • Hagumi: Sacred Kitsune (育み)`, width / 2, 815);

  ctx.fillStyle = '#a8a29e';
  ctx.font = 'bold 11px serif';
  ctx.fillText('⛩️ Fushimi Inari Taisha • Spiritual Passport Series', width / 2, 835);

  return canvas.toDataURL('image/png');
};
