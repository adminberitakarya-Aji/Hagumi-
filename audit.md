# 🔍 LAPORAN AUDIT MENYELURUH — HAGUMI: Virtual Pet Kitsune

> **Tanggal Audit**: 8 September 2026
> **Commit**: `f2875ba` (branch `master`)
> **Metode**: Audit read-only terhadap seluruh folder & file (root, `docs/`, `src/` — 60+ file TS/TSX, `server.ts`, `dist/`, konfigurasi build), verifikasi `tsc --noEmit`, dan penelusuran git history. **Tidak ada file source code yang diubah.**
> **Revisi 1**: Klaim "folder `dist/` ikut ter-commit" DITARIK (terbukti salah via `git ls-files` — `dist/` tidak ter-track); rasio decay dikoreksi dari ±6× menjadi **±9,6×**; formula EXP di `docs/02` dikonfirmasi cocok persis dengan `ROADMAP.md` — artinya `docs/02` adalah dokumen basi versi lama, bukan drift dua arah. Detail di bagian 6 (Catatan Revisi).
> **Revisi 2**: Prioritas #1 selesai — bug `useEffect`/`tick` di `KitsuneCanvas.tsx` diperbaiki (RAF loop mount-once + refs). Prioritas #2 selesai — `docs/02_GAMEPLAY_MECHANICS.md` ditulis ulang penuh dari kode aktual (Revisi 2 dokumen), plus 2 klaim usang kecil di `docs/04` & `docs/05` dan deskripsi indeks `docs/README.md` ikut dikoreksi.
> **Revisi 3**: Prioritas #3 selesai — `package.json` dibersihkan (`name: "hagumi"`, `version: "0.1.0"`, + description); README ditulis ulang penuh dari boilerplate AI Studio; `bun.lock` dihapus, standardisasi **npm** dengan `package-lock.json` (diverifikasi: tidak ada referensi bun di repo).

---

## Ringkasan Eksekutif

| Item | Hasil |
|---|---|
| Stack | React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS 4 + Express + Gemini API |
| Skala kode | ±19.500 baris TS/TSX di `src/`, 60+ file, 30+ komponen modal/scene |
| Status `tsc --noEmit` | ✅ Bersih, 0 error (strict mode aktif) |
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
- [x] Pecah `TatamiRoom.tsx` & `soundEngine.ts` menjadi modul lebih kecil (SELESAI bertahap): **soundEngine 2493→2016 baris** — cluster SFX UI/Hanabi/Shoji/Sensu/Musim (14 method) diekstrak ke `src/utils/sound/uiSeasonSfx.ts` via prototype-mixin + declaration merging, API `soundEngine` identik bagi pemanggil, **verifikasi mekanis 415 baris ternormalisasi identik 1:1** (nol drift transkripsi); **TatamiRoom 2420→2296 baris** — `ModalKind`+`MODAL_LABELS` → `tatami/modalRegistry.ts`, dialog tidur → `tatami/SleepConfirmDialog.tsx`, dialog konfirmasi reset → `tatami/ResetConfirmDialog.tsx`. *Follow-up terdokumentasi*: pindahkan subsystem BGM ambient (`toggleAmbientBGM`–`playFurinChime`, ±445 baris) dengan pola mixin yang sama, ~~serta pemecahan JSX HUD/dock/banner~~ → **Langkah 3 SELESAI**: blok 19 modal diekstrak ke `src/components/tatami/ModalLayer.tsx` (±410 baris, role="dialog" wrapper + semua props ter-tipe; `triggerShoji` diprop-kan karena SanctuaryMenuModal memakainya) — **TatamiRoom 2197→1598 baris** (kumulatif 2420→1598, −34%). *Sisa follow-up*: ④ `TatamiHeader`/`TatamiDock`/`StatusBanners` (±500 baris JSX) dan subsystem BGM ambient di soundEngine. ~~ekstraksi cluster handler Odekake ke hook~~ → **SELESAI**: `src/hooks/useOdekakeFlow.ts` (state `completedTripToCelebrate`, countdown, effect deteksi kepulangan, 4 handler depart/recall/claim/blocked; TatamiRoom 2296→2197 baris). ~~cluster aksi perawatan~~ → **SELESAI**: `src/hooks/useCareActions.ts` (11 handler: petting, feed, bath scene/finish, bedroom scene/wake, sleeping-blocked, confirm-sleep, sleep-button, clean-and-bath, toggle-sleep; TatamiRoom 2197→**1886 baris**). Verifikasi exit code diperbaiki (pola `cmd & echo %ERRORLEVEL%` ternyata menampilkan nilai basi — ditemukan & diperbaiki saat langkah ini).
- [ ] *Follow-up* aksesibilitas: aria-label untuk tombol tutup (X) di tiap modal (saat ini fokus awal otomatis ke tombol pertama sehingga tetap bisa dioperasikan keyboard), dan hormati `prefers-reduced-motion` di animasi Canvas (`KitsuneCanvas`/`SeasonParticles`) via `matchMedia`.

### Long-Term
- [ ] PWA: `manifest.json` + Service Worker (sudah di roadmap).
- [ ] Cloud save & sinkronisasi lintas perangkat (sudah di roadmap).
- [ ] Sistem daily quest / endgame reinkarnasi (pacing late-game).
- [ ] Aktivitas untuk menghidupkan stat Discipline.

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

*Laporan ini murni bersifat audit read-only; tidak ada perubahan pada codebase (perubahan hanya pada file audit.md ini sendiri).*





