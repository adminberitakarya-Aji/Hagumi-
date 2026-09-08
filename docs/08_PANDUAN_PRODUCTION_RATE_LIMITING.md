# 08 — Panduan Rate Limiting & Proteksi Biaya Gemini API (Production)

> Endpoint AI di app ini (`/api/kitsune/chat`, `/api/kitsune/ema-blessing`, `/api/kitsune/omikuji`)
> bersifat publik dan setiap request yang lolos memicu panggilan berbayar ke Gemini API.
> Dokumen ini menjelaskan lapisan proteksi yang sudah terpasang di kode, konfigurasinya,
> dan langkah hardening tambahan di sisi Google Cloud.

## 1. Lapisan proteksi di kode (sudah terimplementasi)

Semua guard hidup di `src/server/rateLimiter.ts` dan dipasang di `server.ts` dengan urutan
**murah → mahal** pada prefix `/api/kitsune`:

| # | Lapisan | Default | Env Override | Melindungi dari |
|---|---------|---------|--------------|-----------------|
| 1 | **Concurrency guard** | 10 request in-flight / instance | `AI_MAX_CONCURRENT_REQUESTS` | Stampede request bersamaan, kuota RPM Gemini |
| 2 | **Budget guard (circuit breaker biaya)** | 500 total request AI / jam / instance, semua IP digabung | `AI_HOURLY_INSTANCE_BUDGET` | Rotasi IP, botnet, pembagian kuota saat scale-out |
| 3 | **Rate limiter global per-IP** | 45 request / 15 menit / IP | `AI_RATE_GLOBAL_MAX` | Spam dari satu klien |
| 4 | **Rate limiter per-endpoint per-IP** | chat: 15/menit · ema: 8/5 menit · omikuji: 10/10 menit | `AI_RATE_CHAT_MAX`, `AI_RATE_EMA_MAX`, `AI_RATE_OMIKUJI_MAX` | Spam endpoint spesifik |

Semua respons limit memakai HTTP **429** + header standar `Retry-After`, `RateLimit-Limit`,
`RateLimit-Remaining`, `RateLimit-Reset`, dengan body JSON in-character (`fallback: true`,
`rateLimited: true`, `retryAfterSeconds`) yang sudah ditangani frontend sebagai fallback offline.

### Anti-spoofing `X-Forwarded-For`

`getClientIp()` **tidak** mengambil entri pertama XFF secara manual (entri itu bisa dipalsukan
klien per-request untuk bypass per-IP limiter). Kode memakai `req.ip` Express yang menghormati
`app.set('trust proxy', 1)`:

- Di **Cloud Run**, Google Front End selalu menambahkan IP klien asli tepat sebelum hop
  proxy-nya, jadi `req.ip` = IP klien sebenarnya, dan XFF palsu diabaikan.
- `trust proxy = 1` **hanya benar jika ada tepat satu lapis proxy** (kasus Cloud Run langsung).
  Jika menambahkan proxy sendiri (mis. Cloud Load Balancing + Cloud Armor), sesuaikan nilainya.

### Keterbatasan in-memory (jujur & penting)

Budget guard dan rate limiter menyimpan state di memori proses:

- **Restart/deploy me-reset counter.** Plafon biaya tetap terjaga karena tiap instance punya
  plafon sendiri — total worst-case = `plafon × jumlah instance`. Batasi juga `--max-instances`
  di Cloud Run (lihat bagian 2).
- **State tidak dibagi antar instance.** Untuk plafon global yang benar-benar service-wide,
  gunakan distributed limiter (Cloud Memorystore/Redis) — sisipkan store Redis ke
  `createRateLimiter`/`createInstanceBudgetGuard` tanpa mengubah middleware-nya.

## 2. Hardening di sisi Google Cloud (di luar kode)

1. **`--max-instances` rendah** di Cloud Run (mis. 3–5). Karena plafon biaya per instance,
   ini juga membatasi total worst-case tagihan per jam.
2. **Budget & billing alerts** (Billing → Budgets): alert saat biaya API mencapai 50/90/100%.
3. **Quota Gemini API**: turunkan kuota RPM/RPD `Generative Language API` di Cloud Console
   sesuai kebutuhan riil — ini plafon paling otoritatif dari sisi Google.
4. **Cloud Armor** (jika pakai Load Balancer di depan Cloud Run): aturan rate-based ban per IP,
   memblokir sebelum request menyentuh instance.
5. **Firebase App Check / autentikasi**: lapisan terkuat — hanya klien asli (app terverifikasi)
   yang bisa menembak endpoint, membuat rate limit per-IP jauh lebih efektif.
6. **Monitoring**: budget guard mencatat `console.warn("[AI BUDGET] ...")` saat plafon
   terlampaui — buat log-based alert/metrik di Cloud Logging untuk notifikasi.

## 3. Cara menguji

```bash
# Jalankan dengan plafon kecil untuk verifikasi circuit breaker:
AI_HOURLY_INSTANCE_BUDGET=3 npm run dev

# Tembak endpoint (fallback fortune dikembalikan karena tanpa API key pun request tetap terhitung):
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:3000/api/kitsune/omikuji \
    -H "Content-Type: application/json" -d '{}'
done
# Harapan: 200 200 200 429 429
```

Verifikasi header limit:

```bash
curl -s -D - -o /dev/null -X POST http://localhost:3000/api/kitsune/chat \
  -H "Content-Type: application/json" -d '{"message":"kon"}' | grep -i ratelimit
```
