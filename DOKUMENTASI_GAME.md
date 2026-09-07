# 📖 DOKUMENTASI LENGKAP GAME HAGUMI (育み) - PET SPIRIT KITSUNE

Dokumentasi ini disusun sebagai acuan pengujian (*trial*), pemahaman mekanisme (*gameplay mechanics*), dan panduan alur fitur (*feature flow*) bagi tim pengembang dan tim penguji (*QA/Tester*). Seluruh parameter, formula, dan alur di bawah ini **100% selaras dengan codebase yang aktif saat ini**.

---

## ⛩️ DAFTAR ISI
1. [Konsep & Elemen Spiritual Kitsune](#1-konsep--elemen-spiritual-kitsune)
2. [Sistem Statistik Inti (Vitals) & Rumus Penurunannya](#2-sistem-statistik-inti-vitals--rumus-penurunannya)
3. [Alur & Mekanika Aktivitas Utama](#3-alur--mekanika-aktivitas-utama)
   - [A. Makan (Bento Dining & Feeding)](#a-makan-bento-dining--feeding)
   - [B. Mandi & Kebersihan (Onsen Bath & Poop Sweeping)](#b-mandi--kebersihan-onsen-bath--poop-sweeping)
   - [C. Tidur (Kamar Peraduan Futon & Aturan Khusus Mode Tidur)](#c-tidur-kamar-peraduan-futon--aturan-khusus-mode-tidur)
   - [D. Busana & Lemari Aksesori (Wardrobe)](#d-busana--lemari-aksesori-wardrobe)
   - [E. Kuil Inari & Paspor Peziarah (Shrine & Pilgrimage)](#e-kuil-inari--paspor-peziarah-shrine--pilgrimage)
   - [F. Festival (Matsuri Games & Hanabi Fireworks Maker)](#f-festival-matsuri-games--hanabi-fireworks-maker)
   - [G. Toko Tanuki Konbini](#g-toko-tanuki-konbini)
4. [Menu & Fitur Pendukung Santuari](#4-menu--fitur-pendukung-santuari)
   - [Buku Harian Roh & Catatan Kenangan Kustom](#buku-harian-roh--catatan-kenangan-kustom)
   - [Album Hanko (Cap Kayu Segel Merah)](#album-hanko-cap-kayu-segel-merah)
   - [Dekorasi Santuari Tatami (Renovasi Ruangan)](#dekorasi-santuari-tatami-renovasi-ruangan)
   - [Siklus 4 Musim Tradisional (Haru, Natsu, Aki, Fuyu)](#siklus-4-musim-tradisional-haru-natsu-aki-fuyu)
5. [Sistem Evolusi & Percabangan Wujud Dewasa](#5-sistem-evolusi--percabangan-wujud-dewasa)
6. [Aturan Waktu (Day & Night) Serta Sistem Audio/Haptik](#6-aturan-waktu-day--night-serta-sistem-audiohaptik)
7. [Checklist Skenario Pengujian untuk Tim (Trial Guide)](#7-checklist-skenario-pengujian-untuk-tim-trial-guide)

---

## 1. Konsep & Elemen Spiritual Kitsune

Pemain merawat seekor roh rubah suci (*Kitsune*) yang menetas dari telur kuil Inari. Terdapat **6 Pilihan Elemen Roh**:
1. **Api Merah (*Hinote* - 火):** Berani, hangat, berorientasi energi perlindungan.
2. **Air Embun (*Mizu* - 水):** Tenang, bijaksana, aura sejuk penyembuh hati.
3. **Petir Kilat (*Ikazuchi* - 雷):** Lincah, enerjik, percikan listrik emas.
4. **Angin Semilir (*Kaze* - 風):** Periang, bebas, melompat ringan seperti daun tertiup angin.
5. **Cahaya Suci (*Hikari* - 光):** Mulia, berkah surgawi Inari, pembawa keberuntungan.
6. **Bayangan Mistik (*Kage* - 影):** Cerdik, misterius, mahir seni ilusi malam.

---

## 2. Sistem Statistik Inti (Vitals) & Rumus Penurunannya

Permainan berjalan secara waktu-nyata (*real-time game loop*) yang memeriksa status setiap **10 detik**:

| Nama Status | Rentang | Penurunan Saat Bangun | Penurunan Saat Tidur | Efek Ambang Kritis | Solusi / Pemulihan |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Kenyang (Hunger)** | 0 – 100 | -0.12 / 10s (~0.72%/mnt) | -0.04 / 10s | Jika < 25: Bahagia turun & Care Mistake naik.<br>Jika < 15: Darah Sehat turun (-0.4/10s). | Makan Bento (Onigiri, Inari Sushi, Aburaage) |
| **Energi (Energy)** | 0 – 100 | -0.15 / 10s | **+1.1 / 10s** (Regenerasi pulih) | Jika < 20: Bahagia turun perlahan. | Tidur di Kamar Futon (15 Menit) / Minum Ocha |
| **Bersih (Cleanliness)**| 0 – 100 | -0.12 / 10s | -0.12 / 10s | Jika < 20 atau Kotoran Poop ≥ 3: **Peluang Sakit 10% per tick**. | Mandi Onsen (+100 Bersih) / Sapu kotoran |
| **Bahagia (Happiness)**| 0 – 100 | Stabil | Stabil | Menurun jika lapar, kotor, lelah, atau sakit. | Dielus, diberi camilan manis, main kembang api |
| **Sehat (Health)** | 0 – 100 | Stabil | Stabil | Menurun drastis saat sakit (-0.8/10s). Jika sehat & kenyang > 60: pulih alami (+0.3/10s). | Ramuan Herbal *Yakusou* atau Jimat *Omamori* |
| **Ikatan Batin (Kasih / Kizuna)** | 0 – 850+ | *Tidak menurun* | *Tidak menurun* | Menentukan level kedekatan emosional dan membuka dialog serta perk khusus. | Elus kepala (+batin), beri makan favorit, catat diary |
| **Disiplin (Discipline)**| 0 – 100 | Terjaga | Terjaga | Menentukan cabang evolusi ke arah Zenko (kebajikan) atau Yako (liar). | Pelatihan teratur, jadwal tidur tertib |

### 💩 Mekanisme Kotoran (*Poop*) & Penyakit (*Sickness*)
* **Kotoran Tatami:** Jika status kenyang > 30 dan sedang tidak tidur, terdapat peluang (8% per tick) muncul kotoran di lantai tatami (maksimal 4 tumpukan).
* **Sapu Cepat:** Mengklik tombol *"Sapu Kotoran"* memberikan **+20 EXP** dan membersihkan lantai.
* **Sakit (*Sick*):** Jika kebersihan < 20 atau ada 3 kotoran yang diabaikan, Kitsune jatuh sakit. Bulunya menjadi redup dan indikator demam muncul. Harus disembuhkan dengan **Ramuan Herbal Kuil (Yakusou)** dari Toko Tanuki.

### 🏆 Rumus Skor Pengasuhan (*Care Score*)
```text
Care Score = Rata-rata(Kenyang + Energi + Bersih + Bahagia + Sehat) - (Care Mistakes × 0.5)
```
*Rentang:* 10 hingga 100. Skor ini menentukan wujud evolusi fase dewasa Kitsune!

---

## 3. Alur & Mekanika Aktivitas Utama

### A. Makan (Bento Dining & Feeding)
* **Cara Membuka:** Klik ikon Onigiri 🍙 di bilah menu bawah atau *Sensu Fan HUD*.
* **Menu Makanan & Dampaknya:**
  * **Aburaage (油揚げ - Tahu Goreng Gurih):** Makanan legendaris favorit rubah (+35 Kenyang, +30 Bahagia, +30 EXP) - Biaya: 15 Ryo.
  * **Onigiri Nori (おにぎり):** Nasi kepal hangat (+25 Kenyang, +10 Bahagia, +15 EXP) - Biaya: 10 Ryo.
  * **Inari Sushi (稲荷寿司):** Nasi ketan kantung tahu (+40 Kenyang, +35 Bahagia, +35 EXP) - Biaya: 22 Ryo.
  * **Sanshoku Dango (三色団子):** Dango manis kenyal 3 warna (+15 Kenyang, +25 Bahagia, +20 EXP) - Biaya: 12 Ryo.
  * **Sakura Mochi (桜餅):** Kue beras isi kacang merah (+20 Kenyang, +28 Bahagia, +25 EXP) - Biaya: 18 Ryo.
  * **Matcha Ocha Panas (温かい抹茶):** Teh hijau (+10 Kenyang, +18 Bahagia, +20 Energi, +5 Bersih, +15 EXP) - Biaya: 8 Ryo.
  * **Ramuan Herbal Yakusou (薬草茶):** Obat penyembuh penyakit (+45 Sehat, Menyembuhkan Sakit, +25 EXP) - Biaya: 25 Ryo.
  * **Jimat Omamori (御守り):** Jimat berkah (+50 Sehat, +35 Bahagia, +15 Disiplin, Menyembuhkan Sakit, +45 EXP) - Biaya: 40 Ryo.
* **Interaksi Suapan:** Makanan disajikan di atas meja, pemain menyuapi dengan animasi 3 gigitan bertahap (100% → 60% → 30% → Habis) diiringi efek remahan bento dan partikel hati kasih.

---

### B. Mandi & Kebersihan (Onsen Bath & Poop Sweeping)
* **Cara Membuka:** Klik ikon Air Mancur ♨️ di bilah bawah.
* **4 Tahapan Interaktif di Kolam Air Hangat Onsen:**
  1. **Gosok Sabun (*Scrub Soap*):** Menggosok busa harum melati ke tubuh Kitsune.
  2. **Guyur Gayung Kayu (*Water Ladle*):** Mengguyurkan air pegunungan hangat untuk membilas busa.
  3. **Rendam Relaksasi (*Soak Bath*):** Kitsune berendam tenang menikmati uap air onsen.
  4. **Keringkan Handuk (*Towel Dry*):** Mengeringkan bulu hingga mengembang halus berkilau.
* **Hasil:** Kebersihan langsung pulih **100%**, mendapatkan **+35 EXP** dan **+20 Bahagia**.

---

### C. Tidur (Kamar Peraduan Futon & Aturan Khusus Mode Tidur)
* **Durasi Tidur:** **15 Menit (900 detik)**.
* **Alur Transisi Tidur:**
  1. Pemain mengklik tombol tidur (ikon Kasur Futon 🛏️) di beranda.
  2. Dialog konfirmasi muncul: *"Rehatkan Kitsune di Kamar Peraduan Futon selama 15 menit?"*
  3. Saat pemain memilih **"💤 Ya, Tidurkan (15 Menit)"**:
     - Status tidur aktif (`pet.isSleeping = true`, timer 15 menit berjalan).
     - Layar otomatis menampilkan transisi pintu geser kayu *Shoji* yang halus.
     - Pemain **langsung masuk ke dalam Kamar Peraduan Futon (*Bedroom Scene*)**.
* **Kondisi Khusus Mode Tidur Aktif:**
  * **Otomatis Masuk Kamar Tidur:** Jika aplikasi baru dibuka atau direfresh saat timer tidur masih aktif, halaman yang pertama kali menyambut pemain adalah **Kamar Peraduan Futon**.
  * **Bebas Keluar ke Beranda:** Di pojok kanan atas kamar peraduan, terdapat tombol **`[ ← Ke Beranda ]`**. Pemain tetap bisa kembali ke beranda tatami kapan saja (misal untuk menyetel musik kuil, melihat pemandangan taman, atau berbelanja).
  * **Kitsune Tidak Ada di Beranda (Konsep Keberadaan Nyata):** Saat mode tidur aktif dan pemain berada di beranda, wujud Kitsune **tidak muncul** di lantai tatami karena secara fisik ia sedang tidur di kamar peraduan. Sebagai gantinya, tampil ornamen zen estetik:
    > **🛏️ [Nama Kitsune] sedang di Kamar Peraduan**  
    > *Beranda tatami sedang hening & tenang.*  
    > **[ Tengok ke Kamar ⏱️ mm:ss ]**
    *Pemain cukup mengklik ornamen tersebut untuk kembali menengok Kitsune di kamar peraduan.*
  * **Perlindungan Tidur:** Selama tidur, tombol makan dan mandi diistirahatkan sejenak agar tidur Kitsune tidak terganggu.
  * **Bangun Tidur:** Pemain dapat menunggu 15 menit hingga selesai otomatis, atau menekan tombol bangun manual jika ingin segera mengajaknya bermain kembali.

---

### D. Busana & Lemari Aksesori (Wardrobe)
* **Cara Membuka:** Klik menu Busana 👘 di Sensu Fan HUD atau menu santuari.
* **Katalog Aksesori Leher (首飾り):**
  * Tanpa Aksesoris Leher (Gratis)
  * Pita Lonceng Emas (*Suzu* - 40 Ryo, Syarat: Lv 2)
  * Kalung Giok Magatama (*Magatama* - 65 Ryo, Syarat: Lv 4)
  * Syal Merah Inari (*Inari Erimaki* - 50 Ryo, Syarat: Lv 3)
  * Tali Suci Shimenawa (*Shimenawa* - 80 Ryo, Syarat: Lv 5)
* **Katalog Hiasan Kepala (頭飾り):**
  * Tanpa Hiasan Kepala (Gratis)
  * Jepit Bunga Sakura (*Sakura Pin* - 45 Ryo, Syarat: Lv 2)
  * Topeng Rubah (*Kitsune-men* - 75 Ryo, Syarat: Lv 3)
  * Daun Mistis Tanuki (*Henka no Ko-noha* - 35 Ryo, Syarat: Lv 1)
* Semua aksesori yang dibeli langsung terpasang pada wujud kanvas Kitsune secara waktu-nyata.

---

### E. Kuil Inari & Paspor Peziarah (Shrine & Pilgrimage)
* **Cara Membuka:** Klik ikon Kuil Torii ⛩️ di bilah bawah.
* **3 Aktivitas Utama di Kuil:**
  1. **Doa Altar & Lonceng Suzu:** Pemain membunyikan lonceng perunggu kuil dan menarik ramalan **Omikuji** (Mulai dari *Dai-Kichi / Berkah Agung* hingga *Kichi*) yang memberikan berkah koin serta syair nasehat spiritual.
  2. **Papan Doa Ema (絵馬):** Pemain dapat menuliskan doa dan harapan tulus. Doa ini disimpan dan sesekali akan disebut oleh Kitsune dalam dialog batinnya.
  3. **Paspor Peziarah (Shrine Pass):** Pemain memiliki kode kuil unik dan dapat berziarah harian ke 5 Kuil Spiritual legendaris:
     * *Kuil Ribuan Gerbang Fushimi (Kyoto)* → Hadiah: Jimat Berkah Emas (+10 Ryo, +50 EXP).
     * *Kuil Bunga Krisan Kasama (Hitachi)* → Hadiah: Inari Bento (+15 Bahagia, +40 Kenyang).
     * *Kuil Tebing Merah Yutoku (Hizen)* → Hadiah: Air Embun Surga (+100 Bersih, +35 EXP).
     * *Kuil Ombak Motonosumi (Nagato)* → Hadiah: Kipas Semilir (+20 Energi, +25 EXP).
     * *Kuil Bukit Taikodani (Tsuwano)* → Hadiah: Batu Halilintar (+12 Ryo, +60 EXP).

---

### F. Festival (Matsuri Games & Hanabi Fireworks Maker)
* **Cara Membuka:** Klik ikon Lampion Matsuri 🏮.
* **Aktivitas Festival:**
  * **Hanabi Fireworks Maker (Pesta Kembang Api):** Pemain meracik formula bubuk kembang api tradisional di tabung peluncur lalu menyalakannya ke langit malam Gunung Fuji (+40 EXP, koin hadiah, dan membuka gulungan lukisan memori Hanabi).
  * **Kingyo Sukui (Tangkap Ikan Mas):** Permainan ketangkasan menangkap ikan mas dengan jaring kertas washi tanpa merobek kertasnya.
  * **Tabuhan Taiko Matsuri:** Mengikuti ritme tabuhan beduk festival untuk melatih ketangkasan dan kegembiraan Kitsune.

---

### G. Toko Tanuki Konbini
* **Cara Membuka:** Klik ikon Belanja 🛍️.
* **Jam Operasional Toko:** Pukul **08.00 – 22.00** (Jika datang di luar jam ini, pemain dapat mengetuk pintu darurat).
* **Fitur Toko:**
  * Pembelian seluruh item bento, makanan penutup, obat-obatan, dan jimat kuil.
  * Penukaran koin Ryo hasil ziarah dan mini-game.
  * Tampilan toko menyesuaikan waktu lokal (siang/malam).

---

## 4. Menu & Fitur Pendukung Santuari

### Buku Harian Roh & Catatan Kenangan Kustom
* **Galeri Lukisan Ukiyo-e (Memory Scroll):** Terdapat 9 kenangan agung yang terbuka bertahap:
  1. *Kelahiran dari Telur Suci Inari*
  2. *Menatap Puncak Salju Reihō Fuji*
  3. *Upacara Teh di Atas Tatami*
  4. *Pemandian Air Hangat Kolam Kuil*
  5. *Tumbuhnya Ekor Roh Kedua*
  6. *Doa Restu & Gulungan Emas Omikuji*
  7. *Juara Festival Tabuhan Taiko Matsuri*
  8. *Pesta Bunga Api Hanabi di Langit Malam*
  9. *Kebangkitan Sembilan Ekor Kyubi no Kitsune*
* **Buku Harian Kustom:** Pemain dapat menulis catatan refleksi harian disertai pilihan emoji suasana hati (+25 EXP per catatan).

### Album Hanko (Cap Kayu Segel Merah)
* Cap stempel kayu tradisional Jepang berukir kanji keberuntungan:
  * 福 (*Fuku* - Keberuntungan), 寿 (*Kotobuki* - Panjang Umur), 絆 (*Kizuna* - Ikatan Kasih), 心 (*Kokoro* - Hati Tulus), 夢 (*Yume* - Impian), 狐 (*Kitsune* - Roh Rubah), 光 (*Hikari* - Cahaya), 和 (*Wa* - Harmoni).

### Dekorasi Santuari Tatami (Renovasi Ruangan)
Pemain dapat merombak tampilan ruangan beranda tatami:
* **Tikar Tatami:** Igusa Tradisional, Jerami Emas Musim Gugur, Indigo Celup Nila, atau Washi Merah Sakura.
* **Gulungan Dinding (Kakemono):** Berkah Fuku (福), Kasih Asuhan Ji-ai (慈愛), Lingkaran Zen Enso (円相), atau Pemandangan Fuji Suci.
* **Aksen Sudut (Zashiki):** Ruang Lapang Bebas, Meja Rendah Chabudai, Bonsai Pinus Abadi, Pedupaan Roh Koro, atau Pancuran Bambu Shishi-odoshi.

### Siklus 4 Musim Tradisional (Haru, Natsu, Aki, Fuyu)
Dapat berganti otomatis atau diganti manual dengan tombol siklus musim (pintu Shoji mengusap layar):
* **🌸 Musim Semi (Haru):** Guguran kelopak bunga sakura merah muda lembut.
* **🍃 Musim Panas (Natsu):** Cahaya kunang-kunang *Hotaru* berpendar di malam hari.
* **🍁 Musim Gugur (Aki):** Daun *Momiji* merah jingga melayang anggun.
* **❄️ Musim Dingin (Fuyu):** Butiran salju putih turun di lereng bukit kuil.

---

## 5. Sistem Evolusi & Percabangan Wujud Dewasa

Formula EXP Seimbang:  
$$\text{EXP}_{\text{required}}(L) = \lfloor 40 \times (L^{1.35}) + 60 \rfloor$$  
*(Level 1: 100 EXP, Level 2: 162 EXP, Level 3: 236 EXP, dst)*.

### 🧬 Alur 6 Tahap Evolusi
1. **Telur Suci (*Egg* - 霊卵):** Diinkubasi di Altar Torii dengan mengelus cangkang hingga retak.
2. **Bayi (*Kitsunebi* - 狐火, Level 1):** Gumpalan api roh mungil yang hangat (Ekor 1).
3. **Anak (*Kogitsune* - 子狐, Level 3, Umur ≥ 1 Hari):** Anak rubah kecil lincah berekor ganda (Ekor 2).
4. **Remaja (*Wakahitsune* - 若狐, Level 6, Umur ≥ 3 Hari):** Rubah muda mahir seni ilusi cahaya (Ekor 3).
5. **Dewasa / Mistik (Level 10, Umur ≥ 5 Hari):** Terbagi menjadi **4 Percabangan Berdasarkan Cara Pengasuhan**:
   * **Tenko (天狐 - Rubah Surgawi 9 Ekor):**  
     *Syarat:* **Care Score ≥ 85**. Wujud tertinggi paling agung pembawa berkah surgawi abadi.
   * **Zenko (善狐 - Rubah Putih Kebajikan 7 Ekor):**  
     *Syarat:* **Care Score ≥ 70 dan Disiplin ≥ 60**. Rubah putih penolong setia pembawa kedamaian.
   * **Yako (野狐 - Rubah Liar Cerdik 5 Ekor):**  
     *Syarat:* **Care Score ≥ 50**. Rubah jenaka berjiwa bebas yang gemar bermain teka-teki.
   * **Nogitsune (野狐 - Rubah Rimba Mandiri 4 Ekor):**  
     *Syarat:* **Care Score < 50**. Rubah tangguh yang mandiri mengarungi lebatnya hutan.

---

## 6. Aturan Waktu (Day & Night) Serta Sistem Audio/Haptik

### ⏰ Kesepakatan Waktu Aplikasi
Sesuai kesepakatan final, pembagian waktu lokal di seluruh ruangan, toko, kolam onsen, dan kamar tidur adalah:
* **06.00 – 17.59 : DAY (Siang)**
* **18.00 – 05.59 : NIGHT (Malam)**

*Catatan:* Pada pukul 16.04 (sore), latar belakang tetap menampilkan suasana siang/sore alami (bukan malam gulita).

### 🎵 Sistem Audio Tradisional (Web Audio API)
* **BGM Kuil:** Musik instrumen tiup bambu *Shakuhachi* dan petikan senar *Koto* yang damai (dapat di-pause/play melalui tombol nada 🎵).
* **Efek Suara Realistis:** Suara pintu geser Shoji kayu, gemerincing lonceng kuil Suzu, suara makan renyah, guyuran air onsen, kepakan kipas Sensu, desau selimut futon, hingga suara dengkuran napas tidur lembut.

### 📳 Haptic Feedback (Getaran Sentuh Ponsel)
Dapat diatur melalui tombol pengaturan gerigi (3 opsi: Ringan, Sedang, Kuat). Memberi getaran halus saat mengelus Kitsune, menggosok sabun onsen, atau mengetuk tatami.

### 📱 2.5D Parallax Gyroscope & Cursor
Latar belakang ruangan bergeser dinamis mengikuti gerakan kursor mouse (di desktop) atau kemiringan orientasi sensor *Gyroscope* ponsel.

---

## 7. Checklist Skenario Pengujian untuk Tim (Trial Guide)

Gunakan checklist ini saat melakukan *playtest* bersama tim:

- [ ] **Uji Kelahiran Telur:** Ketuk telur beberapa kali hingga bar retakan penuh dan Kitsunebi menetas.
- [ ] **Uji Makan Bento:** Beli *Onigiri* atau *Aburaage*, suapkan 3 kali hingga habis, pastikan Kenyang dan EXP bertambah.
- [ ] **Uji Mandi Onsen:** Masuk ke Onsen, lakukan 4 tahap (gosok sabun, guyur, rendam, handuk), pastikan Kebersihan kembali ke 100%.
- [ ] **Uji Sapu Kotoran:** Tunggu kotoran muncul di tatami, klik tombol sapu kotoran, verifikasi kotoran hilang dan EXP bertambah +20.
- [ ] **Uji Alur Masuk Tidur:**
  1. Klik menu tidur di beranda, konfirmasi 15 menit.
  2. Pastikan pintu Shoji menutup dan otomatis membuka **Kamar Peraduan Futon**.
  3. Periksa penghitung waktu mundur 15 menit dan partikel tidur *Zzz*.
- [ ] **Uji Alur Beranda Saat Tidur (Pro Mode):**
  1. Di kamar tidur, klik tombol `[ ← Ke Beranda ]`.
  2. Pastikan beranda tatami terbuka dengan hening.
  3. Pastikan **wujud Kitsune TIDAK ADA** di lantai beranda.
  4. Pastikan kartu ornamen *"Kitsune sedang di Kamar Peraduan"* tampil lengkap dengan tombol *"Tengok ke Kamar"*.
  5. Klik tombol *"Tengok ke Kamar"*, pastikan kembali ke kamar tidur dengan mulus.
- [ ] **Uji Mode Tidur Saat Refresh:** Muat ulang (F5) browser saat tidur aktif, pastikan halaman yang langsung terbuka adalah Kamar Peraduan Futon.
- [ ] **Uji Jam Siang/Malam:** Periksa apakah pada jam 06.00-17.59 latar belakang adalah Day, dan 18.00-05.59 latar belakang adalah Night.
- [ ] **Uji Ziarah Kuil:** Kunjungi salah satu kuil di Paspor Peziarah, klaim berkah harian, pastikan koin dan EXP bertambah.
- [ ] **Uji Busana:** Beli *Jepit Bunga Sakura* atau *Pita Lonceng Suzu*, pastikan aksesori langsung terpasang pada gambar Kitsune.
- [ ] **Uji Kembang Api Hanabi:** Luncurkan kembang api matsuri, periksa apakah gulungan kenangan Hanabi terbuka di Buku Harian.
