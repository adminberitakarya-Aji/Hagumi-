# 💻 03. Arsitektur Teknis & Mesin Audio-Sensor

Dokumen ini menguraikan arsitektur sistem perangkat lunak, komponen state management, Web Audio synthesizer tanpa aset eksternal, mesin getaran haptik, dan sistem kamera *Parallax 2.5D*.

---

## 🏗️ 1. Diagram Arsitektur Komponen Utama

```
┌────────────────────────────────────────────────────────────────────────┐
│                        APLIKASI UTAMA (App.tsx)                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
┌───────────────────────────────┐   ┌──────────────────────────────────┐
│      TatamiRoom (Main Hub)    │   │      Global System Hooks         │
│  - Kamar Tatami Tradisional   │   │  - useKitsunePet (Game State)    │
│  - Panorama Fuji & Musim      │   │  - useParallax2D (Sensors/Camera)│
│  - Sensu Fan HUD Navigasi     │   │  - useShojiTransition (Screen)   │
└───────────────┬───────────────┘   └──────────────────────────────────┘
                │
   ┌────────────┴───────────────────────────┐
   ▼                                        ▼
┌───────────────────────────────┐   ┌──────────────────────────────────┐
│   KitsuneCanvas (Renderer)    │   │  Sanctuary Modals & Activities   │
│  - Multi-Tail Spine Rigging   │   │  - Festival Mini-Games (5 Game)  │
│  - Ekspresi Emosional & Mata  │   │  - Kuil Inari & Papan Doa Ema    │
│  - Aura Mistik Kitsunebi      │   │  - Lemari Busana & Aksesoris     │
│  - Partikel Kelopak Sakura    │   │  - Paspor Ziarah & Cap Hanko     │
└───────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🛠️ 2. Fondasi Teknologi & Pustaka Inti

- **React 18 & TypeScript 5**: Menyediakan arsitektur berbasis komponen yang *type-safe*, terstruktur, dan modular.
- **Vite 6**: Perkakas bundler ultra-cepat dengan arsitektur ESM modern untuk pengalaman pengembangan instan.
- **Tailwind CSS 4**: Sistem utilitas penataan gaya visual modern dengan performa kompilasi tinggi dan tema warna Jepang yang konsisten.
- **Motion (`motion/react`)**: Menggerakkan animasi transisi menu, ayunan kipas lipat Sensu, dan peluncuran kembang api Hanabi.
- **Lucide React**: Set ikon modern yang diselaraskan secara visual dengan tema ornamen oriental.

---

## 🎵 3. Mesin Sintesis Audio Web (`soundEngine.ts`)

Aplikasi mengimplementasikan **Zero-Asset Web Audio API**: seluruh nada musik, lonceng kuil, petikan kecapi Koto, dan suara alam disintesis secara algoritmik dari frekuensi murni menggunakan oscillator, gain node, dan biquad filter.

### Instrumen & Efek Suara yang Disintesis:
1. **Petikan Koto Tradisional**:
   - Menggunakan kombinasi gelombang *triangle* dan *sine* dengan *decay* eksponensial cepat dan resonansi filter band-pass (tangga nada pentatonik Jepang *Insen* & *Hirajoushi*).
2. **Tiupan Seruling Shakuhachi**:
   - Menghasilkan nada lembut bernafaskan desau udara menggunakan modulasi frekuensi rendah (LFO) dan filter low-pass.
3. **Pemberat Bambu Taman (Shishi-odoshi)**:
   - Suara tetesan air lambat disusul ketukan kayu bambu pada batu alam (*thwack* berongga).
4. **Lonceng Angin Furin (風鈴)**:
   - Resonansi kaca/tembaga berkilau frekuensi tinggi (~2400Hz - 3200Hz).
5. **Genta Kuil Suci (Kane)**:
   - Dentang bass dalam (sub-120Hz) yang bergema panjang menyapu ruangan saat pemain berdoa di altar Inari.

---

## 📳 4. Mesin Umpan Balik Haptik (`hapticEngine.ts`)

Untuk menghadirkan sensasi sentuhan fisik layaknya mengelus rubah asli di perangkat seluler:
- Mengakses Web Vibration API (`navigator.vibrate`) dengan pola milidetik yang diprogram secara presisi:
  - **Elusan Lembut (Purr)**: Getaran mikro halus bertingkat `[15, 30, 15]`.
  - **Ketukan Antarmuka (Tap)**: Pulsa 8ms yang renyah tanpa jeda.
  - **Pukulan Genderang Taiko**: Dentuman bertenaga `[50, 40, 70]`.
  - **Penyelesaian Berkah (Blessing/Success)**: Melodi ritmis haptik tiga ketukan gembira.
- Mendukung mode intensitas yang dapat dikonfigurasi: *Penuh (100%)*, *Lembut (50%)*, atau *Nonaktif (0%)*.

---

## 🪞 5. Mesin Kamera Parallax 2.5D (`useParallax2D.ts`)

Kamera memberikan ilusi stereoskopik mendalam (*diorama effect*) dengan membagi antarmuka menjadi 5 bidang kedalaman:

```
[Layer 1: Deep BG] ──► Langit, Fuji, Matahari/Bulan  (Pergeseran -22px)
[Layer 2: Mid BG]  ──► Layar Shoji, Engawa, Kakemono (Pergeseran -9px)
[Layer 3: Tatami]  ──► Anyaman Lantai & Meja Rendah  (Pergeseran +4px)
[Layer 4: Subject] ──► Karakter Roh Kitsune           (Pergeseran +7px)
[Layer 5: Foregr.] ──► Lentera Andon & Lemari Tansu  (Pergeseran +16px)
```

### Karakteristik Teknis:
- **Dukungan Perangkat Ganda**:
  - *Desktop*: Melacak posisi kursor mouse ternormalisasi dari sumbu tengah layar $(-1 \le x, y \le 1)$.
  - *Mobile*: Membaca data kemiringan sudut akselerometer ponsel melalui `DeviceOrientationEvent` (sumbu *Beta* untuk kemiringan depan-belakang dan *Gamma* untuk kiri-kanan).
- **Smooth Damping (LERP)**:
  - Pergerakan kamera dihaluskan menggunakan interpolasi linier dengan faktor damping `0.075`, mencegah sentakan kasar saat sensor bergetar.
- **Dukungan Izin iOS**:
  - Menyediakan penanganan izin eksplisit `DeviceOrientationEvent.requestPermission` sesuai spesifikasi WebKit iOS 13+.
