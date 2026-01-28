const characters = [
  { name: "Character 1", voiceId: "cgSgspJ2msm6clMCkdW9" },
  { name: "Character 2", voiceId: "CwhRBWXzGAHq8TQ4Fs17" },
  { name: "Character 3", voiceId: "EXAVITQu4vr4xnSDxMaL" },
  { name: "Character 4", voiceId: "AZnzlk1XvdvUeBnXmlld" }
];

const emotions = [
  "calm","gentle","nervous","panic","angry","firm","shy","weak","yell","scold","high_pitch","low_pitch"
];

const characterSelect = document.getElementById('character');
characters.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.voiceId;
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

document.getElementById('generate').addEventListener('click', async () => {
  const text = document.getElementById('text').value;
  const voiceId = characterSelect.value;
  const emotion = emotionSelect.value;

  const res = await fetch('/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, emotion })
  });

  const data = await res.json();
  const player = document.getElementById('player');
  player.src = data.file;
  player.play();
});
