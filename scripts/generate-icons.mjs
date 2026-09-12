/**
 * scripts/generate-icons.mjs
 * PWA (Revisi 6, prioritas P1): membuat ikon aplikasi dari public/favicon.svg
 * via sharp (devDependency yang sudah ada — pola sama dengan optimize-images.mjs):
 *   - public/icons/icon-192.png / icon-512.png   (purpose: any)
 *   - public/icons/icon-512-maskable.png         (purpose: maskable — konten 78%
 *     di dalam safe zone, di atas latar solid #1c1815 agar aman dari crop
 *     mask Android)
 *   - public/icons/apple-touch-icon-180.png      (iOS homescreen)
 * Jalankan: npm run generate:icons
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, '..', 'public', 'favicon.svg');
const outDir = path.join(__dirname, '..', 'public', 'icons');

// Pastikan folder output ada (idempoten)
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon-180.png', size: 180, maskable: false },
];

for (const target of targets) {
  if (target.maskable) {
    const inner = await sharp(svgPath)
      .resize(Math.round(target.size * 0.78))
      .png()
      .toBuffer();
    await sharp({
      create: { width: target.size, height: target.size, channels: 4, background: '#1c1815' },
    })
      .composite([{ input: inner, gravity: 'centre' }])
      .png()
      .toFile(path.join(outDir, target.file));
  } else {
    await sharp(svgPath).resize(target.size, target.size).png().toFile(path.join(outDir, target.file));
  }
  console.log(`[icons] ${target.file} (${target.size}px${target.maskable ? ', maskable' : ''}) OK`);
}
console.log('[icons] selesai.');
