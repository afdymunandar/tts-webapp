require('dotenv').config();

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

/* ================= VALIDASI ENV ================= */
if (!process.env.ELEVEN_API_KEY) {
  console.error('❌ ELEVEN_API_KEY tidak ditemukan di .env');
  process.exit(1);
}
console.log('✅ ELEVEN_API_KEY loaded');

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.static('frontend'));

/* ================= AUDIO DIR ================= */
const audioOutputDir = path.join(__dirname, 'audio', 'output');
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
}

/* ================= ROUTE TTS ================= */
app.post('/generate-audio', async (req, res) => {
  try {
    const { text, voiceId, emotion } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({
        error: 'text dan voiceId wajib diisi'
      });
    }

    // Inject emotion (opsional)
    const finalText = emotion
      ? `[${emotion.toUpperCase()}] ${text}`
      : text;

    const outputFile = path.join(audioOutputDir, 'output.mp3');

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: finalText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
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
    console.error(
      '❌ Generate error:',
      err.response?.data || err.message
    );
    res.status(500).json({
      error: 'Generate audio gagal'
    });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
