require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Load characters & emotions
const characters = require('./utils/index.json').characters;
const emotions = require('./utils/emotions.json');

console.log('Characters loaded:', characters);
console.log('Emotions loaded:', Object.keys(emotions));

// Middleware
app.use(express.json());
app.use(express.static('frontend'));

// Pastikan folder audio/output ada
const audioOutputDir = path.join(__dirname, 'audio/output');
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
}

// Route generate audio
app.post('/generate-audio', async (req, res) => {
  const { text, voiceId, emotion } = req.body;

  try {
    const outputFile = path.join(audioOutputDir, 'output.mp3');

    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech',
      {
        text: text,
        voice: voiceId,
        emotion: emotion
      },
      {
        headers: { 'Authorization': `Bearer ${process.env.ELEVEN_API_KEY}` },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(outputFile, Buffer.from(response.data));
    res.json({ success: true, file: 'audio/output/output.mp3' });
  } catch (err) {
    console.error('Error generating audio:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route upload audio (placeholder)
app.post('/upload-audio', (req, res) => {
  res.json({ success: true, file: 'audio/output/uploaded_audio.mp3' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started ✅ on port ${PORT}`);
});
