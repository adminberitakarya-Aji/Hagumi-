# 🦊 02. Mekanika Permainan & Sistem Pertumbuhan (Gameplay Mechanics)

> **REVISI 2 (8 September 2026)** — Dokumen ini ditulis ulang **dari kode aktual**, bukan dari desain lama.
> Versi sebelumnya berisi spesifikasi desain awal yang sudah tidak berlaku (stat *Spirit (霊力)*, formula EXP
> `100 × 1.25^(L-1)`, laju decay ±4,5 poin/jam, evolusi linier Yako→Kyuubi berdasar level) sehingga berpotensi
> menyesatkan kontributor. **Sumber kebenaran saat ini**: `src/types/game.ts`, `src/data/gameConfig.ts`,
> `src/hooks/useGameLoop.ts`, dan `src/components/TatamiRoom.tsx`. Jika dokumen ini berbeda dengan kode, **kode yang benar**.

Dokumen ini menjelaskan model stat vital, siklus peluruhan (*decay loop*), formula skor pengasuhan
(*Care Score*), kurva EXP, sistem evolusi bercabang, dan ikatan batin (*Kizuna Bond*) yang menggerakkan
siklus kehidupan Kitsune di Hagumi.

---

## 📊 1. Enam Stat Vital Utama (*Core Vital Stats*)

Setiap Kitsune memiliki 6 stat dengan rentang nilai **0 hingga 100** (interface `PetStats` di `src/types/game.ts`):

| Stat Vital | Fungsi & Kebutuhan | Tindakan Pemulihan |
| :--- | :--- | :--- |
| **Kenyang (Hunger)** | Daya tahan fisik harian; meluruh terus-menerus. | Memberi makan di Bento Dining (aburaage, dango, manju, sup miso, dll.). |
| **Energi (Energy)** | Kapasitas beraktivitas dan bermain. | Tidur 15 menit di kamar futon; pulih +1,1/10 detik saat tidur. |
| **Kebersihan (Cleanliness)** | Kesucian bulu roh dari debu dan kotoran. | Mandi Onsen dan sapu-beres tatami (`handleCleanAndBath`); khasiat cleanliness beberapa makanan (`handleFeedItem`). |
| **Kebahagiaan (Happiness)** | Suasana hati dan keceriaan batin. | Mengelus kitsune, mini-game Matsuri, Hanabi, perjalanan Odekake, meditasi Zen. |
| **Disiplin (Discipline)** | Fokus & manasik roh; menentukan cabang evolusi Zenko. Meluruh **sangat lembut** saat pengasuhan terlala (lihat §2). | Meditasi Zen Taman Engawa (**+15, 1× per hari kalender** — cooldown `lastZenMeditationDate`), Wanage skor bagus (+8 / +4), Jimat Omamori (+10 via `handleFeedItem`). |
| **Kesehatan (Health)** | Vitalitas umum; dipengaruhi 6 stat lainnya. | Penyembuhan alami (+0,3/10 detik) saat kenyang > 60 dan bersih > 60. |

> ⚠️ **Tidak ada stat "Spirit/Spiritualitas (霊力)"** di `PetStats`. Spesifikasi lama yang menyebutkannya sudah
> tidak berlaku. HUD in-game menampilkan 6 stat ini, ditambah koin dan usia.

---

## ⏳ 2. Siklus Peluruhan Status (*Decay Loop*)

Decay loop berjalan setiap **10 detik** (interval `setInterval` di `useGameLoop.ts`) selama tab aktif:

| Peristiwa (per tick 10 dtk) | Nilai | Kondisi |
| :--- | :--- | :--- |
| Peluruhan (Hunger) | **−0,12** | Selalu (≈ **−43,2 poin/jam** saat terjaga; ≈ −14,4 poin/jam saat tidur). |
| Energi (Energy) | **−0,15** | Saat terjaga. |
| Energi (Energy) | **+1,1** | Saat tidur (mencapai 100 dalam ±15 menit). |
| Kebersihan (Cleanliness) | **−0,12** | Selalu. |
| Kebahagiaan (Happiness) | **−0,5** | Jika hunger < 25 **atau** energy < 20 **atau** cleanliness < 25. |
| Disiplin (Discipline) | **−0,01** | Bersamaan penalti happiness di atas; **hanya saat terjaga** — floor 10 (≈ −3,6/jam terburuk). |
| Care Mistakes | **+0,05** | Bersamaan dengan penurunan happiness di atas. |
| Kotoran (Poop) | Peluang **8%** | Jika terjaga, hunger > 30, dan poopCount < 4. |
| Sakit (Sickness) | Peluang **10%** | Jika cleanliness < 20 **atau** poopCount ≥ 3. |
| Kesehatan (Health) | **−0,8** | Saat isSick = true (happiness juga −0,5, keduanya berhenti di 10). |
| Kesehatan (Health) | **−0,4** | Jika tidak sakit tetapi hunger < 15. |
| Kesehatan (Health) | **+0,3** | Penyembuhan alami jika hunger > 60 dan cleanliness > 60. |

**Desain "cozy" tanpa kematian**: stat memiliki batas bawah alami — health dan happiness berhenti di 10
saat sakit, dan tidak ada mekanika kematian. Kitsune yang terlala hanya tampak lesu, bukan mati.

### 🛏️ 2.1 Model Reward Bangun Tidur (*Sleep Wake Reward*) — sejak 10 September 2026

Menutup eksploit siklus "tidur → Bangunkan Awal → tidur lagi" (sebelumnya +14 EXP & +25 energi per
siklus ±5 detik). Keputusan reward kini murni fungsi waktu nyata di `src/utils/sleepReward.ts`
(`resolveSleepWakeReward(now, sleepUntilTimestamp, currentEnergy)`), dihitung dari
`sleepUntilTimestamp` — **bukan** dari bar energi visual `energyProgress` (bar itu bisa dinaikkan
sentuhan lembut di kamar dan kini murni kosmetik):

| Kondisi | Bonus penyelesaian | Keterangan |
| :--- | :--- | :--- |
| Sesi 15 menit **selesai** | **+14 EXP**, energi tambahan `min(100 − energi, 25)` | Termasuk selesai otomatis (decay loop saat online, modal kamar saat `diff === 0`, atau offline decay). |
| **Bangun awal** (sesi masih aktif) | **0 EXP, 0 bonus energi** | Sesi dibatalkan; energi hasil akumulasi **pasif** decay loop (+1,1/10 dtk online / +15/jam offline) tetap aman dibawa pulang. Siklus spam = selalu 0/0. |

Konsisten dengan pola Odekake: *selesaikan perjalanan = hadiah penuh; pulang awal = hadiah tidak ada*.
Selama sesi aktif, decay loop sudah memulihkan energi secara proporsional, sehingga pemain yang tidur
7,5 menit lalu bangun awal tetap membawa ±50 energi — tanpa bonus penyelesaian.

---

## 🏆 3. Formula Skor Pengasuhan (*Care Score*)

Care Score dihitung ulang setiap tick decay di `useGameLoop.ts`:

```
careScore = clamp( round( (hunger + energy + cleanliness + happiness
                          + health + discipline) / 6
                          − careMistakes × 0.5 ), 10, 100 )
```

Catatan penting yang membedakan dari spesifikasi lama:
- **6 stat** dirata-rata — **discipline kini masuk** dalam Care Score (Revisi 4 bug #5). Nilai awal
  disiplin saat penetasan adalah 50, sehingga Care Score tipikal sedikit lebih rendah dibanding
  formula 5-stat lama; kenaikan disiplin otomatis mengangkat Care Score.
- `careMistakes` mengakumulasi +0,05 per tick selama pengasuhan terabaikan (lihat §2) dan hanya
  di-reset oleh aksi perawatan — sehingga kesalahan lama tetap berdampak sampai diperbaiki.
- Rentang akhir dibatasi **10–100**.

Contoh terverifikasi (hitung ulang dari formula):
| Kondisi | Care Score |
| :--- | :---: |
| Keenam stat 90, careMistakes 0 | **90** |
| Keenam stat 60, careMistakes 20 | **50** |

**Peran Care Score**: syarat percabangan evolusi Dewasa/Mistik (§6) dan indikator kualitas pengasuhan
secara keseluruhan. Ekspresi mood visual (balon pikiran, efek status) ditangani sistem
*Idle Thought* (`pickIdleThought`) dan `drawStatusFX`, bukan tabel tier Omikuji seperti versi lama.

---

## 🌙 4. Peluruhan Offline (*Offline Decay*)

Dihitung sekali saat data dimuat (`useGameLoop.ts`), jika pemain pergi **≥ 3 menit**. Durasi dihitung
dari `lastInteractionTime` dan dibatasi maksimum **24 jam**:

| Stat | Efek offline | Batas |
| :--- | :--- | :--- |
| Hunger | −5/jam | Maksimum −60; berhenti di 15. |
| Energy | Tidur: **+15/jam** (pulih); Terjaga: −3/jam | Regen maksimum +80; turun maksimum −40; berhenti di 10. |
| Cleanliness | −4/jam | Maksimum −50; berhenti di 10. |
| Kotoran | +1 (peluang tetap) | Jika pergi ≥ 4 jam dan poopCount < 2; maksimum 3. |
| Koin | **Bonus selamat datang** | `min(100, floor(jam × 6) + 10)` — ditampilkan lewat *Offline Return Modal*. |
| Usia | `ageDays` = selisih `birthTimestamp` / 24 jam nyata (1 hari kalender). | Hanya bertambah, tidak pernah mundur. |

Jika sesi tidur 15 menit selesai selama offline, kitsune terbangun otomatis: energy = 100,
happiness +20. Tidak ada penalti agresif — pemain yang kembali selalu disambut bonus, bukan hukuman.

---

## 📈 5. Pertumbuhan Level & Kurva EXP

Setiap tindakan positif memberikan poin pengalaman (*EXP*). Formula kebutuhan EXP per level
(`getRequiredExp` di `gameConfig.ts`) — eksponensial lembut:

```
EXP Diperlukan(L) = floor( 40 × L^1.35 + 60 )
```

Nilai terverifikasi (dihitung ulang dari formula; tabel lama dengan `100 × 1.25^(L-1)` sudah tidak berlaku):

| Level | EXP dibutuhkan untuk naik |
| :---: | :---: |
| 1 | 100 |
| 2 | 161 |
| 3 | 236 |
| 5 | 411 |
| 10 | 955 |
| 15 | 1.608 |
| 25 | 3.145 |
| 40 | 5.878 |
| 50 | 7.924 |

Total EXP kumulatif Lv. 1 → 50: **±174.254 EXP**. `addPetExp` mendukung **multi-level-up** dalam satu
penambahan (sisa EXP dibawa ke level berikutnya secara otomatis dalam loop `while`).

### Contoh Sumber EXP (dari kode)

| Aksi | EXP |
| :--- | :---: |
| Mengelus kitsune (tap) | +5 |
| Bangun tidur selesai (online) | +15 |
| Bersih-bersih / mandi | +12 (atau +20 jika ada kotoran disapu) |
| Menulis catatan Buku Harian Roh | +25 |
| Hanabi Maker sukses | +40 |
| Upacara Evolusi | (stat dipulihkan; lihat §6) |
| Berkah ziarah Kuil & Odekake | Nilai variatif sesuai config reward perjalanan/kuil |

---

## 🦊 6. Sistem Evolusi Bercabang (*Kitsune Morphosis*)

Evolusi dipicu oleh `determineNextEvolution(stage, level, ageDays, careScore, discipline)` di
`gameConfig.ts` dan diperiksa secara reaktif di `App.tsx`. Evolusi **bercabang** pada fase Dewasa —
bukan linier seperti spesifikasi lama:

```
[Altar Telur] ──► [Bayi] ──► [Anak] ──► [Remaja] ──► { 4 Cabang Dewasa/Mistik }
   Hōju Egg      Kitsunebi   Kogitsune   Wakahitsune     Tenko / Zenko / Yako / Nogitsune
    (0 ekor)       (1)          (2)          (3)              (9 / 7 / 5 / 4 ekor)
```

| Transisi | Wujud | Kanji | Ekor | Syarat |
| :--- | :--- | :---: | :---: | :--- |
| Telur → Bayi | Kitsunebi (Api Roh) | 狐火 | 1 | Otomatis setelah penetasan. |
| Bayi → Anak | Kogitsune (Anak Rubah) | 子狐 | 2 | Level ≥ 3 **dan** usia ≥ 1 hari. |
| Anak → Remaja | Wakahitsune (Rubah Muda) | 若狐 | 3 | Level ≥ 6 **dan** usia ≥ 3 hari. |
| Remaja → Dewasa | **Tenko** (Rubah Surgawi) | 天狐 | 9 | Level ≥ 10, usia ≥ 5 hari, **careScore ≥ 85**. |
| Remaja → Dewasa | **Zenko** (Rubah Kebajikan) | 善狐 | 7 | Level ≥ 10, usia ≥ 5 hari, careScore ≥ 70 **dan** discipline ≥ 70. |
| Remaja → Dewasa | **Yako** (Rubah Liar Cerdik) | 野狐 | 5 | Level ≥ 10, usia ≥ 5 hari, careScore ≥ 50. |
| Remaja → Dewasa | **Nogitsune** (Rubah Rimba) | 野狐 | 4 | Level ≥ 10, usia ≥ 5 hari, careScore < 50 (fallback). |

Percabangan Dewasa dievaluasi **berurutan dengan prioritas Tenko → Zenko → Yako → Nogitsune**;
cabang pertama yang syaratnya terpenuhi yang terpilih.

**Bonus Upacara Evolusi** (`handleConfirmEvolution` di `App.tsx`): health, happiness, dan energy
dipulihkan penuh ke 100, plus careScore +10.

> ⚠️ Nama fase versi lama (Yako Lv.1-4 → Youko Lv.5-14 → Kiko Lv.15-24 → Kinko Lv.25-39 → Kyuubi Lv.40+)
> adalah **spesifikasi usang**. Di kode, "Yako" dan "Nogitsune" adalah cabang Dewasa, bukan fase awal,
> dan tidak ada threshold Lv. 40 untuk 9 ekor.

---

## ⛩️ 7. Sistem Ikatan Batin (*Kizuna Bond*)

`bondingPoints` diakumulasi dari interaksi kasih sayang dan dipetakan ke 5 milestone
(`BONDING_MILESTONES` + `getBondingLevelInfo` di `gameConfig.ts`):

| Level | Gelar | Japanese Title | Poin Minimum | Perk yang Dibuka |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Kenalan Kuil | 初縁 (Hatsuen) | 0 | Menyapa "Kon kon!" saat dipanggil. |
| 2 | Teman Berbagi Teh | 茶友 (Chayu) | 100 | Efek relaksasi ganda saat waktu teh sore. |
| 3 | Penjaga Doa Ema | 祈護 (Kigo) | 250 | Kitsune mengingat & menyebut doa Ema dalam dialog. |
| 4 | Jiwa Senada | 同心 (Doushin) | 500 | Berkah koin Ryo tak terduga saat dielus. |
| 5 | Ikatan Mistis Abadi | 魂の契り (Tamashii no Chigiri) | 850 | Aura pelangi spiritual & gelar kehormatan Inari. |

Sumber poin bonding yang terverifikasi di kode:
- **Mengelus kitsune**: +2 poin per tap (bersamaan dengan +5 EXP dan +3 happiness) —
  **reward dibatasi cooldown 2 menit per kitsune** (sejak 10 September 2026, modul
  `src/utils/petAffectionCooldown.ts`; realisasi niat desain ROADMAP M9.5). Selama
  cooldown, elusan tetap merespons (suara + animasi) tanpa reward apa pun. Cooldown
  bertahan reload halaman (localStorage terpisah, diikat `pet.id`) dan otomatis reset
  untuk pemain baru / generasi baru.
- **Odekake**: `reward.bondingPoints` sesuai config perjalanan.
- Progress bar, milestone berikutnya, dan persentase dihitung `getBondingLevelInfo`.

---

## 🎯 8. Sistem Disiplin (*Discipline*) — Revisi 4 bug #5

Disiplin menentukan cabang evolusi **Zenko** (§6: careScore ≥ 70 **dan** discipline ≥ 70) dan kini
hidup dalam gameplay — punya sumber naik multi-aksi dan penurun lembut. Nilai awal saat penetasan: **50**.

### Sumber kenaikan

| Aksi | Disiplin | Cooldown / Syarat |
| :--- | :---: | :--- |
| Meditasi Zen Taman Engawa (`handleZenMeditation`) | **+15** | **1× per hari kalender** — disimpan `lastZenMeditationDate` (YYYY-MM-DD lokal, schema save v3). Sebelum cooldown ini, aksi bisa di-spam ke 100. |
| Wanage skor ≥ 25 (tancapan bagus) | **+8** | Tiap sesi main; skor < 25 tapi ≥ 12 tetap dapat **+4**. Dikirim via parameter ketiga `onReward` Matsuri. |
| Jimat Omamori (`FOOD_ITEMS.omamori`) | **+10** | Tiap pemberian — kandungan `discipline` item kini diterapkan `handleFeedItem` (sebelumnya ada di katalog tapi tidak berfungsi). |

### Penurunan & perlindungan

- **Penurun lembut**: −0,01/tick (±3,6/jam terburuk) — hanya saat terjaga, dan hanya ketika
  pengasuhan terlala (hunger < 25 / energy < 20 / cleanliness < 25), bersamaan penalti happiness.
- **Floor 10**: disiplin tidak pernah turun di bawah 10 — pemain tidak bisa terkunci permanen dari
  Zenko; recovery via meditasi Zen selalu tersedia.
- **Tidak turun saat tidur** maupun saat offline decay (offline decay tidak menyentuh discipline).

### Peran lain

Disiplin juga masuk rata-rata **6-stat** Care Score (§3) — pemain yang konsisten bermeditasi
otomatis mengangkat kualitas pengasuhan keseluruhan, bukan hanya jalur evolusi Zenko.

---

## 📜 9. Quest Harian & Streak (*Daily Quest & Streak*) — P4 Revisi 6

> Sumber kebenaran: `src/utils/dailyQuest.ts` (logika murni), `src/hooks/useDailyQuest.ts`
> (integrasi state), `src/components/tatami/DailyQuestPanel.tsx` (HUD). State tersimpan di
> save **schema v4** — field opsional `dailyQuest: DailyQuestState` (`src/types/game.ts`),
> jadi save lama tetap valid tanpa migrasi data.

### 9.1 Dua Quest Harian (auto-claim, non-blocking)

| Quest | Pemicu (1× per hari) | Reward |
| :--- | :--- | :--- |
| 🍙 **Beri Makan** | `handleFeedItem` — memberi makan item apa pun | **+10 Ryo, +5 EXP** |
| 🎏 **Mini-game Festival** | `handleGameReward` — sesi mini-game apa pun | **+15 Ryo, +10 EXP** |

- Reward **auto-claim** saat aksi terjadi (tanpa tombol klaim — konsisten desain cozy).
- **Tidak dihitung ganda** dalam hari yang sama (guard `questDate`).
- Desain **non-blocking**: quest tidak pernah memblokir aksi lain; panel hanya memandu.
- Kalender memakai tanggal **lokal** YYYY-MM-DD (`toLocaleDateString('sv-SE')` — pola yang sama
  dengan cooldown meditasi Zen §8). Roll quest ke hari baru terjadi saat aksi pertama hari itu
  atau saat save berikutnya; panel hanya menampilkan *view* roll tanpa persist.

### 9.2 Streak 🔥 (*Retention Streak*)

- **Definisi**: jumlah hari **berturut-turut** menuntaskan minimal 1 quest.
- Hari sama → streak tidak berubah; hari berurutan (kemarin) → **+1**; bolong → kembali ke **1**.
- **Tanpa hukuman lain** — hadiah tidak pernah dicabut (filosofi cozy non-punishing).
- **Bonus**: streak kelipatan **7** → **+50 Ryo** (diberikan sekali per nilai streak, dilacak
  `lastBonusStreak`, sehingga nilai streak 7, 14, 21, … masing-masing berhadiah tepat 1×).

### 9.3 Nilai Konstanta

`DAILY_FEED_REWARD = { coins: 10, exp: 5 }` · `DAILY_GAME_REWARD = { coins: 15, exp: 10 }` ·
`STREAK_BONUS_COINS = 50` · `STREAK_BONUS_EVERY = 7`

> Saat mengubah angka/aturan di `dailyQuest.ts`, perbarui bagian ini di commit yang sama.
> Guard sinkronisasi ada di `src/utils/dailyQuest.test.ts` & `src/utils/petSaveSchema.test.ts`.

## 📎 Catatan Pemeliharaan Dokumen

- Dokumen ini dibuat ulang pada 8 September 2026 sebagai koreksi atas temuan audit (lihat `audit.md`):
  stat Spirit tidak ada, formula EXP lama salah, laju decay meleset ±9,6×, dan diagram evolusi linier usang.
- Saat mengubah mekanika di `useGameLoop.ts` atau `gameConfig.ts`, **perbarui dokumen ini di commit yang sama**.
- Referensi silang: `docs/03_ARCHITECTURE_AND_TECH_STACK.md` (arsitektur), `ROADMAP.md` (status fitur),
  `docs/06_PANDUAN_PENGGUNA_BARU_5_FASE.md` (onboarding pemain).



