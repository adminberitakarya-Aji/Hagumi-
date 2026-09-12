/**
 * Unit test src/server/securityHeaders.ts (temuan audit Revisi 7, item B3):
 * builder CSP (pure) dan middleware security headers (res di-stub).
 */

import { describe, it, expect, vi } from 'vitest';
import { buildContentSecurityPolicy, securityHeaders } from './securityHeaders';

function makeStubRes() {
  const headers = new Map<string, string>();
  return {
    headers,
    setHeader: vi.fn((name: string, value: string) => {
      headers.set(name, value);
    }),
  };
}

describe('buildContentSecurityPolicy', () => {
  it('mengembalikan null di mode dev (CSP dilewati agar Vite HMR tetap jalan)', () => {
    expect(buildContentSecurityPolicy(false)).toBeNull();
  });

  it('di produksi: skrip hanya self, tanpa inline', () => {
    const csp = buildContentSecurityPolicy(true) ?? '';
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("default-src 'self'");
  });

  it('di produksi: font Google tetap diizinkan (dipakai index.html)', () => {
    const csp = buildContentSecurityPolicy(true) ?? '';
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://fonts.gstatic.com');
  });

  it('di produksi: frame-ancestors none & object-src none', () => {
    const csp = buildContentSecurityPolicy(true) ?? '';
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});

describe('securityHeaders middleware', () => {
  it('memasang header dasar di semua mode (termasuk dev)', () => {
    const res = makeStubRes();
    securityHeaders(false)({} as never, res as never, () => {});

    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toContain('geolocation=()');
    // Header khusus produksi tidak dipasang di dev
    expect(res.headers.has('Content-Security-Policy')).toBe(false);
    expect(res.headers.has('Strict-Transport-Security')).toBe(false);
  });

  it('di produksi memasang HSTS + CSP, dan memanggil next() tepat sekali', () => {
    const res = makeStubRes();
    const next = vi.fn();
    securityHeaders(true)({} as never, res as never, next);

    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('tidak memblokir gyroscope (fitur parallax 2.5D mobile tetap berfungsi)', () => {
    const res = makeStubRes();
    securityHeaders(true)({} as never, res as never, () => {});
    const policy = res.headers.get('Permissions-Policy') ?? '';
    expect(policy).not.toContain('gyroscope');
    expect(policy).not.toContain('accelerometer');
  });
});
