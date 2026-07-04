import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { maryamApi } from '../services/maryamApi';
import { useLanguage } from '../LanguageContext';

export default function MaryamOverlay({ isOpen, onClose, aiVoice }) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const currentAudioPlaybackRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (currentAudioPlaybackRef.current) {
        currentAudioPlaybackRef.current.pause();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  const handleAudioTranscription = async (audioBlob) => {
    setIsProcessing(true);
    setTranscript('جارِ تحليل الصوت...');
    try {
      const buffer = await audioBlob.arrayBuffer();
      const text = await window.electronAPI.transcribeAudio(buffer, audioBlob.type);
      if (text.trim()) {
        setInputText(text); // Put it in the input box first
        await handleSendMessage(text); // Auto send
      } else {
        setTranscript('لم أتمكن من سماعك بوضوح.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setTranscript('حدث خطأ في خدمة Whisper. هل أدخلت مفتاح Groq؟');
      setIsProcessing(false);
    }
  };

  // Handle Edge-TTS
  const speak = async (text) => {
    if (isMuted) return;
    
    // Stop any ongoing speech
    if (currentAudioPlaybackRef.current) {
      currentAudioPlaybackRef.current.pause();
    }

    try {
      const aiLang = localStorage.getItem('ai_language') || localStorage.getItem('mnova_lang') || 'en';
      const voiceMap = {
        en: { female: 'en-US-AriaNeural', male: 'en-US-ChristopherNeural' },
        ar: { female: 'ar-SA-ZariyahNeural', male: 'ar-SA-HamedNeural' },
        es: { female: 'es-ES-ElviraNeural', male: 'es-ES-AlvaroNeural' },
        fr: { female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' },
        de: { female: 'de-DE-KatjaNeural', male: 'de-DE-ConradNeural' },
        ja: { female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' },
        ko: { female: 'ko-KR-SunHiNeural', male: 'ko-KR-InJoonNeural' },
        ru: { female: 'ru-RU-SvetlanaNeural', male: 'ru-RU-DmitryNeural' }
      };
      
      const langVoices = voiceMap[aiLang] || voiceMap['en'];
      const voice = aiVoice === 'male' ? langVoices.male : langVoices.female;
      
      const audioBase64 = await window.electronAPI.generateSpeech(text, voice);
      const audio = new Audio(audioBase64);
      currentAudioPlaybackRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      await audio.play();
    } catch (err) {
      console.error('TTS Error:', err);
      setIsSpeaking(false);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup silence detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.minDecibels = -60;
      source.connect(analyser);
      analyserRef.current = analyser;

      const checkSilence = () => {
        if (mediaRecorder.state !== 'recording') return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Check if any frequency is above threshold
        const isSpeakingNow = dataArray.some(val => val > 10);
        
        if (isSpeakingNow) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        } else if (!silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, 2000); // 2 seconds of silence
        }
        
        requestAnimationFrame(checkSilence);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
        checkSilence();
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        stream.getTracks().forEach(track => track.stop());
        if (audioContext.state !== 'closed') await audioContext.close();
        clearTimeout(silenceTimeoutRef.current);

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await handleAudioTranscription(audioBlob);
        }
      };

      mediaRecorder.start(100);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
    } else {
      // Stop TTS if speaking
      if (currentAudioPlaybackRef.current) {
        currentAudioPlaybackRef.current.pause();
      }
      setIsSpeaking(false);
      setTranscript('');
      startListening();
    }
  };

  const handleSendMessage = async (text) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTranscript('');
    setIsProcessing(true);

    const response = await maryamApi.sendMessage(text);
    
    const botMsg = { id: Date.now() + 1, role: 'assistant', content: response };
    setMessages(prev => [...prev, botMsg]);
    setIsProcessing(false);

    speak(response);
  };

  // Auto scroll to bottom without jumping the window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, transcript]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4 md:p-8">
      <div className="bg-white/5 border border-white/20 rounded-3xl w-full max-w-3xl h-[85vh] shadow-[0_0_100px_rgba(168,85,247,0.3)] flex flex-col relative overflow-hidden backdrop-blur-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            {/* Small Orb for header */}
            <div className="relative w-10 h-10">
              <div className={`absolute inset-0 rounded-full ${aiVoice === 'male' ? 'bg-cyan-500/40' : 'bg-purple-500/40'} blur-md transition-all duration-700 ${isSpeaking || isListening ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${aiVoice === 'male' ? 'from-cyan-600 to-blue-500' : 'from-purple-500 to-cyan-500'} flex items-center justify-center shadow-lg`}>
                <MessageSquare size={18} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                {aiVoice === 'male' ? 'MNova AI' : 'Maryam AI'}
              </h2>
              <p className="text-xs text-white/50 font-medium">
                {isListening ? (language === 'ar' ? 'تستمع إليك...' : 'Listening...') : 
                 isProcessing ? (language === 'ar' ? 'تفكر...' : 'Thinking...') :
                 isSpeaking ? (language === 'ar' ? 'تتحدث' : 'Speaking') :
                 (language === 'ar' ? 'متصلة وجاهزة' : 'Online & Ready')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
              onClick={() => {
                if (currentAudioPlaybackRef.current) currentAudioPlaybackRef.current.pause();
                setIsSpeaking(false);
                if (isListening) mediaRecorderRef.current?.stop();
                onClose();
              }} 
              className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 flex flex-col gap-6"
        >
          {messages.length === 0 && !transcript && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 my-auto">
              <MessageSquare size={64} className="text-white/20 mb-4" />
              <p className="text-white/60 text-lg">{language === 'ar' ? 'كيف يمكنني مساعدتك اليوم؟' : 'How can I help you today?'}</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-6 py-4 rounded-3xl text-sm md:text-base max-w-[85%] leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-sm' 
                  : 'bg-white/10 text-white/90 border border-white/5 rounded-bl-sm backdrop-blur-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {(transcript || isProcessing) && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="px-6 py-4 rounded-3xl rounded-bl-sm bg-white/5 text-white/70 border border-white/5 max-w-[85%] flex items-center gap-3">
                {isProcessing ? (
                  <>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                  </>
                ) : (
                  <span className="italic">{transcript}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-3 relative max-w-4xl mx-auto">
            {/* Mic Button */}
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse border-2 border-red-300/50' 
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-white/20'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleSendMessage();
                  }
                }}
                disabled={isListening || isProcessing}
                placeholder={isListening ? (language === 'ar' ? 'تتحدث الآن...' : 'Speaking...') : (language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...')}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isProcessing || isListening}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 rounded-xl text-white hover:bg-purple-400 disabled:opacity-0 disabled:scale-95 transition-all duration-300"
              >
                {language === 'ar' ? 'إرسال' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
