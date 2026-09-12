/**
 * src/server/omikuji.ts
 * Validasi bentuk payload ramalan Omikuji yang dikembalikan Gemini & fallback lokal.
 *
 * Latar (temuan audit Revisi 7, item B2): endpoint `/api/kitsune/omikuji` sebelumnya
 * meneruskan `JSON.parse(response.text)` langsung ke klien — JSON valid dengan field
 * salah/hilang tetap sampai ke UI. Fungsi di sini memastikan HANYA payload dengan
 * keempat field string non-kosong dalam batas panjang yang lolos; selain itu handler
 * memakai fallback lokal (fallback juga dipakai saat parse gagal / AI error).
 *
 * Pure module (tanpa efek samping) agar mudah di-unit-test.
 */

import type { OmikujiResult } from '../types/game';

/** Fallback ramalan lokal — dipakai saat AI gagal ATAU bentuk payload tidak valid. */
export const OMIKUJI_FALLBACK_FORTUNES: OmikujiResult[] = [
  {
    blessing: 'Daikichi (Berkah Agung / Great Blessing)',
    poem: 'Api rubah menari di bawah rembulan,\nLangkahmu diberkahi ketenangan dan keberanian.',
    advice: 'Hari ini adalah waktu terbaik untuk memulai kebiasaan baik baru.',
    luckyItem: 'Aburaage (Tahu Goreng Gurih)',
  },
  {
    blessing: 'Chukichi (Berkah Menengah / Middle Blessing)',
    poem: 'Kelopak sakura melayang lembut di tatami,\nRezeki datang bagi hati yang gemar berbagi.',
    advice: 'Luangkan waktu untuk beristirahat dan menyeduh teh hangat.',
    luckyItem: 'Cangkir Ocha Hijau',
  },
  {
    blessing: 'Kichi (Keberuntungan Baik / Good Fortune)',
    poem: 'Lonceng kuil berdentang di senja temaram,\nSemua niat tulus berujung pada damai tenteram.',
    advice: 'Tetap rawat kitsune-mu dengan penuh kesabaran.',
    luckyItem: 'Jimat Omamori Merah',
  },
];

/**
 * Memilih satu ramalan fallback secara acak.
 * `random` diinjeksi agar testable (default Math.random).
 */
export function pickFallbackOmikuji(random: () => number = Math.random): OmikujiResult {
  const count = OMIKUJI_FALLBACK_FORTUNES.length;
  const index = Math.min(count - 1, Math.max(0, Math.floor(random() * count)));
  return { ...OMIKUJI_FALLBACK_FORTUNES[index] };
}

/** Batas panjang per field (karakter) — melindungi UI dari teks liar. */
const FIELD_LIMITS: Record<keyof OmikujiResult, number> = {
  blessing: 120,
  poem: 300,
  advice: 200,
  luckyItem: 80,
};

/**
 * Memvalidasi bentuk payload omikuji dari AI.
 * Mengembalikan objek OmikujiResult tersanitasi (di-trim), atau null jika bentuknya
 * tidak valid sehingga pemanggil harus memakai fallback lokal.
 */
export function validateOmikujiPayload(raw: unknown): OmikujiResult | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;

  const candidate = raw as Record<string, unknown>;
  const result = {} as OmikujiResult;

  for (const field of Object.keys(FIELD_LIMITS) as Array<keyof OmikujiResult>) {
    const value = candidate[field];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > FIELD_LIMITS[field]) return null;
    result[field] = trimmed;
  }

  return result;
}
