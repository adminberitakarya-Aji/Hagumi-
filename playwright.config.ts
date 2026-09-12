import { defineConfig, devices } from '@playwright/test';

/**
 * Konfigurasi Playwright E2E (temuan audit Revisi 8, item T1).
 *
 * Menjaga alur kritis yang tidak terlindungi unit/component test:
 *   1. Onboarding: Prolog Torii → Altar Telur (pilih elemen → nama → Hanko →
 *      3× ketuk menetas) → Tatami Room tampil.
 *   2. Core loop: save seed v5 → HUD tampil → buka modal Bento via dock.
 *
 * webServer menjalankan `npm run dev` (Express + Vite middleware di :3000).
 * Di lokal, server yang sudah berjalan dipakai ulang; di CI selalu fresh.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false, // alur onboarding menulis save ke localStorage — jalankan serial
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
