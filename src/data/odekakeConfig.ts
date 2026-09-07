// HAGUMI (育み) - Konfigurasi Petualangan Berkelana Roh (O-dekake / Tabi)
import { OdekakeDestination, OdekakeReward } from '../types/game';

export interface TabiBentoOption {
  id: string;
  name: string;
  kanji: string;
  emoji: string;
  desc: string;
  costCoins: number;
  bonusCoinsPct: number;
  bonusExpPct: number;
}

export interface TabiOmamoriOption {
  id: string;
  name: string;
  kanji: string;
  emoji: string;
  desc: string;
  costCoins: number;
  perk: string;
  bonusKizuna: number;
}

export interface TabiGearOption {
  id: string;
  name: string;
  kanji: string;
  emoji: string;
  desc: string;
  costCoins: number;
  perk: string;
  speedMultiplier: number;
}

export const ODEKAKE_DESTINATIONS: OdekakeDestination[] = [
  {
    id: 'arashiyama',
    name: 'Hutan Bambu Arashiyama',
    kanji: '嵐山竹林',
    region: 'Kyoto Barat (京都)',
    description: 'Lorong batang bambu hijau menjulang tinggi yang bergoyang ditiup angin sepoi pegunungan Sagano.',
    distanceKm: 12,
    baseDurationMinutes: 15,
    minLevel: 1,
    badge: 'Santai & Sejuk',
    accentColor: 'emerald',
    bgGradient: 'from-emerald-950 via-teal-950 to-stone-950',
    postcardTitle: 'Senandung Semilir Bambu Arashiyama',
    postcardKanji: '竹林の風韻',
    postcardStory: 'Kitsune melangkah anggun di antara riak dedaunan bambu Arashiyama. Cahaya mentari yang menyusup di celah batang bambu memancarkan kilau emas di bulu halusnya. Ia beristirahat di bawah naungan batu kuil Tenryu-ji sembari mendengarkan gemericik air sungai Katsura.',
    seed: {
      name: 'Benih Bambu Emas Suci',
      kanji: '金竹の種',
      desc: 'Benih bambu dari hutan Arashiyama. Membawa ketenangan dan kesejukan batin bagi santuari.',
    },
  },
  {
    id: 'fushimi_inari',
    name: 'Kuil Seribu Torii Fushimi Inari',
    kanji: '伏見稲荷大社',
    region: 'Kyoto Selatan (京都)',
    description: 'Gunung suci Inari yang dipenuhi ribuan gerbang torii merah vermilion dan patung rubah pembawa permata Hoju.',
    distanceKm: 28,
    baseDurationMinutes: 30,
    minLevel: 2,
    badge: 'Situs Inari Suci',
    accentColor: 'rose',
    bgGradient: 'from-rose-950 via-red-950 to-stone-950',
    postcardTitle: 'Ziarah Rubah di Bawah Seribu Gerbang',
    postcardKanji: '千本鳥居巡礼',
    postcardStory: 'Melewati lorong ribuan gerbang Senbon Torii yang megah, Kitsune disambut oleh roh-roh rubah penunggu gunung. Di puncak gunung Yotsutsuji, ia menatap panorama kota Kyoto di kala senja sembari menerima berkat kemakmuran dari Sang Inari Okami.',
    seed: {
      name: 'Bulir Padi Emas Kemakmuran',
      kanji: '稲穂の霊種',
      desc: 'Benih padi suci persembahan kuil Fushimi Inari. Dipercaya menarik rezeki dan koin Ryo.',
    },
  },
  {
    id: 'kawaguchiko_fuji',
    name: 'Danau Cermin Kawaguchiko Fuji',
    kanji: '河口湖富士',
    region: 'Yamanashi (山梨)',
    description: 'Danau tenang berkabut di kaki Gunung Fuji yang memantulkan bayangan puncak salju abadi bak cermin surga.',
    distanceKm: 65,
    baseDurationMinutes: 45,
    minLevel: 3,
    badge: 'Refleksi Sakral',
    accentColor: 'cyan',
    bgGradient: 'from-cyan-950 via-sky-950 to-stone-950',
    postcardTitle: 'Cermin Danau Sang Maha Fuji',
    postcardKanji: '富士逆さ湖',
    postcardStory: 'Di tepian danau Kawaguchiko yang membeku tenang di pagi fajar, Kitsune duduk bersimpuh memandangi Gunung Fuji. Permukaan air yang bening memantulkan bayangan terbalik kerucut suci (Sakasa-Fuji). Udara dingin menyegarkan jiwa roh kitsune.',
    seed: {
      name: 'Benih Bunga Camellia Salju Fuji',
      kanji: '雪椿の種',
      desc: 'Bunga tahan dingin yang mekar di lereng Fuji. Memberikan ketabahan dan aura perlindungan.',
    },
  },
  {
    id: 'nikko_toshogu',
    name: 'Hutan Kabut Purba Nikko',
    kanji: '日光杉並木',
    region: 'Tochigi (栃木)',
    description: 'Jalanan pepohonan Aras kuno raksasa berusia 400 tahun yang diselimuti kabut mistis dan lumut beludru hijau.',
    distanceKm: 98,
    baseDurationMinutes: 60,
    minLevel: 4,
    badge: 'Kabut Mistik',
    accentColor: 'amber',
    bgGradient: 'from-amber-950 via-stone-900 to-stone-950',
    postcardTitle: 'Kabut Mistik Lembah Suci Nikko',
    postcardKanji: '日光幽玄の霧',
    postcardStory: 'Kitsune melompat lincah dari akar pohon cedar raksasa ke jembatan Shinkyo yang berselimut lumut. Kabut tebal turun perlahan dari puncak pegunungan Nikko, membawa aroma getah pinus kuno yang meditatif. Suara lonceng kuil bergema dari kejauhan.',
    seed: {
      name: 'Kecambah Pohon Cedar Abadi',
      kanji: '神木杉の種',
      desc: 'Benih pohon cedar suci pelindung kuil. Melambangkan umur panjang dan ketenangan spiritual.',
    },
  },
  {
    id: 'nachi_falls',
    name: 'Lembah Air Terjun Nachi',
    kanji: '那智の大滝',
    region: 'Kumano Kodo, Wakayama (和歌山)',
    description: 'Air terjun suci berketinggian 133 meter di jalur ziarah kuno Kumano, dijaga pagoda merah tiga tingkat.',
    distanceKm: 140,
    baseDurationMinutes: 90,
    minLevel: 5,
    badge: 'Air Suci Penyucian',
    accentColor: 'blue',
    bgGradient: 'from-blue-950 via-indigo-950 to-stone-950',
    postcardTitle: 'Gemuruh Air Terjun Surgawi Nachi',
    postcardKanji: '那智神滝響',
    postcardStory: 'Percikan air terjun tertinggi di Jepang membasahi bulu Kitsune dengan kesucian mata air dewa. Di depan pagoda tiga tingkat Seiganto-ji, pelangi lembut melengkung di antara kabut air terjun, membisikkan doa keselamatan bagi seluruh makhluk.',
    seed: {
      name: 'Benih Teratai Air Suci Nachi',
      kanji: '霊水蓮の種',
      desc: 'Bunga teratai yang tumbuh di mata air pegunungan Nachi. Memulihkan vitalitas dan kemurnian jiwa.',
    },
  },
  {
    id: 'miyajima_island',
    name: 'Pulau Torii Samudra Miyajima',
    kanji: '安芸の宮島',
    region: 'Hiroshima (広島)',
    description: 'Pulau keramat Itsukushima tempat gerbang Torii raksasa mengapung di atas samudra saat pasang purnama.',
    distanceKm: 210,
    baseDurationMinutes: 120,
    minLevel: 6,
    badge: 'Kuil Terapung Lautan',
    accentColor: 'purple',
    bgGradient: 'from-purple-950 via-violet-950 to-stone-950',
    postcardTitle: 'Gerbang Samudra di Bawah Sinar Rembulan',
    postcardKanji: '厳島月下海門',
    postcardStory: 'Kala malam pasang laut purnama tiba, Kitsune menaiki perahu kayu kecil mendekati O-Torii raksasa yang tampak mengapung di lautan Itsukushima. Rusa-rusa suci pulau berlarian di pantai berpasir perak, mengantar kepulangan Kitsune membawa oleh-oleh berharga.',
    seed: {
      name: 'Benih Daun Momiji Maple Merah',
      kanji: '紅葉の種',
      desc: 'Benih pohon maple merah khas pulau Miyajima. Mempercantik santuari dengan nuansa musim gugur abadi.',
    },
  },
];

export const TABI_BENTO_OPTIONS: TabiBentoOption[] = [
  {
    id: 'onigiri',
    name: 'Onigiri Rumput Laut',
    kanji: '梅海苔おにぎり',
    emoji: '🍙',
    desc: 'Nasi kepal isi umeboshi berbalut rumput laut renyah. Sederhana, mengenyangkan, dan memulihkan tenaga.',
    costCoins: 0,
    bonusCoinsPct: 0,
    bonusExpPct: 0,
  },
  {
    id: 'inari_sushi',
    name: 'Inari Bento Aburaage',
    kanji: '特製稲荷寿司',
    emoji: '🦊',
    desc: 'Tahu aburaage manis gurih kesukaan Kitsune, diisi nasi wijen wangi. Menambah keberuntungan koin (+25%).',
    costCoins: 25,
    bonusCoinsPct: 25,
    bonusExpPct: 15,
  },
  {
    id: 'hanami_dango',
    name: 'Kotak Bento Dango Matsuri',
    kanji: '花見団子御膳',
    emoji: '🍡',
    desc: 'Kue dango warna-warni dan camilan manis festival. Membuat Kitsune sangat riang selama berkelana (+50% EXP).',
    costCoins: 45,
    bonusCoinsPct: 15,
    bonusExpPct: 50,
  },
];

export const TABI_OMAMORI_OPTIONS: TabiOmamoriOption[] = [
  {
    id: 'omamori_kinun',
    name: 'Omamori Rezeki Emas (Kin-un)',
    kanji: '金運御守',
    emoji: '💰',
    desc: 'Jimat kain sutra kuning emas bertuliskan kanji kekayaan. Melipatgandakan koin Ryo yang ditemukan saat perjalanan.',
    costCoins: 15,
    perk: '+35 Koin Ryo Tambahan',
    bonusKizuna: 10,
  },
  {
    id: 'omamori_kizuna',
    name: 'Omamori Jalinan Kasih (En-musubi)',
    kanji: '縁結び御守',
    emoji: '💖',
    desc: 'Jimat merah muda simbol keterikatan batin tak terputus antara pemilik dan roh Kitsune.',
    costCoins: 20,
    perk: '+25 Poin Ikatan Kizuna',
    bonusKizuna: 25,
  },
  {
    id: 'omamori_anzen',
    name: 'Omamori Keselamatan (Koutsu-anzen)',
    kanji: '交通安全守',
    emoji: '⛩️',
    desc: 'Jimat pelindung dari marabahaya hutan dan kabut gaib. Memastikan kepulangan tepat waktu dan selamat.',
    costCoins: 10,
    perk: '+15 Kasih Care Score',
    bonusKizuna: 15,
  },
];

export const TABI_GEAR_OPTIONS: TabiGearOption[] = [
  {
    id: 'wagasa',
    name: 'Payung Kertas Bambu Wagasa',
    kanji: '和傘',
    emoji: '☂️',
    desc: 'Payung tradisional minyak biji perilla tahan hujan dan terik mentari gunung.',
    costCoins: 0,
    perk: 'Perlindungan Cuaca Alam',
    speedMultiplier: 1.0,
  },
  {
    id: 'waraji',
    name: 'Sandal Jerami Cepat Waraji',
    kanji: '藁草履',
    emoji: '👡',
    desc: 'Anyaman jerami padi ringan yang mempercepat langkah kaki di jalan bebatuan kuil (-15% durasi).',
    costCoins: 30,
    perk: 'Langkah Ringan Lebih Cepat (-15% Waktu)',
    speedMultiplier: 0.85,
  },
  {
    id: 'chochin',
    name: 'Lentera Kertas Roh Chochin',
    kanji: '提灯',
    emoji: '🏮',
    desc: 'Lentera api kitsunebi hangat yang menerangi jalan gelap dan mengungkap rahasia tersembunyi.',
    costCoins: 40,
    perk: 'Menemukan Harta Karun Ekstra',
    speedMultiplier: 1.0,
  },
];

// Helper kalkulasi hadiah kepulangan
export function calculateOdekakeReward(
  dest: OdekakeDestination,
  bento: TabiBentoOption,
  omamori: TabiOmamoriOption,
  gear: TabiGearOption,
  petLevel: number
): OdekakeReward {
  // Base reward scaling with distance and pet level
  const baseCoins = 40 + Math.floor(dest.distanceKm * 0.8) + petLevel * 5;
  const coinsBonusMultiplier = 1 + bento.bonusCoinsPct / 100;
  const extraCoinsFromOmamori = omamori.id === 'omamori_kinun' ? 35 : 10;
  const totalCoins = Math.round(baseCoins * coinsBonusMultiplier + extraCoinsFromOmamori);

  const baseExp = 25 + Math.floor(dest.baseDurationMinutes * 0.9) + petLevel * 4;
  const expMultiplier = 1 + bento.bonusExpPct / 100;
  const totalExp = Math.round(baseExp * expMultiplier);

  const totalKizuna = 15 + omamori.bonusKizuna;

  return {
    coins: totalCoins,
    exp: totalExp,
    bondingPoints: totalKizuna,
    postcardId: `postcard_${dest.id}`,
    postcardTitle: dest.postcardTitle,
    postcardKanji: dest.postcardKanji,
    postcardDesc: `${dest.name} (${dest.region})`,
    postcardStory: dest.postcardStory,
    seedName: dest.seed.name,
    seedKanji: dest.seed.kanji,
    seedDesc: dest.seed.desc,
  };
}
