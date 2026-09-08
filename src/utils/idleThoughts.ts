/**
 * src/utils/idleThoughts.ts
 * Logika pemilihan pikiran idle Kitsune (dipanggil dari KitsuneCanvas).
 */
import { PetData, IdleThought } from '../types/game';

export function pickIdleThought(pet: PetData): IdleThought {
  const { hunger, energy, cleanliness, happiness } = pet.stats;

  // Tier 1 — Urgent needs
  if (pet.isSick) {
    const sickThoughts: IdleThought[] = [
      { trigger: 'sick', emoji: '🤒', text: 'Badan nggak enak...', japaneseFlair: '気持ち悪い', actionHint: 'shop', bubbleColor: 'rgba(254,226,226,0.97)', accentColor: '#ef4444' },
      { trigger: 'sick', emoji: '💊', text: 'Mau minum obat...', japaneseFlair: '薬が欲しい', actionHint: 'shop', bubbleColor: 'rgba(254,226,226,0.97)', accentColor: '#ef4444' },
    ];
    return sickThoughts[Math.floor(Math.random() * sickThoughts.length)];
  }

  if (hunger <= 20) {
    const hungerThoughts: IdleThought[] = [
      { trigger: 'hunger', emoji: '🍱', text: 'Lapar... mau Bento!', japaneseFlair: 'お腹すいたよ', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
      { trigger: 'hunger', emoji: '🫐', text: 'Pengen Aburaage~', japaneseFlair: '揚げ豆腐食べたい', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
      { trigger: 'hunger', emoji: '🍡', text: 'Kangen Mitarashi Dango...', japaneseFlair: 'みたらし団子が恋しい', actionHint: 'bento', bubbleColor: 'rgba(255,237,213,0.97)', accentColor: '#f97316' },
    ];
    return hungerThoughts[Math.floor(Math.random() * hungerThoughts.length)];
  }

  if (energy <= 20) {
    const sleepThoughts: IdleThought[] = [
      { trigger: 'energy', emoji: '😴', text: 'Ngantuk banget...', japaneseFlair: 'ねむ〜い', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
      { trigger: 'energy', emoji: '🛏️', text: 'Pengen Futon hangat~', japaneseFlair: '布団に入りたいな', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
      { trigger: 'energy', emoji: '💤', text: 'Mau istirahat sebentar...', japaneseFlair: 'すこし休みたい', actionHint: 'sleep', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#6366f1' },
    ];
    return sleepThoughts[Math.floor(Math.random() * sleepThoughts.length)];
  }

  if (cleanliness <= 25) {
    const bathThoughts: IdleThought[] = [
      { trigger: 'dirty', emoji: '🛁', text: 'Mau mandi Onsen!', japaneseFlair: '温泉に入りたい', actionHint: 'bath', bubbleColor: 'rgba(204,251,241,0.97)', accentColor: '#14b8a6' },
      { trigger: 'dirty', emoji: '🧼', text: 'Badan agak bau...', japaneseFlair: 'ちょっとくさいかも', actionHint: 'bath', bubbleColor: 'rgba(204,251,241,0.97)', accentColor: '#14b8a6' },
    ];
    return bathThoughts[Math.floor(Math.random() * bathThoughts.length)];
  }

  // Tier 2 — Happy / good state
  if (happiness >= 80) {
    const happyThoughts: IdleThought[] = [
      { trigger: 'happy', emoji: '✨', text: 'Senang sekali hari ini~!', japaneseFlair: '今日は幸せだよ', bubbleColor: 'rgba(254,249,195,0.97)', accentColor: '#eab308' },
      { trigger: 'happy', emoji: '🦊', text: 'Kitsune yang bahagia!', japaneseFlair: '幸せな狐', bubbleColor: 'rgba(254,249,195,0.97)', accentColor: '#eab308' },
      { trigger: 'happy', emoji: '🌸', text: 'Aroma sakura...', japaneseFlair: '桜の香りがする', bubbleColor: 'rgba(254,228,228,0.97)', accentColor: '#ec4899' },
      { trigger: 'happy', emoji: '🎋', text: 'Semuanya sempurna~', japaneseFlair: '全てが完璧だ', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#22c55e' },
    ];
    return happyThoughts[Math.floor(Math.random() * happyThoughts.length)];
  }

  // Tier 3 — Bored / want to play
  if (happiness <= 50) {
    const boredThoughts: IdleThought[] = [
      { trigger: 'bored', emoji: '🎮', text: 'Mau main Matsuri!', japaneseFlair: 'お祭りがしたいな', actionHint: 'matsuri', bubbleColor: 'rgba(243,232,255,0.97)', accentColor: '#a855f7' },
      { trigger: 'bored', emoji: '🎯', text: 'Bosen... main yuk?', japaneseFlair: '暇だなぁ', actionHint: 'matsuri', bubbleColor: 'rgba(243,232,255,0.97)', accentColor: '#a855f7' },
      { trigger: 'bored', emoji: '🌟', text: 'Pengen ke Kuil Inari!', japaneseFlair: '稲荷神社に行きたい', actionHint: 'shrine', bubbleColor: 'rgba(254,252,232,0.97)', accentColor: '#ca8a04' },
    ];
    return boredThoughts[Math.floor(Math.random() * boredThoughts.length)];
  }

  // Tier 4 — Random zen thoughts
  const randomThoughts: IdleThought[] = [
    { trigger: 'random', emoji: '🍵', text: 'Teh matcha terasa manis...', japaneseFlair: '抹茶がおいしい', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#16a34a' },
    { trigger: 'random', emoji: '🌙', text: 'Bulan malam ini indah...', japaneseFlair: '今夜の月が美しい', bubbleColor: 'rgba(224,231,255,0.97)', accentColor: '#818cf8' },
    { trigger: 'random', emoji: '🎐', text: 'Angin sepoi lewat~', japaneseFlair: 'そよ風が吹いてきた', bubbleColor: 'rgba(224,242,254,0.97)', accentColor: '#0ea5e9' },
    { trigger: 'random', emoji: '🦋', text: 'Kupu-kupu yang cantik!', japaneseFlair: '綺麗な蝶だな', bubbleColor: 'rgba(253,244,255,0.97)', accentColor: '#d946ef' },
    { trigger: 'random', emoji: '🌿', text: 'Mencium aroma hutan~', japaneseFlair: '森の香りがする', bubbleColor: 'rgba(220,252,231,0.97)', accentColor: '#22c55e' },
    { trigger: 'random', emoji: '⛩️', text: 'Inari-sama melindungi...', japaneseFlair: '稲荷様のご加護', bubbleColor: 'rgba(255,247,237,0.97)', accentColor: '#f97316' },
    { trigger: 'random', emoji: '🎵', text: 'Koto terdengar dari jauh~', japaneseFlair: '琴の音が聞こえる', bubbleColor: 'rgba(253,244,255,0.97)', accentColor: '#a855f7' },
    { trigger: 'random', emoji: '❄️', text: 'Sepertinya akan turun salju...', japaneseFlair: '雪が降りそうだな', bubbleColor: 'rgba(240,249,255,0.97)', accentColor: '#38bdf8' },
  ];
  return randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
}

/**
 * Draws an anime-style speech/thought bubble above the Kitsune.
 * Returns the bounding box {x, y, w, h} for click detection.
 */
