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
  },
});
