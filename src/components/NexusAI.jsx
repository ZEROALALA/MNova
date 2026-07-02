import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function NexusAI({ games, onLaunchGame, onTabChange }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Settings UI
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [lang, setLang] = useState(localStorage.getItem('nexus_lang') || 'ar-SA');
  const [voiceType, setVoiceType] = useState(localStorage.getItem('nexus_voice') || 'mnova');
  
  const latestStateRef = useRef({ lang, voiceType, games, apiKey });
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  useEffect(() => {
    latestStateRef.current = { lang, voiceType, games, apiKey };
  }, [lang, voiceType, games, apiKey]);
  
  // Audio Speech
  const synth = window.speechSynthesis;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          await sendAudioToGemini(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      
      let promptTxt = latestStateRef.current.lang === 'ar-SA' ? 'أستمع... (اضغط المايكروفون مرة أخرى للإرسال)' : 'Listening... (Click mic again to send)';
      setTranscript(promptTxt);
    } catch (e) {
      setTranscript(`Mic Error: ${e.message}. هل سمحت باستخدام المايكروفون؟`);
      setTimeout(() => setTranscript(''), 5000);
    }
  };

  const toggleListening = async () => {
    if (isListening && mediaRecorderRef.current) {
      // Stop recording and send
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setTranscript(latestStateRef.current.lang === 'ar-SA' ? 'جاري التفكير...' : 'Thinking...');
    } else {
      const currentLang = latestStateRef.current.lang;
      const currentVoice = latestStateRef.current.voiceType;
      
      if (!latestStateRef.current.apiKey) {
        setTranscript(currentLang === 'ar-SA' ? 'الرجاء إدخال مفتاح Gemini في الإعدادات أولاً!' : 'Please add Gemini API key in settings first!');
        setTimeout(() => setTranscript(''), 4000);
        return;
      }

      let greeting = '';
      if (currentLang === 'ar-SA') {
        greeting = currentVoice === 'mariam' ? 'السلام عليكم، أنا مريم.' : 'السلام عليكم، أنا ماي نوفا.';
      } else {
        greeting = currentVoice === 'mariam' ? 'Hello, I am Mariam.' : 'Hello, I am MNova.';
      }

      const cloudTTS = (text, onEnd) => {
        const tl = currentLang.startsWith('ar') ? 'ar' : (currentVoice === 'mariam' ? 'en-US' : 'en-GB');
        const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${tl}&q=${encodeURIComponent(text)}`;
        if (audioRef.current) {
          let ended = false;
          const finish = () => {
            if (ended) return;
            ended = true;
            onEnd();
          };
          audioRef.current.src = url;
          audioRef.current.onplay = () => { setTranscript(text); setIsSpeaking(true); };
          audioRef.current.onended = () => { setIsSpeaking(false); finish(); };
          audioRef.current.onerror = () => {
            setIsSpeaking(false);
            setTranscript(text);
            setTimeout(finish, 1500);
          };
          audioRef.current.play().catch((e) => {
            console.error("Audio Play Error:", e);
            setTranscript(text);
            setTimeout(finish, 1500);
          });
        }
      };

      cloudTTS(greeting, startRecording);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('nexus_lang', lang);
    localStorage.setItem('nexus_voice', voiceType);
    setShowSettings(false);
  };

  const speakResponse = (text) => {
    const st = latestStateRef.current;
    setTranscript(st.lang === 'ar-SA' ? `نيكسوس: ${text}` : `Nexus: ${text}`);
    
    const onEnd = () => {
      setIsListening(false);
      manualStopRef.current = true;
    };

    // Force Cloud TTS
    const tl = st.lang.startsWith('ar') ? 'ar' : (st.voiceType === 'mariam' ? 'en-US' : 'en-GB');
    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${tl}&q=${encodeURIComponent(text)}`;
    if (audioRef.current) {
      let ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        onEnd();
      };
      audioRef.current.src = url;
      audioRef.current.onplay = () => setIsSpeaking(true);
      audioRef.current.onended = () => { setIsSpeaking(false); finish(); };
      audioRef.current.onerror = () => { setIsSpeaking(false); finish(); };
      audioRef.current.play().catch((e) => { setIsSpeaking(false); finish(); });
    }
  };

  const sendAudioToGemini = async (base64Audio) => {
    const st = latestStateRef.current;
    if (!st.apiKey) return;

    try {
      const genAI = new GoogleGenerativeAI(st.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: st.lang === 'ar-SA' ? 
          "أنت نيكسوس، مساعد ألعاب ذكي في واجهة MNova. استمع لطلب المستخدم وأجب بذكاء. الأوامر المتاحة: 1. لتشغيل لعبة: <LAUNCH: اسم اللعبة>. 2. للأخبار: <TAB: news>. 3. للوسائط: <TAB: media>. 4. للصور: <TAB: screenshots>. الألعاب المتاحة: " + st.games.map(g => g.title).join(', ') : 
          "You are Nexus, a smart gaming assistant in MNova. Commands: 1. Launch a game: <LAUNCH: GameName>. 2. Open News: <TAB: news>. 3. Open Media: <TAB: media>. 4. Open Screenshots: <TAB: screenshots>. Available games: " + st.games.map(g => g.title).join(', ')
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Audio,
            mimeType: "audio/webm"
          }
        },
        { text: st.lang === 'ar-SA' ? "ماذا قال المستخدم؟ أجب عليه أو نفذ الأمر." : "What did the user say? Reply or execute command." }
      ]);
      
      const textRes = result.response.text().replace(/\*/g, '');
      
      // Parse commands
      if (textRes.includes('<LAUNCH:')) {
        const gameNameMatch = textRes.match(/<LAUNCH:\s*([^>]+)>/);
        if (gameNameMatch) {
          const gameName = gameNameMatch[1].trim().toLowerCase();
          const game = st.games.find(g => g.title.toLowerCase().includes(gameName) || gameName.includes(g.title.toLowerCase()));
          if (game) {
            speakResponse(st.lang === 'ar-SA' ? `جاري تشغيل ${game.title}، استمتع!` : `Launching ${game.title}, have fun!`);
            setTimeout(() => onLaunchGame(game), 2000);
            return;
          }
        }
      } else if (textRes.includes('<TAB:')) {
        const tabMatch = textRes.match(/<TAB:\s*([^>]+)>/);
        if (tabMatch) {
          const tabName = tabMatch[1].trim().toLowerCase();
          onTabChange(tabName);
          const tabNames = { news: 'الأخبار', media: 'الوسائط', screenshots: 'الصور' };
          speakResponse(st.lang === 'ar-SA' ? `أفتح قسم ${tabNames[tabName] || tabName}.` : `Opening ${tabName}.`);
          return;
        }
      }

      speakResponse(textRes.trim());
    } catch (e) {
      console.error(e);
      if (e.message.includes('API key not valid')) {
        speakResponse(st.lang === 'ar-SA' ? 'مفتاح Gemini غير صحيح، يرجى التحقق منه.' : 'Invalid Gemini API Key.');
      } else {
        speakResponse(st.lang === 'ar-SA' ? 'حدث خطأ في الاتصال بالشبكة العصبية.' : 'Network error connecting to Gemini.');
      }
    }
  };

  if (!SpeechRecognition) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end pointer-events-none">
      
      {/* Settings Popup */}
      {showSettings && (
        <div className="pointer-events-auto mb-4 bg-[#0a0a0a]/95 backdrop-blur-3xl p-6 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] w-80 animate-[slide-up_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-cyan-400 font-bold tracking-widest text-sm">NEXUS AI SETTINGS</h3>
            <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white transition-colors"><X size={18}/></button>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide font-bold">Language / اللغة</label>
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                <option value="en-US">English (US)</option>
                <option value="ar-SA">العربية</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide font-bold">Voice / الصوت</label>
              <select 
                value={voiceType}
                onChange={(e) => setVoiceType(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                <option value="mnova">MNova (Male)</option>
                <option value="mariam">Mariam (Female)</option>
              </select>
            </div>
          </div>
          
          <label className="block text-xs text-white/60 mb-2 uppercase tracking-wide font-bold">Gemini API Key (Free)</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white text-sm mb-6 outline-none focus:border-cyan-500 transition-colors"
          />
          <div className="flex justify-between items-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400/80 text-xs hover:text-cyan-400 font-bold tracking-wide">GET FREE KEY</a>
            <button onClick={saveApiKey} className="bg-white/10 hover:bg-cyan-500 hover:text-black text-white px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105">SAVE</button>
          </div>
        </div>
      )}

      {/* Transcript & Visualizer Popup */}
      {transcript && !showSettings && (
        <div className="mb-4 px-6 py-4 bg-cyan-950/90 backdrop-blur-xl text-cyan-50 font-semibold rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-[slide-up_0.3s_ease-out] max-w-md leading-relaxed flex items-center gap-4">
          
          {(isListening || isSpeaking) && (
            <div className="flex items-center gap-1 h-6">
              <div className="w-1.5 bg-cyan-400 rounded-full animate-[sound-wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 bg-cyan-400 rounded-full animate-[sound-wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 bg-cyan-400 rounded-full animate-[sound-wave_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }}></div>
              <style>{`
                @keyframes sound-wave {
                  0%, 100% { height: 6px; }
                  50% { height: 24px; }
                }
              `}</style>
            </div>
          )}
          
          <span>{transcript}</span>
        </div>
      )}
      
      {/* Mic Button & Settings Toggle */}
      <div className="flex items-center gap-4">
        {!isListening && (
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="pointer-events-auto w-12 h-12 rounded-full bg-black/50 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors backdrop-blur-md shadow-lg"
            title="Nexus AI Settings"
          >
            <Settings size={20} />
          </button>
        )}
        
        <button 
          onClick={toggleListening}
          className={`pointer-events-auto p-4 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-cyan-500 text-black shadow-[0_0_50px_rgba(0,255,255,0.8)] scale-110 animate-pulse border-none' : 'bg-black/50 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md shadow-lg'}`}
          title="Nexus AI Voice Assistant (Ctrl + Space)"
        >
          {isListening ? <Mic size={26} /> : <MicOff size={24} />}
        </button>
      </div>
    </div>
  );
}
