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
function getVoiceSettings(emotion, speed = 1, pitch = 1) {
  const settings = { stability: 0.7, similarity_boost: 0.75 };

  switch (emotion) {
    case 'angry':
      settings.stability = 0.18;
      settings.similarity_boost = 0.85;
      break;
    case 'sad':
      settings.stability = 0.75;
      settings.similarity_boost = 0.7;
      break;
    case 'nervous':
      settings.stability = 0.4;
      settings.similarity_boost = 0.6;
      break;
    case 'gentle':
      settings.stability = 0.9;
      settings.similarity_boost = 0.75;
      break;
  }

  settings.speed = speed;
  settings.pitch = pitch;

  return settings;
}

// ===== GENERATE AUDIO =====
app.post('/generate-audio', async (req, res) => {
  try {
    const { text, voiceId, emotion, speed, pitch } = req.body;

    // Validate input
    if (!text || !voiceId) {
      return res.status(400).json({ error: 'text dan voice wajib' });
    }

    // Validate voiceId exists in VOICE_MAP
    if (!Object.values(VOICE_MAP).includes(voiceId)) {
      return res.status(400).json({ error: 'voiceId tidak valid' });
    }

    const timestamp = Date.now();
    const outputFile = path.join(audioOutputDir, `output_${timestamp}.mp3`);

    // Call ElevenLabs TTS API
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

    // Save audio file
    fs.writeFileSync(outputFile, response.data);
    console.log('✅ Audio generated:', outputFile);

    // Return file URL for streaming and download
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
