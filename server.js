require('dotenv').config();

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== VALIDASI API KEY =====
if (!process.env.ELEVENLABS_API_KEY) {
  console.error('❌ ELEVENLABS_API_KEY tidak ditemukan di .env');
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
function getVoiceSettings(emotion, speed = 1.0, pitch = 1.0) {
  let settings = {};
  switch (emotion) {
    case 'angry': // marah
      settings = { stability: 0.18, similarity_boost: 0.85, style: 0.9 };
      break;
    case 'sad': // sedih
      settings = { stability: 0.75, similarity_boost: 0.7, style: 0.2 };
      break;
    case 'nervous': // gugup
      settings = { stability: 0.4, similarity_boost: 0.6, style: 0.5 };
      break;
    case 'gentle': // lemah lembut
      settings = { stability: 0.9, similarity_boost: 0.75, style: 0.15 };
      break;
    default:
      settings = { stability: 0.6, similarity_boost: 0.7, style: 0.3 };
  }

  // ⚡ Tambahkan pitch dan speed ke voice_settings jika ElevenLabs API mendukung
  settings.pitch = pitch;  // opsional, jika API tidak mendukung bisa diabaikan
  settings.rate = speed;    // opsional, jika API tidak mendukung bisa diabaikan

  return settings;
}

// ===== GENERATE AUDIO =====
app.post('/generate-audio', async (req, res) => {
  try {
    const { text, voice, emotion, speed = 1.0, pitch = 1.0 } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'text dan voice wajib' });
    }

    const voiceId = VOICE_MAP[voice];
    if (!voiceId) {
      return res.status(400).json({ error: 'voice tidak valid (1-3)' });
    }

    const outputFile = path.join(audioOutputDir, 'output.mp3');

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: getVoiceSettings(emotion, speed, pitch)
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
      file: '/audio/output/output.mp3'
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
