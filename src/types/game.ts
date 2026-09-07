// HAGUMI (育み) - Type Definitions

export type KitsuneElement = 'fire' | 'water' | 'thunder' | 'wind' | 'light' | 'shadow';

export type KitsuneStage = 'egg' | 'bayi' | 'anak' | 'remaja' | 'dewasa' | 'mistik';

export type KitsuneForm =
  | 'egg_fire'
  | 'egg_water'
  | 'egg_thunder'
  | 'egg_wind'
  | 'egg_light'
  | 'egg_shadow'
  | 'kitsunebi' // Bayi (spirit fire orb)
  | 'kogitsune' // Anak (fox cub)
  | 'wakahitsune' // Remaja (young fox)
  | 'zenko' // Dewasa/Mistik: Holy White Celestial Fox (Care Score > 80, high discipline)
  | 'tenko' // Dewasa/Mistik: Heavenly Gold 9-tail Fox (Care Score > 85, balance)
  | 'yako' // Dewasa/Mistik: Mischievous Purple/Blue Wild Fox (Low discipline, high energy)
  | 'nogitsune'; // Dewasa/Mistik: Rustic Woodland Wild Fox (Low care score)

export interface PetStats {
  hunger: number; // 0 - 100
  energy: number; // 0 - 100
  cleanliness: number; // 0 - 100
  happiness: number; // 0 - 100
  discipline: number; // 0 - 100
  health: number; // 0 - 100
}

export type NeckAccessory = 'none' | 'suzu' | 'magatama' | 'scarf' | 'shimenawa';
export type HeadAccessory = 'none' | 'kitsune_mask' | 'sakura' | 'leaf';

export interface WardrobeAccessories {
  neck: NeckAccessory;
  head: HeadAccessory;
}

export type TatamiStyle = 'classic' | 'golden' | 'indigo' | 'sakura';
export type KakemonoStyle = 'fuku' | 'ai' | 'enso' | 'fuji';
export type RoomAccent = 'none' | 'chabudai' | 'bonsai' | 'koro' | 'shishi_odoshi';

export interface SanctuaryDecorations {
  tatami: TatamiStyle;
  kakemono: KakemonoStyle;
  accent: RoomAccent;
}

export interface DecorItem {
  id: string;
  category: 'tatami' | 'kakemono' | 'accent';
  key: TatamiStyle | KakemonoStyle | RoomAccent;
  name: string;
  japaneseName: string;
  description: string;
  icon: string;
  price: number;
  unlockLevel: number;
  blessingText: string;
}

export interface AccessoryItem {
  id: string;
  category: 'neck' | 'head';
  key: NeckAccessory | HeadAccessory;
  name: string;
  japaneseName: string;
  description: string;
  icon: string;
  price: number;
  unlockLevel: number;
  blessingText: string;
}

export interface PetData {
  id: string;
  name: string;
  element: KitsuneElement;
  stage: KitsuneStage;
  form: KitsuneForm;
  tailCount: number; // 0 to 9
  stats: PetStats;
  weight: number; // grams
  ageDays: number;
  exp: number;
  level: number;
  careScore: number;
  careMistakes: number;
  hankoSignature: string;
  birthTimestamp: number;
  lastInteractionTime: number;
  lastDecayTime: number;
  isSleeping: boolean;
  sleepUntilTimestamp?: number; // Target timestamp when 15-min sleep finishes
  isSick: boolean;
  poopCount: number; // 0 - 4
  coins: number;
  inventory: Record<string, number>;
  favoriteFood: string;
  generation: number;
  totalMiniGamesWon: number;
  accessories?: WardrobeAccessories;
  unlockedAccessories?: string[];
  sanctuaryDecor?: SanctuaryDecorations;
  unlockedDecor?: string[];
  season?: SeasonType;
  unlockedMemories?: string[];
  customDiaryNotes?: CustomDiaryNote[];
  visitedShrines?: string[];
  hanabiLaunches?: number;
  caretakerName?: string;
  shrineWishes?: ShrineWish[];
  bondingPoints?: number;
  bondingLevel?: number;
  bondingTitle?: string;
}

export type WishCategory = 'health' | 'fortune' | 'bonding' | 'wisdom' | 'peace';

export interface ShrineWish {
  id: string;
  text: string;
  category: WishCategory;
  date: string;
  fulfilled?: boolean;
  kitsuneBlessing?: string;
}

export interface BondingMilestone {
  level: number;
  title: string;
  japaneseTitle: string;
  minPoints: number;
  description: string;
  unlockedPerk: string;
  auraColor: string;
}

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export type UkiyoArtId =
  | 'birth'
  | 'first_evolution'
  | 'nine_tails'
  | 'matsuri_master'
  | 'bath'
  | 'shrine_prayer'
  | 'tea_zen'
  | 'hanabi'
  | 'fuji_view';

export interface MemoryScrollEntry {
  id: string;
  title: string;
  japaneseTitle: string;
  dateStr?: string;
  description: string;
  ukiyoArt: UkiyoArtId;
  unlocked: boolean;
  category: 'milestone' | 'daily' | 'spiritual';
  blessingText?: string;
}

export interface CustomDiaryNote {
  id: string;
  text: string;
  date: string;
  moodEmoji: string;
}

export interface ShrinePassData {
  shrineCode: string;
  shrineName: string;
  guardianName: string;
  element: KitsuneElement;
  tailCount: number;
  level: number;
  hankoSignature: string;
  greeting: string;
  offeringGift: string;
  visitorsCount: number;
}

export interface FoodItem {
  id: string;
  name: string;
  japaneseName: string;
  price: number;
  hunger: number;
  happiness: number;
  energy?: number;
  cleanliness?: number;
  discipline?: number;
  curesSickness?: boolean;
  health?: number;
  exp?: number;
  description: string;
  iconEmoji: string;
}

export interface ElementInfo {
  id: KitsuneElement;
  name: string;
  japanese: string;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  auraColor: string;
  kanji: string;
  hojuTitle?: string;
  gemstoneName?: string;
}

export type DayPhase = 'morning' | 'noon' | 'evening' | 'night';

export interface OmikujiResult {
  blessing: string;
  poem: string;
  advice: string;
  luckyItem: string;
}

// --- IDLE THOUGHT BUBBLE SYSTEM ---
export type ThoughtTrigger =
  | 'hunger'    // stat lapar tinggi → ingin makan
  | 'energy'    // energi rendah → ingin tidur
  | 'dirty'     // kebersihan rendah → ingin mandi
  | 'happy'     // kesenangan penuh → senang
  | 'bored'     // bosan → ingin bermain
  | 'sick'      // sakit → ingin obat
  | 'random';   // pikiran acak/random

export interface IdleThought {
  trigger: ThoughtTrigger;
  emoji: string;
  text: string;        // Teks singkat muncul di bubble
  japaneseFlair: string; // Aksen Jepang kecil di bawah text
  actionHint?: string; // Modal apa yang dibuka saat di-klik
  bubbleColor: string; // Warna latar bubble
  accentColor: string; // Warna border/tail bubble
}
