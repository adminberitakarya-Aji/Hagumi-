# 🗺️ Peta Jalan & Saran Pengembangan Hagumi (Recommended Roadmap)

Dokumen ini memuat hasil audit menyeluruh terhadap game **Hagumi: Sacred Kitsune (育み)** beserta rincian strategi dan peta jalan pengembangan fitur di masa depan. Dokumen ini berfungsi sebagai panduan visi produk (*Product Roadmap*) dan panduan prioritas pengembangan teknis bagi tim pengembang.

---

## 📑 Daftar Isi
1. [Ringkasan Skor Audit Kualitas Sistem](#ringkasan-skor-audit-kualitas-sistem)
2. [Peta Jalan Terstruktur (3 Fase Pengembangan)](#peta-jalan-terstruktur-3-fase-pengembangan)
3. [Fase 1: Penyempurnaan Praktis (Quick Wins)](#fase-1-penyempurnaan-praktis-quick-wins)
4. [Fase 2: Pengayaan Gameplay & Kedalaman Emosional (Mid-Term)](#fase-2-pengayaan-gameplay--kedalaman-emosional-mid-term)
5. [Fase 3: Fitur Komunitas & Dinamika Musiman (Long-Term)](#fase-3-fitur-komunitas--dinamika-musiman-long-term)
6. [Prinsip Desain & Batasan Arsitektur untuk Pengembangan Lanjutan](#prinsip-desain--batasan-arsitektur-untuk-pengembangan-lanjutan)

---

## Ringkasan Skor Audit Kualitas Sistem

Berdasarkan audit arsitektur dan pengalaman pengguna (*UX/UI*):

| Dimensi Audit | Skor | Status Saat Ini |
| :--- | :---: | :--- |
| **Core Gameplay Loop** | **8.5 / 10** | Siklus hidup jelas (Permata Hōju ➔ Kitsunebi ➔ Kogitsune ➔ Wakahitsune ➔ 4 Wujud Mistik Dewasa). Formula peluruhan vital proporsional dengan perhitungan luring (*offline decay*). |
| **Kanvas Grafis Procedural** | **9.0 / 10** | Animasi procedural berbasis kanvas HTML5 murni tanpa aset gambar eksternal berat. 6 varian elemen unik (warna bulu, corak dahi, dan pendaran aura dinamis). |
| **Audio & Haptik Synthesizer** | **9.0 / 10** | Web Audio API synthesizer menghasilkan instrumen tradisional (Koto, Lonceng Suzu, Taiko) tanpa beban unduhan file audio besar. Dukungan feedback getaran haptik responsif. |
| **Arsitektur & Kode** | **8.8 / 10** | TypeScript 100% type-safe, modular, dan bersih dari linting error. Persistensi local storage andal. |
| **Antarmuka (UI/UX)** | **9.2 / 10** | Estetika tradisional Jepang (*Wabi-Sabi*, *Kintsugi*, merah vermilion Inari) sangat kuat. Efek kamera 2.5D Parallax responsif terhadap giroskop dan kursor. |

---

## Peta Jalan Terstruktur (3 Fase Pengembangan)

```
[FASE 1: QUICK WINS] - SELESAI ✅
├── 💾 [x] Ekspor & Impor Data Santuari (Backup Teks Jimat / JSON)
├── 🎵 [x] Ambient Zen BGM Generator (Web Audio Synthesizer Musik Latar)
└── 💭 [x] Gelembung Pikiran Acak saat Santai (Idle Thought Emotes)
        │
        ▼
[FASE 2: PENGAYAAN KEDALAMAN (MID-TERM)] - SELESAI ✅
├── 🎒 [x] Petualangan Berkelana Roh (Kitsune O-dekake / Tabi)
├── 🌿 [x] Perluasan Halaman Luar: Taman Kolam Koi & Pasir Zen
├── 🍂 [x] Sistem 4 Musim Dinamis & Partikel Atmosfer (Haru, Natsu, Aki, Fuyu)
└── 🥁 [x] Mini-Game Taiko Ritme Ketukan Interaktif (Don & Ka) - ada di Festival Matsuri
        │
        ▼
[FASE 3: KOMUNITAS & MUSIMAN (LONG-TERM)] - SELESAI ✅
├── 📇 [x] Kartu Paspor Ziarah Digital (Unduh PNG bergaya Ukiyo-e beresolusi tinggi)
├── 🔊 [x] Suara Musim Sintetis + Auto-Deteksi dari Kalender Nyata
└── 🏮 [x] Pohon Doa Ema Virtual Bersama (Komunitas) - SELESAI ✅
```

---

## Fase 1: Penyempurnaan Praktis (Quick Wins)

Fitur-fitur berbiaya pengembangan rendah namun memberikan dampak langsung pada kenyamanan dan keamanan pemain.

### 1.1 Cadangan & Pemulihan Data Santuari (Backup & Restore)
* **Kebutuhan Pengguna:** Mencegah hilangnya progres Kitsune ketika pengguna membersihkan cache browser, beralih ponsel, atau berganti peramban.
* **Solusi Desain:**
  * Tombol **"Salin Segel Santuari"** di menu pengaturan yang menyandikan data `PetData` menjadi teks sandi terenkripsi ringan (*Base64 string*) atau file unduhan `.json`.
  * Tombol **"Pulihkan Segel Santuari"** untuk menempelkan kembali teks sandi dan memuat ulang profil Kitsune secara instan tanpa kehilangan ikatan batin.

### 1.2 Generator Musik Latar Zen Ambient (*Procedural BGM Synthesizer*)
* **Kebutuhan Pengguna:** Memberikan suasana damai berkelanjutan saat membuka aplikasi santuari.
* **Solusi Desain:**
  * Memanfaatkan Web Audio API yang sudah ada untuk memainkan melodi ambient lembut secara acak dengan tangga nada tradisional Jepang (*Skala Hirajoshi & Insen*).
  * Menyelipkan interval hening (sunyi yang meditatif) agar musik tidak monoton atau mengganggu pendengaran.
  * Saklar bisu (*Mute / Unmute*) elegan di pojok atas santuari.

### 1.3 Emosi Santai & Gelembung Pikiran (*Idle Emotes & Thought Bubbles*)
* **Kebutuhan Pengguna:** Menghidupkan suasana saat pemain mendiamkan Kitsune di beranda tatami.
* **Solusi Desain:**
  * Setiap 30–60 detik saat menganggur, Kitsune menampilkan gelembung pikiran kecil di atas kepalanya:
    * Membayangkan sepotong Aburaage gurih (*Hunger < 50*)
    * Membayangkan bantal empuk (*Energy < 40*)
    * Membayangkan kembang api atau bunga sakura (*Happiness > 80*)
    * Mengantuk atau menggeliat santai.

---

## Fase 2: Pengayaan Gameplay & Kedalaman Emosional (Mid-Term)

Menambah variasi aktivitas harian agar pemain memiliki alasan untuk kembali membuka aplikasi beberapa kali dalam sehari.

### 2.1 Petualangan Berkelana Roh (*Kitsune O-dekake / Tabi*)
* **Mekanika:**
  * Pemain menyiapkan bekal perjalanan (Bento, jimat keberuntungan, dan payung bambu) di dalam tas Kitsune.
  * Kitsune berpamitan untuk menjelajahi hutan suci atau kuil rahasia di pegunungan selama rentang waktu tertentu (30 menit s.d 2 jam).
  * Di beranda tatami akan tampil catatan kecil di atas meja: *"Sedang berkelana ke Hutan Bambu Arashiyama..."*
* **Hadiah Kepulangan:**
  * Kitsune kembali membawakan oleh-oleh kartu pos lukisan kenangan seni Ukiyo-e eksklusif, koin Ryo langka, atau benih tanaman hias kuil.

### 2.2 Perluasan Area Santuari: Taman Kolam Koi & Pasir Zen
* **Desain Ruang Baru:**
  * Menambahkan tombol geser ke area luar beranda tatami: **Engawa & Taman Zen**.
  * **Kolam Ikan Koi:** Pemain dapat mengetuk permukaan air untuk menaburkan pakan pelet dan melihat ikan Koi berenang berkumpul.
  * **Pasir Batu Zen (Karesansui):** Pemain dapat menyisir pola pasir dengan ujung jari untuk meditasi ketenangan batin (+Happiness & +Discipline).

### 2.3 Mini-Game Ritme Taiko Festival Interaktif
* **Penyempurnaan:**
  * Mengubah simulasi Taiko saat ini menjadi mini-game ritme interaktif sederhana di mana drum drum merah (*Don*) dan biru (*Ka*) meluncur melintasi garis ketukan mengikuti tempo lagu festival Matsuri.
  * Tingkat kesulitan bervariatif (Santai, Bersemangat, Harmoni Kuil) dengan imbalan koin Ryo dan poin Ikatan Batin (*Kizuna*).

---

## Fase 3: Fitur Komunitas & Dinamika Musiman (Long-Term)

Mengembangkan Hagumi menjadi ekosistem pengalaman spiritual yang kaya dan dapat dirayakan bersama orang lain.

### 3.1 Kartu Paspor Ziarah Digital yang Dapat Dibagikan (*Spiritual Shrine Passport Card*)
* **Fitur:**
  * Mengonversi pencapaian ziarah, wujud ekor, cap stempel Hanko, dan elemen Kitsune menjadi kartu grafis berbingkai kayu tradisional beresolusi tinggi.
  * Pemain dapat mengunduh kartu tersebut dalam format `.png` dengan satu klik untuk dijadikan wallpaper ponsel atau dibagikan ke media sosial.

### 3.2 Siklus 4 Musim Real-Time (*Four Seasons Dynamic Ambience*)
* **Visual Dinamis Mengikuti Kalender Nyata:**
  * 🌸 **Musim Semi (Maret – Mei):** Angin semilir membawa kelopak bunga sakura merah muda berguguran di atas atap santuari.
  * 🎋 **Musim Panas (Juni – Agustus):** Suasana malam berhias kunang-kunang hijau berpendar dan festival kembang api Tanabata.
  * 🍁 **Musim Gugur (September – November):** Pepohonan di lereng Gunung Fuji berubah menjadi merah keemasan dengan daun Momiji berhamburan.
  * ❄️ **Musim Dingin (Desember – Februari):** Salju putih menumpuk di puncak Fuji dan genteng kuil, Kitsune mengenakan syal hangat di atas tatami.

### 3.3 Altar Papan Doa Ema Virtual Bersama (*Community Ema Tree*)
* **Fitur:**
  * Pohon suci di halaman kuil tempat para pemain dapat menggantungkan papan doa kayu (*Ema*) berisi harapan positif (misalnya: kesehatan, kelulusan, kedamaian keluarga).
  * Pemain lain yang berkunjung dapat membacanya dan memberikan "Lonceng Berkah" untuk saling menyemangati secara anonim dan hangat.

---

## Prinsip Desain & Batasan Arsitektur untuk Pengembangan Lanjutan

Dalam mengimplementasikan fitur-fitur di atas, pengembang wajib mematuhi panduan inti berikut:

1. **Prinsip Beban Ringan (Zero Heavy Assets):**
   * Pertahankan tradisi menggambar visual procedural via Canvas atau SVG ringan. Hindari mengimpor paket grafis bitmap/3D berat yang dapat merusak waktu pemuatan kilat aplikasi.
2. **Prinsip Wabi-Sabi & Keheningan:**
   * Jangan pernah menambahkan notifikasi agresif (*spam push notification*), iklan popup yang mengganggu, atau timer *pay-to-win*. Pengalaman Hagumi harus tetap tenang, meditatif, dan menghormati waktu pemain.
3. **Penyimpanan Aman & Terisolasi:**
   * Pertahankan kemampuan offline-first yang kuat sehingga pemain tetap dapat merawat Kitsune kesayangannya di mana pun tanpa kewajiban koneksi internet konstan.
