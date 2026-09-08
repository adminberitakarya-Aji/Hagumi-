# ⛩️ Dokumentasi Proyek HAGUMI (育み)
*The Sacred Kitsune Sanctuary & Zen Virtual Pet Experience*

Selamat datang di direktori dokumentasi resmi **HAGUMI (育み - Membesarkan / Mengasuh)**. Dokumentasi ini merangkum filosofi desain, arsitektur teknis, formula mekanika permainan, serta katalog fitur menyeluruh dari aplikasi.

---

## 📑 Daftar Isi Dokumentasi

| Dokumen | Deskripsi |
| :--- | :--- |
| [**01. Gambaran Umum & Filosofi (01_OVERVIEW.md)**](./01_OVERVIEW.md) | Visi proyek, filosofi estetika tradisional Jepang (*Wabi-Sabi*, *Miyabi*, *Ukiyo-e*), konsep roh rubah suci Inari, dan pilar pengalaman santuari. |
| [**02. Mekanika Permainan & Sistem Pertumbuhan (02_GAMEPLAY_MECHANICS.md)**](./02_GAMEPLAY_MECHANICS.md) | 6 stat vital & siklus peluruhan (*decay*), formula *Care Score*, peluruhan offline, kurva EXP `floor(40 × L^1.35 + 60)`, evolusi bercabang (*Kitsune Morphosis*: Tenko/Zenko/Yako/Nogitsune), dan sistem ikatan batin (*Kizuna*). Ditulis ulang dari kode aktual (Revisi 2). |
| [**03. Arsitektur Teknis & Mesin Audio-Sensor (03_ARCHITECTURE_AND_TECH_STACK.md)**](./03_ARCHITECTURE_AND_TECH_STACK.md) | Fondasi teknologi (React 18, TypeScript, Tailwind CSS, Motion), Web Audio Synthesizer (*Koto & Shakuhachi*), *Haptic Feedback Engine*, dan kamera *Parallax 2.5D* (Giroskop + Kursor). |
| [**04. Katalog Fitur & Aktivitas Santuari (04_FEATURES_AND_ACTIVITIES.md)**](./04_FEATURES_AND_ACTIVITIES.md) | Eksplorasi ruangan Tatami, panorama Gunung Fuji 4 siklus waktu, Kuil Inari & Papan Ema, Lemari Busana *Tansu*, Jurnal Roh, Paspor Ziarah, serta seluruh mini-game festival Matsuri. |
| [**05. Panduan Pengembang & Struktur Kode (05_CONTRIBUTING_AND_GUIDE.md)**](./05_CONTRIBUTING_AND_GUIDE.md) | Struktur berkas proyek, tata kelola state management, konvensi penulisan kode, alur build & deployment, serta peta jalan pengembangan berikutnya. |
| [**06. Panduan Pengguna Baru: 5 Fase Bermain (06_PANDUAN_PENGGUNA_BARU_5_FASE.md)**](./06_PANDUAN_PENGGUNA_BARU_5_FASE.md) | Langkah demi langkah (*step-by-step onboarding*) mulai dari pemilihan 6 elemen batu permata roh Hōju (宝珠), pengenalan vitals beranda, siklus makan/mandi/tidur, eksplorasi kuil matsuri, hingga evolusi dewasa. |
| [**07. Peta Jalan & Saran Pengembangan (07_PETA_JALAN_DAN_SARAN_PENGEMBANGAN.md)**](./07_PETA_JALAN_DAN_SARAN_PENGEMBANGAN.md) | Hasil audit menyeluruh sistem game beserta rincian rekomendasi peta jalan pengembangan 3 fase (*Quick Wins, Mid-Term, Long-Term*). |

---

## 🌸 Identitas Cepat Proyek
- **Nama Aplikasi**: Hagumi: Sacred Kitsune (育み)
- **Tema Utama**: Spiritual Zen Virtual Pet & Traditional Japanese Sanctuary
- **Target Platform**: Web Modern (Responsive Mobile & Desktop) dengan dukungan PWA & Sensor Giroskop
- **Lisensi**: Proyek Terbuka Berbasis AI Studio
