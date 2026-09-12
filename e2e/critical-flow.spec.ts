/**
 * E2E — alur kritis HAGUMI (temuan audit Revisi 8, item T1).
 *
 * Dilindungi di sini karena unit/component test tidak bisa menjaga:
 *   1. Onboarding penuh: Prolog Torii → Altar Telur → penetasan → Tatami Room.
 *   2. Core loop dengan save schema v5: HUD + buka modal Bento dari dock.
 *
 * Catatan: game berjalan TANPA GEMINI_API_KEY (semua endpoint AI punya
 * fallback lokal), sehingga E2E tidak butuh env apa pun.
 */

import { test, expect, type Page } from '@playwright/test';

/**
 * Menanam save schema v5 (envelope { version, data }) SEBELUM skrip aplikasi
 * jalan — melewati onboarding dan langsung masuk Tatami Room.
 * Field wajib mengikuti sanitizer `petSaveSchema.ts`; field opsional memakai default.
 */
async function seedPetSave(page: Page) {
  const now = Date.now();
  const pet = {
    id: 'e2e_kitsune_seed',
    name: 'Kohaku',
    element: 'fire',
    stage: 'bayi',
    form: 'kitsunebi',
    tailCount: 1,
    stats: { hunger: 70, energy: 80, cleanliness: 75, happiness: 70, discipline: 50, health: 90 },
    weight: 450,
    ageDays: 1,
    exp: 10,
    level: 1,
    careScore: 80,
    careMistakes: 0,
    hankoSignature: '福',
    birthTimestamp: now - 3_600_000,
    // < 3 menit → tidak memicu modal Offline Return
    lastInteractionTime: now,
    lastDecayTime: now,
    isSleeping: false,
    isSick: false,
    poopCount: 0,
    coins: 100,
    inventory: {},
    favoriteFood: 'Aburaage',
    generation: 1,
    totalMiniGamesWon: 0,
  };
  await page.addInitScript(
    ({ save }) => {
      window.localStorage.setItem('HAGUMI_KITSUNE_SAVE_DATA', save);
      window.localStorage.setItem('hagumi_skip_prologue_auto', 'true');
    },
    { save: JSON.stringify({ version: 5, data: pet }) }
  );
}

test.describe('Alur kritis: onboarding', () => {
  test('Prolog Torii → Altar Telur → menetas → Tatami Room', async ({ page }) => {
    await page.goto('/');

    // 1. Prolog Torii tampil untuk pemain baru (tanpa skip flag)
    const enterButton = page.getByRole('button', { name: /Melangkah Masuk ke Santuari/ });
    await expect(enterButton).toBeVisible();
    await enterButton.click();

    // 2. Altar Telur — Langkah 1: pilih elemen (default terpilih) → lanjut
    const nextToName = page.getByRole('button', { name: /Langkah Berikutnya: Beri Nama/ });
    await expect(nextToName).toBeVisible({ timeout: 20_000 });
    await nextToName.click();

    // 3. Langkah 2: beri nama & pilih Hanko → bawa ke altar permata
    await page.getByPlaceholder(/Contoh: Hagumi/).fill('Kohaku');
    await page.getByRole('button', { name: /Bawa ke Altar Permata Hōju/ }).click();

    // 4. Langkah 3: ketuk permata Hōju 3× untuk menetas
    const awakenButton = page.getByRole('button', { name: /Bangunkan Permata Hōju/ });
    await expect(awakenButton).toBeVisible();
    for (let i = 0; i < 3; i++) {
      await awakenButton.click();
    }

    // 5. Penetasan selesai → Tatami Room: identitas pet tampil di HUD header
    const petHeading = page.getByRole('heading', { name: 'Kohaku', exact: true });
    await expect(petHeading).toBeVisible({ timeout: 45_000 });

    // 6. HUD inti aktif: stage bayi + dock aksi terlihat
    await expect(page.getByText(/bayi/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Makan Bento/ })).toBeVisible();
  });
});

test.describe('Alur kritis: core loop (save seed v5)', () => {
  test.beforeEach(async ({ page }) => {
    await seedPetSave(page);
  });

  test('HUD tampil + buka & tutup modal Bento dari dock', async ({ page }) => {
    await page.goto('/');

    // Save seed dimuat: langsung Tatami Room (tanpa Prolog/Altar)
    await expect(page.getByRole('heading', { name: 'Kohaku', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    // Altar telur TIDAK tampil
    await expect(page.getByText(/Hōju/).first()).toBeHidden();

    // Dock aksi: buka modal Bento (transisi Shoji → modal muncul).
    // CATATAN: pembungkus role="dialog" (DialogA11yWrapper) berukuran 0×0 karena
    // konten modal memakai fixed inset-0 — Playwright menganggap pembungkusnya
    // "hidden". Karena itu visibilitas diuji pada konten modal yang nyata tampil.
    await page.getByRole('button', { name: /Makan Bento/ }).click();
    const bentoHeading = page.getByRole('heading', { name: 'Meja Santapan Bento' });
    await expect(bentoHeading).toBeVisible({ timeout: 20_000 });

    // Aksesibilitas inti modal: Esc menutup (useDialogA11y)
    await page.keyboard.press('Escape');
    await expect(bentoHeading).toBeHidden({ timeout: 10_000 });

    // Prolog tidak muncul (flag skip)
    await expect(page.getByText(/Melangkah Masuk ke Santuari/)).toBeHidden();
  });

  test('header menampilkan identitas & saldo koin dari save seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Kohaku', exact: true })).toBeVisible({
      timeout: 30_000,
    });
    // Tombol Toko memuat saldo di aria-label (seed = 100 Ryo; default pet baru = 50 —
    // sehingga assertion ini membuktikan save seed v5 benar-benar dimuat).
    await expect(page.getByRole('button', { name: /Saldo 100 Ryo/ })).toBeVisible();
  });
});
