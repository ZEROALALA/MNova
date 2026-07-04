const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');

async function generateSpeechBuffer(text, voice) {
  const voiceName = voice || 'ar-SA-ZariyahNeural';
  const langCode = voiceName.split('-').slice(0, 2).join('-');
  
  const tts = new EdgeTTS({
    voice: voiceName,
    lang: langCode,
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
  });

  const tempFilePath = path.join(app.getPath('temp'), `tts_${Date.now()}.mp3`);
  
  try {
    await tts.ttsPromise(text, tempFilePath);
    const buffer = await fs.promises.readFile(tempFilePath);
    
    // Clean up
    fs.promises.unlink(tempFilePath).catch(e => console.error('Failed to delete temp TTS file:', e));
    
    // Return Base64 encoded audio
    return `data:audio/mp3;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('TTS Generation Error:', error);
    throw error;
  }
}

// Groq API Key
let GROQ_API_KEY = '';

function setGroqApiKey(key) {
  GROQ_API_KEY = key;
}

async function transcribeAudioBuffer(audioBuffer, mimetype = 'audio/webm') {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
    throw new Error('Groq API Key is not set. Please set it in Settings to use Whisper.');
  }

  // Create form data manually to send buffer to Groq
  const form = new FormData();
  
  // Extension depends on mimetype. Usually webm from MediaRecorder in Chrome.
  const ext = mimetype.includes('mp4') ? 'mp4' : 'webm';
  const audioBlob = new Blob([audioBuffer], { type: mimetype });
  form.append('file', audioBlob, `audio.${ext}`);
  form.append('model', 'whisper-large-v3');
  form.append('response_format', 'json');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: form
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq Whisper Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Whisper Transcription Error:', error);
    throw error;
  }
}

module.exports = {
  generateSpeechBuffer,
  transcribeAudioBuffer,
  setGroqApiKey
};
