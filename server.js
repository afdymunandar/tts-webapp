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

// ===== EMOTION → VOICE SETTINGS =====
// ⚠️ ElevenLabs TIDAK membaca emotion dari text
function getVoiceSettings(emotion) {
  switch (emotion) {
    case 'angry':
      return { stability: 0.15, similarity_boost: 0.9 };
    case 'sad':
      return { stability: 0.7, similarity_boost: 0.75 };
    case 'calm':
      return { stability: 0.8, similarity_boost: 0.7 };
    case 'nervous':
      return { stability: 0.35, similarity_boost: 0.6 };
    default:
      return { stability: 0.5, similarity_boost: 0.75 };
  }
}

// ===== GENERATE AUDIO =====
app.post('/generate-audio', async (req, res) => {
  try {
    const { text, voiceId, emotion } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: 'text dan voiceId wajib' });
    }

    // ⚠️ JANGAN tambahkan emotion ke text
    const finalText = text;

    const outputFile = path.join(audioOutputDir, 'output.mp3');

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

    console.log('✅ Audio generated');

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
