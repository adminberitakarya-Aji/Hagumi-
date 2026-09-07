# 🦊 HAGUMI (育み) — Master Game Development Roadmap & Architecture Blueprint

> **HAGUMI (育み)** adalah game virtual pet bertema mitologi rubah Jepang (*Kitsune*) yang memadukan nostalgia gameplay Tamagotchi klasik, visual pixel-art hangat berpadu estetika kertas washi & ukiyo-e, kedalaman evolusi mistis berdasarkan *Care Score*, elemen roh, dan kebijaksanaan spiritual.

---

## ⛩️ Status Progres Milestone

| Milestone | Nama & Fokus | Status | Target Deliverable |
|---|---|---|---|
| **M1** | **Playable Core** | ✅ Selesai | 6 Stat + Decay loop, Interaksi dasar (Makan, Mandi, Tidur, Rawat), Scene Rumah Tatami, Animasi Pixel Kitsune, Save/Load lokal |
| **M1.5** | **Onboarding & Altar Telur** | ✅ Selesai | Gerbang Torii, Altar Telur Suci, Pemilihan Elemen Jiwa, Layar Penamaan & Cap Hanko, Animasi Menetas (Hatching) |
| **M2** | **Full Game Loop & Festival** | ✅ Selesai | Mekanisme Kotoran (Poop/Unko), Penyakit & Obat Herbal (Yakusou), Mini-Game #1: *Kingyo-sukui*, Toko Tanuki & Koin Ryo |
| **M3** | **Sistem Evolusi Bercabang** | ✅ Selesai | Formula *Care Score*, 5 Tahap Pertumbuhan (Telur → Bayi/Kitsunebi → Anak → Remaja → Dewasa/Mistik), Layar Upacara Evolusi |
| **M4** | **Retensi & Aktivitas Ekstra** | ✅ Selesai | Kalkulasi Offline Progress (Simulasi saat pemain pergi) + Layar Ringkasan Kepulangan, Hadiah Kehadiran Harian, Mini-Game #2: *Wanage*, Mini-Game #3: *Kitsune Dash* |
| **M5** | **Audio, SFX & Visual Atmosphere** | ✅ Selesai | Web Audio API Retro 8-bit & Shamisen/Koto Synth, Siklus Waktu 4 Fase (Pagi, Siang, Sore, Malam), Partikel Cuaca |
| **M6** | **Companion Dialogue & AI Chat** | ✅ Selesai | Balon dialog kontekstual real-time, percakapan mendalam dengan Gemini API di Kuil Inari (Altar Doa Ema & Omikuji) |
| **M7** | **Memorial & Pohon Silsilah** | ✅ Selesai | Catatan silsilah rubah, album kenangan, cap hanko resmi, siklus reinkarnasi |
| **M8** | **UI/UX 1-Screen (No-Scroll) & Atmospheric Aesthetics** | ✅ Selesai | Redesain layout 100dvh pas satu layar tanpa scrollbar, latar belakang Tatami Sanctuary premium bertekstur anyaman igusa, sekat shoji berpendar, dan teras engawa |
| **M9** | **Autonomous Roaming & Behavior AI** | ✅ Selesai | Gerak bebas alami melintasi tatami (koordinat target acak berjangka), pembalikan arah hadap tubuh (flip), ayunan cakar berjalan (trotting paws), reaksi ketuk layar |
| **M9.5**| **Balanced EXP & Growth Progression** | ✅ Selesai | Formula eksponensial seimbang `floor(40 * L^1.35 + 60)`, multi-level up support, rebalans EXP seluruh aksi (bento, kuil, bersih-bersih, festival) |
| **M10**| **Kitsune Wardrobe & Accessories** | ✅ Selesai | Lemari Busana (*Kitsune Tansu*), aksesoris leher (*Suzu*, *Magatama*, syal Inari) & kepala (*Kitsune-men*, sakura, daun mistis), rendering dinamis di kanvas, fitting room live preview, sound effect lonceng suzu |
| **M10.5**| **Sanctuary Decoration & Tatami Customization** | ✅ Selesai | Pilihan variasi tikar tatami (Igusa, Ougon, Aizome, Sakura), gulungan lukisan dinding *Kakemono* (Fuku, Ai, Enso, Fuji), meja teh chabudai, bonsai, dupa koro, dan pancuran air bambu shishi-odoshi interaktif |
| **M10.8**| **Panorama Suci Gunung Fuji (霊峰富士)** | ✅ Selesai | Latar belakang beranda (*Engawa*) menghadap panorama Gunung Fuji bersalju megah dengan adaptasi 4 fase waktu (fajar Asahi, siang cerah, senja Aka-Fuji, malam bulan purnama), siluet Torii Inari, pagoda, dan guguran kelopak sakura |
| **M11**| **Expanded Matsuri & Lo-Fi Soundscape** | ✅ Selesai | Mini-Game *Taiko Rhythm Beat* (太鼓の達人) dengan ketukan DON & KA, highway nada interaktif, serta musik latar ambient kuil tradisional (Shakuhachi & Koto Synthesizer) yang menyesuaikan waktu |
| **M12**| **Buku Harian Roh & Cuaca Musiman (PWA)** | ✅ Selesai | Jurnal kenangan otomatis (*Memory Scroll* & Album Ukiyo-e), efek 4 cuaca musiman (Sakura, Kunang-kunang, Momiji merah, Salju Dingin), Mini-Game *Hanabi Maker*, dan Paspor Kuil (*Shrine Pass*) |
| **M13**| **Haptic Feedback & Transisi Pintu Shoji** | ✅ Selesai | Sistem getaran taktil haptic multi-preset (Lembut, Seimbang, Kuat), transisi layar tradisional pintu geser Shoji/Fusuma berbunyi kayu (*screen wipe*), HUD radial Kipas Sensu, dan interaksi perabot diegetik |
| **M14**| **PWA Standalone & Parallax Gyroscope** | 🔄 Terjadwal | Service worker offline-first, manifest PWA instalasi homescreen, dan efek parallax 2.5D kedalaman ruangan tatami |

---

## 🔄 Alur Keseluruhan Game (Comprehensive Game & System Flow)

```
                       ┌────────────────────────┐
                       │   MULAI / LOAD GAME    │
                       └───────────┬────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
           [Pet Belum Ada / Egg]         [Pet Sudah Ada]
                    │                             │
                    ▼                             ▼
       ┌────────────────────────┐    ┌───────────────────────────┐
       │   Altar Telur & Torii  │    │  Kalkulasi Waktu Offline  │
       │  - Pilih Elemen Jiwa   │    │  (Hunger/Energy Decay,    │
       │  - Tulis Nama & Hanko  │    │   Unko Spawning, Reward)  │
       │  - Upacara Penetasan   │    └─────────────┬─────────────┘
       └────────────┬───────────┘                  │
                    │                              ▼
                    │                 ┌──────────────────────────┐
                    │                 │  Layar Ringkasan Kembali │
                    │                 └────────────┬─────────────┘
                    │                              │
                    └──────────────┬───────────────┘
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │        PANGGUNG UTAMA: SANCTUARY TATAMI          │
          │   Layout 1 Halaman Pas (100dvh, Bebas Scroll)    │
          │   Latar Kayu Washi, Tikar Tatami, Lentera Andon  │
          └────────────────────────┬─────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────────┐       ┌─────────────────┐
│ STAT & DECAY │          │ AUTONOMOUS PET   │       │ DOK AKSI CEPAT  │
│ - Kenyang    │          │ - Gerak Jelajah  │       │ [1] Makan Bento │
│ - Energi     │◄────────►│ - Menoleh Kiri/  │◄─────►│ [2] Mandi/Sapu  │
│ - Bersih     │          │   Kanan (Flip)   │       │ [3] Tidur Futon │
│ - Bahagia    │          │ - Dekati Lentera/│       │ [4] Lemari/Tansu│
│ - Sehat      │          │   Bento/Pemain   │       │ [5] Kuil Inari  │
│ - Skor Kasih │          │ - Emosi & Animasi│       │ [6] Matsuri     │
│              │          │ - Aksesoris Busana│      │ [7] Toko Tanuki │
└──────────────┘          └──────────────────┘       │ [8] Buku Hanko  │
                                                     └────────┬────────┘
                                                              │
          ┌───────────────────────────────────────────────────┤
          ▼                                                   ▼
┌──────────────────┐                               ┌─────────────────────┐
│  KUIL INARI      │                               │ FESTIVAL MATSURI    │
│ - Omikuji Harian │                               │ - Kingyo-sukui      │
│ - Doa Permohonan │                               │ - Wanage (Gelang)   │
│ - AI Spirit Chat │                               │ - Kitsune Dash      │
│   (Gemini Cloud) │                               │ - Taiko Rhythm Beat │
└─────────┬────────┘                               └──────────┬──────────┘
          │ (Tambah EXP & Disiplin)                           │ (Koin Ryo & EXP)
          └────────────────────────┬──────────────────────────┘
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │          PERKEMBANGAN LEVEL & MILESTONE          │
          │     EXP Curve: EXP_req = floor(40 * L^1.35 + 60) │
          └────────────────────────┬─────────────────────────┘
                                   │
                                   ▼ (Syarat Tercapai: Level + Umur + Care)
          ┌──────────────────────────────────────────────────┐
          │               UPACARA EVOLUSI                    │
          │  - Bayi (Kitsunebi) ──► Ekor 1 (Kogitsune)       │
          │  - Ekor 1 ────────────► Ekor 3 (Mikitsune)       │
          │  - Ekor 3 ────────────► Ekor 5 (Gokitsune)       │
          │  - Ekor 5 ────────────► Ekor 9 (Zenko / Tenko /  │
          │                         Yako / Nogitsune)        │
          │  - Cap Hanko Emas & Lembar Silsilah Reinkarnasi  │
          └──────────────────────────────────────────────────┘
```

---

## 📈 Formula Alur Kenaikan Level (Leveling Curve & EXP Progression)

Sistem progresi level dirombak dari perhitungan datar sebelumnya (`level * 50`) menjadi **Kurva Eksponensial Bertahap (*Smooth Geometric Scaling*)** agar memberikan rasa pencapaian yang memuaskan dan menjaga retensi jangka panjang.

### 1. Formula Kebutuhan EXP
$$\text{EXP}_{\text{required}}(L) = \left\lfloor 40 \times L^{1.35} + 60 \right\rfloor$$

| Level Target ($L$) | EXP Dibutuhkan | Total Akumulasi EXP | Estimasi Waktu Capai | Fase Pertumbuhan |
|---|---|---|---|---|
| **Lv 1 → 2** | **100 EXP** | 100 EXP | ~10 - 15 Menit | Bayi Baru Menetas |
| **Lv 2 → 3** | **150 EXP** | 250 EXP | ~1 Jam | Bayi Bersemangat |
| **Lv 3 → 4** | **205 EXP** | 455 EXP | ~4 Jam (Hari ke-1) | *Milestone Evolusi: Ekor 1* |
| **Lv 5** | **330 EXP** | 990 EXP | Hari ke-2 | Anak Lincah |
| **Lv 8** | **550 EXP** | 2.300 EXP | Hari ke-4 | *Milestone Evolusi: Ekor 3* |
| **Lv 12** | **890 EXP** | 5.200 EXP | Minggu ke-1 | Remaja Belajar Sihir |
| **Lv 15** | **1.180 EXP** | 8.350 EXP | Minggu ke-2 | *Milestone Evolusi: Ekor 5* |
| **Lv 20** | **1.720 EXP** | 15.600 EXP | Minggu ke-3 | Penjaga Kuil Dewasa |
| **Lv 25** | **2.310 EXP** | 25.800 EXP | Bulan ke-1 | *Evolusi Mistik Puncak: Ekor 9* |
| **Lv 30+** | **2.950+ EXP** | 39.000+ EXP | Endgame | Roh Suci Abadi (*Kami*) |

### 2. Sumber Perolehan EXP (Actions & Rewards)
* **Elusan Penuh Kasih (Petting / Patting)**: $+5$ EXP (Cooling down 2 menit untuk mencegah eksploitasi spam).
* **Memberi Makanan Berkualitas (Bento/Shop)**:
  * Onigiri Biasa: $+10$ EXP
  * Aburaage (Tahu Manis Favorit): $+25$ EXP
  * Inari Sushi / Sakuramochi Mewah: $+35$ EXP
* **Kebersihan & Mandi Air Hangat**: $+15$ EXP saat membersihkan kotoran dan memandikan kitsune.
* **Mini-Game Matsuri**:
  * Skor Rendah: $+10$ EXP
  * Skor Sedang: $+25$ EXP
  * Skor Tertinggi / Menang Sempurna: $+50$ EXP
* **Ibadah Kuil Inari (Omikuji & Doa Harian)**: $+30$ EXP (sekali per hari).
* **Obrolan Bijak AI Companion**: $+15$ EXP (maksimal 3x per hari).

---

## 🦊 Sistem Gerak Dinamis Bebas (Autonomous Roaming & Behavior AI)

Masalah saat ini: **Kitsune hanya berdiam diri di koordinat tengah kanvas (center) secara monoton.**

### 1. State Machine Perilaku Kitsune
Kitsune akan dilengkapi sistem kecerdasan perilaku (*Autonomous Agent*) yang bergerak alami melintasi ruang tatami:

```
                  ┌──────────────┐
                  │  IDLE_STAND  │ (Bernapas, ekor melambai)
                  └──────┬───────┘
                         │ (Setelah 3-6 detik)
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
  │  WALK_ROAM  │ │  SIT_LOOK   │ │ APPROACH_OBJ │
  │ - Jalan     │ │ - Duduk     │ │ - Menghampiri│
  │   bebas     │ │ - Melirik   │ │   Lentera/   │
  │ - Flip kiri/│ │   ke arah   │ │   Bento/     │
  │   kanan     │ │   pemain    │ │   Futon      │
  └──────┬──────┘ └──────┬──────┘ └──────┬───────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
                  ┌──────────────┐
                  │ TARGET_REACH │ (Tiba di tujuan, reaksi senang/nguap)
                  └──────────────┘
```

### 2. Parameter Spasial & Logika Gerak
* **Tatami Bounded Box**: Batas jelajah aman di dalam kanvas:
  * $X_{\min} = 15\%$, $X_{\max} = 85\%$ dari lebar kanvas tatami.
  * $Y_{\min} = 45\%$, $Y_{\max} = 80\%$ (area perspektif tikar tatami bawah).
* **Facing Direction (Pembalikan Orientasi / Horizontal Flip)**:
  * Jika target posisi $X > X_{\text{saat ini}}$, rubah menoleh dan berjalan ke kanan (`scaleX = 1`).
  * Jika target posisi $X < X_{\text{saat ini}}$, rubah menoleh dan berjalan ke kiri (`scaleX = -1`).
* **Interaktivitas Sentuhan Pemain**:
  * Mengklik area tatami: Kitsune menoleh, terkejut gembira (*kon!*), dan berlari kecil menghampiri titik sentuhan jari/kursor.
* **Perilaku Kontekstual Berdasarkan State**:
  * **Waktu Makan**: Kitsune otomatis berjalan mendekati meja nampan bento.
  * **Waktu Tidur (Futon Aktif)**: Kitsune berjalan menuju kasur futon, berputar 1 lingkaran kecil, lalu meringkuk tidur.
  * **Malam Hari**: Mendekati lentera andon yang menyala hangat.

---

## 🎨 Redesain Antarmuka: 1 Layar Utuh & Estetika Sanctuary Premium

Masalah saat ini: **Aplikasi mengalami overflow vertikal (muncul scrollbar panjang di kanan) dan latar belakang hitam pekat tanpa nuansa.**

### 1. Prinsip 100dvh "One-Screen Applet" (Bebas Scroll)
* Seluruh tampilan dikunci secara ketat dalam `h-[100dvh] max-h-[100dvh] overflow-hidden`.
* **Struktur Grid 3-Tingkat Terukur**:
  1. **Header Profil & Vital Stats (Tinggi ~20%)**:
     * Banner nama, level bar ramping dengan persentase EXP.
     * Grid 6 status (Kenyang, Energi, Bersih, Bahagia, Sehat, Skor Kasih) dibuat kompak dengan ikon elegan tanpa memakan ruang berlebih.
     * Pill Koin Ryo, Indikator Waktu, dan Tombol Mute dalam 1 baris terpadu.
  2. **Panggung Peliharaan Utama / Tatami Canvas (Tinggi ~62%)**:
     * Fleksibel dan mengisi seluruh ruang sisa vertikal (`flex-1`).
     * Kanvas responsif yang merender tekstur tatami, bayangan halus, dan kitsune yang bebas menjelajah.
  3. **Dok Navigasi & Aksi Bawah (Tinggi ~18%)**:
     * Grid tombol aksi 4x2 atau 1 baris horizontal scrollable yang ramping, rapi, dan mudah dijangkau jempol (Thumb Zone).
     * Tombol didesain tanpa padding berlebihan agar tidak mendorong batas layar ke bawah.

### 2. Estetika Latar Belakang Tradisional Jepang (Bukan Hitam Polos)
Menggantikan warna hitam datar dengan nuansa **Kediaman Roh Kuil Inari (Traditional Washi & Hinoki Sanctuary)**:
* **Tekstur Tikar Tatami Halus**: Gradasi warna jerami lembut (keemasan di siang hari, kuning madu redup di senja, zaitun temaram di malam hari) berpadu garis lis tepi kain hitam (*tatami heri*).
* **Sekat Kayu Shoji & Fusuma**: Dinding belakang dihiasi kisi-kisi kertas washi berpendar lembut dengan siluet bambu/pinus di baliknya.
* **Pencahayaan Lentera Andon Realistis**:
  * Radial gradient hangat (`amber-500/20` hingga `transparent`) yang menyinari lantai kayu dan tatami di sekitar lentera.
  * Partikel debu emas/kunang-kunang melayang lembut di udara saat malam.
* **Perspektif Teras Engawa**: Tepi kayu jati/hinoki yang memisahkan bagian dalam kamar dengan taman luar kuil.

---

## 🗺️ Rencana Kerja Lanjutan (Future Phase Milestones)

### **Fase 4: Sanctuary & Customization Expansion (Q3 2026)**
* [x] **Sistem Renovasi Ruangan Tatami**:
  * ✅ Pilihan motif tikar tatami (Anyaman Igusa Hijau Segar, Emas Altar Ougon, Nila Samurai Aizome, Sutra Sakura).
  * ✅ Panel lukisan dinding gantung (*Kakemono*) yang bisa diganti (Kaligrafi Berkah Fuku, Kasih Sayang Ai, Lingkaran Zen Enso, Siluet Fuji).
  * ✅ Meja teh rendah chabudai dengan mangkuk matcha & wagashi, pohon bonsai pinus, tempat dupa koro berasap wangi, dan pancuran air bambu shishi-odoshi interaktif.
* [x] **Panorama Suci Gunung Fuji (霊峰富士) & Beranda Engawa**:
  * ✅ Siluet megah Gunung Fuji dengan puncak salju bergerigi abadi terlihat melintasi sekat shoji terbuka.
  * ✅ Adaptasi 4 fase waktu nyata (fajar emas Asahi, siang biru cerah, senja merah Aka-Fuji, malam bulan purnama mistis).
  * ✅ Awan melayang tradisional Kumogata, siluet Torii Inari, pagoda kuil, dan guguran kelopak sakura.
* [x] **Lemari Busana & Aksesoris Kitsune (Wardrobe)**:
  * ✅ Aksesoris leher: Pita bel emas (*Suzu*), kalung manik-manik batu giok (*Magatama*), syal merah kuil Inari.
  * ✅ Aksesoris kepala: Topeng festival setengah wajah (*Kitsune-men*), bunga sakura, daun mistis tanuki.

### **Fase 5: Deep Bonding & AI Companion 2.0 (Q4 2026)**
* [x] **Buku Harian Roh (Memory Scroll)**:
  * ✅ Jurnal otomatis yang mencatat momen berkesan (Kelahiran, Panorama Fuji, Hanabi Matsuri, Ikan Mas, Evolusi).
  * ✅ Galeri koleksi karya seni Ukiyo-e dengan unlock milestone & buku harian catatan personal dengan mood emoji (+25 EXP).
* [x] **Siklus Cuaca Musiman Ekstra (Seasonal Particles)**:
  * ✅ Efek visual musim di beranda & luar jendela Shoji: Guguran kelopak Sakura (Semi), Kunang-kunang Hotaru (Panas), Daun Momiji Merah (Gugur), dan Salju Tebal serta embun beku Engawa (Dingin).
  * ✅ Jimat penanda musim interaktif untuk beralih antar 4 musim secara instan.
* [x] **Memori Kontekstual Percakapan Kuil & Papan Doa Ema (絵馬)**:
  * ✅ Papan Doa Kayu Ema interaktif dengan kategori permohonan (Ikatan, Kesehatan, Rezeki, Kebijaksanaan, Kedamaian), pemberkatan spiritual AI (`/api/kitsune/ema-blessing`), serta bunyi genta kuil.
  * ✅ Dialog Kotodama Kuil Inari berdaya memori kontekstual: Kitsune mengenali panggilan pengasuh, makanan kesukaan jiwa (Aburaage), harapan di papan Ema, dan kondisi cuaca musim saat berbincang (`/api/kitsune/chat`).
  * ✅ Sistem Jenjang Ikatan Batin (*Kizuna Leveling* 1-5): dari Kenalan Kuil hingga Ikatan Mistis Abadi, perolehan poin batin dari interaksi kasih, menyuapkan makanan kesukaan (+15 poin), doa Ema (+30 poin), dan dialog batin (+10 poin).

### **Fase 6: Matsuri Expansions & Social Connectivity (Q1 2027)**
* [x] **Mini-Game Baru #4: Taiko Rhythm Beat (太鼓の達人)**:
  * ✅ Permainan ketukan drum tradisional Jepang mengikuti irama highway musik dengan hit DON (tengah) & KA (pinggir drum).
  * ✅ Sistem kombo, penilaian presisi (*良 Perfect, 可 Good, 不可 Miss*), feedback visual bergetar, dan reward EXP + Koin Ryo.
* [x] **Mini-Game Baru #5: Hanabi Maker**:
  * ✅ Meracik bubuk warna kembang api festival (Merah Enenra, Biru Suiryu, Emas Inari, Ungu Kitsune, Pelangi Niji).
  * ✅ Kanvas peluncuran kembang api dengan sintesis suara Web Audio (siulan desis peluncuran & ledakan partikel kembang api berkilau).
* [x] **Pertukaran Berkah Antar Pemain (Shrine Pass)**:
  * ✅ Paspor ziarah kuil resmi dengan kode kuil unik (`INARI-...`), tanggal berdiri, dan cap segel.
  * ✅ Eksplorasi kuil teman (Kuil Gunung Fuji, Kuil Seribu Gerbang Fushimi, Kuil Danau Bulan) dengan upacara pembakaran dupa doa & berkah Ryo/EXP.

### **Fase 7: Polish, Soundscape & Haptic Feedback (Q2 2027)**
* [x] **BGM Tradisional Dinamis (Shakuhachi & Koto Synthesizer)**:
  * ✅ Alunan instrumen Koto dan Shakuhachi yang lembut dan menenangkan, berganti melodi dan tangga nada pentatonik (*In-Sen & Hirajoshi*) sesuai waktu (fajar, siang, senja, malam).
  * ✅ Tombol toggle BGM interaktif di bilah atas dengan status animasi pendaran.
* [x] **Sistem Umpan Balik Taktil (Haptic Feedback Engine)**:
  * ✅ Umpan balik getaran responsif untuk aksi elusan, memandikan, menyuapkan makanan, level-up, transisi pintu shoji, dan kipas sensu.
  * ✅ Panel pengaturan taktil (`HapticSettingsModal.tsx`) dengan 4 profil sensitivitas: Mati (*Off*), Lembut (*Soft 0.6x*), Seimbang (*Medium 1.0x*), dan Kuat (*Strong 1.45x*).

### **Fase 8: Pro-Tier UI/UX Transformation & Diegetic Game World (Q3 2027)**
* [x] **Transisi Layar Tradisional Pintu Shoji/Fusuma (*Screen Wipe Transition*)**:
  * ✅ Transisi sinematik sepasang pintu geser kertas *Shoji/Fusuma* bertekstur washi menutup dari kiri-kanan dengan audio gesekan kayu *swoosh-clack*, menggantikan fade/pop-up standar saat membuka fitur santuari, kedai, dan ritual.
* [x] **Menu Aksi Kipas Lipat Tradisional (*Sensu Radial Fan HUD*)**:
  * ✅ Kipas Lipat Tradisional (*Sensu*) di sudut layar yang merekah melengkung (*fan-out*) dinamis dengan bilah bertekstur washi, kanji, dan audio kibasan kipas sutra.
  * ✅ Pengalih instan antara HUD Kipas Sensu radial dan bilah Dok Klasik 8-tombol di header.
* [x] **Antarmuka Diegetik Perabot Tatami (*In-World Diegetic Interactions*)**:
  * ✅ **Meja Teh (*Chabudai*)**: Sentuhan langsung membuka nampan bento & hidangan.
  * ✅ **Altar Dinding (*Kamidana*)**: Sentuhan langsung membuka Kuil Inari & altar doa Ema.
  * ✅ **Peti Kayu (*Tansu*)**: Sentuhan langsung membuka lemari busana & aksesoris Miyabi.
  * ✅ **Pancuran Bambu (*Shishi-odoshi*)**: Mengetuk pancuran menghasilkan suara benturan batu *clack* & cipratan air.
  * ✅ **Lentera Andon**: Mengklik lentera menyalakan/mematikan temaram api lentera.
* [x] **Interaktivitas Lantai Tatami (*Tatami Ripples & Pet Call*)**:
  * ✅ Sentuhan di mana saja pada lantai tatami memunculkan riak gelombang bertingkat (`🌸`, `✨`, `🐾`, `⛩️`, `🍃`), denting lonceng Suzu, getaran haptic, dan memanggil Kitsune untuk menoleh serta melompat gembira.
* [x] **Menu Terpadu Fitur Santuari (*SanctuaryMenuModal*)**:
  * ✅ Penyederhanaan header atas menjadi bersih dan lega, memusatkan akses Buku Harian, Paspor Ziarah, Hanabi Maker, Renovasi Tatami, Hanko, dan Haptic dalam satu hub jendela elegan.
* [x] **Penyempurnaan Altar Telur Suci (3-Ketukan Menetas)**:
  * ✅ Ambang batas menetas tepat 3 ketukan (`tapCount / 3`), dukungan klik langsung pada kanvas telur, dan tombol bantuan interaktif berjenjang.

### **Fase 9: PWA Standalone, Parallax 2.5D & Matsuri Expansion (Q4 2027)**
* [ ] **PWA Offline-First & Standalone Web App**:
  * Web App Manifest (`manifest.json`) dengan ikon Kitsune emas untuk instalasi langsung ke Homescreen Android/iOS tanpa bilah peramban.
  * Service Worker untuk penyimpanan aset lokal sehingga game dapat dimainkan offline.
* [ ] **Sensasi Kedalaman Parallax 2.5D (*Gyroscope & Cursor Parallax*)**:
  * Efek kedalaman 3 dimensi berlapis (layer depan: lampion & tiang beranda; layer tengah: tatami & Kitsune; layer belakang: panorama Fuji & awan kumogata) yang merespons gerak kursor mouse dan sensor kemiringan ponsel pintar.
* [ ] **Mini-Game Festival #6: Penangkap Kunang-Kunang (*Hotaru Catcher*)**:
  * Permainan malam menenangkan menangkap kunang-kunang berpendar di atas kolam teratai engawa untuk mengumpulkan bubuk cahaya roh.
* [ ] **Sinkronisasi Cloud Multi-Perangkat (Cloud Save)**:
  * Opsi penyimpanan profil Kitsune secara aman di cloud (Firebase Firestore) agar data ikatan batin (*Kizuna*) tidak hilang saat berganti perangkat.

---

## 🛠️ Ringkasan Eksekusi & Prioritas Lanjutan

### ✅ 15 Item Prioritas Utama (Telah Selesai Dikerjakan):
1. **Refactor Layout 1-Halaman (Zero-Scroll 100dvh)**:
   - ✅ Terkunci rapat dalam layout `100dvh` bebas scroll vertikal/horizontal di `TatamiRoom.tsx` dan `App.tsx`.
   - ✅ Header stat profil dipadatkan dengan status ringkas dan dok aksi bawah dirancang pas dengan jangkauan jari/layar tanpa mendorong batas tampilan.
2. **Implementasi Latar Sanctuary Tatami Premium**:
   - ✅ Mengganti latar hitam datar dengan visual ruangan tradisional Jepang: anyaman tikar *igusa tatami* dengan lis kain hitam (*tatami heri*), sekat jendela *shoji* berpendar lembut berbayang bambu, lantai kayu *hinoki/engawa*, dan pendaran cahaya lentera *andon*.
3. **Upgrade Engine Kanvas Kitsune (Autonomous Roaming & Behavior AI)**:
   - ✅ State machine jelajah mandiri di atas tatami (`x: 85–275, y: 165–205`) dengan jeda istirahat realistis di `KitsuneCanvas.tsx`.
   - ✅ Orientasi balik badan otomatis (*horizontal flip*) mengikuti arah jalan, animasi langkah kaki cakar depan (*reciprocating paws trot*), dan interaksi sentuhan panggil/elus langsung pada kanvas.
4. **Implementasi Kurva EXP Baru & Rebalans Pertumbuhan**:
   - ✅ Formula eksponensial seimbang $\text{EXP} = \lfloor 40 \times L^{1.35} + 60 \rfloor$ di `gameConfig.ts`.
   - ✅ Penambahan utilitas `getRequiredExp` & `addPetExp` dengan penanganan *multi-level up*.
   - ✅ Sinkronisasi bar level, sertifikat Hanko, dan penyeimbangan perolehan EXP di semua aktivitas (Bento, Cuci/Sapu, Bangun Tidur, Omikuji Kuil Inari, dan Festival Matsuri).
5. **Lemari Busana & Aksesoris Kitsune (Wardrobe & Accessories - Kitsune Tansu)**:
   - ✅ Katalog aksesoris terpadu leher (*Suzu* pita lonceng emas Inari, kalung giok *Magatama*, syal merah kuil Inari) dan kepala (*Kitsune-men*, sakura merah muda, daun mistis tanuki).
   - ✅ Rendering kanvas prosedural dinamis berlapis dengan animasi ayunan lonceng & ujung syal di `KitsuneCanvas.tsx`.
   - ✅ Modal lemari busana (`WardrobeModal.tsx`) berlatar kayu lemari washi dengan pratinjau langsung (*live fitting preview*), sound effect lonceng suzu & klik busana, serta transaksi koin Ryo dan syarat level.
   - ✅ Akses cepat 3 titik: tombol dok utama [4] Busana, peti lemari tansu di samping kanvas tatami, dan tombol pintasan di bilah atas / kedai Tanuki.
6. **Dekorasi & Kustomisasi Ruangan Tatami (Sanctuary Renovations)**:
   - ✅ Pilihan motif tikar tatami (Igusa Alami, Emas Ougon, Nila Aizome, Sutra Sakura) dengan efek visual real-time di lantai.
   - ✅ Gulungan gantung dinding (*Kakemono*) berganti dinamis (Fuku, Ai, Enso, Fuji).
   - ✅ Perabot & hiasan altar interaktif (Meja teh Chabudai dengan matcha, Bonsai cemara, Dupa Koro berasap, Pancuran bambu Shishi-odoshi berbunyi ketukan saat diklik).
   - ✅ Modal Kustomisasi Sanctuary (`SanctuaryDecorModal.tsx`) terhubung dengan dompet koin Ryo, level minimal, dan tersimpan otomatis (*persistent state*).
7. **Panorama Megah Bertema Gunung Fuji (霊峰富士) di Beranda Engawa**:
   - ✅ Siluet anggun Gunung Fuji bersalju (*Snow-capped Fuji*) membentang di luar sekat pintu geser Shoji.
   - ✅ Sistem pencahayaan dinamis 4 siklus waktu nyata: fajar Asahi keemasan, siang biru jernih cerah, senja legendaris *Aka-Fuji* (Gunung Fuji merah menyala), dan malam bulan sabit bertabur bintang spiritual.
   - ✅ Awan melayang tradisional *Kumogata*, gerbang Torii merah di kaki lereng pegunungan, pagoda kuil, dan kelopak bunga sakura melayang di udara.
8. **Ekspansi Festival Matsuri & Soundscape Tradisional**:
   - ✅ Mini-Game ke-4: **Taiko Rhythm Beat** (太鼓の達人) lengkap dengan highway nada, ketukan DON & KA, kombo, feedback getar, serta reward EXP & Ryo.
   - ✅ Synthesizer Audio Tradisional (Web Audio API) membawakan alunan alat musik klasik *Koto* dan seruling bambu *Shakuhachi* dengan tombol toggle BGM (🎵) di bilah atas.
9. **Buku Harian Roh (Memory Scroll & Album Ukiyo-e)**:
   - ✅ Gulungan kenangan terukir otomatis sesuai pencapaian milestone hidup kitsune.
   - ✅ Galeri seni Ukiyo-e autentik dan fitur jurnal buku harian pribadi berhadiah +25 EXP.
10. **Siklus Cuaca Musiman Ekstra (Seasonal Particles & Engawa Frost)**:
   - ✅ Partikel dinamis 4 musim: Kelopak Sakura (Semi), Kunang-kunang Hotaru (Panas), Daun Momiji Merah (Gugur), dan Hujan Salju Yuki (Dingin) dengan lapisan es di bibir teras Engawa.
   - ✅ Tombol jimat musim interaktif di teras untuk pergantian musim real-time.
11. **Mini-Game Hanabi Maker & Paspor Kuil (Shrine Pass)**:
   - ✅ Mini-game peluncuran kembang api interaktif di atas langit malam festival dengan sintesis audio Web Audio (suara siulan & ledakan kembang api).
   - ✅ Paspor kuil Inari unik pemain, pencarian kode kuil sahabat, dan upacara dupa ziarah berhadiah Ryo & EXP.
12. **Deep Bonding & AI Companion 2.0 (Memori Kontekstual & Papan Ema)**:
   - ✅ Papan Doa Kayu Ema (絵馬) interaktif dengan kategori permohonan, suara genta, dan pemberkatan spiritual AI Inari.
   - ✅ Dialog Jiwa Kotodama dengan memori kontekstual penuh: mengingat nama panggilan pengasuh, makanan kesukaan jiwa, harapan Ema, dan musim.
   - ✅ Sistem Ikatan Batin (Kizuna Leveling Lv. 1 - 5) dengan bar progres, milestone, dan reward poin batin dari interaksi kasih serta makanan favorit.
13. **Transisi Pintu Shoji & Kipas Sensu Radial Fan HUD**:
   - ✅ Transisi geser pintu washi Shoji/Fusuma berbunyi kayu (*swoosh-clack*) untuk pembukaan modal dan area.
   - ✅ Kipas Sensu radial dinamis di sudut kanan bawah dengan animasi busur merekah (*fan-out*) dan opsi mode dock klasik.
14. **Interaktivitas Perabot Diegetik & Sentuhan Lantai Tatami**:
   - ✅ Interaksi klik langsung pada meja Chabudai, altar Kamidana, peti Tansu, pancuran bambu Shishi-odoshi, dan lentera Andon.
   - ✅ Efek gelombang riak tatami bertingkat (`🌸`, `✨`, `🐾`, `⛩️`, `🍃`) saat lantai diketuk, diiringi bunyi Suzu dan Kitsune mendekat.
15. **Haptic Feedback Engine & Streamlined Sanctuary Menu**:
   - ✅ Pengaturan getaran haptik dengan 4 preset sensitivitas untuk perangkat seluler.
   - ✅ Header atas yang ramping dan lapang dengan pusat akses terpadu `Menu Fitur` (`🏮`).
   - ✅ Sinkronisasi penetasan telur 3-ketukan di Altar Kelahiran.

---

### 🚀 Target Prioritas Pengembangan Selanjutnya (Fase 9):
1. **Sensasi Kedalaman Parallax 2.5D (Gyroscope & Kursor)**:
   - ✅ **SELESAI**: Engine parallax multi-layer terintegrasi (`useParallax2D.ts`) dengan LERP 60 FPS untuk gerakan halus.
   - ✅ **Layering Kedalaman Berjenjang**:
     - *Background Terjauh*: Langit panorama, matahari/bulan, Gunung Fuji, awan mengambang, dahan pinus taman.
     - *Midground Belakang*: Kisi-kisi shoji bambu, tiang kayu engawa, gulungan lukisan kakemono, shishi-odoshi.
     - *Dasar Ruangan*: Anyaman tikar tatami dengan perspektif 3D yang condong mengikuti sudut pandang.
     - *Subjek*: Karakter Kitsune roh dengan respon pergeseran alami di tengah tatami.
     - *Foreground Terdepan*: Lentera Andon bercahaya dan peti lemari busana Tansu dengan pergeseran paralaks terkuat.
   - ✅ **Dukungan Sensor Ganda**:
     - *Desktop*: Pelacakan gerakan pointer mouse dinamis ternormalisasi (-1 s/d 1).
     - *Mobile*: Integrasi sensor `DeviceOrientationEvent` (Alpha/Beta/Gamma tilt) dengan tombol izin eksplisit iOS DeviceOrientation API.
   - ✅ **Modal Pengaturan & Kontrol UI**:
     - Tombol cepat `🪞 2.5D` di bilah atas santuari dan entri menu di `SanctuaryMenuModal`.
     - `ParallaxSettingsModal` dengan 3 mode (Dinamis 100%, Lembut 50%, Nonaktif), preview kalibrasi gyroscope real-time visual, dan indikator status sensor.
2. **Instalasi PWA Standalone & Dukungan Offline Penuh**:
   - Pembuatan `manifest.json` dan Service Worker agar aplikasi dapat diinstal ke homescreen perangkat seluler layaknya aplikasi native.
3. **Mini-Game Festival #6: Penangkap Kunang-Kunang (*Hotaru Catcher*)**:
   - Aktivitas menangkap kunang-kunang malam di taman engawa untuk mendapatkan koin Ryo dan debu roh.
4. **Cloud Save & Sinkronisasi Lintas Perangkat**:
   - Integrasi Firebase Firestore untuk sinkronisasi akun dan profil Kitsune antar peramban dan perangkat.
