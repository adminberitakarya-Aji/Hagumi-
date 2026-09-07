# 🦊 02. Mekanika Permainan & Sistem Pertumbuhan (Gameplay Mechanics)

Dokumen ini menjelaskan model matematis, siklus status (*stats loop*), sistem evolusi ekor, dan perhitungan skor pengasuhan (*Care Score*) yang menggerakkan siklus kehidupan Kitsune di Hagumi.

---

## 📊 1. Enam Status Vital Utama (*Core Vital Stats*)

Setiap Kitsune memiliki 6 indikator vital yang berfluktuasi antara nilai **0 hingga 100**:

| Status Vital | Kanji | Fungsi & Kebutuhan | Tindakan Pemulihan |
| :--- | :---: | :--- | :--- |
| **Kenyang (Hunger)** | 満腹 | Menjaga energi fisik dan kelangsungan hidup harian. | Memberikan Inari Sushi, Dango Kacang Merah, Manju, atau Sup Miso di meja makan. |
| **Kebahagiaan (Happiness)** | 幸福 | Menggambarkan suasana hati dan kesenangan batin. | Mengelus kepala/perut, bermain lempar bola temari, atau memenangkan festival Matsuri. |
| **Energi (Energy)** | 活気 | Daya tahan untuk beraktivitas dan berlatih ilmu roh. | Tidur di atas bantal Zabuton sutra atau meminum Teh Matcha pekat. |
| **Kebersihan (Hygiene)** | 清浄 | Menjaga kesucian bulu rubah dari debu duniawi. | Mandi di kolam Onsen kayu hinoki beraroma bunga sakura. |
| **Spiritualitas (Spirit)** | 霊力 | Kekuatan mistis roh untuk berevolusi dan melindungi santuari. | Berdoa di altar Kamidana, menyalakan lilin dupa, atau bermeditasi Zen. |
| **Kesehatan (Health)** | 健勝 | Kondisi vitalitas umum; dipengaruhi oleh 5 status lainnya. | Menjaga kebersihan dan nutrisi; memanggil tabib herbal jika jatuh sakit. |

---

## ⏳ 2. Siklus Peluruhan Status (*Decay Loop*)

Status vital Kitsune meluruh secara periodik seiring berjalannya waktu, bahkan saat tab browser tidak aktif:

- **Laju Peluruhan Harian**:
  - *Lapar (Hunger)*: Berkurang ~4.5 poin per jam nyata.
  - *Energi (Energy)*: Berkurang ~3.0 poin per jam saat terjaga; pulih bertahap saat mode tidur diaktifkan.
  - *Kebersihan (Hygiene)*: Berkurang ~2.5 poin per jam; lebih cepat meluruh jika sering bermain di luar ruangan.
  - *Spiritualitas (Spirit)*: Berkurang ~2.0 poin per jam jika santuari dibiarkan berdebu.
- **Sistem Perlindungan (*Offline Cushion*)**:
  - Untuk mencegah kematian traumatis, jika status mencapai 0, Kitsune tidak akan mati melainkan memasuki kondisi **Lemah (*Fushin*)**. Pemain cukup memberikan ritual pembersihan air suci dan hidangan hangat untuk memulihkannya.

---

## 📈 3. Pertumbuhan Level & Kurva EXP Eksponensial

Setiap tindakan positif (memberi makan, menyikat bulu, memenangkan mini-game) memberikan poin pengalaman (*Spirit EXP*).

### Formula Kebutuhan EXP per Level:
$$\text{EXP Diperlukan}(L) = \lfloor 100 \times 1.25^{(L - 1)} \rfloor$$

- **Level 1**: 100 EXP
- **Level 5**: ~244 EXP
- **Level 10**: ~745 EXP
- **Level 25**: ~26,469 EXP
- **Level 50**: ~33,874,000 EXP (Taraf Dewa Penjaga Tertinggi)

---

## 🦊 4. Lima Fase Evolusi Ekor (*Kitsune Morphosis*)

Seiring bertambahnya usia, level, dan akumulasi spiritualitas, Kitsune akan menjalani transformasi wujud ekor (*Kyuubi Evolution*):

```
       [Fase 1: Yako]  ──► (Lv 5) ──►  [Fase 2: Youko]
          (1 Ekor)                         (3 Ekor)
                                              │
                                              ▼ (Lv 15)
       [Fase 4: Kinko] ◄── (Lv 25) ◄── [Fase 3: Kiko]
          (7 Ekor)                         (5 Ekor)
             │
             ▼ (Lv 40+)
       [Fase 5: Kyuubi no Kitsune]
         (9 Ekor Emas Mistik)
```

| Fase Evolusi | Nama Wujud | Jumlah Ekor | Syarat Level | Karakteristik Visual & Kekuatan |
| :---: | :--- | :---: | :---: | :--- |
| **I** | **Yako (野狐)** | 1 Ekor | Lv. 1 - 4 | Anak rubah mungil pemalu dengan mata bulat besar dan telinga yang mudah berkedut. |
| **II** | **Youko (妖狐)** | 3 Ekor | Lv. 5 - 14 | Ekor terbelah menjadi tiga helai anggun; mulai bisa menghasilkan percikan api roh *Kitsunebi*. |
| **III** | **Kiko (気狐)** | 5 Ekor | Lv. 15 - 24 | Bulu putih keperakan dengan aksen merah cinnabar di ujung telinga; membuka kemampuan meditasi mendalam. |
| **IV** | **Kinko (金狐)** | 7 Ekor | Lv. 25 - 39 | Ekor memancarkan aura cahaya emas; dapat memanggil angin musim dan membawa keberuntungan melimpah. |
| **V** | **Kyuubi (九尾の狐)** | 9 Ekor | Lv. 40+ | Wujud dewa sejati; sembilan ekor mekar seperti kipas agung, dikelilingi permata suci *Hoshi no Tama*. |

---

## 🏆 5. Formula Skor Pengasuhan (*Care Score*)

Skor pengasuhan dievaluasi secara dinamis untuk menentukan status mood dan berkah harian dari Kuil:

$$\text{Care Score} = \left( \frac{\text{Hunger} + \text{Happiness} + \text{Energy} + \text{Hygiene} + \text{Spirit} + \text{Health}}{6} \right) \times \text{Kizuna Multiplier}$$

- **Nilai 90 - 100**: *Kondisi Murni / Daikichi (Sangat Beruntung)*  
  Kitsune memancarkan kelopak bunga bercahaya, bonus +50% EXP untuk seluruh aktivitas.
- **Nilai 70 - 89**: *Kondisi Bahagia / Chukichi (Beruntung)*  
  Kitsune aktif bersenandung dan sering membawakan hadiah kejutan berupa daun ginkgo emas atau koin ryo.
- **Nilai 40 - 69**: *Kondisi Biasa / Suekichi (Cukup)*  
  Tingkah laku normal, sesekali melamun menatap taman engawa.
- **Di bawah 40**: *Kondisi Butuh Perhatian / Kyo (Kurang)*  
  Kitsune tampak lesu, telinga turun, dan membutuhkan belaian serta makanan bergizi.

---

## ⛩️ 6. Sistem Ikatan Batin (*Kizuna Bond*)

Tingkat ikatan batin merefleksikan kedekatan emosional antara pemain dan Kitsune:
1. **Ritual Harian**: Membuka aplikasi setiap hari memberikan tanda kehadiran di *Paspor Ziarah*.
2. **Cap Hanko Pribadi**: Pemain dapat menorehkan cap stempel tradisional merah sebagai tanda kepemilikan dan cinta.
3. **Pohon Harapan Ema**: Menuliskan doa pribadi di papan kayu Ema yang digantungkan di Kuil Inari akan memperkuat resonansi jiwa hingga +20 poin ikatan.
