# 🛠️ 05. Panduan Pengembang & Struktur Kode (Developer Guide)

Dokumen ini ditujukan bagi pengembang yang ingin memahami struktur basis kode, menjalankan aplikasi di lingkungan lokal, serta berkontribusi dalam pengembangan fitur baru.

---

## 📁 1. Struktur Direktori Proyek

```
/
├── docs/                               # Dokumentasi arsitektur & panduan proyek
│   ├── README.md                       # Indeks dokumentasi
│   ├── 01_OVERVIEW.md                  # Filosofi, seni & visi game
│   ├── 02_GAMEPLAY_MECHANICS.md        # Formula stats, EXP & evolusi ekor
│   ├── 03_ARCHITECTURE_AND_TECH_STACK.md # Audio synthesis, haptik & parallax
│   ├── 04_FEATURES_AND_ACTIVITIES.md   # Katalog santuari & 5 mini-game
│   └── 05_CONTRIBUTING_AND_GUIDE.md    # Panduan struktur & konvensi kode
├── src/
│   ├── components/                     # Komponen antarmuka React
│   │   ├── TatamiRoom.tsx              # Hub panggung santuari utama
│   │   ├── TatamiSanctuaryBackground.tsx # Latar belakang bertingkat & Gunung Fuji
│   │   ├── KitsuneCanvas.tsx           # Mesin rendering visual Kitsune
│   │   ├── SensuFanHUD.tsx             # Navigasi HUD kipas lipat tradisional
│   │   ├── SanctuaryMenuModal.tsx      # Modal menu utama santuari
│   │   ├── ParallaxSettingsModal.tsx   # Modal pengaturan kamera & sensor 2.5D
│   │   ├── HapticSettingsModal.tsx     # Modal preferensi getaran haptik
│   │   ├── ShojiDoorTransition.tsx     # Transisi layar pintu geser shoji
│   │   ├── EmaWishboardModal.tsx       # Papan doa kayu Ema
│   │   ├── InariShrineModal.tsx        # Altar kuil Inari & sistem ikatan
│   │   ├── WardrobeTansuModal.tsx      # Lemari busana yukata & aksesoris
│   │   ├── SanctuaryShopModal.tsx      # Kedai saudagar Tanuki
│   │   ├── SpiritDiaryModal.tsx        # Buku catatan harian Kitsune
│   │   └── games/                      # Seluruh modul mini-game festival Matsuri
│   │       ├── TaikoRhythmGame.tsx     # Mini-game irama genderang Taiko
│   │       ├── KingyoSukuiGame.tsx     # Mini-game tangguk ikan mas
│   │       ├── WanageGame.tsx          # Mini-game lempar gelang bambu
│   │       ├── HanabiGameModal.tsx     # Mini-game peracik kembang api
│   │       └── KitsuneDashGame.tsx     # Mini-game lari kuil Torii
│   ├── hooks/
│   │   ├── useKitsunePet.ts            # State machine siklus hidup Kitsune
│   │   └── useShojiTransition.ts       # Hook pengontrol transisi pintu shoji
│   ├── utils/
│   │   ├── soundEngine.ts              # Web Audio synthesizer algoritmik
│   │   ├── hapticFeedback.ts           # Mesin getaran Web Vibration API
│   │   ├── useParallax2D.ts            # Hook pelacak sensor kemiringan & kursor
│   │   └── storage.ts                  # Persistensi data lokal (localStorage)
│   ├── types.ts                        # Definisi tipe data TypeScript global
│   ├── data/
│   │   └── gameConfig.ts               # Parameter stats, katalog item & aksesoris
│   ├── index.css                       # Styling global dengan Tailwind CSS
│   ├── App.tsx                         # Entry component utama
│   └── main.tsx                        # Bootstrapper React DOM
├── package.json                        # Konfigurasi dependensi dan skrip
├── ROADMAP.md                          # Peta jalan pengembangan fitur
└── vite.config.ts                      # Konfigurasi bundler Vite
```

---

## 💻 2. Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18.0.0 atau lebih baru
- Manajer paket `npm` atau `pnpm`

### Langkah Instalasi
```bash
# 1. Pasang seluruh dependensi proyek
npm install

# 2. Jalankan server pengembangan lokal (tersedia di port 3000)
npm run dev

# 3. Jalankan linter dan pemeriksa tipe TypeScript
npm run lint

# 4. Bangun bundel siap rilis untuk produksi
npm run build
```

---

## 🎨 3. Konvensi Penulisan Kode (Coding Guidelines)

1. **Prinsip Zero-Asset Audio**:
   - Jangan menambahkan berkas `.mp3` atau `.wav` eksternal. Semua efek audio baru harus dibangun menggunakan modulasi oscillator dan filter di dalam `soundEngine.ts`.
2. **Kemandirian State & Ketahanan Offline**:
   - Game didesain untuk berjalan 100% di sisi klien tanpa ketergantungan server backend wajib. Setiap perubahan state penting harus disinkronkan ke `localStorage` melalui `useKitsunePet.ts`.
3. **Standar Penamaan & Bahasa**:
   - Istilah budaya Jepang dipertahankan dalam bentuk romanisasi yang jelas (*Shoji*, *Tatami*, *Yukata*, *Kitsunebi*, *Ema*, *Kizuna*) dan disertai penjelasan kanji serta terjemahan bahasa Indonesia yang elegan.
4. **Sentuhan & Aksesibilitas**:
   - Selalu berikan umpan balik haptik melalui `hapticEngine` pada setiap interaksi tombol atau ketukan penting.
   - Pastikan rasio kontras teks di atas permukaan kayu atau kertas Washi memenuhi standar kenyamanan mata.

---

## 🗺️ 4. Prioritas Pengembangan Selanjutnya

Mengacu pada berkas `ROADMAP.md`:
1. **Dukungan PWA Lengkap**: Konfigurasi `manifest.json` dan Service Worker untuk caching offline dan instalasi ke homescreen smartphone.
2. **Mini-Game Baru #6: Penangkap Kunang-Kunang (*Hotaru Catcher*)**: Aktivitas malam hari di beranda engawa taman bambu.
3. **Sinkronisasi Awan Opsional**: Ekspor-impor kode pemulihan atau penyimpanan aman cloud Firestore untuk pemain yang berganti perangkat.
