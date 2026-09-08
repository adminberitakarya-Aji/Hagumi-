# 🦊 HAGUMI (育み): Virtual Pet Kitsune

Game *virtual pet* bertema mitologi rubah Jepang (Kitsune): merawat, memberi makan, dan mengevolusikan
roh rubah dari telur permata Hōju hingga wujud Dewasa bercabang (Tenko / Zenko / Yako / Nogitsune)
di santuari tatami tradisional Jepang — lengkap dengan mini-game festival Matsuri, petualangan Odekake,
kuil dengan pendamping AI (Gemini), siklus 4 musim, serta audio & haptic yang disintesis prosedural.

---

## ✨ Fitur Utama

- **Core loop pengasuhan**: 6 stat vital dengan decay loop, kotoran, penyakit, tidur 15 menit, dan *Care Score*.
- **Evolusi bercabang**: Telur → Kitsunebi → Kogitsune → Wakahitsune → 4 wujud Dewasa sesuai kualitas pengasuhan.
- **Mini-game Matsuri**: Taiko Rhythm, Kingyo-sukui, Wanage, Kitsune Dash, plus Hanabi Maker.
- **Kuil Inari ber-AI**: chat pendamping, Omikuji, dan pohon doa Ema (Gemini API dengan fallback lokal + rate limiting berlapis).
- **Retensi & koleksi**: bonding Kizuna 5 level, perjalanan Odekake, album kenangan Ukiyo-e, Paspor Ziarah, 4 musim dinamis.
- **Imersif**: render Canvas prosedural, musik Web Audio API (tanpa aset audio besar), parallax 2.5D (gyroscope/kursor), haptic feedback.

## 🧰 Tech Stack

- **Frontend**: React 19, TypeScript (strict mode), Vite 6, Tailwind CSS 4, Motion, lucide-react
- **Backend**: Express.js + `@google/genai` (Gemini) dengan rate limiter & budget circuit breaker
- **Render**: HTML5 Canvas prosedural & Web Audio API

## 🚀 Menjalankan Secara Lokal

**Prasyarat**: Node.js (disarankan 20+ dan npm — project ini distandardkan ke **npm**, lihat bagian
[Paket Manager](#-paket-manager)).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi `GEMINI_API_KEY` dengan API key Gemini kamu
   (fitur AI di Kuil Inari). Game tetap bisa dimainkan tanpa key — semua endpoint AI punya fallback lokal.

3. Jalankan server dev (Vite middleware + Express dalam satu proses):

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## 📦 Build & Produksi

```bash
npm run build   # vite build + bundle server ke dist/
npm run start   # menyajikan dist/ + API AI lewat Express (Cloud Run ready)
```

## 🧪 Test

```bash
npm run test        # jalankan seluruh unit test sekali (Vitest)
npm run test:watch  # mode watch saat pengembangan
```

Cakupan: formula gameplay (`gameConfig.ts`), schema & migrasi save
(`petSaveSchema.ts`), dan decay loop (`decayLoop.ts`). Saat mengubah
mekanika gameplay, jalankan test ini dan perbarui
[`docs/02_GAMEPLAY_MECHANICS.md`](docs/02_GAMEPLAY_MECHANICS.md) di commit yang sama.

## 🔐 Variabel Lingkungan (lihat `.env.example`)

| Variabel | Wajib? | Keterangan |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Untuk fitur AI | Kunci API Gemini untuk chat/Omikuji/Ema blessing. |
| `APP_URL` | Tidak | URL hosting (Cloud Run), untuk link referensi-diri. |
| `AI_HOURLY_INSTANCE_BUDGET`, `AI_MAX_CONCURRENT_REQUESTS`, `AI_RATE_*` | Tidak | Plafon biaya & rate limiting AI — default yang wajar sudah diset. |

## 📥 Paket Manager

Project ini standard menggunakan **npm** dengan lockfile `package-lock.json`. Jangan menambahkan
lockfile lain (`bun.lock`, `pnpm-lock.yaml`, `yarn.lock`) ke repository — satu lockfile saja agar
resolusi dependency konsisten untuk semua kontributor.

## 📚 Dokumentasi

- [`docs/`](docs/README.md) — indeks dokumentasi (arsitektur, mekanika, panduan kontribusi, roadmap)
- [`docs/02_GAMEPLAY_MECHANICS.md`](docs/02_GAMEPLAY_MECHANICS.md) — mekanika gameplay (Revisi 2, ditulis dari kode aktual)
- [`ROADMAP.md`](ROADMAP.md) — status milestone & rencana pengembangan
- [`audit.md`](audit.md) — laporan audit kualitas & roadmap remediasi

