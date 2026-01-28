// ===== CHARACTER & VOICE MAP =====
const characters = [
  { name: "Character 1", id: "1" },
  { name: "Character 2", id: "2" },
  { name: "Character 3", id: "3" }
];

const emotions = ["angry", "sad", "nervous", "gentle"];

// ===== POPULATE SELECT OPTIONS =====
const characterSelect = document.getElementById('character');
characters.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.id;       // gunakan 1,2,3
  opt.textContent = c.name;
  characterSelect.appendChild(opt);
});

const emotionSelect = document.getElementById('emotion');
emotions.forEach(e => {
  const opt = document.createElement('option');
  opt.value = e;
  opt.textContent = e;
  emotionSelect.appendChild(opt);
});

// ===== EVENT GENERATE AUDIO =====
document.getElementById('generate').addEventListener('click', async () => {
  const text = document.getElementById('text').value.trim();
  const voice = characterSelect.value;
  const emotion = emotionSelect.value;

  if (!text) return alert("Isi teks dulu!");
  if (!voice) return alert("Pilih voice dulu!");

  try {
    const res = await fetch('/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, emotion })
    });

    const data = await res.json();

    if (data.success) {
      const player = document.getElementById('player');
      player.src = data.file + "?t=" + new Date().getTime(); // cache-busting
      player.play();
    } else {
      alert("Generate gagal: " + data.error);
    }

  } catch (err) {
    console.error(err);
    alert("Terjadi error saat generate audio");
  }
});

// ===== EVENT UPLOAD AUDIO =====
const uploadBtn = document.getElementById('uploadBtn');
const uploadAudio = document.getElementById('uploadAudio');

uploadBtn.addEventListener('click', async () => {
  if (!uploadAudio.files.length) return alert("Pilih file audio dulu");
  
  const formData = new FormData();
  formData.append('file', uploadAudio.files[0]);

  try {
    const res = await fetch('/upload-audio', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    alert("File uploaded: " + data.file);
  } catch (err) {
    console.error(err);
    alert("Terjadi error saat upload audio");
  }
});
