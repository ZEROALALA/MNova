const { EdgeTTS } = require('node-edge-tts');

async function test() {
  const tts = new EdgeTTS({
    voice: 'ar-SA-ZariyahNeural',
    lang: 'ar-SA',
    outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
  });
  
  // let's see if we can get a buffer directly or need to save
  console.log('Methods:', Object.keys(tts));
  
  try {
    await tts.ttsPromise('مرحبا، كيف حالك؟', 'test.mp3');
    console.log('Saved to test.mp3');
  } catch(e) {
    console.error(e);
  }
}
test();
