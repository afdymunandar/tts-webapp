require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// === Tambahkan di sini ===
const characters = require('./utils/index.json').characters;
const emotions = require('./utils/emotions.json');
console.log('Characters loaded:', characters);
console.log('Emotions loaded:', Object.keys(emotions));

// Middleware
app.use(express.json());
app.use(express.static('frontend')); // serve frontend files

// Pastikan folder audio/output ada
const audioOutputDir = path.join(__dirname, 'audio/output');
if (!fs.existsSync(audioOutputDir)) {
  fs.mkdirSync(audioOutputDir, { recursive: true });
  }

  // Route generate-audio
  app.post('/generate-audio', (req, res) => {
    ...
    });

    // Route upload-audio
    app.post('/upload-audio', (req, res) => {
      ...
      });

      // Start server
      app.listen(PORT, () => {
        console.log(`Server started ✅ on port ${PORT}`);
        });