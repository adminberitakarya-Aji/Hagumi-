/**
 * scripts/optimize-images.mjs
 * Optimasi aset gambar HAGUMI:
 *   1. Konversi semua .jpg di src/assets/images → .webp (max lebar 1920px, quality 80).
 *   2. Buat public/og_image.jpg (1200x630, quality 80) dari fuji_torii_gateway
 *      untuk meta tag og:image/twitter:image — social crawler lebih aman dengan JPG.
 *
 * Pemakaian:
 *   node scripts/optimize-images.mjs            # konversi saja (tidak menghapus sumber)
 *   node scripts/optimize-images.mjs --clean    # konversi + hapus .jpg sumber yang sudah dikonversi
 *
 * Jalankan ulang setiap menambahkan aset gambar baru. Butuh devDependency `sharp`.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src/assets/images');
const CLEAN = process.argv.includes('--clean');
const OG_SOURCE = 'fuji_torii_gateway_1788711184860.jpg';

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Folder tidak ditemukan: ${SRC_DIR}`);
    process.exit(1);
  }

  const jpgs = fs.readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith('.jpg'));
  if (jpgs.length === 0) {
    console.log('Tidak ada .jpg untuk dioptimasi.');
  }

  let totalIn = 0;
  let totalOut = 0;

  for (const file of jpgs) {
    const inPath = path.join(SRC_DIR, file);
    const outPath = inPath.replace(/\.jpe?g$/i, '.webp');
    const inSize = fs.statSync(inPath).size;

    await sharp(inPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(outPath);

    const outSize = fs.statSync(outPath).size;
    totalIn += inSize;
    totalOut += outSize;
    console.log(
      `${file} → ${path.basename(outPath)}: ${(inSize / 1024).toFixed(0)} KB → ${(outSize / 1024).toFixed(0)} KB`
    );
  }

  if (jpgs.length > 0) {
    console.log(
      `\nTotal: ${(totalIn / 1024 / 1024).toFixed(2)} MB → ${(totalOut / 1024 / 1024).toFixed(2)} MB ` +
        `(${Math.round((1 - totalOut / totalIn) * 100)}% hemat)`
    );
  }

  // Og image untuk meta tag (og:image / twitter:image)
  const ogSource = path.join(SRC_DIR, OG_SOURCE);
  const ogOut = path.resolve('public/og_image.jpg');
  if (fs.existsSync(ogSource)) {
    await sharp(ogSource)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(ogOut);
    console.log(`\nog:image dibuat: public/og_image.jpg (${(fs.statSync(ogOut).size / 1024).toFixed(0)} KB)`);
  } else {
    console.warn(`\nSumber og:image tidak ditemukan: ${OG_SOURCE} — dilewati.`);
  }

  if (CLEAN && jpgs.length > 0) {
    for (const file of jpgs) fs.unlinkSync(path.join(SRC_DIR, file));
    console.log(`\n--clean: ${jpgs.length} file .jpg sumber dihapus.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
