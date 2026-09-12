/**
 * src/server/securityHeaders.ts
 * Security headers untuk Express (temuan audit Revisi 7, item B3).
 *
 * Dipasang manual (tanpa dependensi `helmet`) agar sesuai filosofi minim-dependency
 * project; cakupan setara kebutuhan aplikasi ini:
 *  - X-Content-Type-Options: nosniff
 *  - X-Frame-Options: DENY (anti-clickjacking; juga di-CSP via frame-ancestors)
 *  - Referrer-Policy: strict-origin-when-cross-origin
 *  - Permissions-Policy: kamera/mikrofon/geolokasi dimatikan default
 *    (CATATAN: gyroscope/accelerometer SENGAJA tidak di-set agar parallax 2.5D
 *    di mobile tetap berfungsi — lihat docs/03 §5)
 *  - Strict-Transport-Security (HSTS) — hanya di produksi (di belakang TLS Cloud Run)
 *  - Content-Security-Policy — hanya di produksi.
 *
 * CSP produksi disetel agar:
 *  - font Google (fonts.googleapis.com / fonts.gstatic.com) tetap jalan (index.html)
 *  - style inline tetap diizinkan (React inline style + Tailwind runtime)
 *  - skrip inline TIDAK diizinkan (build produksi tidak memakai inline script)
 *
 * Di mode dev, CSP SENGAJA dilewati: Vite HMR menyuntik skrip inline & koneksi
 * ws:// yang akan dilanggar CSP ketat. Header non-CSP tetap dipasang di dev.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Menyusun nilai header Content-Security-Policy untuk produksi.
 * Mengembalikan null di mode dev (CSP dilewati — lihat catatan di atas).
 * Pure function agar mudah di-unit-test.
 */
export function buildContentSecurityPolicy(isProduction: boolean): string | null {
  if (!isProduction) return null;
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

/**
 * Middleware security headers. `isProduction` diinjeksi (bukan dibaca di dalam)
 * agar perilaku dev/produksi mudah diuji tanpa mengubah NODE_ENV global.
 */
export function securityHeaders(isProduction: boolean) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      const csp = buildContentSecurityPolicy(true);
      if (csp) res.setHeader('Content-Security-Policy', csp);
    }

    next();
  };
}
