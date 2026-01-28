require('dotenv').config();

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== VALIDATE API KEY =====
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY not found in .env');
  process.exit(1);
}
console.log('✅ ELEVENLABS_API_KEY loaded');

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static('frontend'));
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// ===== AUDIO OUTPUT DIR =====
const audioOutputDir = path.join(__dirname, 'audio/output');
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
}

// ===== VOICE MAP =====
const VOICE_MAP = {
  "1": process.env.ELEVENLABS_VOICE_ID_1,
  "2": process.env.ELEVENLABS_VOICE_ID_2,
  "3": process.env.ELEVENLABS_VOICE_ID_3
};

// ===== EMOTION → VOICE SETTINGS =====
function getVoiceSettings(emotion) {
  switch (emotion) {
    case 'angry':
      return { stability: 0.18, similarity_boost: 0.85, style: 0.9 };
    case 'sad':
      return { stability: 0.75, similarity_boost: 0.7, style: 0.2 };
    case 'nervous':
      return { stability: 0.4, similarity_boost: 0.6, style: 0.5 };
    case 'gentle':
      return { stability: 0.9, similarity_boost: 0.75, style: 0.15 };
    default:
      return { stability: 0.6, similarity_boost: 0.7, style: 0.3 };
  }
}

// ===== GENERATE AUDIO =====
app.post('/generate-audio', async (req, res) => {
  try {
    const { text, voice, emotion } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'text dan voice wajib' });
    }

    const voiceId = VOICE_MAP[voice];
    if (!voiceId) return res.status(400).json({ error: 'voice tidak valid (1-3)' });

    const finalText = text; // ⚠️ emotion tidak ditambahkan ke text
    const timestamp = Date.now();
    const outputFile = path.join(audioOutputDir, `output_${timestamp}.mp3`);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: finalText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: getVoiceSettings(emotion)
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(outputFile, response.data);

    console.log('✅ Audio generated:', outputFile);

    res.json({
      success: true,
      file: `/audio/output_${timestamp}.mp3`,
      download: `/audio/output_${timestamp}.mp3`
    });

  } catch (err) {
    console.error('❌ Generate error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Generate audio gagal' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
