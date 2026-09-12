import {
  ElementInfo,
  FoodItem,
  KitsuneElement,
  KitsuneForm,
  KitsuneStage,
  AccessoryItem,
  NeckAccessory,
  HeadAccessory,
  DecorItem,
  TatamiStyle,
  KakemonoStyle,
  RoomAccent,
  SanctuaryDecorations,
  MemoryScrollEntry,
  ShrinePassData,
  SeasonType,
  BondingMilestone,
  ShrineWish,
} from '../types/game';

export const ELEMENTS_CONFIG: Record<KitsuneElement, ElementInfo> = {
  fire: {
    id: 'fire',
    name: 'Api Merah (Hinote)',
    japanese: '火の狐',
    title: 'Semangat Menyala & Kehangatan Jiwa',
    description: 'Kitsune berjiwa pemberani dengan kobaran api hangat yang melindungi rumah.',
    primaryColor: '#ea580c', // Orange-red
    secondaryColor: '#fef08a', // Flame yellow
    auraColor: 'rgba(234, 88, 12, 0.45)',
    kanji: '火',
    hojuTitle: 'Hōju Garnet Api Merah (紅玉宝珠)',
    gemstoneName: 'Garnet / Ruby Api',
  },
  water: {
    id: 'water',
    name: 'Air Embun (Mizu)',
    japanese: '水の狐',
    title: 'Ketenangan Danau & Kebijaksanaan Abadi',
    description: 'Kitsune anggun dengan aura embun sejuk yang menyembuhkan hati gundah.',
    primaryColor: '#0284c7', // Sky blue
    secondaryColor: '#bae6fd', // Pale cyan
    auraColor: 'rgba(2, 132, 199, 0.45)',
    kanji: '水',
    hojuTitle: 'Hōju Safir Air Embun (青玉宝珠)',
    gemstoneName: 'Safir / Akuamarin',
  },
  thunder: {
    id: 'thunder',
    name: 'Petir Kilat (Ikazuchi)',
    japanese: '雷の狐',
    title: 'Kecepatan Cahaya & Kegembiraan Lincah',
    description: 'Kitsune lincah dengan percikan listrik emas yang tak pernah kehabisan energi.',
    primaryColor: '#eab308', // Gold
    secondaryColor: '#fef9c3', // Pale yellow
    auraColor: 'rgba(234, 179, 8, 0.45)',
    kanji: '雷',
    hojuTitle: 'Hōju Topaz Kilat Emas (黄玉宝珠)',
    gemstoneName: 'Topaz / Amber Emas',
  },
  wind: {
    id: 'wind',
    name: 'Angin Semilir (Kaze)',
    japanese: '風の狐',
    title: 'Kebebasan Padang Rumput & Keceriaan',
    description: 'Kitsune periang yang melompat seringan daun gugur ditiup angin pegunungan.',
    primaryColor: '#059669', // Emerald green
    secondaryColor: '#a7f3d0', // Mint
    auraColor: 'rgba(5, 150, 105, 0.45)',
    kanji: '風',
    hojuTitle: 'Hōju Giok Angin Hijau (翠玉宝珠)',
    gemstoneName: 'Giok / Zamrud Hijau',
  },
  light: {
    id: 'light',
    name: 'Cahaya Suci (Hikari)',
    japanese: '光の狐',
    title: 'Kesucian Kuil & Berkah Surgawi Inari',
    description: 'Kitsune putih mulia dengan pita suci shimenawa pembawa keberuntungan.',
    primaryColor: '#e0e7ff', // Pearl / lavender white
    secondaryColor: '#fda4af', // Sakura pink
    auraColor: 'rgba(224, 231, 255, 0.65)',
    kanji: '光',
    hojuTitle: 'Hōju Mutiara Cahaya Suci (金剛宝珠)',
    gemstoneName: 'Mutiara / Berlian Suci',
  },
  shadow: {
    id: 'shadow',
    name: 'Bayangan Mistik (Kage)',
    japanese: '影の狐',
    title: 'Misteri Malam & Cerdik Tak Tertebak',
    description: 'Kitsune cerdik berbulu jelaga dengan mata berpendar yang menguasai seni ilusi.',
    primaryColor: '#7c3aed', // Purple
    secondaryColor: '#1e1b4b', // Deep indigo
    auraColor: 'rgba(124, 58, 237, 0.45)',
    kanji: '影',
    hojuTitle: 'Hōju Ametis Bayangan Mistik (紫宝珠)',
    gemstoneName: 'Ametis / Obsidian Ungu',
  },
};

export const FOOD_ITEMS: Record<string, FoodItem> = {
  aburaage: {
    id: 'aburaage',
    name: 'Aburaage (Tahu Goreng Gurih)',
    japaneseName: '油揚げ',
    price: 15,
    hunger: 35,
    happiness: 30,
    exp: 30,
    description: 'Tahu tipis goreng keemasan legendaris, makanan paling digemari semua kitsune!',
    iconEmoji: '🥟',
  },
  onigiri: {
    id: 'onigiri',
    name: 'Onigiri Nori',
    japaneseName: 'おにぎり',
    price: 10,
    hunger: 25,
    happiness: 10,
    exp: 15,
    description: 'Nasi kepal segitiga hangat dengan selimut rumput laut renyah.',
    iconEmoji: '🍙',
  },
  inari: {
    id: 'inari',
    name: 'Inari Sushi',
    japaneseName: '稲荷寿司',
    price: 22,
    hunger: 40,
    happiness: 35,
    exp: 35,
    description: 'Kantung tahu manis berkuah dashi berisi nasi ketan harum.',
    iconEmoji: '🍣',
  },
  dango: {
    id: 'dango',
    name: 'Sanshoku Dango Tiga Warna',
    japaneseName: '三色団子',
    price: 12,
    hunger: 15,
    happiness: 25,
    exp: 20,
    description: 'Dango manis kenyal berwarna merah muda sakura, putih salju, dan hijau matcha.',
    iconEmoji: '🍡',
  },
  sakuramochi: {
    id: 'sakuramochi',
    name: 'Sakura Mochi',
    japaneseName: '桜餅',
    price: 18,
    hunger: 20,
    happiness: 28,
    exp: 25,
    description: 'Kue beras ketan kenyal isi pasta kacang merah dibungkus daun sakura asin manis.',
    iconEmoji: '🌸',
  },
  ocha: {
    id: 'ocha',
    name: 'Matcha Ocha Panas',
    japaneseName: '温かい抹茶',
    price: 8,
    hunger: 10,
    happiness: 18,
    energy: 20,
    cleanliness: 5,
    exp: 15,
    description: 'Seduhan teh hijau matcha hangat yang menenangkan dan menyegarkan raga.',
    iconEmoji: '🍵',
  },
  yakusou: {
    id: 'yakusou',
    name: 'Ramuan Herbal Kuil (Yakusou)',
    japaneseName: '薬草茶',
    price: 25,
    hunger: 5,
    happiness: -5,
    curesSickness: true,
    health: 45,
    exp: 25,
    description: 'Pahit tapi manjur! Menyembuhkan penyakit kitsune dan membersihkan racun.',
    iconEmoji: '🌿',
  },
  omamori: {
    id: 'omamori',
    name: 'Jimat Keberuntungan (Omamori)',
    japaneseName: '御守り',
    price: 40,
    hunger: 0,
    happiness: 35,
    curesSickness: true,
    health: 50,
    discipline: 10,
    exp: 45,
    description: 'Kantung kain brokat merah pembawa berkah perlindungan Inari Okami.',
    iconEmoji: '🏮',
  },
};

// Lemari Busana & Aksesoris Kitsune (Wardrobe & Accessories)
export const ACCESSORIES_CATALOG: AccessoryItem[] = [
  // --- AKSESORIS LEHER (首飾り) ---
  {
    id: 'neck_none',
    category: 'neck',
    key: 'none',
    name: 'Tanpa Aksesoris Leher',
    japaneseName: '装飾なし (Nashi)',
    description: 'Bulu leher alami yang bersih dan bebas tanpa ikatan apapun.',
    icon: '✨',
    price: 0,
    unlockLevel: 1,
    blessingText: 'Kecantikan murni dari bulu kitsune alami.',
  },
  {
    id: 'neck_suzu',
    category: 'neck',
    key: 'suzu',
    name: 'Pita Lonceng Emas (Suzu)',
    japaneseName: '金鈴の首紐 (Kin-suzu)',
    description: 'Pita sutra merah vermilion dengan lonceng kuningan emas yang bergemerincing merdu pembawa berkah.',
    icon: '🔔',
    price: 40,
    unlockLevel: 2,
    blessingText: 'Gemerincing suci mengusir hawa kegelapan dan menambah keceriaan.',
  },
  {
    id: 'neck_magatama',
    category: 'neck',
    key: 'magatama',
    name: 'Kalung Giok Magatama',
    japaneseName: '勾玉の首飾り (Magatama)',
    description: 'Batu giok suci berbentuk tetesan melengkung hijau zamrud kuno pembawa kekuatan roh leluhur.',
    icon: '📿',
    price: 65,
    unlockLevel: 4,
    blessingText: 'Aura giok suci memancarkan ketenangan batin dan kestabilan energi spiritual.',
  },
  {
    id: 'neck_scarf',
    category: 'neck',
    key: 'scarf',
    name: 'Syal Merah Inari',
    japaneseName: '稲荷の赤襟巻 (Inari no Erimaki)',
    description: 'Syal merah khas pelayan kuil Inari yang berkibar lembut tertiup angin saat Kitsune melangkah.',
    icon: '🧣',
    price: 50,
    unlockLevel: 3,
    blessingText: 'Memberikan kehangatan raga dan mempererat ikatan batin dengan sang perawat.',
  },
  {
    id: 'neck_shimenawa',
    category: 'neck',
    key: 'shimenawa',
    name: 'Tali Suci Shimenawa',
    japaneseName: '注連縄の首輪 (Shimenawa)',
    description: 'Anyaman jerami padi suci kuil dengan gantungan kertas putih Shide penolak roh jahat.',
    icon: '🎋',
    price: 80,
    unlockLevel: 5,
    blessingText: 'Batasan suci mutlak pelindung kesucian jiwa sang Kitsune.',
  },

  // --- HIASAN KEPALA (頭飾り) ---
  {
    id: 'head_none',
    category: 'head',
    key: 'none',
    name: 'Tanpa Hiasan Kepala',
    japaneseName: '装飾なし (Nashi)',
    description: 'Telinga rubah bebas tanpa sematan aksesoris apapun.',
    icon: '🦊',
    price: 0,
    unlockLevel: 1,
    blessingText: 'Pendengaran tajam dan alami mendengarkan bisikan angin.',
  },
  {
    id: 'head_sakura',
    category: 'head',
    key: 'sakura',
    name: 'Jepit Bunga Sakura',
    japaneseName: '桜の髪飾り (Sakura Pin)',
    description: 'Kuntum mekar sakura merah muda lembut musim semi yang disematkan anggun di pangkal telinga.',
    icon: '🌸',
    price: 45,
    unlockLevel: 2,
    blessingText: 'Aroma semerbak bunga musim semi membuat Kitsune selalu ceria.',
  },
  {
    id: 'head_kitsune_mask',
    category: 'head',
    key: 'kitsune_mask',
    name: 'Topeng Rubah (Kitsune-men)',
    japaneseName: '狐面 (Kitsune-men)',
    description: 'Topeng festival porselen putih bergaris merah vermilion yang disematkan miring di samping telinga.',
    icon: '🎭',
    price: 75,
    unlockLevel: 3,
    blessingText: 'Pesona misterius khas festival malam matsuri di alam roh.',
  },
  {
    id: 'head_leaf',
    category: 'head',
    key: 'leaf',
    name: 'Daun Mistis Tanuki',
    japaneseName: '変化の木の葉 (Henka no Ko-noha)',
    description: 'Selembar daun hijau bertuah yang diletakkan di dahi untuk melatih seni penyamaran ceria.',
    icon: '🍃',
    price: 35,
    unlockLevel: 1,
    blessingText: 'Memicu kecerdikan dan kelicikan jenaka yang menggemaskan.',
  },
];

export const DEFAULT_UNLOCKED_ACCESSORIES = ['neck_none', 'head_none', 'head_leaf'];

export function getAccessoryById(id: string): AccessoryItem | undefined {
  return ACCESSORIES_CATALOG.find((item) => item.id === id);
}

// Sanctuary Renovations (Dekorasi Tatami & Ruang Perlindungan)
export const SANCTUARY_DECOR_CATALOG: DecorItem[] = [
  // 1. Tatami Weave Mat Styles
  {
    id: 'tatami_classic',
    category: 'tatami',
    key: 'classic',
    name: 'Anyaman Igusa Tradisional',
    japaneseName: '本草畳 (Honkusa Tatami)',
    description: 'Anyaman rumput rawa igusa hijau alami beraroma segar dengan tepian pita sutra hitam arang.',
    icon: '🟩',
    price: 0,
    unlockLevel: 1,
    blessingText: 'Kesejukan alami dan ketenangan jiwa khas kuil Inari zaman kuno.',
  },
  {
    id: 'tatami_golden',
    category: 'tatami',
    key: 'golden',
    name: 'Jerami Emas Musim Gugur',
    japaneseName: '黄金藁畳 (Kogane Wara-tatami)',
    description: 'Anyaman jerami matang warna kuning keemasan hangat dengan tepian brokat sutra emas.',
    icon: '🌾',
    price: 50,
    unlockLevel: 2,
    blessingText: 'Memberkahi ruangan dengan kelimpahan panen padi dan rezeki melimpah.',
  },
  {
    id: 'tatami_indigo',
    category: 'tatami',
    key: 'indigo',
    name: 'Indigo Kuil Kekaisaran',
    japaneseName: '藍染御殿畳 (Aizome Goten-tatami)',
    description: 'Anyaman serat celup nila biru tua anggun dengan aksen motif awan perak kuil suci.',
    icon: '🔷',
    price: 80,
    unlockLevel: 3,
    blessingText: 'Memberikan aura kebijaksanaan agung dan perlindungan roh malam.',
  },
  {
    id: 'tatami_sakura',
    category: 'tatami',
    key: 'sakura',
    name: 'Washi Merah Sakura',
    japaneseName: '桜和紙畳 (Sakura Washi-tatami)',
    description: 'Anyaman kertas washi bergradasi merah muda kelopak sakura dengan tepian pita vermilion.',
    icon: '🌸',
    price: 110,
    unlockLevel: 4,
    blessingText: 'Semerbak musim semi abadi yang menghibur hati kitsune setiap saat.',
  },

  // 2. Hanging Wall Scrolls (Kakemono)
  {
    id: 'kakemono_fuku',
    category: 'kakemono',
    key: 'fuku',
    name: 'Berkah Keberuntungan (Fuku)',
    japaneseName: '掛け軸「福」 (Fuku Scroll)',
    description: 'Gulungan sutra bertuliskan kanji "Fuku" (福) dengan stempel segel merah pembawa rezeki.',
    icon: '📜',
    price: 0,
    unlockLevel: 1,
    blessingText: 'Mengundang dewa rezeki Inari agar memberkahi setiap langkah kitsune.',
  },
  {
    id: 'kakemono_ai',
    category: 'kakemono',
    key: 'ai',
    name: 'Kasih Asuhan (Ji-ai)',
    japaneseName: '掛け軸「慈愛」 (Ji-ai Scroll)',
    description: 'Kaligrafi indah bermakna cinta kasih mendalam dan ikatan pengasuhan Hagumi yang tak terputus.',
    icon: '💖',
    price: 40,
    unlockLevel: 2,
    blessingText: 'Mempererat ikatan batin dan menambah kebahagiaan kitsune saat dirawat.',
  },
  {
    id: 'kakemono_enso',
    category: 'kakemono',
    key: 'enso',
    name: 'Lingkaran Pencerahan (Enso)',
    japaneseName: '掛け軸「円相」 (Enso Scroll)',
    description: 'Sapuan kuas melingkar Zen hitam di atas kertas beras, lambang keheningan dan keabadian semesta.',
    icon: '⭕',
    price: 70,
    unlockLevel: 3,
    blessingText: 'Menenangkan pikiran dan mempercepat pemulihan energi saat istirahat.',
  },
  {
    id: 'kakemono_fuji',
    category: 'kakemono',
    key: 'fuji',
    name: 'Pemandangan Fuji Suci',
    japaneseName: '掛け軸「霊峰富士」 (Reihou Fuji)',
    description: 'Lukisan pemandangan puncak salju Gunung Fuji dikelilingi awan merah fajar mistis.',
    icon: '🗻',
    price: 95,
    unlockLevel: 4,
    blessingText: 'Kekuatan tekad teguh dan kemegahan spiritual alam Jepang.',
  },

  // 3. Room Accents (Zashiki Kazari)
  {
    id: 'accent_none',
    category: 'accent',
    key: 'none',
    name: 'Ruang Terbuka Bebas',
    japaneseName: '広間 (Hiroma - Open Floor)',
    description: 'Lantai tatami lapang tanpa perabot tambahan agar kitsune leluasa menjelajah.',
    icon: '🍃',
    price: 0,
    unlockLevel: 1,
    blessingText: 'Keleluasaan ruang memberi ketenangan napas bagi roh rubah.',
  },
  {
    id: 'accent_chabudai',
    category: 'accent',
    key: 'chabudai',
    name: 'Meja Teh Tradisional (Chabudai)',
    japaneseName: 'ちゃぶ台とお茶 (Chabudai Table)',
    description: 'Meja kayu pernis rendah dengan mangkuk keramik teh hijau matcha hangat dan kue wagashi.',
    icon: '🍵',
    price: 45,
    unlockLevel: 2,
    blessingText: 'Suasana santai minum teh membuat kitsune merasa nyaman seperti di rumah.',
  },
  {
    id: 'accent_bonsai',
    category: 'accent',
    key: 'bonsai',
    name: 'Bonsai Pinus Abadi',
    japaneseName: '松の盆栽 (Matsu Bonsai)',
    description: 'Miniatur pohon pinus berusia ratusan tahun di atas tatakan pernis hitam mengkilap.',
    icon: '🪴',
    price: 65,
    unlockLevel: 3,
    blessingText: 'Menjaga keharmonisan alam dan memperkuat vitalitas roh kitsune.',
  },
  {
    id: 'accent_koro',
    category: 'accent',
    key: 'koro',
    name: 'Pedupaan Perunggu Roh (Koro)',
    japaneseName: '青銅香炉 (Koro Incense Burner)',
    description: 'Pedupaan kuil perunggu berukir awan dengan asap dupa beraroma cendana meliuk lembut ke udara.',
    icon: '🪔',
    price: 85,
    unlockLevel: 3,
    blessingText: 'Menyucikan ruangan dari hawa buruk dan menjaga kebersihan sanctuary.',
  },
  {
    id: 'accent_shishi_odoshi',
    category: 'accent',
    key: 'shishi_odoshi',
    name: 'Pancuran Bambu Engawa (Shishi-odoshi)',
    japaneseName: '鹿威し (Shishi-odoshi)',
    description: 'Pancuran air bambu tradisional di dekat beranda engawa dengan suara ketukan ritmis menyejukkan.',
    icon: '🎋',
    price: 120,
    unlockLevel: 4,
    blessingText: 'Suara air gemericik dan ketukan bambu mengusir kegelisahan roh malam.',
  },
];

export const DEFAULT_SANCTUARY_DECOR: SanctuaryDecorations = {
  tatami: 'classic',
  kakemono: 'fuku',
  accent: 'none',
};

export const DEFAULT_UNLOCKED_DECOR = [
  'tatami_classic',
  'kakemono_fuku',
  'accent_none',
];

export function getDecorById(id: string): DecorItem | undefined {
  return SANCTUARY_DECOR_CATALOG.find((item) => item.id === id);
}

// Evolution Requirements & Branching
export interface EvolutionTarget {
  stage: KitsuneStage;
  form: KitsuneForm;
  name: string;
  japanese: string;
  tailCount: number;
  minLevel: number;
  minAgeDays: number;
  minCareScore?: number;
  maxCareScore?: number;
  minDiscipline?: number;
  description: string;
}

export function determineNextEvolution(
  currentStage: KitsuneStage,
  level: number,
  ageDays: number,
  careScore: number,
  discipline: number
): EvolutionTarget | null {
  // Egg -> Bayi (Kitsunebi)
  if (currentStage === 'egg') {
    return {
      stage: 'bayi',
      form: 'kitsunebi',
      name: 'Kitsunebi (Api Roh)',
      japanese: '狐火',
      tailCount: 1,
      minLevel: 1,
      minAgeDays: 0,
      description: 'Gumpalan api roh yang hangat dan menggemaskan!',
    };
  }

  // Bayi -> Anak (Kogitsune)
  if (currentStage === 'bayi' && level >= 3) {
    return {
      stage: 'anak',
      form: 'kogitsune',
      name: 'Kogitsune (Anak Rubah)',
      japanese: '子狐',
      tailCount: 2,
      minLevel: 3,
      minAgeDays: 1,
      description: 'Anak rubah kecil yang mulai pintar berlari dan menggoyangkan ekor ganda!',
    };
  }

  // Anak -> Remaja (Wakahitsune)
  if (currentStage === 'anak' && level >= 6) {
    return {
      stage: 'remaja',
      form: 'wakahitsune',
      name: 'Wakahitsune (Rubah Muda)',
      japanese: '若狐',
      tailCount: 3,
      minLevel: 6,
      minAgeDays: 3,
      description: 'Rubah remaja lincah berekor tiga yang mahir menguasai ilusi cahaya!',
    };
  }

  // Remaja -> Dewasa / Mistik (Zenko, Tenko, Yako, Nogitsune)
  if (currentStage === 'remaja' && level >= 10) {
    if (careScore >= 85) {
      return {
        stage: 'dewasa',
        form: 'tenko',
        name: 'Tenko (Rubah Surgawi 9 Ekor)',
        japanese: '天狐',
        tailCount: 9,
        minLevel: 10,
        minAgeDays: 5,
        minCareScore: 85,
        description: 'Bentuk paling suci dan agung berekor sembilan pembawa berkah surgawi.',
      };
    } else if (careScore >= 70 && discipline >= 70) {
      return {
        stage: 'dewasa',
        form: 'zenko',
        name: 'Zenko (Rubah Putih Kebajikan)',
        japanese: '善狐',
        tailCount: 7,
        minLevel: 10,
        minAgeDays: 5,
        minCareScore: 70,
        minDiscipline: 70,
        description: 'Rubah putih penolong yang setia menjaga kedamaian dan kesejahteraan.',
      };
    } else if (careScore >= 50) {
      return {
        stage: 'dewasa',
        form: 'yako',
        name: 'Yako (Rubah Liar Cerdik)',
        japanese: '野狐',
        tailCount: 5,
        minLevel: 10,
        minAgeDays: 5,
        description: 'Rubah berjiwa bebas yang jenaka, cerdik, dan gemar bermain teka-teki.',
      };
    } else {
      return {
        stage: 'dewasa',
        form: 'nogitsune',
        name: 'Nogitsune (Rubah Rimba Pegunungan)',
        japanese: '野狐',
        tailCount: 4,
        minLevel: 10,
        minAgeDays: 5,
        description: 'Rubah tangguh yang mandiri mengarungi lebatnya hutan bambu.',
      };
    }
  }

  return null;
}

/**
 * P2 (Revisi 6): katalog transparansi evolusi untuk layar "Pertimbangan Inari".
 * PENTING: threshold di bawah ini adalah CERMINAN dari determineNextEvolution()
 * — jika threshold di atas berubah, perbarui juga di sini agar preview
 * deterministik tidak menyesatkan pemain.
 */
export interface EvolutionBranchInfo {
  form: KitsuneForm;
  name: string;
  japanese: string;
  minCareScore: number;
  minDiscipline?: number;
  description: string;
}

export const REMAJA_EVOLUTION_BRANCHES: EvolutionBranchInfo[] = [
  {
    form: 'tenko',
    name: 'Tenko (Rubah Surgawi 9 Ekor)',
    japanese: '天狐',
    minCareScore: 85,
    description: 'Bentuk paling suci dan agung berekor sembilan pembawa berkah surgawi.',
  },
  {
    form: 'zenko',
    name: 'Zenko (Rubah Putih Kebajikan)',
    japanese: '善狐',
    minCareScore: 70,
    minDiscipline: 70,
    description: 'Rubah putih penolong yang setia menjaga kedamaian dan kesejahteraan.',
  },
  {
    form: 'yako',
    name: 'Yako (Rubah Liar Cerdik)',
    japanese: '野狐',
    minCareScore: 50,
    description: 'Rubah berjiwa bebas yang jenaka, cerdik, dan gemar bermain teka-teki.',
  },
  {
    form: 'nogitsune',
    name: 'Nogitsune (Rubah Rimba Pegunungan)',
    japanese: '野狐',
    minCareScore: 0,
    description: 'Rubah tangguh yang mandiri mengarungi lebatnya hutan bambu.',
  },
];

export const STAGE_LEVEL_GOALS: Record<'bayi' | 'anak', { name: string; japanese: string; minLevel: number }> = {
  bayi: { name: 'Kogitsune (Anak Rubah)', japanese: '子狐', minLevel: 3 },
  anak: { name: 'Wakahitsune (Rubah Muda)', japanese: '若狐', minLevel: 6 },
};

// In-Game Hanko Seal Kanji Suggestions
export const HANKO_KANJI_OPTIONS = [
  { kanji: '福', reading: 'Fuku', meaning: 'Keberuntungan' },
  { kanji: '寿', reading: 'Kotobuki', meaning: 'Panjang Umur' },
  { kanji: '絆', reading: 'Kizuna', meaning: 'Ikatan Kasih' },
  { kanji: '心', reading: 'Kokoro', meaning: 'Hati & Ketulusan' },
  { kanji: '夢', reading: 'Yume', meaning: 'Impian Harapan' },
  { kanji: '狐', reading: 'Kitsune', meaning: 'Roh Rubah' },
  { kanji: '光', reading: 'Hikari', meaning: 'Cahaya Abadi' },
  { kanji: '和', reading: 'Wa', meaning: 'Harmoni & Damai' },
];

/**
 * Formula EXP Eksponensial Seimbang:
 * EXP_required(L) = floor(40 * (L ^ 1.35) + 60)
 * Memberikan awal yang cepat (Lv 1: 100 EXP, Lv 2: 162 EXP, Lv 3: 236 EXP)
 * dan milestone pertumbuhan yang bermakna di level tinggi.
 */
export function getRequiredExp(level: number): number {
  const safeLevel = Math.max(1, level);
  return Math.floor(40 * Math.pow(safeLevel, 1.35) + 60);
}

export interface ExpResult {
  newExp: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Memproses penambahan EXP dan menghitung kenaikan level (termasuk multi-level up).
 */
export function addPetExp(
  currentExp: number,
  currentLevel: number,
  expGained: number
): ExpResult {
  let exp = currentExp + expGained;
  let level = currentLevel;
  let levelsGained = 0;

  while (true) {
    const required = getRequiredExp(level);
    if (exp >= required) {
      exp -= required;
      level += 1;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    newExp: exp,
    newLevel: level,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * Entri Jurnal Kenangan Roh (Memory Scroll / Ukiyo-e Collection)
 */
export const MEMORY_SCROLL_ENTRIES: MemoryScrollEntry[] = [
  {
    id: 'mem_birth',
    title: 'Kebangkitan dari Permata Roh Hōju',
    japaneseTitle: '宝珠の覚醒',
    description: 'Ketika pendaran cahaya batu permata Hōju suci merekah di atas altar kuil, seekor roh rubah mungil dengan bulu bercahaya membuka matanya untuk pertama kali.',
    ukiyoArt: 'birth',
    unlocked: true,
    category: 'milestone',
    blessingText: 'Ikatan Suci Terjalin',
  },
  {
    id: 'mem_fuji_view',
    title: 'Menatap Puncak Salju Reihō Fuji',
    japaneseTitle: '霊峰富士の眺望',
    description: 'Duduk berdua di beranda kayu Engawa, memandang siluet abadi Gunung Fuji yang diselimuti kabut pagi dan bunga sakura melayang.',
    ukiyoArt: 'fuji_view',
    unlocked: true,
    category: 'spiritual',
    blessingText: 'Ketenangan Batin & Kedamaian',
  },
  {
    id: 'mem_tea_zen',
    title: 'Upacara Teh di Atas Tatami',
    japaneseTitle: '茶の湯と静寂',
    description: 'Aroma harum matcha segar dan manisnya kue wagashi menemani heningnya sore di kuil Inari diiringi ketukan bambu shishi-odoshi.',
    ukiyoArt: 'tea_zen',
    unlocked: false,
    category: 'daily',
    blessingText: 'Harmoni & Kehangatan Jiwa',
  },
  {
    id: 'mem_bath',
    title: 'Pemandian Air Hangat Kolam Kuil',
    japaneseTitle: '霊泉の湯浴み',
    description: 'Bulu kitsune dibasuh lembut dengan mata air suci yang wangi daun hinoki dan kelopak bunga persik, mengusir segala letih dan debu.',
    ukiyoArt: 'bath',
    unlocked: false,
    category: 'daily',
    blessingText: 'Kemurnian Raga & Cahaya Bulu',
  },
  {
    id: 'mem_first_evolution',
    title: 'Tumbuhnya Ekor Roh Kedua',
    japaneseTitle: '二尾の覚醒',
    description: 'Kobaran aura mistis mengelilingi tubuh rubah, membelah ekor menjadi dua helai sutra bercahaya sebagai tanda kedewasaan spiritual.',
    ukiyoArt: 'first_evolution',
    unlocked: false,
    category: 'milestone',
    blessingText: 'Kekuatan Elemen Meningkat',
  },
  {
    id: 'mem_shrine_prayer',
    title: 'Doa Restu & Gulungan Emas Omikuji',
    japaneseTitle: '大吉の祈願',
    description: 'Mendengarkan gemerincing lonceng suzu di altar Inari, mempersembahkan doa syukur dan menarik ramalan berkah keberuntungan agung (Dai-Kichi).',
    ukiyoArt: 'shrine_prayer',
    unlocked: false,
    category: 'spiritual',
    blessingText: 'Perlindungan Dewa Padi',
  },
  {
    id: 'mem_matsuri_master',
    title: 'Juara Festival Tabuhan Taiko Matsuri',
    japaneseTitle: '祭りの太鼓名手',
    description: 'Irama pukulan beduk DON dan KA mengguncang malam matsuri! Seluruh pengunjung kuil bersorak gembira menyaksikan kepiawaian ketukan.',
    ukiyoArt: 'matsuri_master',
    unlocked: false,
    category: 'milestone',
    blessingText: 'Semangat Kebahagiaan Abadi',
  },
  {
    id: 'mem_hanabi',
    title: 'Pesta Bunga Api Hanabi di Langit Malam',
    japaneseTitle: '夜空の打ち上げ花火',
    description: 'Bubuk api diracik dengan cermat dan diluncurkan tinggi melintasi puncak Gunung Fuji, mekar menjadi bunga api warna-warni yang menakjubkan.',
    ukiyoArt: 'hanabi',
    unlocked: false,
    category: 'daily',
    blessingText: 'Cahaya Penolak Bala',
  },
  {
    id: 'mem_nine_tails',
    title: 'Kebangkitan Sembilan Ekor Kyubi no Kitsune',
    japaneseTitle: '九尾の白狐降臨',
    description: 'Puncak pencerahan spiritual! Sembilan ekor berkilau keemasan melambai anggun, menjelma menjadi makhluk surgawi pelindung semesta.',
    ukiyoArt: 'nine_tails',
    unlocked: false,
    category: 'milestone',
    blessingText: 'Keabadian & Berkah Tertinggi',
  },
];

export const DEFAULT_UNLOCKED_MEMORIES = ['mem_birth', 'mem_fuji_view'];

/**
 * Traveler Shrines dari Pengasuh Spiritual Lainnya (Kuil Ziarah Inari)
 */
export const SPIRITUAL_VISITOR_SHRINES: ShrinePassData[] = [
  {
    shrineCode: 'INARI-KYOTO-777',
    shrineName: 'Kuil Ribuan Gerbang Fushimi',
    guardianName: 'Kogitsune Haku',
    element: 'light',
    tailCount: 5,
    level: 28,
    hankoSignature: '吉',
    greeting: 'Selamat datang di lorong seribu gerbang merah Torii! Semoga jalanmu selalu dipenuhi cahaya.',
    offeringGift: 'Jimat Berkah Emas (+10 Ryo, +50 EXP)',
    visitorsCount: 1420,
  },
  {
    shrineCode: 'KASAMA-HITACHI-304',
    shrineName: 'Kuil Bunga Krisan Kasama',
    guardianName: 'Akane Hinote',
    element: 'fire',
    tailCount: 3,
    level: 16,
    hankoSignature: '福',
    greeting: 'Hangatkan hatimu dengan api kebahagiaan kami! Nikmati kue inari-zushi manis kami.',
    offeringGift: 'Inari Bento Spesial (+15 Bahagia, +40 Kenyang)',
    visitorsCount: 890,
  },
  {
    shrineCode: 'YUTOKU-HIZEN-912',
    shrineName: 'Kuil Tebing Merah Yutoku',
    guardianName: 'Mizuki Ryu',
    element: 'water',
    tailCount: 4,
    level: 22,
    hankoSignature: '和',
    greeting: 'Air suci pegunungan kami mengalir jernih menyegarkan jiwa yang haus akan kedamaian.',
    offeringGift: 'Air Embun Embun Surga (+100 Bersih, +35 EXP)',
    visitorsCount: 1105,
  },
  {
    shrineCode: 'MOTONOSUMI-NAGATO-555',
    shrineName: 'Kuil Ombak Laut Motonosumi',
    guardianName: 'Hayate Kaze',
    element: 'wind',
    tailCount: 2,
    level: 11,
    hankoSignature: '心',
    greeting: 'Angin laut membawa aroma kebebasan melintasi tebing terjal menghadap samudra biru.',
    offeringGift: 'Kipas Angin Semilir (+20 Energi, +25 EXP)',
    visitorsCount: 654,
  },
  {
    shrineCode: 'TAIKODANI-TSUWANO-888',
    shrineName: 'Kuil Bukit Berkabut Taikodani',
    guardianName: 'Raijin Raiko',
    element: 'thunder',
    tailCount: 6,
    level: 34,
    hankoSignature: '光',
    greeting: 'Kilatan petir kami menyalakan lentera harapan di puncak bukit saat kabut turun.',
    offeringGift: 'Batu Magatama Halilintar (+12 Ryo, +60 EXP)',
    visitorsCount: 1630,
  },
];

/**
 * Generate Shrine Pass Code untuk Pet pemain
 */
export function generateShrineCode(petName: string, element: KitsuneElement, level: number, tails: number): string {
  const cleanName = petName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'KITSUNE';
  const elemCode = element.slice(0, 3).toUpperCase();
  const hash = Math.abs(Math.sin(level * 37 + tails * 19) * 10000).toFixed(0).padStart(4, '0');
  return `SHRINE-${cleanName}-${elemCode}${tails}T-${hash}`;
}

/**
 * Tingkat Ikatan Batin Roh & Pengasuh (Kizuna Milestones - 絆)
 */
export const BONDING_MILESTONES: BondingMilestone[] = [
  {
    level: 1,
    title: 'Kenalan Kuil',
    japaneseTitle: '初縁 (Hatsuen)',
    minPoints: 0,
    description: 'Awal mula ikatan suci di kuil Inari. Rubah mulai mengenali aroma dan langkah kakimu.',
    unlockedPerk: 'Menyapa dengan suara "Kon kon!" gembira saat dipanggil.',
    auraColor: '#fef08a',
  },
  {
    level: 2,
    title: 'Teman Berbagi Teh',
    japaneseTitle: '茶友 (Chayu)',
    minPoints: 100,
    description: 'Duduk bersama menikmati hangatnya seduhan ocha dan camilan manis di atas tatami.',
    unlockedPerk: 'Efek relaksasi ganda saat waktu teh sore.',
    auraColor: '#86efac',
  },
  {
    level: 3,
    title: 'Penjaga Doa Ema',
    japaneseTitle: '祈護 (Kigo)',
    minPoints: 250,
    description: 'Kitsune senantiasa mendoakan harapanmu di altar dan membisikkan berkah keselamatan.',
    unlockedPerk: 'Kitsune mengingat dan menyebut doa Ema di dalam dialog.',
    auraColor: '#67e8f9',
  },
  {
    level: 4,
    title: 'Jiwa Senada',
    japaneseTitle: '同心 (Doushin)',
    minPoints: 500,
    description: 'Koneksi batin mendalam tanpa kata. Kitsune merasakan suasana hatimu dan menghiburmu saat lelah.',
    unlockedPerk: 'Pemberian berkah koin Ryo tak terduga saat dielus hangat.',
    auraColor: '#c084fc',
  },
  {
    level: 5,
    title: 'Ikatan Mistis Abadi',
    japaneseTitle: '魂の契り (Tamashii no Chigiri)',
    minPoints: 850,
    description: 'Ikatan batin tertinggi para pelayan kuil surgawi Tenko. Api roh pelindung melindungimu selamanya.',
    unlockedPerk: 'Pendaran aura pelangi spiritual di sekitar Kitsune & gelar pengasuh kehormatan Inari.',
    auraColor: '#f43f5e',
  },
];

export function getBondingLevelInfo(points: number): {
  level: number;
  currentMilestone: BondingMilestone;
  nextMilestone: BondingMilestone | null;
  progressPercent: number;
} {
  const currentPts = Math.max(0, points);
  let currentMilestone = BONDING_MILESTONES[0];
  let nextMilestone: BondingMilestone | null = BONDING_MILESTONES[1] || null;

  for (let i = BONDING_MILESTONES.length - 1; i >= 0; i--) {
    if (currentPts >= BONDING_MILESTONES[i].minPoints) {
      currentMilestone = BONDING_MILESTONES[i];
      nextMilestone = BONDING_MILESTONES[i + 1] || null;
      break;
    }
  }

  let progressPercent = 100;
  if (nextMilestone) {
    const range = nextMilestone.minPoints - currentMilestone.minPoints;
    const gained = currentPts - currentMilestone.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  }

  return {
    level: currentMilestone.level,
    currentMilestone,
    nextMilestone,
    progressPercent,
  };
}

export const DEFAULT_SHRINE_WISHES: ShrineWish[] = [
  {
    id: 'wish_init',
    text: 'Semoga kitsune-ku tumbuh sehat, penuh kebahagiaan, dan ikatan batin kami abadi di kuil suci ini.',
    category: 'bonding',
    date: 'Hari Pertama di Kuil',
    fulfilled: false,
    kitsuneBlessing: 'Kitsune bersumpah menjaga hatimu dengan segenap kehangatan api rohnya!',
    blessingBells: 12,
    authorName: 'Pengasuh Kuil',
  },
  {
    id: 'wish_comm_1',
    text: 'Semoga seluruh keluarga senantiasa diberi kesehatan, kelapangan hati, dan kedamaian jiwa.',
    category: 'health',
    date: 'Awal Musim',
    fulfilled: false,
    kitsuneBlessing: 'Embun suci pegunungan mengalir menyembuhkan segala keletihan jiwa.',
    blessingBells: 28,
    authorName: 'Peziarah Kyoto',
  },
  {
    id: 'wish_comm_2',
    text: 'Lulus ujian dan meraih cita-cita dengan tekad yang kokoh bagaikan pohon cemara kuil.',
    category: 'wisdom',
    date: 'Musim Lalu',
    fulfilled: false,
    kitsuneBlessing: 'Cahaya lentera kebijaksanaan Inari menerangi setiap lembar ilmumu!',
    blessingBells: 34,
    authorName: 'Peziarah Pelajar',
  },
  {
    id: 'wish_comm_3',
    text: 'Rezeki berlimpah, usaha penuh berkah, dan senantiasa bisa berbagi kebaikan pada sesama.',
    category: 'fortune',
    date: 'Bulan Purnama',
    fulfilled: false,
    kitsuneBlessing: 'Butir beras emas Inari melimpah ruah di lumbung kesejahteraanmu!',
    blessingBells: 45,
    authorName: 'Pedagang Konbini',
  },
  {
    id: 'wish_comm_4',
    text: 'Semoga hari ini membawa senyuman hangat bagi siapa pun yang melangkahi gerbang Torii kuil ini.',
    category: 'peace',
    date: 'Pagi Hari',
    fulfilled: false,
    kitsuneBlessing: 'Semilir angin sepoi-sepoi membawa kedamaian menembus relung kalbumu.',
    blessingBells: 56,
    authorName: 'Musafir Pengembara',
  },
];



