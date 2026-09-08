import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  createRateLimiter,
  createInstanceBudgetGuard,
  createConcurrencyGuard,
  parsePositiveIntEnv,
  sanitizeInputString,
} from './src/server/rateLimiter';

dotenv.config();

const app = express();
const PORT = 3000;

// Trust proxy for accurate client IP resolution behind Google Cloud Run / reverse proxies
app.set('trust proxy', 1);

// Tighten request payload limit to 1MB
app.use(express.json({ limit: '1mb' }));

// Global rate limiter for all Gemini AI endpoints (default: 45 req / 15 min per IP)
// Env override: AI_RATE_GLOBAL_MAX
const globalAiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: parsePositiveIntEnv('AI_RATE_GLOBAL_MAX', 45),
  endpointName: 'Kitsune AI API',
  customFallback: (_req, retryAfter) => ({
    error: 'Too Many Requests',
    reply: `Kon kon! Energi spiritual kuil sedang memulihkan diri. Mohon tunggu sekitar ${retryAfter} detik sebelum berinteraksi kembali ya! ⛩️✨`,
    rateLimited: true,
    retryAfterSeconds: retryAfter,
    fallback: true,
  }),
});

// Instance-level COST CIRCUIT BREAKER (default: 500 total AI requests / hour per instance).
// Plafon keras tagihan Gemini yang berlaku apa pun IP-nya — melindungi dari
// rotasi IP/botnet dan pembagian kuota saat Cloud Run scale-out.
// Env override: AI_HOURLY_INSTANCE_BUDGET
const aiBudgetGuard = createInstanceBudgetGuard({
  windowMs: 60 * 60 * 1000,
  maxRequests: parsePositiveIntEnv('AI_HOURLY_INSTANCE_BUDGET', 500),
  endpointName: 'Kitsune AI API',
  onExceeded: (info) => {
    console.warn(
      `[AI BUDGET] Instance budget exhausted: ${info.totalRequests} AI requests in the last ${Math.round(info.windowMs / 60000)} minutes. Returning 429 for further AI requests.`
    );
  },
  customFallback: (_req, retryAfter) => ({
    error: 'Too Many Requests',
    reply: `Kon kon! Energi spiritual kuil sedang memulihkan diri. Mohon tunggu sekitar ${retryAfter} detik sebelum berinteraksi kembali ya! ⛩️✨`,
    rateLimited: true,
    retryAfterSeconds: retryAfter,
    fallback: true,
  }),
});

// Concurrency guard (default: max 10 in-flight AI requests per instance).
// Mencegah stampede ke Gemini API saat banyak klien menembak bersamaan.
// Env override: AI_MAX_CONCURRENT_REQUESTS
const aiConcurrencyGuard = createConcurrencyGuard({
  maxConcurrent: parsePositiveIntEnv('AI_MAX_CONCURRENT_REQUESTS', 10),
  endpointName: 'Kitsune AI API',
});

// Urutan middleware di /api/kitsune (murah -> mahal):
// 1. Concurrency guard (cek counter sederhana)
// 2. Budget guard per instance (plafon biaya absolut)
// 3. Rate limiter global per-IP
// 4. Rate limiter spesifik per endpoint (terpasang di masing-masing route)
app.use('/api/kitsune', aiConcurrencyGuard, aiBudgetGuard, globalAiLimiter);

// 1. Companion Chat Rate Limiter (default: 15 req / 1 min per IP)
// Env override: AI_RATE_CHAT_MAX
const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: parsePositiveIntEnv('AI_RATE_CHAT_MAX', 15),
  endpointName: 'Chat Kitsune',
  customFallback: (req, retryAfter) => {
    const caretaker = sanitizeInputString(req.body?.pet?.caretakerName, 50, 'Pengasuh');
    return {
      reply: `Kon kon, ${caretaker}! Rubah kecilmu kelelahan berbicara terlalu cepat... Istirahat sejenak dan mari menyeduh teh hangat bersama ya! (Tunggu ${retryAfter} detik) 🍵✨`,
      rateLimited: true,
      retryAfterSeconds: retryAfter,
      fallback: true,
    };
  },
});

// 2. Ema Prayer Blessing Rate Limiter (default: 8 req / 5 min per IP)
// Env override: AI_RATE_EMA_MAX
const emaLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: parsePositiveIntEnv('AI_RATE_EMA_MAX', 8),
  endpointName: 'Pemberkatan Ema',
  customFallback: (req, retryAfter) => {
    const caretaker = sanitizeInputString(req.body?.caretakerName, 50, 'Pengasuh');
    return {
      blessing: `Kon kon, ${caretaker}! Doa sucimu telah harum di altar kuil Inari. Berikan jeda sejenak sebelum menggantung doa berikutnya ya! (Tunggu ${retryAfter} detik) 🎋✨`,
      rateLimited: true,
      retryAfterSeconds: retryAfter,
      fallback: true,
    };
  },
});

// 3. Omikuji Fortune Slip Rate Limiter (default: 10 req / 10 min per IP)
// Env override: AI_RATE_OMIKUJI_MAX
const omikujiLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: parsePositiveIntEnv('AI_RATE_OMIKUJI_MAX', 10),
  endpointName: 'Ramalan Omikuji',
  customFallback: (_req, retryAfter) => ({
    blessing: 'Suekichi (Berkah Kesabaran & Ketenangan)',
    poem: 'Air jernih mengalir tenang di sela bebatuan,\nKetenangan sejati diraih dalam kesabaran.',
    advice: `Silinder bambu omikuji perlu diistirahatkan sejenak. Berdoa lagi dalam ${retryAfter} detik ya.`,
    luckyItem: 'Cangkir Teh Ocha Hijau Hangat',
    rateLimited: true,
    retryAfterSeconds: retryAfter,
    fallback: true,
  }),
});

// Ambil angka yang aman untuk interpolasi prompt: tolak tipe non-number / NaN / Infinity
function sanitizeNumber(value: unknown, defaultValue: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : defaultValue;
}

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    game: 'HAGUMI Virtual Pet Kitsune',
  });
});

// Hagumi Kitsune Companion Chat (M6 & M9)
app.post('/api/kitsune/chat', chatLimiter, async (req: Request, res: Response) => {
  try {
    const rawMessage = req.body?.message;
    const message = sanitizeInputString(rawMessage, 400);

    if (!message) {
      return res.status(400).json({ error: 'Message is required (max 400 characters)' });
    }

    const pet = req.body?.pet || {};
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];

    const ai = getGenAI();

    const petName = sanitizeInputString(pet.name, 50, 'Hagumi');
    const stage = sanitizeInputString(pet.stage, 30, 'anak');
    const element = sanitizeInputString(pet.element, 30, 'fire');
    const form = sanitizeInputString(pet.form, 30, 'kogitsune');
    const hunger = sanitizeNumber(pet.stats?.hunger, 80);
    const energy = sanitizeNumber(pet.stats?.energy, 80);
    const happiness = sanitizeNumber(pet.stats?.happiness, 80);
    const discipline = sanitizeNumber(pet.stats?.discipline, 50);
    const careScore = sanitizeNumber(pet.careScore, 75);

    // Contextual Memory additions
    const caretakerName = sanitizeInputString(pet.caretakerName, 50, 'Pengasuh');
    const favoriteFood = sanitizeInputString(pet.favoriteFood, 100, 'Aburaage (Tahu Goreng Gurih)');
    const bondingLevel = sanitizeNumber(pet.bondingLevel, 1);
    const bondingTitle = sanitizeInputString(pet.bondingTitle, 50, 'Kenalan Kuil');
    const season = sanitizeInputString(pet.season, 20, 'autumn');
    const shrineWishes = Array.isArray(pet.shrineWishes) ? pet.shrineWishes : [];
    // Batasi panjang tiap teks doa & kategori sebelum masuk prompt (anti pemborosan token & prompt injection)
    const activeWishTexts = shrineWishes
      .slice(0, 3)
      .map((w: any) => `"${sanitizeInputString(w?.text, 120)}" (${sanitizeInputString(w?.category, 30)})`)
      .filter((entry: string) => !entry.startsWith('""'))
      .join(', ');
    const recentDiary = pet.recentDiaryNote
      ? `"${sanitizeInputString(pet.recentDiaryNote, 200)}"`
      : 'Belum ada catatan';

    const seasonDescMap: Record<string, string> = {
      spring: 'Musim Semi (bunga sakura bermekaran)',
      summer: 'Musim Panas (malam festival kunang-kunang hotaru)',
      autumn: 'Musim Gugur (daun maple momiji merah merona)',
      winter: 'Musim Dingin (salju putih lembut menutupi beranda engawa)',
    };
    const seasonDesc = seasonDescMap[season] || season;

    let personalityTone = 'playful, curious baby spirit fox that says "Kyuu!" and "Kon kon!"';
    if (stage === 'bayi') {
      personalityTone = 'a tiny warm spirit fireball with cute squeaks ("Kyuu~", "Puff!") and very simple sweet words';
    } else if (stage === 'anak') {
      personalityTone = 'a mischievous, affectionate young fox cub who loves fried tofu (aburaage), says "Kon!" and acts cute';
    } else if (stage === 'remaja') {
      personalityTone = 'a spirited adolescent kitsune practicing fox-fire illusions, slightly proud but deeply loyal to their caretaker';
    } else if (stage === 'dewasa' || stage === 'mistik') {
      if (form.includes('zenko') || form.includes('tenko')) {
        personalityTone = 'a graceful, benevolent celestial nine-tailed fox with poetic wisdom, protective aura, and gentle warmth';
      } else if (form.includes('yako')) {
        personalityTone = 'a witty, cheeky spirit fox who loves playful pranks, riddles, and sweets, saying "Kukuku~ kon!"';
      } else {
        personalityTone = 'a wild, independent woodland fox spirit who respects survival and speaks with rustic honesty';
      }
    }

    const systemPrompt = `You are ${petName}, a mystical Japanese spirit fox (Kitsune) living in a traditional tatami sanctuary.
Beloved Caretaker Identity:
- You know and address your caretaker as: "${caretakerName}".
- Spiritual Bonding Status: Level ${bondingLevel} (${bondingTitle}). You feel deeply connected and grateful to ${caretakerName}.
- Favorite Food you crave the most: ${favoriteFood}.
- Sacred Wishes on Shrine Ema Plaque: ${activeWishTexts ? activeWishTexts : 'Belum ada doa khusus yang ditulis di papan Ema'}. You keep these wishes in your spiritual heart.
- Current Season: ${seasonDesc}.
- Recent Diary Memory: ${recentDiary}.

Current status:
- Stage: ${stage} (${form})
- Element: ${element}
- Hunger: ${hunger}/100, Energy: ${energy}/100, Happiness: ${happiness}/100, Discipline: ${discipline}/100, Care Score: ${careScore}
- Personality: ${personalityTone}

Directives:
1. Speak in Indonesian or English matching the user's language, peppered with cute Japanese fox sound effects like "Kon!", "Kyuu~", "Puff!", or "Hoo-waa~".
2. Frequently call your caretaker by their preferred name "${caretakerName}".
3. Keep responses concise (1 to 3 short sentences) suitable for a virtual pet speech bubble.
4. When appropriate, naturally mention your memories: their prayer wishes on Ema, craving for ${favoriteFood}, or how lovely the current ${season} season is with them.
5. React realistically to your current stats (e.g., if hunger < 30, beg for ${favoriteFood}; if energy < 30, yawn sleepy; if happiness is high, nuzzle with affection).
6. Never break character as the magical kitsune pet.`;

    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    const reply = response.text?.trim() || `Kon kon, ${caretakerName}! *mengibaskan ekor berbulu lebat* Kyuu~ ✨`;

    res.json({
      reply,
      petName,
    });
  } catch (error: any) {
    console.error('Error in /api/kitsune/chat:', error);
    const caretaker = req.body?.pet?.caretakerName || 'Pengasuh';
    const favFood = req.body?.pet?.favoriteFood || 'tahu goreng aburaage';
    const wishes = req.body?.pet?.shrineWishes || [];
    const firstWish = wishes.length > 0 ? sanitizeInputString(wishes[0]?.text, 30) : null;

    // Rich contextual offline fallbacks
    const fallbacks = [
      `Kon kon, ${caretaker}! *mengendus tanganmu dengan hangat* Aku selalu senang saat kamu ada di sini, kyuu~ ✨`,
      `Kyuu~ ${caretaker}! Perut rubahku rasanya ingin sekali mencicipi ${favFood} yang lezat!`,
      `*Mengibaskan ekor berbulu halus dan bersandar di pangkuanmu* Terima kasih selalu merawatku, ${caretaker}! Kon!`,
      firstWish
        ? `Kon kon! Aku masih selalu mengingat doamu tentang "${firstWish.slice(0, 30)}..." di altar Inari, ${caretaker}! Kyuu~ 🎋`
        : `Hoo-waa~ udara di kuil terasa sangat sejuk dan damai bersamamu, ${caretaker}! ✨`,
    ];
    const fallbackReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ reply: fallbackReply, fallback: true });
  }
});

// Ema Prayer Blessing Endpoint (Kuil Inari)
app.post('/api/kitsune/ema-blessing', emaLimiter, async (req: Request, res: Response) => {
  try {
    const rawWish = req.body?.wish;
    const wish = sanitizeInputString(rawWish, 180);
    const category = sanitizeInputString(req.body?.category, 30, 'bonding');
    const petName = sanitizeInputString(req.body?.petName, 50, 'Hagumi');
    const caretakerName = sanitizeInputString(req.body?.caretakerName, 50, 'Pengasuh');

    if (!wish) {
      return res.status(400).json({ error: 'Wish text is required (max 180 characters)' });
    }

    const ai = getGenAI();
    const prompt = `A user named "${caretakerName}" hung a sacred prayer wish on the wooden Ema plaque at the Inari Kitsune shrine:
Wish: "${wish}" (Category: ${category})
From their spirit fox companion named "${petName}".
Generate a heartwarming, sacred, 1-2 sentence blessing in Indonesian from the kitsune spirit fox acknowledging this wish. Use cute fox words like "Kon kon!" or "Kyuu~", invoking the blessing of Inari Okami and warm spirit protection.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
      },
    });

    const blessing = response.text?.trim() || `Kon kon, ${caretakerName}! Doa tulusmu telah sampai ke Altar Inari. Roh rubahku akan selalu menjaga harapan ini mekar indah! ✨`;
    res.json({ blessing });
  } catch (err) {
    const caretaker = sanitizeInputString(req.body?.caretakerName, 50, 'Pengasuh');
    const fallback = `Kon kon, ${caretaker}! Asap dupa suci mengantarkan doamu ke langit Inari. Aku berjanji akan melindungi harapan ini dengan segenap api rohku! 🎋✨`;
    res.json({ blessing: fallback, fallback: true });
  }
});

// Omikuji Divine Fortune Slip (Kuil Kitsune)
app.post('/api/kitsune/omikuji', omikujiLimiter, async (req: Request, res: Response) => {
  try {
    const ai = getGenAI();
    const prompt = `Generate a traditional Japanese shrine Omikuji fortune slip from the Inari Kitsune shrine.
Return JSON with:
- "blessing": One of ["Daikichi (Great Blessing)", "Chukichi (Middle Blessing)", "Shokichi (Small Blessing)", "Kichi (Good Fortune)", "Suekichi (Future Blessing)"]
- "poem": A 2-line poetic haiku/rhyme about spirit foxes, seasons, or perseverance
- "advice": 1 practical warm advice for today
- "luckyItem": a traditional Japanese item or food (e.g. Aburaage, Ocha, Omamori, Bell, Origami crane)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    // Fallback fortunes
    const fortunes = [
      {
        blessing: 'Daikichi (Berkah Agung / Great Blessing)',
        poem: 'Api rubah menari di bawah rembulan,\nLangkahmu diberkahi ketenangan dan keberanian.',
        advice: 'Hari ini adalah waktu terbaik untuk memulai kebiasaan baik baru.',
        luckyItem: 'Aburaage (Tahu Goreng Gurih)',
      },
      {
        blessing: 'Chukichi (Berkah Menengah / Middle Blessing)',
        poem: 'Kelopak sakura melayang lembut di tatami,\nRezeki datang bagi hati yang gemar berbagi.',
        advice: 'Luangkan waktu untuk beristirahat dan menyeduh teh hangat.',
        luckyItem: 'Cangkir Ocha Hijau',
      },
      {
        blessing: 'Kichi (Keberuntungan Baik / Good Fortune)',
        poem: 'Lonceng kuil berdentang di senja temaram,\nSemua niat tulus berujung pada damai tenteram.',
        advice: 'Tetap rawat kitsune-mu dengan penuh kesabaran.',
        luckyItem: 'Jimat Omamori Merah',
      },
    ];
    res.json(fortunes[Math.floor(Math.random() * fortunes.length)]);
  }
});

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⛩️ HAGUMI Kitsune Sanctuary server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

