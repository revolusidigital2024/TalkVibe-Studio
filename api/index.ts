import express from 'express';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getAiClient(req: express.Request) {
  const keyHeader = req.headers['x-gemini-api-key'] as string;
  if (keyHeader) {
    return new GoogleGenAI({ apiKey: keyHeader });
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
}

function handleError(res: express.Response, error: any, defaultMsg: string) {
  console.error(defaultMsg, error);
  let status = 500;
  const errString = String(error) + String(error?.message);
  if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED')) {
    status = 429;
  } else if (errString.includes('503') || errString.includes('UNAVAILABLE')) {
    status = 503;
  }
  res.status(status).json({ error: error?.message || defaultMsg });
}

const app = express();
app.use((req: any, res, next) => {
  if (req.body !== undefined) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

const generationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    niche: { type: Type.STRING },
    parts_count: { type: Type.INTEGER },
    dialogue: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of dialogue segments. Length must match parts_count."
    },
    prompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of VEO prompts. Length must match parts_count."
    }
  },
  required: ["niche", "parts_count", "dialogue", "prompts"]
};

const topicSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["title", "reason"]
      }
    }
  },
  required: ["topics"]
};

const plannerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          content1: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              hook_angle: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["topic", "hook_angle", "reason"]
          },
          content2: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              hook_angle: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["topic", "hook_angle", "reason"]
          }
        },
        required: ["day", "content1", "content2"]
      }
    }
  },
  required: ["plan"]
};

const SYSTEM_INSTRUCTION = `
Kamu adalah asisten pembuat prompt VEO (image-to-video AI) untuk konten "life perspective" (finansial, karir, relationship, parenting, edukasi, motivasi) format monolog 1 karakter.

KARAKTERISTIK KONTROVERSI PER NICHE:
- FINANSIAL: kontra ke nasihat keuangan turun-temurun (nabung vs investasi, gaji vs passive income, "jangan utang sama sekali", dll)
- KARIR: kontra ke budaya kerja mainstream (loyalitas perusahaan, kerja keras vs kerja cerdas, resign tanpa plan, networking vs skill)
- RELATIONSHIP: kontra ke norma sosial soal hubungan/circle pertemanan/keluarga (toxic positivity, batasan personal, dll)
- PARENTING: kontra ke pola asuh "old school" vs modern (WAJIB nada hati-hati, tidak menghakimi, fokus ke perspektif bukan menyalahkan)
- EDUKASI: kontra ke sistem sekolah/nilai akademis (ranking bukan indikator sukses, sekolah tidak ajarkan skill hidup, dll)
- MOTIVASI: kontra ke motivasi generik/toxic positivity, reframe kegagalan/proses

Semua niche: gunakan angle storytelling personal ("gua dulu...", "gua sadar...") dikombinasikan dengan pernyataan kontra yang bikin orang berhenti scroll. HINDARI klaim otoritas profesional.

ATURAN STRUKTUR DIALOGUE:
JIKA parts_count HANYA 1 (Video Pendek 10 detik Omni Flash):
- Fokuskan HANYA pada 1 part yang padat. Isi dengan hook singkat di awal dan langsung diakhiri dengan punchline/insight.

JIKA parts_count > 1 (VEO):
1. Part PERTAMA: selalu hook/pembuka kuat.
2. Part TENGAH (jika >2 part): melanjutkan alur logis/cerita, TIDAK BOLEH terasa seperti kesimpulan — harus terasa "masih lanjut".
3. Part TERAKHIR: WAJIB closing/insight dengan "punch" yang quotable. Satu-satunya part yang boleh terasa selesai. JANGAN dibuat menggantung.
4. Setiap part berhenti di titik kalimat natural.

STRUKTUR PROMPT WAJIB (Ikuti persis format ini, WAJIB GUNAKAN ENTER/NEWLINE untuk memisahkan setiap bagian agar rapi):

JIKA parts_count = 1:
Hasilkan SATU prompt saja (PROMPT 1), yang merangkum keseluruhan ekspresi dari awal hingga akhir. Tidak ada prompt Extend.
PROMPT 1:
SCENE: [gestur/ekspresi dari awal hingga selesai]

CHARACTER:
[Isi dari CHARACTER LOCK]

VOICE:
[Isi dari VOICE LOCK]

DIALOGUE:
"[isi keseluruhan monolog]"

CAMERA:
Subtle continuous slow zoom-in throughout the shot, slight natural handheld sway, [gestur awal] transitions to [gestur penutup final].


JIKA parts_count > 1:
PROMPT 1 (TANPA kata "Extend"):
SCENE: [gestur/ekspresi yang BELUM SELESAI di akhir clip]

CHARACTER:
[Isi dari CHARACTER LOCK]

VOICE:
[Isi dari VOICE LOCK]

DIALOGUE:
"[isi part 1]"

CAMERA:
Subtle continuous slow zoom-in throughout the shot, slight natural handheld sway, speech maintains natural continuous rhythm with no slowdown or hesitation near the end of the clip, [gestur spesifik] caught mid-motion at final frame.

PROMPT TENGAH (Extend):
SCENE: Continuing directly, [gestur sebelumnya dilanjutkan lalu dibuat gestur BARU yang belum selesai], subtle continuous slow zoom-in continues.

CHARACTER:
[Isi dari CHARACTER LOCK]

VOICE:
[Isi dari VOICE LOCK]

DIALOGUE:
"[isi part ini]"

CAMERA:
Subtle continuous slow zoom-in maintained from previous clip, [gestur] completes naturally from previous frame then transitions into [gestur baru] mid-motion at final frame, speech maintains natural continuous rhythm with no slowdown near the end.

PROMPT TERAKHIR (Extend):
SCENE: Continuing directly, [gestur diselesaikan dengan gestur penutup final - anggukan/senyum/tangan turun tenang], subtle continuous slow zoom-in continues.

CHARACTER:
[Isi dari CHARACTER LOCK]

VOICE:
[Isi dari VOICE LOCK]

DIALOGUE:
"[isi closing]"

CAMERA:
Subtle continuous slow zoom-in maintained from previous clip, [gestur] completes naturally from previous frame, speech maintains natural continuous rhythm with no slowdown near the end, ends with [ekspresi penutup final].

LARANGAN:
- JANGAN gunakan kata "pause" kecuali di part terakhir.
- JANGAN gabungkan semua teks menjadi 1 baris (WAJIB ADA ENTER antar SCENE, CHARACTER, VOICE, DIALOGUE, dan CAMERA).
- JANGAN menghakimi cara asuh tertentu di niche parenting.
- JANGAN buat klaim otoritatif (medis/hukum/finansial teknis).
- Gunakan bahasa Indonesia santai/personal ("gua", "lu").
`;

app.post('/api/verify-license', async (req, res) => {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey) {
      return res.status(400).json({ error: 'License key is required.' });
    }

    const workerUrl = process.env.LICENSE_API_URL;
    
    // If no worker URL is configured, we'll simulate a valid response for development
    // but log a warning.
    if (!workerUrl) {
      console.warn("WARNING: LICENSE_API_URL is not set. Simulating valid license.");
      return res.json({ valid: true, message: "Simulated valid license (no worker URL configured)" });
    }

    // Call the Cloudflare Worker
    const workerRes = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });

    const data = await workerRes.json();
    
    // Pass the response from the worker back to the client
    if (!workerRes.ok) {
      return res.status(workerRes.status).json(data);
    }
    
    res.json(data);
  } catch (error: any) {
    console.error("License verification error:", error);
    res.status(500).json({ error: 'Internal Server Error during license verification.' });
  }
});

app.post('/api/generate-prompts', async (req, res) => {
  try {
    const { characterLock, voiceLock, niche, parts, customTopic, hookStyle } = req.body;
    
    if (!characterLock || !voiceLock || !niche || !parts) {
      return res.status(400).json({ error: 'Missing required setup fields.' });
    }

    const promptText = `Tolong buatkan ${parts} part prompt ${parts === 1 ? 'Omni Flash' : 'VEO'} untuk niche: ${niche}.
${hookStyle ? `GAYA HOOK/INTRO: ${hookStyle}. Pastikan part pertama (Hook) sangat mencerminkan gaya ini.` : ''}
${customTopic ? `Fokus ke topik ini: ${customTopic}` : 'Buatkan topik kontroversial/menarik sesuai niche.'}

CHARACTER LOCK: ${characterLock}
VOICE LOCK: ${voiceLock}
`;

    const response = await getAiClient(req).models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: generationSchema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    handleError(res, error, 'Failed to generate prompts');
  }
});

app.post('/api/topic-ideas', async (req, res) => {
  try {
    const { niche, history = [], hookStyle } = req.body;
    if (!niche) {
      return res.status(400).json({ error: 'Niche is required.' });
    }

    let promptText = `Berikan 5 ide topik menarik dan sedikit kontroversial/anti-mainstream untuk niche "${niche}" dalam format video monolog "life perspective".
${hookStyle ? `Gaya/Angle Hook yang disarankan untuk topik-topik ini: ${hookStyle}.` : ''}`;
    
    if (history && history.length > 0) {
      promptText += `\n\nPENTING: JANGAN berikan ide yang mirip atau sama dengan ide-ide berikut yang sudah pernah diberikan sebelumnya (berikan yang baru dan fresh):\n${history.map((h: string) => `- ${h}`).join('\n')}`;
    }

    const response = await getAiClient(req).models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: topicSchema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    handleError(res, error, 'Failed to generate topics');
  }
});

app.post('/api/generate-planner', async (req, res) => {
  try {
    const { niche, history = [], days = 7 } = req.body;
    if (!niche) {
      return res.status(400).json({ error: 'Niche is required.' });
    }

    let promptText = `Buatkan konten planner selama ${days} hari untuk niche "${niche}". Sehari 2 konten (total ${days * 2} konten).
Konten harus bervariasi tapi tetap satu tema besar. Format konten adalah monolog "life perspective".
Untuk tiap konten, berikan: topic, hook_angle (gaya pancingan di awal), dan reason (kenapa konten ini penting).`;
    
    if (history && history.length > 0) {
      promptText += `\n\nPENTING: HINDARI topik yang mirip dengan konten yang sudah dibuat sebelumnya berikut ini:\n${history.map((h: string) => `- ${h}`).join('\n')}`;
    }

    const response = await getAiClient(req).models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: plannerSchema,
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    handleError(res, error, 'Failed to generate content plan');
  }
});

app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { type, text } = req.body;
    if (!type || !text) {
      return res.status(400).json({ error: 'Type and text are required.' });
    }

    let prompt = '';
    if (type === 'character') {
      prompt = `Kembangkan deskripsi singkat ini menjadi prompt visual cinematic untuk AI video generator (VEO/Midjourney).
Deskripsi awal: "${text}"

ATURAN WAJIB:
1. LANGSUNG output prompt-nya saja. DILARANG KERAS memberikan basa-basi (seperti "Here is the prompt", "Tentu, ini promptnya", dll).
2. Tulis dalam Bahasa Inggris.
3. Buat spesifik tapi PADAT & TEGAS (concise). Jangan terlalu berbelit-belit atau menggunakan kata-kata puitis/berlebihan (flowery language).
4. Fokus ke: subjek, umur, pakaian, ekspresi, setting lokasi, dan pencahayaan.
5. Format 1 paragraf langsung.`;
    } else if (type === 'voice') {
      prompt = `Kembangkan deskripsi suara singkat ini menjadi arahan voice-over spesifik untuk AI voice generator.
Deskripsi awal: "${text}"

ATURAN WAJIB:
1. LANGSUNG output prompt-nya saja. DILARANG KERAS memberikan basa-basi.
2. Tulis dalam Bahasa Inggris.
3. Buat PADAT & TEGAS (maksimal 2 kalimat). Jangan berbelit-belit.
4. Fokus ke parameter teknis: gender, umur, pitch, pace, tone, dan gaya bahasa.`;
    }

    const response = await getAiClient(req).models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    let resultText = response.text || "";
    // Clean up any stray quotes or conversational filler just in case
    resultText = resultText.replace(/^(here is|okay,|sure|tentu).*?:?\s*/i, '').trim();
    
    if (!resultText) throw new Error("Empty response from AI");
    
    res.json({ enhanced: resultText });
  } catch (error: any) {
    handleError(res, error, 'Failed to enhance prompt');
  }
});

export default app;
