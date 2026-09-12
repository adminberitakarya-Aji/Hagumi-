import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

/**
 * Konfigurasi Vitest khusus test (Revisi 6, prioritas P3):
 * - environment jsdom untuk test komponen (@testing-library/react)
 * - plugin react agar JSX di file test terkompilasi
 * - alias '@' identik dengan vite.config.ts
 * File ini HANYA dipakai oleh Vitest (`npm run test`); build produksi tetap
 * memakai vite.config.ts.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // T3 (Revisi 8): stabilkan eksekusi test di mesin RAM terbatas.
    // Pool default Vitest 5 ('forks') sempat gagal start worker (3 file test
    // terskip diam-diam di lokal — lihat audit.md bagian 8.2 T3). Pool
    // 'threads' lebih ringan memori; worker dibatasi 2 agar jsdom berat
    // (React Testing Library) tidak berebut RAM paralel berlebihan.
    // Catatan: Vitest 5 memakai `maxWorkers` top-level (poolOptions sudah dihapus).
    pool: 'threads',
    maxWorkers: 2,
    // Test Vitest hanya di src/ — folder e2e/ adalah test Playwright
    // (spec.ts di sana akan error "test.describe() called here" jika ikut terambil).
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
