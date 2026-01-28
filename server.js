require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Load characters & emotions =====
const characters = require('./utils/index.json').characters;
const emotions = require('./utils/emotions.json');

console.log('Characters loaded:', characters);
console.log('Emotions loaded:', Object.keys(emotions));

// ===== Middleware =====
app.use(express.json());
app.use(express.static('frontend')); // serve frontend files

// ===== Pastikan folder audio/output ada =====
const audioOutputDir = path.join(__dirname, 'audio/output');
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
  }

  // ===== Skeleton route: generate audio (TTS) =====
  app.post('/generate-audio', (req, res) => {
    const { text, voiceId, emotion } = req.body;

      console.log(`Text: ${text}`);
        console.log(`Voice: ${voiceId}`);
          console.log(`Emotion: ${emotion}`);

            // Dummy output file sementara
              const outputFile = path.join(audioOutputDir, 'output.mp3');
                fs.writeFileSync(outputFile, ''); // buat file kosong sementara

                  res.json({ success: true, file: 'audio/output/output.mp3' });
                  });

                  // ===== Skeleton route: upload audio =====
                  app.post('/upload-audio', (req, res) => {
                    // nanti pakai multer untuk file upload
                      res.json({ success: true, file: 'audio/output/uploaded_audio.mp3' });
                      });

                      // ===== Start server =====
                      app.listen(PORT, () => {
                        console.log(`Server started ✅ on port ${PORT}`);
                        });