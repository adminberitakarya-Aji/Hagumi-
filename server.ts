import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

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
app.post('/api/kitsune/chat', async (req: Request, res: Response) => {
  try {
    const {
      message = '',
      pet = {},
      history = [],
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();

    const petName = pet.name || 'Hagumi';
    const stage = pet.stage || 'anak';
    const element = pet.element || 'fire';
    const form = pet.form || 'kogitsune';
    const hunger = pet.stats?.hunger ?? 80;
    const energy = pet.stats?.energy ?? 80;
    const happiness = pet.stats?.happiness ?? 80;
    const discipline = pet.stats?.discipline ?? 50;
    const careScore = pet.careScore ?? 75;

    // Contextual Memory additions
    const caretakerName = pet.caretakerName || 'Pengasuh';
    const favoriteFood = pet.favoriteFood || 'Aburaage (Tahu Goreng Gurih)';
    const bondingLevel = pet.bondingLevel || 1;
    const bondingTitle = pet.bondingTitle || 'Kenalan Kuil';
    const season = pet.season || 'autumn';
    const shrineWishes = Array.isArray(pet.shrineWishes) ? pet.shrineWishes : [];
    const activeWishTexts = shrineWishes.slice(0, 3).map((w: any) => `"${w.text}" (${w.category})`).join(', ');
    const recentDiary = pet.recentDiaryNote ? `"${pet.recentDiaryNote}"` : 'Belum ada catatan';

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
    const firstWish = wishes.length > 0 ? wishes[0].text : null;

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
app.post('/api/kitsune/ema-blessing', async (req: Request, res: Response) => {
  try {
    const { wish = '', category = 'bonding', petName = 'Hagumi', caretakerName = 'Pengasuh' } = req.body;
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
    const caretaker = req.body?.caretakerName || 'Pengasuh';
    const fallback = `Kon kon, ${caretaker}! Asap dupa suci mengantarkan doamu ke langit Inari. Aku berjanji akan melindungi harapan ini dengan segenap api rohku! 🎋✨`;
    res.json({ blessing: fallback, fallback: true });
  }
});

// Omikuji Divine Fortune Slip (Kuil Kitsune)
app.post('/api/kitsune/omikuji', async (req: Request, res: Response) => {
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

