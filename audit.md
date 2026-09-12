# 🔍 LAPORAN AUDIT MENYELURUH — HAGUMI: Virtual Pet Kitsune

> **Tanggal Audit**: 8 September 2026
> **Commit**: `f2875ba` (branch `master`)
> **Metode**: Audit read-only terhadap seluruh folder & file (root, `docs/`, `src/` — 60+ file TS/TSX, `server.ts`, `dist/`, konfigurasi build), verifikasi `tsc --noEmit`, dan penelusuran git history. **Tidak ada file source code yang diubah.**
> **Revisi 1**: Klaim "folder `dist/` ikut ter-commit" DITARIK (terbukti salah via `git ls-files` — `dist/` tidak ter-track); rasio decay dikoreksi dari ±6× menjadi **±9,6×**; formula EXP di `docs/02` dikonfirmasi cocok persis dengan `ROADMAP.md` — artinya `docs/02` adalah dokumen basi versi lama, bukan drift dua arah. Detail di bagian 6 (Catatan Revisi).
> **Revisi 2**: Prioritas #1 selesai — bug `useEffect`/`tick` di `KitsuneCanvas.tsx` diperbaiki (RAF loop mount-once + refs). Prioritas #2 selesai — `docs/02_GAMEPLAY_MECHANICS.md` ditulis ulang penuh dari kode aktual (Revisi 2 dokumen), plus 2 klaim usang kecil di `docs/04` & `docs/05` dan deskripsi indeks `docs/README.md` ikut dikoreksi.
> **Revisi 3**: Prioritas #3 selesai — `package.json` dibersihkan (`name: "hagumi"`, `version: "0.1.0"`, + description); README ditulis ulang penuh dari boilerplate AI Studio; `bun.lock` dihapus, standardisasi **npm** dengan `package-lock.json` (diverifikasi: tidak ada referensi bun di repo).
> **Revisi 4**: Audit lanjutan independen (10 September 2026) menemukan 3 temuan baru yang TIDAK tercakup di laporan ini, dan seluruhnya telah diremediasi: **(1) Bug hadiah Prolog lenyap** — `handleClaimBlessingReward`/`handleSaveEmaPrayer` di `App.tsx` menjadi no-op saat `pet` masih `null` (pemain baru yang mengklaim reward sebelum penetasan telur kehilangan bonus koin Omamori & careScore Ema diam-diam); diperbaiki dengan buffer `pendingPrologueRewards` + `useEffect` flush otomatis saat pet tersedia. **(2) Aset mati ±2,4 MB** — `bedroom_futon_day_1788726680718.jpg`, `onsen_bath_day_1788726650268.jpg`, `onsen_bath_night_1788726665859.jpg` tidak di-import komponen mana pun; dihapus. **(3) Aset gambar tidak teroptimasi** — 15,44 MB JPG (700 KB–1,1 MB/file) dikonversi ke WebP (max 1920px, quality 80) → **2,15 MB (−86%)**; bundle `dist/assets` 14,2 MB → 3,18 MB; ditambah script reusable `scripts/optimize-images.mjs` (`npm run optimize:images`) + `public/og_image.jpg` (1200×630, 154 KB) untuk meta tag `og:image`/`twitter:image`. Diverifikasi: `tsc --noEmit` 0 error, 79/79 test lulus, build sukses. Detail di bagian 5 (Temuan Audit Lanjutan).
> **Revisi 5**: Temuan audit lanjutan #4 (bundle JS 867 KB + CSS 218 KB, 19 modal di-bundle statis lewat `ModalLayer.tsx`) selesai — 19 modal dikonversi ke `React.lazy` (1 chunk per modal) dengan gating **mount-on-first-open** (`everOpenedModal`) + **prefetch saat idle** (`requestIdleCallback`) agar pattern render `isOpen` tidak mem-fetch semua chunk sekaligus; 4 layar kondisional level-App (Torii Prolog, Altar Telur, EvolutionModal, OfflineReturnModal) ikut lazy dengan fallback boot santuari; import mati `SanctuaryMenuModal` di `TatamiRoom.tsx` dihapus. Hasil: **bundle utama 867,8 → 542,0 KB (−37,5%; gzip 236,7 → 160,9 KB)**, ±40 chunk lazy on-demand. Audit CSS: 218 KB (gzip 23,6 KB) terbukti utility yang benar-benar dipakai (file markdown hanya memuat 1 baris token mirip-class — bukan penyumbang); ditambahkan guard `@source not` untuk `docs/`, `audit.md`, `ROADMAP.md`, `DOKUMENTASI_GAME.md`, `scripts/` di `index.css` sebagai preventif. Diverifikasi: `tsc --noEmit` 0 error, 79/79 test lulus, build sukses. Detail di bagian 5 (item #4).

> **Revisi 6**: Batch aksesibilitas 3 tahap (1: aria dinamis + live region + jalur keyboard; 2: Mode "Teks Besar" + caption intro Sensu; 3: audit `title=`-only di 19 modal + `prefers-reduced-motion` penuh untuk partikel musim) **SELESAI** — diverifikasi `tsc --noEmit` 0 error, 105/105 test, build produksi sukses; cakupan `aria-*`/`role=` **17 → 118**, `aria-live` 1 → 3; di-commit `46c9809` dan di-push ke `origin/master`. **Temuan #1 (aksesibilitas) dinyatakan LUNAS** dan dikeluarkan dari daftar kerja. Prioritas kerja berikutnya disusun ulang berbasis verifikasi ulang seluruh temuan terhadap kode aktual → **bagian 7 (P1–P8, effort-to-impact)**. Ditemukan doc drift baru: `ROADMAP.md` M4 mengklaim "Hadiah Kehadiran Harian ✅" padahal tidak ada kodenya (detail §7.1 F4). Item Long-Term "Aktivitas Discipline" ikut ditandai selesai (sudah direalisasi commit `5f318aa`).

---

## Ringkasan Eksekutif

| Item | Hasil |
|---|---|
| Stack | React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS 4 + Express + Gemini API |
| Skala kode | ±19.500 baris TS/TSX di `src/`, 60+ file, 30+ komponen modal/scene |
| Status `tsc --noEmit` | ✅ Bersih, 0 error (strict mode aktif) |
| Unit test | ✅ 105/105 lulus (Vitest — 5 file formula gameplay murni) |
| Cakupan Aksesibilitas | ✅ **118** atribut `aria-*`/`role=` + 3 `aria-live` (Revisi 6; sebelumnya 17 / 1) |
| Skor UI/UX | **8.5 / 10** |
| Skor Alur / Flow | **8 / 10** |
| **Tier Project** | **B+ — "Advanced Indie Prototype / Vertical Slice berkualitas Shippable"** |
| Skor Keseluruhan | **≈ 8 / 10** |

**Ringkasan satu kalimat**: Ini adalah *portfolio-grade virtual pet* yang berada di puncak tier indie prototype — estetika dan fiturnya setara produk komersial kecil, tetapi untuk naik ke **Tier A (siap rilis)** yang paling menentukan adalah tiga hal: (1) unit test untuk formula gameplay, (2) PWA + cloud save, dan (3) perbaikan aksesibilitas — disusul pembersihan hygiene repo yang biayanya rendah tapi dampaknya besar.

---

## 1️⃣ AUDIT TEKNIS & ARSITEKTUR

### 1.1 Profil Project

| Aspek | Temuan |
|---|---|
| Frontend | React 19, TypeScript strict, Vite 6, Tailwind CSS 4, Motion, lucide-react |
| Backend | Express server terintegrasi Vite middleware (`server.ts`), 3 endpoint AI (chat, ema-blessing, omikuji) via `@google/genai` |
| Render | HTML5 Canvas prosedural (tanpa aset sprite), gambar per-layer di `src/canvas/` (drawFox, drawTails, drawKitsunebi, dll.) |
| Persistensi | localStorage dengan schema versioning & migrasi (`src/utils/petSaveSchema.ts`) |
| Build | `vite build` + esbuild untuk server; `npm run lint` = `tsc --noEmit` |

### 1.2 ✅ Kekuatan (di atas rata-rata project sejenis)

1. **Kualitas engineering backend sangat matang** — rate limiter sliding-window berlapis (per-IP + per-endpoint), budget circuit breaker per-instance (500 req/jam), concurrency guard, dan anti-spoofing `X-Forwarded-For` dengan komentar penjelasan yang akurat (`src/server/rateLimiter.ts`). Level production-minded yang jarang ada di project indie.
2. **Save system paling baik di kelasnya** — schema versioning + migrasi, save korup di-backup (tidak ditimpa diam-diam), fitur backup/restore manual via JSON (`BackupRestoreModal.tsx`).
3. **Audio engine 2.493 baris** — synthesizer Web Audio API (Koto, Taiko, Suzu, Shakuhachi) tanpa file audio = waktu load cepat.
4. **Refactor berdisiplin** — git history menunjukkan ekstraksi `useAmbient`, `useAudioHaptic`, `useTimers`; konsolidasi 19 boolean modal → satu state `activeModal`; pemecahan canvas per-layer ke `src/canvas/`.
5. **Desain "cozy" konsisten** — tidak ada kematian pet, offline decay punya floor (min 10–15), cap 24 jam. Filosofi wabi-sabi diterapkan sungguh-sungguh, bukan sekadar klaim dokumen.

### 1.3 ⚠️ Kelemahan & Masalah yang Ditemukan

| # | Masalah | Detail | Severity |
|---|---|---|---|
| 1 | **Tidak ada test sama sekali** | 0 unit test, 0 integration test, tidak ada test runner di `package.json`. Formula gameplay kompleks (EXP curve, care score, decay, evolusi) berisiko regresi tanpa terdeteksi. | 🔴 Tinggi |
| 2 | **Aksesibilitas: NOL** | Tidak ada satu pun atribut `aria-*`, `role=`, `prefers-reduced-motion`, skip-link, atau navigasi keyboard. Interaksi utama berupa canvas yang tidak terbaca screen reader. `index.html` `lang="en"` padahal konten Indonesia. | 🔴 Tinggi |
| 3 | **Dokumen basi (`docs/02`) dari versi desain lama** | Lihat rincian di bagian 1.4. | 🟠 Sedang |
| 4 | **`KitsuneCanvas.tsx` — RAF loop di-recreate** | `useEffect` bergantung pada `[pet, actionState, eggCrackCount]`; `pet` di-replace setiap 10 detik oleh decay loop di `useGameLoop.ts` dan setiap interaksi → seluruh render loop teardown/recreate, variabel `tick` (dideklarasikan di dalam effect) reset ke 0 → fase animasi kitsune "ter-reset" periodik (glitch halus + boros). **Fix yang disarankan**: pisahkan `pet` menjadi `petRef.current` (di-update tanpa memicu re-run effect), sisakan dependency array kosong atau hanya `[actionState, eggCrackCount]`. | 🟠 Sedang |
| 5 | **Kebersihan repo** | `package.json` masih `"name": "react-example"` v0.0.0; `README.md` masih boilerplate AI Studio; dua lockfile (`bun.lock` + `package-lock.json`) hidup berdampingan; tidak ada favicon; tidak ada `manifest.json`/Service Worker; tidak ada React Error Boundary. *(Catatan revisi 1: klaim awal "folder `dist/` ikut ter-commit" ditarik — verifikasi `git ls-files` membuktikan `dist/` tidak ter-track git.)* | 🟡 Rendah |
| 6 | **Fat files** | `TatamiRoom.tsx` 2.299 baris (fat component), `soundEngine.ts` 2.493 baris (monolitik). | 🟡 Rendah |
| 7 | **Prompt injection (kecil)** | Prompt AI disusun dari input user yang hanya dibatasi panjang (`sanitizeInputString`), tidak disanitasi konteksnya. Rate limiter in-memory tidak shared saat Cloud Run scale-out (komentar kode sudah jujur soal ini). | 🟡 Rendah |

### 1.4 Rincian Dokumentasi Basi (`docs/02` vs kode)

- `docs/02_GAMEPLAY_MECHANICS.md` menyebut **6 stat** termasuk *Spirit (霊力)* → `PetStats` di kode sama sekali tidak memiliki stat Spirit; yang ada hanya hunger, energy, cleanliness, happiness, discipline, health (dengan `discipline` statis di decay loop).
- Formula EXP: `docs/02` → `100 × 1.25^(L-1)`; sedangkan kode di `gameConfig.ts` (`floor(40 × L^1.35 + 60)`) **cocok persis dengan `ROADMAP.md`** — hanya ada dua versi, dan `docs/02` adalah satu-satunya yang menyimpang.
- Laju decay: `docs/02` → "±4,5 poin/jam"; kode (`useGameLoop.ts`) → 0,12/10 detik ≈ **43,2 poin/jam** (±9,6× lebih cepat dari dokumen).
- Diagram evolusi dokumen (linier Yako→Youko→Kiko→Kinko→Kyuubi berdasar level) vs kode (branching 4 wujud dewasa berdasarkan `careScore` & `discipline`).
- **Kesimpulan**: `docs/02` adalah peninggalan versi desain lama, bukan hasil drift dua arah. Kandidat solusi terbaik adalah mengarsipkannya atau menulis ulang dari kode aktual — bukan "menyamakan" kode ke dokumen.

---

## 2️⃣ PENILAIAN UI/UX — Skor: 8.5 / 10

### 2.1 ✅ Yang Sudah Sangat Bagus

- **Art direction terkuat sekelasnya**: palet warna tradisional Jepang yang benar (Shu-iro, Kurotsurubami, Moegi, Kikyou), tipografi Shippori Mincho + Zen Maru Gothic, transisi pintu Shoji (*swoosh-clack*), HUD berbentuk kipas **Sensu radial**, latar JPG day/night per ruangan. Identitas visual memorable dan tidak generik.
- **Diegetic UI**: interaksi lewat objek dunia (chabudai, kamidana, tansu, shishi-odoshi) alih-alih tombol menu datar — immersion bagus.
- **Idle Thought Bubbles** = fitur UX terbaik project ini: pet "meminta" secara visual (+food, +tidur, +mandi) dan bisa diklik untuk langsung membuka modal yang relevan. *Contextual guidance* yang elegan.
- **Preferensi pemain dihormati**: parallax 3 mode (dinamis/lembut/nonaktif) + izin gyroscope iOS eksplisit, haptic 4 preset, mute terpisah BGM/SFX, skip prologue.
- **Layout 1-screen (100dvh, no-scroll)** yang tepat untuk mobile.

### 2.2 🔧 Saran Perbaikan (prioritas)

1. **Aksesibilitas (paling mendesak)**: tambahkan `aria-label` untuk semua tombol ikon-emoji, `role="dialog"` + focus trap di modal, dukungan keyboard (Esc = tutup modal), `prefers-reduced-motion` untuk partikel musim & parallax, dan `lang="id"` di `index.html`.
2. **Toast 3 detik terlalu singkat** untuk teks panjang di mobile — naikkan ke 5 detik atau buat dismissible/tappable.
3. **Kontras & ukuran font**: banyak `text-xs` + `text-stone-400` di latar gelap — berisiko gagal WCAG AA (4.5:1). Audit dengan kontras checker.
4. **Onboarding fitur lanjutan**: prologue bagus, tapi fitur Odekake / Zen Garden / Shrine Pass tidak ada *first-time discoverability* (tooltip/kotak "Baru!"). Pertimbangkan badge notifikasi kecil di Sensu HUD.
5. **Menu terlalu padat**: 19 modal diakses dari HUD + menu — kelompokkan (Rawat / Bermain / Koleksi / Pengaturan) dengan submenu.
6. **Konfirmasi reset pet** harus punya modal konfirmasi eksplisit (progres berbulan-bulan bisa hilang sekali klik).

---

## 3️⃣ PENILAIAN ALUR / FLOW GAME — Skor: 8 / 10

### 3.1 Peta Alur Utama (sudah solid)

```
Torii Prologue (narasi + bel + Ema + reward)
  → Altar Telur (pilih 6 elemen → nama → cap Hanko → 3x ketuk menetas)
  → Tatami Room (core loop: beri makan / mandi / sapu / tidur / main)
      ├─ Decay loop 10 detik + poop + sakit + careScore
      ├─ Offline return (min. 3 menit) → modal bonus koin
      ├─ Evolution ceremony (branching: Zenko/Tenko/Yako/Nogitsune)
      └─ Long-term: Kizuna bonding, Odekake, Matsuri 4 mini-game,
          Kuil AI (chat/omikuji/ema), Memory Scroll, Paspor Ziarah, 4 musim
```

**Kekuatan**: funnel pemain baru jelas dan tidak menegangkan; decay loop memberi alasan kembali; evolusi bercabang memberi replay value; mini-game memberi break berbasis skill dari loop pasif.

### 3.2 🔧 Saran Perbaikan

1. **Pacing mid-late game**: EXP butuh jutaan di level tinggi, tapi reward aksi flat (+5 s/d +40 EXP). Tanpa multiplier, akan terasa grind mati. Tambahkan bonus EXP berbasis level/wujud atau sistem *daily quests*.
2. **Tidak ada endgame setelah Kyuubi 9-ekor** — setelah evolusi tertinggi, tidak ada tujuan baru (mis. reinkarnasi generasi dengan bonus permanen — diroadmap M7 tapi belum terlihat di kode).
3. **Discipline stat nyaris mati** — tidak berubah di decay loop dan hanya dipakai sebagai syarat evolusi. Beri aktivitas latihan/disiplin (mis. meditasi Zen memberi +discipline — sekarang hanya +happiness).
4. **Fitur AI terpisah dari offline-first** — game offline-first, tapi chat/omikuji mati tanpa jaringan. Fallback-nya sudah bagus; pastikan omikuji lokal selalu dipakai saat offline, bukan hanya saat error.
5. **Siklus tidur 15 menit real-time** tanpa opsi "tidur cepat" bisa membuat sesi main pendek terasa menggantung — pertimbangkan opsi tidur singkat 5 menit.
6. **Rekonsiliasi doc ↔ kode** (Spirit stat, formula EXP, laju decay) supaya pengembang baru tidak salah implement.

---

## 4️⃣ TIER PROJECT: **B+ — "Advanced Indie Prototype / Vertical Slice berkualitas Shippable"**

Dalam skala industri:

| Tier | Deskripsi | HAGUMI? |
|---|---|---|
| **A** (Studio / Produk Live) | Monetisasi, cloud save, analytics, QA, live-ops | ❌ Belum |
| **B+** (Indie Prototype Premium) | Fitur lengkap, kode rapi, pola production, tapi belum siap rilis publik (tanpa test, tanpa PWA/cloud save, aksesibilitas 0) | ✅ **Di sini** |
| B (Hobby Project Baik) | Core loop jalan, kode standar | Di atas tier ini |
| C (Demo / Tutorial) | — | ❌ Jauh di atas |

### 4.1 Penilaian Akhir per Dimensi

| Dimensi | Skor |
|---|---|
| Core gameplay loop & mechanics | 8.5/10 |
| Visual / art direction | 9/10 |
| Audio & haptics | 9/10 |
| Arsitektur & kualitas kode | 8/10 |
| UI/UX | 8.5/10 |
| Alur & retensi | 8/10 |
| Aksesibilitas | 3/10 |
| Engineering practice (testing, CI, hygiene) | 4/10 |
| **Keseluruhan** | **≈ 8/10** |

---

## 5️⃣ ROADMAP REMEDIASI YANG DISARANKAN

### Quick Wins (biaya rendah, dampak besar)
- [x] Ganti `name`/`version` di `package.json` (SELESAI: `hagumi@0.1.0` + description); README ditulis ulang penuh (boilerplate AI Studio diganti panduan install/run/build/env + dokumentasi).
- [x] Hapus satu lockfile (SELESAI: `bun.lock` dihapus, standard **npm** dengan `package-lock.json`; terverifikasi tidak ada referensi bun di repo).
- [x] Perbaiki `useEffect` dependency di `KitsuneCanvas.tsx` (SELESAI: RAF loop kini mount-once dengan `petRef`/`actionStateRef`/`eggCrackCountRef` yang di-sync via effect terpisah; `tick` animasi tidak pernah reset lagi).
- [x] Tambah `lang="id"` di `index.html` + favicon + meta `og:image` (SELESAI: `lang="id"`, `public/favicon.svg` torii vermilion + `theme-color`, `og:image`/`twitter:image` menunjuk aset torii yang ter-track di repo, `og:locale id_ID`).
- [x] Toast duration 5 detik / dismissible (SELESAI: 3000→5000 ms, klik untuk menutup, `aria-live`/`role="status"`, + fix timer lama yang bisa menutup toast baru prematur).
- [x] Tulis ulang `docs/02` dari kode aktual (SELESAI: ditulis ulang penuh — 7 bagian sesuai kode: stat vital tanpa Spirit, decay loop 10 detik, Care Score 5-stat, offline decay, EXP `floor(40 × L^1.35 + 60)` dengan tabel terverifikasi, evolusi bercabang Tenko/Zenko/Yako/Nogitsune, Kizuna 5 milestone).

### Mid-Term
- [x] Unit test (SELESAI: Vitest 5 ditambahkan, script `npm run test`/`test:watch`; **79 test lulus** di 3 file — `gameConfig.test.ts` (kurva EXP, multi-level-up, evolusi bercabang, Kizuna, sanity katalog), `petSaveSchema.test.ts` (roundtrip, migrasi v1→v2, tolak save korup/versi baru, sanitasi clamp), `decayLoop.test.ts` (tick decay terjaga/tidur, poop, sakit, Care Score, offline decay cap/floor). Logika decay diekstrak ke `src/utils/decayLoop.ts` (pure) agar testable — `useGameLoop.ts` 208→88 baris, perilaku tidak berubah).
- [x] Aksesibilitas (SELESAI): hook `useDialogA11y` + `DialogA11yWrapper` (focus trap Tab/Shift+Tab, Esc menutup, simpan & kembalikan fokus ke pemicu, fokus awal ke elemen interaktif pertama); semua 19 modal `TatamiRoom` + 4 modal `App` dibungkus `role="dialog" aria-modal aria-label` dengan label Indonesia per modal; aria-label untuk tombol ikon HUD (BGM, mute, parallax, gerbang, odekake, indikator fase waktu `role="img"`); `prefers-reduced-motion` via CSS global di `index.css` (menonaktifkan animasi/transisi Tailwind).
- [x] React Error Boundary + modal konfirmasi reset pet (SELESAI: `ErrorBoundary.tsx` membungkus `<App />` dengan fallback UI santuari — "Coba Lagi" remount aman karena progres ada di localStorage + "Muat Ulang"; `window.confirm` reset di `HankoAlbumModal` diganti dialog konfirmasi destruktif khusus di `TatamiRoom` yang menjelaskan konsekuensi permanen & menyarankan backup dulu, lengkap focus trap/Esc).
- [x] Pecah `TatamiRoom.tsx` & `soundEngine.ts` menjadi modul lebih kecil (SELESAI bertahap): **soundEngine 2493→2016 baris** — cluster SFX UI/Hanabi/Shoji/Sensu/Musim (14 method) diekstrak ke `src/utils/sound/uiSeasonSfx.ts` via prototype-mixin + declaration merging, API `soundEngine` identik bagi pemanggil, **verifikasi mekanis 415 baris ternormalisasi identik 1:1** (nol drift transkripsi); **TatamiRoom 2420→2296 baris** — `ModalKind`+`MODAL_LABELS` → `tatami/modalRegistry.ts`, dialog tidur → `tatami/SleepConfirmDialog.tsx`, dialog konfirmasi reset → `tatami/ResetConfirmDialog.tsx`. *Follow-up terdokumentasi*: pindahkan subsystem BGM ambient (`toggleAmbientBGM`–`playFurinChime`, ±445 baris) dengan pola mixin yang sama → **SELESAI**: `src/utils/sound/ambientBgm.ts` (±481 baris, 19 method BGM prosedural: drone musiman, sequencer Koto/Shakuhachi, skala tradisional per fase/musim, Furin; script salin verbatim + transformasi mekanis + verifikasi in-order) — **soundEngine 2016→1573 baris** (kumulatif 2493→1573, **−37%**). ~~serta pemecahan JSX HUD/dock/banner~~ → **Langkah 3 SELESAI**: blok 19 modal diekstrak ke `src/components/tatami/ModalLayer.tsx` (±410 baris, role="dialog" wrapper + semua props ter-tipe; `triggerShoji` diprop-kan karena SanctuaryMenuModal memakainya) — **TatamiRoom 2197→1598 baris** (kumulatif 2420→1598, −34%). *Sisa follow-up*: ④ `TatamiHeader`/`TatamiDock`/`StatusBanners` (±500 baris JSX) dan subsystem BGM ambient di soundEngine. ~~④ TatamiHeader/TatamiDock/StatusBanners~~ → **Langkah 4 SELESAI**: header HUD + meter vital → `tatami/TatamiHeader.tsx` (±470 baris), 4 banner status → `tatami/StatusBanners.tsx` (±130 baris), dock 8 tombol + footer → `tatami/TatamiDock.tsx` (±250 baris); slice JSX disalin verbatim via script + **verifikasi subsequence in-order otomatis** (404+96+208 baris, nol drift) — **TatamiRoom 1886→908 baris** (kumulatif 2420→908, **−62%**). ~~ekstraksi cluster handler Odekake ke hook~~ → **SELESAI**: `src/hooks/useOdekakeFlow.ts` (state `completedTripToCelebrate`, countdown, effect deteksi kepulangan, 4 handler depart/recall/claim/blocked; TatamiRoom 2296→2197 baris). ~~cluster aksi perawatan~~ → **SELESAI**: `src/hooks/useCareActions.ts` (11 handler: petting, feed, bath scene/finish, bedroom scene/wake, sleeping-blocked, confirm-sleep, sleep-button, clean-and-bath, toggle-sleep; TatamiRoom 2197→**1886 baris**). Verifikasi exit code diperbaiki (pola `cmd & echo %ERRORLEVEL%` ternyata menampilkan nilai basi — ditemukan & diperbaiki saat langkah ini).
- [ ] *Follow-up* aksesibilitas: aria-label untuk tombol tutup (X) di tiap modal (saat ini fokus awal otomatis ke tombol pertama sehingga tetap bisa dioperasikan keyboard), dan hormati `prefers-reduced-motion` di animasi Canvas (`KitsuneCanvas`/`SeasonParticles`) via `matchMedia`.

### Temuan Audit Lanjutan Independen (Revisi 4) — Remediasi Selesai
Audit lanjutan independen (10 September 2026, read-only dulu, lalu diremediasi dengan persetujuan pemilik) menemukan 3 masalah baru di luar tabel 1.3:

- [x] **Bug hadiah Prolog lenyap untuk pemain baru** (🔴 Tinggi — flow): di `App.tsx`, `handleClaimBlessingReward` & `handleSaveEmaPrayer` memakai `setPet((prev) => { if (!prev) return prev; ... })`, padahal Gerbang Prolog ditampilkan saat `!pet || pet.stage === 'egg'` — untuk pemain baru `prev` = `null` sehingga bonus koin Omamori & careScore +5 Ema **lenyap diam-diam**. SELESAI: reward kini masuk buffer `pendingPrologueRewards`, dan `useEffect` flush otomatis ke pet segera setelah pet tersedia (baik setelah penetasan telur pemain baru, maupun langsung saat Prolog dibuka ulang oleh pet lama); buffer di-nolkan setelah flush agar tidak double-count. Perubahan terisolasi di `App.tsx`.
- [x] **Aset mati ±2,4 MB** (🟠 Sedang — repo hygiene): 3 file JPG tidak di-import komponen mana pun (terverifikasi via grep seluruh `src/`, `index.html`, `metadata.json`; juga tidak masuk bundle `dist`): `bedroom_futon_day_1788726680718.jpg` (752 KB), `onsen_bath_day_1788726650268.jpg` (869 KB), `onsen_bath_night_1788726665859.jpg` (805 KB). SELESAI: ketiganya dihapus.
- [x] **Aset gambar berat & tidak teroptimasi** (🟠 Sedang — performa mobile): 15,44 MB JPG di `src/assets/images` (700 KB–1,1 MB per background, format JPG penuh, tanpa WebP) → bundle `dist/assets` 14,2 MB. SELESAI: seluruh 15 gambar terpakai dikonversi ke **WebP** (max lebar 1920px, quality 80) → **2,15 MB (−86%)**; semua import di 6 komponen (`TatamiSanctuaryBackground`, `ToriiPrologueGateway`, `BentoFoodModal`, `FutonBedroomModal`, `OnsenBathModal`, `TanukiShopModal`) di-update ke `.webp`; bundle `dist/assets` turun **14,2 MB → 3,18 MB**. Ditambah infrastruktur: script reusable `scripts/optimize-images.mjs` via `npm run optimize:images` (devDependency `sharp`, flag `--clean` untuk hapus sumber) serta `public/og_image.jpg` (1200×630, 154 KB) khusus meta tag — `og:image`/`twitter:image` di `index.html` kini menunjuk ke file ini (sebelumnya menunjuk JPG `src/assets` yang terhapus; social crawler lebih aman dengan JPG daripada WebP). Diverifikasi: `tsc --noEmit` 0 error, 79/79 unit test lulus, `npm run build` sukses.

- [x] **Bundle JS monolitik: 867 KB tanpa code-splitting** (🟠 Sedang — performa load): 19 modal di-bundle statis semua lewat `ModalLayer.tsx` + CSS 218 KB. SELESAI: 19 modal → `React.lazy` (1 chunk per modal) dengan gating **mount-on-first-open** (`everOpenedModal`) — karena layer me-render modal terus-menerus dengan pattern `isOpen`, lazy polos akan mem-fetch seluruh chunk saat mount; gating memastikan modal baru hanya di-mount saat pertama dibuka lalu tetap ter-mount (perilaku identik dengan implementasi lama), dan **prefetch saat idle** (`requestIdleCallback`, fallback `setTimeout`) memuat semua chunk di background agar open pertama tanpa jeda. 4 layar kondisional level-App di `App.tsx` (`ToriiPrologueGateway`, `EggAltarModal`, `EvolutionModal`, `OfflineReturnModal`) ikut di-lazy dengan `SanctuaryBootFallback` sebagai fallback. Import mati `SanctuaryMenuModal` di `TatamiRoom.tsx` (sisa refactor) ikut dihapus agar chunk-nya benar-benar terpisah. Hasil: **bundle utama 867,8 → 542,0 KB (−37,5%); gzip 236,7 → 160,9 KB (−32%)**; chunk modal terbesar kini on-demand (ShrineModal 37,3 KB, OdekakeModal 30,1 KB, MatsuriGamesModal 25,6 KB). **Audit CSS**: 218 KB (gzip 23,6 KB) adalah utility yang benar-benar dipakai 60+ komponen (banyak arbitrary values); markdown bukan penyumbang — guard `@source not` ditambahkan di `src/index.css` untuk preventif. Fallback Suspense overlay spinner torii dengan `role="status"` + `aria-label` (menghormati `prefers-reduced-motion` via CSS global).

### Long-Term
- [ ] PWA: `manifest.json` + Service Worker (sudah di roadmap).
- [ ] Cloud save & sinkronisasi lintas perangkat (sudah di roadmap).
- [ ] Sistem daily quest / endgame reinkarnasi (pacing late-game).
- [x] Aktivitas untuk menghidupkan stat Discipline. **(Revisi 6: SELESAI — commit `5f318aa`: meditasi Zen +15/dengan cooldown harian, Wanage +8/+4, Jimat Omamori +10, penurun lembut ber-floor 10; ditest 82 → 105 lulus.)**

---

---

## 6️⃣ CATATAN REVISI 1 (Hasil Verifikasi Mandiri)

Laporan ini telah diverifikasi secara mandiri terhadap repo (bukan hanya membaca ulang laporan). Hasilnya:

### Dikonfirmasi BENAR
- ✅ Tidak ada test sama sekali (`find` untuk `*.test.*`/`*.spec.*` kosong; tidak ada script test di `package.json`).
- ✅ `package.json` masih `"name": "react-example"`, `"version": "0.0.0"`.
- ✅ `README.md` masih boilerplate AI Studio.
- ✅ Dua lockfile (`bun.lock` + `package-lock.json`) hidup berdampingan — inkonsisten, pilih satu package manager.
- ✅ `index.html` `lang="en"` padahal konten berbahasa Indonesia.
- ✅ 0 atribut `aria-*` di seluruh `src/` (diverifikasi via grep).
- ✅ **Bug `useEffect` di `KitsuneCanvas.tsx` nyata dan serius**: dependency array `[pet, actionState, eggCrackCount]`; `pet` di-replace tiap 10 detik oleh decay loop di `useGameLoop.ts`; `tick` dideklarasikan di dalam effect sehingga reset ke 0 tiap kali. Ini teardown/rebuild animation loop tiap 10 detik selagi bermain — glitch halus tapi nyata. **Temuan paling actionable dari seluruh laporan**; fix-nya jelas: `petRef` yang di-sync tanpa memicu re-run effect.
- ✅ Doc drift nyata, bahkan **lebih parah dari laporan awal**: stat "Spirit (霊力)" sama sekali tidak ada di `PetStats`; formula EXP `docs/02` (`100 × 1.25^(L-1)`) beda dari kode, dan formula kode (`gameConfig.ts`: `floor(40 × L^1.35 + 60)`) **cocok persis dengan `ROADMAP.md`** → `docs/02` adalah dokumen basi peninggalan versi lama, bukan drift kecil.

### Dikoreksi (klaim awal meleset)
- ❌ → ✅ **"Folder `dist/` ikut ter-commit" DITARIK.** Verifikasi `git ls-files | grep "^dist/"` hasilnya kosong — `dist/` tidak masuk git. Kesalahan metodologi: membedakan folder build di *filesystem* dengan *git index*.
- 🔧 **Rasio decay dikoreksi**: kode = 0,12/10 detik = 43,2 poin/jam vs dokumen "4,5 poin/jam" → **±9,6× lebih cepat** (laporan awal menulis ±6× — arah benar, angka meleset).

### Catatan tentang Framing Skor
Angka seperti "Skor 8.5/10", "Tier B+", dan tabel skor per-dimensi adalah **framing subjektif yang tidak dapat diverifikasi** — anggap sebagai opini terbungkus angka, bukan fakta. Fokuskan prioritas pada temuan konkret yang dapat diverifikasi, bukan skornya.

### Prioritas yang Disepakati (effort-to-impact)
1. **Fix bug `useEffect`/`tick` di `KitsuneCanvas.tsx`** — kecil tapi berdampak langsung ke kualitas animasi.
2. **Hapus/tulis ulang `docs/02` yang basi** supaya tidak menyesatkan kontributor lain.
3. **Bersihkan `package.json` name/version + README + pilih satu lockfile.**

Testing dan aksesibilitas adalah investasi besar — realistis untuk backlog, bukan quick fix, kecuali memang target rilis publik dalam waktu dekat.

---

*Laporan asli murni bersifat audit read-only. Pengecualian Revisi 4: perbaikan temuan #1–#3 (lihat bagian 5, "Temuan Audit Lanjutan") menyentuh codebase dengan persetujuan pemilik — perubahan terdokumentasi di `git status`/commit terkait.*

---

## 7️⃣ ROADMAP PRIORITAS LANJUTAN — P1–P8 (Effort-to-Impact)

> **Revisi 6 — 12 September 2026 (commit `46c9809`)**. Prioritas disusun ulang setelah verifikasi
> ulang seluruh temuan terhadap kode aktual. Item aksesibilitas (temuan #1) dinyatakan **LUNAS**
> dan dikeluarkan dari daftar kerja. Bagian ini menjadi acuan kerja berikutnya, menggantikan tabel
> prioritas lama di bagian 5. Checkbox ⬜/✅ dipakai untuk melacak remediasi dengan pola yang sama.

### 7.1 Status Verifikasi Temuan (klaim vs fakta kode, 12 Sep 2026)

**Temuan teknis lama:**

| # | Temuan | Status di kode (terverifikasi) | Prioritas |
|---|---|---|---|
| 1 | Aksesibilitas tipis (17 `aria-*` / 1 `aria-live`) | ✅ **LUNAS (Revisi 6)** — 118 atribut (×7), 3 `aria-live`, canvas `role="img"` + `aria-label` dinamis, bubble pikiran & elus keyboard-accessible (tombol overlay + pad "Elus"), `role="meter"` 6 stat vital, 19 modal + header/dock/Sensu bebas `title=`-only, banner status ber-`role`, partikel musim hormat `prefers-reduced-motion`, Mode Teks Besar global | — |
| 2 | Belum PWA / installable | ✅ Konfirmasi: `public/manifest.json` & SW tidak ada; `index.html` tanpa `<link rel="manifest">` | **P1** |
| 3 | Single-device save | ✅ Konfirmasi: 100% `localStorage`; satu-satunya jembatan lintas perangkat = ekspor/impor JSON manual (`BackupRestoreModal`) | P7 |
| 4 | Tidak ada test UI/komponen | ✅ Konfirmasi: 0 `*.test.tsx`, `@testing-library` tidak terpasang; 105 test semuanya fungsi murni | **P3** |
| 5 | God component berat | ✅ Konfirmasi (ukuran terkini): `TatamiRoom` 36,1 KB, `ShrineModal` 44,2 KB, `MatsuriGamesModal` 43,1 KB | P3 (menempel) |
| 6 | Main chunk >500 KB | ✅ Konfirmasi: **548,65 KB** minified (naik ±7 KB dari batch a11y); `soundEngine.ts` (50 KB) masih eager | **P6** |
| 7 | i18n hardcoded ID/JA/EN | ✅ Konfirmasi: copy inline di 60+ file, tanpa lapisan i18n | P8 (defer) |

**Temuan alur/flow:**

| # | Temuan | Status verifikasi | Prioritas |
|---|---|---|---|
| F1 | Pemain baru langsung dihadapkan 19 tujuan modal pasca-penetasan | ✅ Benar — tidak ada quest/penunjuk terpandu pasca-penetasan (Prolog & Altar Telur berhenti sebelum momen ini) | **P2** |
| F2 | Konsekuensi abai tidak terasa (health floor 10, no-death) | ✅ Benar — Nogitsune ada sebagai cabang evolusi, tapi UI tidak menegaskan bahwa careScore menentukan takdir | P2 (menempel) |
| F3 | Tidak ada preview evolusi ("Pertimbangan Inari") | ✅ Benar — `determineNextEvolution` hanya dipakai sebagai trigger internal di `App.tsx` | P2 (menempel) |
| F4 | Daily quest & streak belum ada | ✅ Benar — kategori `'daily'` di `gameConfig.ts` hanyalah kategori album Memory Scroll, bukan quest. ⚠️ **DOC DRIFT BARU**: `ROADMAP.md` M4 mengklaim "Hadiah Kehadiran Harian ✅" padahal tidak ada kodenya — dokumen perlu dikoreksi (atau fitur diimplementasikan) | **P4** |
| F5 | Endgame tidak mengikat | ⚠️ Sebagian benar — reinkarnasi/`generation` **sudah ada** (schema save, `EggAltarModal`, `HankoAlbumModal`) tapi tidak terikat aktivitas harian | P5 |

### 7.2 Urutan Prioritas P1–P8

| Urutan | Item | Alasan effort-to-impact | Dependensi |
|---|---|---|---|
| ✅ **P1** | **PWA + ikon homescreen** — `manifest.json` + Service Worker (precache aset, offline shell) **(SELESAI — Revisi 6)**: `public/manifest.json` (standalone, tema `#1c1815`, ikon 192/512/maskable dari `favicon.svg` via `npm run generate:icons`/sharp); `public/sw.js` hand-rolled tanpa dependensi (navigasi network-first dengan fallback offline, aset statis cache-first + runtime caching, `/api/*` selalu jaringan, cleanup cache lama, skipWaiting); registrasi di `main.tsx` (hanya PROD); `index.html` + apple-touch-icon & meta iOS | Dampak retensi terbesar (install-to-homescreen, fondasi push pengingat); effort moderat; self-contained, tidak menyentuh schema save | — |
| ✅ **P2** | **Onboarding & transparansi evolusi** **(SELESAI — Revisi 6)**: (1) **Misi Pertama Pengasuh** — hook baru `useFirstQuest.ts` + `FirstQuestBanner.tsx`: panduan garis lurus 🍙 makan → 🛁 mandi → 🎏 mini-game dengan langkah berurutan (aktif berkedip `animate-pulse`, selanjutnya terkunci), progres di localStorage terikat `pet.id` **tanpa ubah schema save**, hadiah sekali (+20 Ryo & +15 EXP + confetti, hormat `disableForReducedMotion`); hanya tampil untuk pet muda (stage bayi, level < 3); bersifat memandu non-blocking — 19 modal tetap terbuka kapan saja; aksi terdeteksi via wrapper `handleFeedItemWithQuest`/`handleFinishBathWithQuest`/`handleCleanAndBathWithQuest` + `markDone` di `handleGameReward`. (2) **Pertimbangan Inari** — `InariConsiderationCard.tsx` (collapsible di TatamiRoom): preview DETERMINISTIK 4 cabang dewasa (sumber nilai baru `REMAJA_EVOLUTION_BRANCHES` + `STAGE_LEVEL_GOALS` di `gameConfig.ts`, cerminan `determineNextEvolution` — disinkronkan secara eksplisit), bar progres Kasih/Disiplin vs threshold, badge "KONDISI KINI" pada cabang prediksi, ringkasan takdir untuk dewasa/mistik. (3) **Konsekuensi naratif** — teks wabi-sabi: "tak ada kematian — wujud mengikuti caramu merawat" | Tiga item flow yang saling melengkapi; **UI-only tanpa perubahan schema save** — murah dan langsung terasa oleh pemain baru | — |
| ✅ **P3** | **React Testing Library + test komponen inti → split god component** **(SELESAI dengan catatan — Revisi 6)**: (1) **Infrastruktur**: `@testing-library/react@16` + `@testing-library/dom` + `jsdom@30`; `vitest.config.ts` khusus test (jsdom, plugin react, setupFiles; build produksi tetap `vite.config.ts`); `src/test/setup.ts` (RTL cleanup + guard localStorage untuk test yang me-stub). (2) **8 file test baru, +52 kasus (105 → 157 lulus, 13 file)**: `useFirstQuest` (visibilitas, persistensi, hadiah sekali, reset generasi), `FirstQuestBanner`, `InariConsiderationCard` (determinisme prediksi cabang), `StatusBanners` (role a11y), `TatamiDock` (blokir tidur, Toko tetap buka; audio/haptic di-mock Proxy), `SensuFanHUD`, + 2 guard anti-regresi (`modalRegistry`: wajib label per ModalKind; `evolutionBranches`: sinkron katalog vs `determineNextEvolution`). (3) **Split `MatsuriGamesModal` 43,1 → 9 KB**: 4 mini-game diekstrak ke `src/components/matsuri/` (`TaikoRhythmGame` 16,4 KB, `KingyoSukuiGame` 8,4 KB, `WanageGame` 6,7 KB, `KitsuneDashGame` 5,7 KB) via script sekali-pakai — **tanpa perubahan perilaku** (sub-komponen murni ber-prop `onReward`). *Catatan jujur*: **split `ShrineModal` (44 KB, satu komponen monolitik berisi AI chat/Omikuji/Ema) DITUNDA** — refactor-nya mengubah struktur dalam komponen yang memanggil Gemini API; layak dilakukan setelah `ShrineModal` punya test komponen sendiri (backlog P4-era) | Test dilakukan SEBELUM refactor agar pemecahan god component dilindungi regresi | — |
| ✅ **P4** | **Daily quest + streak** **(SELESAI — Revisi 6)**: (1) **2 quest harian auto-claim, non-blocking**: 🍙 Beri Makan (+10 Ryo/+5 EXP via `handleFeedItem`) & 🎏 Mini-game (+15 Ryo/+10 EXP via `handleGameReward`) — guard anti-dobel per tanggal lokal YYYY-MM-DD (pola `sv-SE` sama dgn cooldown Zen), desain cozy tanpa hukuman. (2) **Streak 🔥**: hari berurutan minimal 1 quest → +1, bolong → reset 1; **bonus +50 Ryo tiap kelipatan 7** (sekali per nilai, dilacak `lastBonusStreak`). (3) **Implementasi**: logika murni `src/utils/dailyQuest.ts`; hook `useDailyQuest.ts` (toast/sfx di luar updater — aman StrictMode); HUD `DailyQuestPanel.tsx` (chip status + badge streak, role=status); schema save **v4** (field opsional `dailyQuest` + `sanitizeDailyQuest` toleran korupsi, migrasi v3→v4 identitas). (4) **Doc drift ROADMAP M4 dikoreksi** — klaim "Hadiah Kehadiran Harian ✅" diberi catatan keterlambatan realisasi; `docs/02` ditambah **§9 Quest Harian & Streak**. (5) **Test +27 kasus (157 → 184 lulus, 16 file)**: `dailyQuest.test.ts` (tanggal/roll/streak/bonus/schema v4 roundtrip + migrasi + korupsi), `useDailyQuest.test.ts` (reward, anti-dobel, streak lintas hari via fake timers, bonus 7), `DailyQuestPanel.test.tsx`. Verifikasi: tsc 0 error, build sukses (chunk utama 452,4 KB) | Butuh schema save v4 — infrastruktur migrasi (v1→v3) sudah ada & teruji; menutup celah retensi D7+ | P3 (dilindungi test) |
| ✅ **P5** | **Endgame binding: Restu Silsilah** **(SELESAI — Revisi 6)**: reinkarnasi kini punya insentif, bukan reset total. (1) **Alur**: konfirmasi "Mulai Generasi Baru" merekam `LineageBlessing` ke localStorage **terpisah** (`HAGUMI_LINEAGE_BLESSING`, pola cooldown elusan) SEBELUM reset — warisan selamat; `EggAltarModal` membaca blessing → telur lahir dengan `generation = targetGeneration` (**memperbaiki silsilah yang sebelumnya tak pernah naik dari 1**); efek `App.tsx` menerapkan field `lineage` + koin warisan (guard anti-dobel); `TatamiRoom` menyambut toast + lonceng sekali per kitsune. (2) **Perhitungan BOUNDED**: `inheritedCoins = min(500, levelElder × 5 + bestStreak × 2)` — anti-inflasi; `bestStreak` = rekor streak quest harian (field baru `dailyQuest.bestStreak`, P4). (3) **UI**: preview warisan di `ResetConfirmDialog` ("pemisahan bukan kehilangan — ceritanya berlanjut di silsilah"), kartu silsilah di `HankoAlbumModal`. (4) **Schema v5**: field opsional `lineage` + `dailyQuest.bestStreak`, migrasi v4→v5 identitas, sanitasi toleran korupsi. (5) **docs/02 §10 Restu Silsilah**. (6) **Test +11 kasus (184 → 195 lulus, 17 file)**: `lineage.test.ts` (warisan bounded, roundtrip storage, schema v5 roundtrip/migrasi/korupsi). Verifikasi: tsc 0 error, build sukses (chunk utama 455,5 KB) | Mengikat P4 (quest harian → generasi baru); infrastruktur generation sudah ada | P4 |
| ✅ **P6** | **Lazy-load `soundEngine.ts` + split main chunk** di bawah 500 KB **(SELESAI dengan catatan — Revisi 6)**: `manualChunks` vendor (react/motion/lucide) di `vite.config.ts` → chunk utama **548,7 → 428,2 KB (−22%)**, warning Rollup hilang, cache vendor granular & stabil. *Catatan jujur*: deep lazy `soundEngine` (±20 file import sinkron) **ditunda ke era P3** — butuh refactor luas dan belum ada perlindungan test komponen | Quick win kecil; ideal dikerjakan bersama P1 (satu area build/loading) | — |
| ⬜ **P7** | **Cloud save & sinkronisasi lintas perangkat** | Upaya infrastruktur terbesar (akun/backend/Firestore); PWA dari P1 adalah fondasinya | P1 |
| ⬜ **P8** | **i18n** | Hanya bernilai jika target pasar melebar; copy perlu stabil dulu; mahal jika dipaksakan sekarang | defer |

### 7.3 Perubahan yang Menyertai Revisi 6

- **Batch aksesibilitas 3 tahap** (rincian di bagian 5, temuan #1) — selesai & diverifikasi:
  `tsc --noEmit` 0 error, 105/105 test, build produksi sukses; di-commit sebagai `46c9809`
  dan di-push ke `origin/master` (push diverifikasi via `git ls-remote`).
- Tidak ada perubahan gameplay, formula, maupun schema save pada revisi ini.
- Dokumen ini hanya diperbarui (header, Ringkasan Eksekutif, Long-Term, dan bagian 7).





