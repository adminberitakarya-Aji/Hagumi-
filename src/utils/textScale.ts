/**
 * src/utils/textScale.ts
 * A11y/UX: Mode "Teks Besar" — memperbesar token teks mikro antarmuka.
 * Implementasi: class `hagumi-text-large` di <html> + override CSS di
 * src/index.css (menaikkan utility px mikro 7–12px sebesar +2px).
 * Preferensi dipersist di localStorage dan diterapkan saat boot di App.tsx.
 */

const STORAGE_KEY = 'hagumi_text_scale';

/** Baca preferensi tersimpan (aman terhadap localStorage yang diblokir). */
export function isTextScaleLarge(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'large';
  } catch {
    return false;
  }
}

/** Set preferensi + terapkan segera ke <html> (berlaku seluruh aplikasi). */
export function setTextScaleLarge(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'large' : 'normal');
  } catch {
    /* penyimpanan gagal diabaikan — mode tetap berlaku untuk sesi ini */
  }
  document.documentElement.classList.toggle('hagumi-text-large', enabled);
}

/** Terapkan preferensi tersimpan (dipanggil sekali saat boot aplikasi). */
export function applyStoredTextScale(): void {
  document.documentElement.classList.toggle('hagumi-text-large', isTextScaleLarge());
}
