/**
 * src/server/rateLimiter.ts
 * Multi-tier In-Memory Sliding Window Rate Limiter & Input Sanitizer
 * Dioptimalkan untuk deployment Google Cloud Run / AI Studio / Express.js
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
  firstRequestTime: number;
}

interface RateLimiterOptions {
  windowMs: number;          // Rentang waktu dalam milidetik (e.g. 60_000 untuk 1 menit)
  maxRequests: number;       // Maksimum permintaan yang diizinkan dalam windowMs
  endpointName: string;      // Nama endpoint untuk identifikasi logging/pesan
  customFallback?: (req: Request, retryAfterSeconds: number) => Record<string, any>;
}

/**
 * Ekstraksi IP Klien yang aman di belakang reverse proxy (Google Cloud Run / Load Balancer)
 *
 * PENTING (anti-spoofing): JANGAN mengambil entri pertama dari header
 * `X-Forwarded-For` secara manual. Klien bebas mengirim header XFF apa pun,
 * sehingga entri pertama bisa dipalsukan per-request untuk bypass rate limiter.
 *
 * `req.ip` dari Express menghormati konfigurasi `app.set('trust proxy', ...)`.
 * Pada Cloud Run (trust proxy = 1), Google Front End selalu menambahkan IP klien
 * asli tepat sebelum hop proxy-nya, sehingga Express mengambil hop klien yang
 * benar (entri kedua dari kanan) dan nilai XFF palsu milik klien diabaikan.
 */
export function getClientIp(req: Request): string {
  if (req.ip) return req.ip;
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Membaca env var sebagai integer positif dengan fallback nilai default.
 * Dipakai agar semua tier rate limit bisa dikonfigurasi via environment tanpa deploy ulang kode.
 */
export function parsePositiveIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (!raw) return defaultValue;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

/**
 * Factory untuk membuat Express Middleware Rate Limiter berbasis Sliding Window
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, endpointName, customFallback } = options;
  const ipStore = new Map<string, RateLimitRecord>();

  // Pembersihan memori berkala setiap 60 detik untuk mencegah memori membengkak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 60_000);

  // Jangan tahan proses node agar tidak mencegah graceful shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();

    let record = ipStore.get(ip);
    if (!record) {
      record = { timestamps: [now], firstRequestTime: now };
      ipStore.set(ip, record);
    } else {
      // Saring timestamp hanya dalam rentang sliding window
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    }

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentCount);
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    // Set standar RFC rate limit headers
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTimeSeconds);

    if (currentCount >= maxRequests) {
      const retryAfterSeconds = Math.max(1, resetTimeSeconds);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429);

      if (customFallback) {
        return res.json(customFallback(req, retryAfterSeconds));
      }

      return res.json({
        error: 'Too Many Requests',
        message: `Batas kuota ${endpointName} terlampaui. Silakan coba lagi dalam ${retryAfterSeconds} detik.`,
        rateLimited: true,
        retryAfterSeconds,
      });
    }

    // Catat timestamp permintaan saat ini
    record.timestamps.push(now);
    next();
  };
}

/**
 * Circuit breaker biaya tingkat INSTANCE (bukan per-IP).
 *
 * Rate limiter per-IP tidak melindungi tagihan jika:
 *  - agresor memakai banyak IP (rotasi IP / botnet), atau
 *  - Cloud Run scale-out ke banyak instance (kuota per-IP terbagi per instance).
 *
 * Guard ini memasang PLAFON KERAS total permintaan AI per instance dalam satu
 * window berjalan (sliding window), apa pun IP-nya. Ini batas atas mutlak untuk
 * tagihan Gemini API per instance. Catatan: in-memory, jadi reset saat instance
 * di-restart/deploy — plafon keseluruhan service tetap dijamin karena tiap
 * instance punya plafon sendiri.
 */
export function createInstanceBudgetGuard(options: {
  windowMs: number;            // e.g. 60 * 60 * 1000 untuk budget per jam
  maxRequests: number;         // Total permintaan maksimum (semua IP digabung) per instance
  endpointName: string;
  onExceeded?: (info: { totalRequests: number; windowMs: number }) => void;
  customFallback?: (req: Request, retryAfterSeconds: number) => Record<string, any>;
}) {
  const { windowMs, maxRequests, endpointName, onExceeded, customFallback } = options;
  let timestamps: number[] = [];

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    timestamps = timestamps.filter((ts) => now - ts < windowMs);
  }, 60_000);
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    timestamps = timestamps.filter((ts) => now - ts < windowMs);

    const remaining = Math.max(0, maxRequests - timestamps.length);
    const oldestTimestamp = timestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetTimeSeconds);

    if (timestamps.length >= maxRequests) {
      const retryAfterSeconds = Math.max(1, resetTimeSeconds);
      if (onExceeded) {
        onExceeded({ totalRequests: timestamps.length, windowMs });
      }
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429);

      if (customFallback) {
        return res.json(customFallback(req, retryAfterSeconds));
      }

      return res.json({
        error: 'Too Many Requests',
        message: `Kuota ${endpointName} untuk saat ini telah habis. Silakan coba lagi dalam ${retryAfterSeconds} detik.`,
        rateLimited: true,
        retryAfterSeconds,
        fallback: true,
      });
    }

    timestamps.push(now);
    next();
  };
}

/**
 * Concurrency guard: membatasi jumlah permintaan AI yang sedang diproses
 * (in-flight) secara bersamaan per instance. Mencegah stampede ke Gemini API
 * saat banyak klien menembak bersamaan, dan melindungi latensi/kuota RPM.
 * Slot dilepas saat response selesai ('finish') atau koneksi putus ('close').
 */
export function createConcurrencyGuard(options: {
  maxConcurrent: number;
  endpointName: string;
}) {
  const { maxConcurrent, endpointName } = options;
  let inFlight = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    if (inFlight >= maxConcurrent) {
      const retryAfterSeconds = 5;
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `${endpointName} sedang sibuk melayani banyak pengasuh. Coba lagi beberapa saat (tunggu ${retryAfterSeconds} detik).`,
        rateLimited: true,
        retryAfterSeconds,
        fallback: true,
      });
    }

    inFlight++;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      inFlight = Math.max(0, inFlight - 1);
    };
    res.on('finish', release);
    res.on('close', release);

    next();
  };
}

/**
 * Sanitasi & pembatasan panjang teks input string
 */
export function sanitizeInputString(input: unknown, maxLength: number, defaultValue: string = ''): string {
  if (typeof input !== 'string') return defaultValue;
  // Potong spasi berlebih dan batasi panjang maksimum
  const trimmed = input.trim();
  if (trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}
