import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function NexusAI({ games, onLaunchGame, onTabChange }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  
  // Settings UI
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [lang, setLang] = useState(localStorage.getItem('nexus_lang') || 'ar-SA');
  const [voiceType, setVoiceType] = useState(localStorage.getItem('nexus_voice') || 'mnova');
  
  const manualStopRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const latestStateRef = useRef({ lang, voiceType, games, apiKey });
  
  useEffect(() => {
    latestStateRef.current = { lang, voiceType, games, apiKey };
  }, [lang, voiceType, games, apiKey]);
  
  // Audio Speech
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => {
      const currentLang = latestStateRef.current.lang;
      setIsListening(true);
      setTranscript(currentLang === 'ar-SA' ? 'أستمع...' : 'Listening...');
      setInterimTranscript('');
      manualStopRef.current = false;
    };
    
    rec.onresult = (event) => {
      let final = '';
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptSegment;
        } else {
          interim += transcriptSegment;
        }
      }

      setInterimTranscript(interim);
      
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      
      if (final) {
        setInterimTranscript('');
        processCommand(final.trim());
      } else if (interim.trim().length > 0) {
        // Force finalization if user stops talking for 2.5 seconds
        silenceTimerRef.current = setTimeout(() => {
          manualStopRef.current = true;
          rec.stop();
          setInterimTranscript('');
          processCommand(interim.trim());
          setTimeout(() => {
            manualStopRef.current = false;
            try { rec.start(); } catch(e){}
          }, 1000);
        }, 2500);
      }
    };

    rec.onend = () => {
      if (!synth.speaking) {
        setIsListening(false);
        setTimeout(() => {
          setTranscript('');
        }, 8000);
      }
    };

    setRecognition(rec);
  }, [lang]); // Recreate recognition when language changes

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        toggleListening();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recognition, isListening]);

  const toggleListening = () => {
    if (!recognition) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (isListening) {
      manualStopRef.current = true;
      recognition.stop();
      if (synth.speaking) synth.cancel();
      setIsListening(false);
    } else {
      const currentLang = latestStateRef.current.lang;
      const currentVoice = latestStateRef.current.voiceType;
      
      manualStopRef.current = false;
      setIsListening(true);
      
      let greeting = '';
      if (currentLang === 'ar-SA') {
        greeting = currentVoice === 'mariam' ? 'السلام عليكم، أنا مريم.' : 'السلام عليكم، أنا ماي نوفا.';
      } else {
        greeting = currentVoice === 'mariam' ? 'Hello, I am Mariam.' : 'Hello, I am MNova.';
      }
      
      setTranscript(greeting);
      
      if (synth) {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.lang = currentLang;
        
        const voices = synth.getVoices();
        const availableVoices = voices.filter(v => v.lang.includes(currentLang.split('-')[0]));
        
        if (currentVoice === 'mariam') {
          const female = availableVoices.find(v => v.name.toLowerCase().includes('hoda') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
          if (female) utterance.voice = female;
          utterance.pitch = 1.3;
        } else {
          const male = availableVoices.find(v => v.name.toLowerCase().includes('naayf') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'));
          if (male) utterance.voice = male;
          utterance.pitch = 0.8;
        }
        
        utterance.rate = 1.05;
        
        utterance.onend = () => {
          if (!manualStopRef.current) {
            setTranscript(currentLang === 'ar-SA' ? 'أستمع...' : 'Listening...');
            try { recognition.start(); } catch(e) {}
          }
        };
        
        synth.speak(utterance);
      } else {
        setTranscript(currentLang === 'ar-SA' ? 'أستمع...' : 'Listening...');
        try { recognition.start(); } catch(e) {}
      }
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('nexus_lang', lang);
    localStorage.setItem('nexus_voice', voiceType);
    setShowSettings(false);
    
    if (isListening && recognition) {
      manualStopRef.current = true;
      recognition.stop();
      setTimeout(() => {
        manualStopRef.current = false;
        recognition.start();
      }, 500);
    }
  };

  const speakResponse = (text) => {
    const st = latestStateRef.current;
    setTranscript(st.lang === 'ar-SA' ? `نيكسوس: ${text}` : `Nexus: ${text}`);
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = st.lang;
      
      const voices = synth.getVoices();
      const availableVoices = voices.filter(v => v.lang.includes(st.lang.split('-')[0]));
      
      if (st.voiceType === 'mariam') {
        const female = availableVoices.find(v => v.name.toLowerCase().includes('hoda') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
        if (female) utterance.voice = female;
        utterance.pitch = 1.3;
      } else {
        const male = availableVoices.find(v => v.name.toLowerCase().includes('naayf') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david'));
        if (male) utterance.voice = male;
        utterance.pitch = 0.8;
      }
      
      utterance.rate = 1.05;
      
      utterance.onend = () => {
        setIsListening(false);
        manualStopRef.current = true;
      };
      
      synth.speak(utterance);
    }
  };

  const processCommand = async (command) => {
    const st = latestStateRef.current;
    const lowerCmd = command.toLowerCase();
    
    // Check local commands first
    const isPlay = lowerCmd.includes('play') || lowerCmd.includes('launch') || lowerCmd.includes('start') || lowerCmd.includes('تشغيل') || lowerCmd.includes('العب') || lowerCmd.includes('شغل');
    if (isPlay) {
      const game = st.games.find(g => lowerCmd.includes(g.title.toLowerCase()));
      if (game) {
        speakResponse(st.lang === 'ar-SA' ? `جاري تشغيل ${game.title}، استمتع!` : `Launching ${game.title}, have fun!`);
        setTimeout(() => onLaunchGame(game), 2000);
        return;
      }
    } else if (lowerCmd.includes('news') || lowerCmd.includes('أخبار') || lowerCmd.includes('اخبار')) {
      onTabChange('news');
      speakResponse(st.lang === 'ar-SA' ? 'أفتح قسم الأخبار.' : 'Opening gaming news.');
      return;
    } else if (lowerCmd.includes('gallery') || lowerCmd.includes('screenshots') || lowerCmd.includes('صور') || lowerCmd.includes('لقطات')) {
      onTabChange('screenshots');
      speakResponse(st.lang === 'ar-SA' ? 'أعرض لقطات الشاشة.' : 'Here are your screenshots.');
      return;
    } else if (lowerCmd.includes('games') || lowerCmd.includes('library') || lowerCmd.includes('مكتبة') || lowerCmd.includes('العاب') || lowerCmd.includes('ألعاب')) {
      onTabChange('games');
      speakResponse(st.lang === 'ar-SA' ? 'عودة إلى مكتبة الألعاب.' : 'Returning to your library.');
      return;
    } else if (lowerCmd.includes('stop') || lowerCmd.includes('shut up') || lowerCmd.includes('cancel') || lowerCmd.includes('توقف') || lowerCmd.includes('اسكت') || lowerCmd.includes('إغلاق')) {
       speakResponse(st.lang === 'ar-SA' ? 'حسناً، سأتوقف.' : 'Okay, stopping.');
       manualStopRef.current = true;
       recognition.stop();
       return;
    }

    // If no local command matches, ask Gemini!
    if (st.apiKey) {
      try {
        setTranscript(st.lang === 'ar-SA' ? 'نيكسوس يفكر...' : 'Nexus is thinking...');
        const genAI = new GoogleGenerativeAI(st.apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          systemInstruction: st.lang === 'ar-SA' ? "أنت نيكسوس، مساعد ألعاب ذكي ومتطور مدمج في محطة ألعاب MNova. كن مختصراً جداً، جملة أو جملتين كحد أقصى. تصرف مثل مساعد شخصي ذكي للألعاب وتحدث باللغة العربية." : "You are Nexus, a cool AI gaming assistant integrated into the MNova Game Station. Be extremely concise, max 1 or 2 sentences. Act like JARVIS from Iron Man but for gaming."
        });
        const result = await model.generateContent(command);
        const textRes = result.response.text().replace(/\*/g, ''); // Clean markdown formatting
        speakResponse(textRes);
      } catch (e) {
        console.error(e);
        speakResponse(st.lang === 'ar-SA' ? 'حدث خطأ في الاتصال بالشبكة العصبية، تأكد من مفتاح API.' : 'I encountered an error connecting to my neural network. Please check your API key.');
      }
    } else {
      speakResponse(st.lang === 'ar-SA' ? `سمعت "${command}". أضف مفتاح Gemini في الإعدادات للمحادثة معي!` : `I heard "${command}". Click the settings icon to add a free Gemini API key and chat with me!`);
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

      {/* Transcript Popup */}
      {(transcript || interimTranscript) && !showSettings && (
        <div className="mb-4 px-6 py-4 bg-cyan-950/90 backdrop-blur-xl text-cyan-50 font-semibold rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] animate-[slide-up_0.3s_ease-out] max-w-md leading-relaxed">
          {interimTranscript && <span className="text-cyan-400/70 italic mr-2">{interimTranscript}</span>}
          {transcript && <span>{transcript}</span>}
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
