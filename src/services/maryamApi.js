// Keys are loaded from localStorage dynamically
class MaryamAPI {
  getLanguageName() {
    const lang = localStorage.getItem('ai_language') || localStorage.getItem('mnova_lang') || 'en';
    const names = {
      en: 'English', ar: 'Arabic', es: 'Spanish', fr: 'French', 
      de: 'German', ja: 'Japanese', ko: 'Korean', ru: 'Russian'
    };
    return names[lang] || 'English';
  }

  constructor() {
    this.messageHistory = [];
    this.setIdentity('female'); // default
  }

  setIdentity(voiceType) {
    const langName = this.getLanguageName();
    this.messageHistory = [];
    if (voiceType === 'male') {
      this.messageHistory.push({
        role: 'system',
        content: `You are a smart AI named "MNova", working inside the MNova gaming dashboard.
Your task is to help the gamer, answer their questions, and give tech tips.
CRITICAL RULE: You MUST answer EXCLUSIVELY in ${langName}. Do NOT use any other language.
Keep answers very short and direct for Text-To-Speech. Do not use lists or complex emojis.`
      });
    } else {
      this.messageHistory.push({
        role: 'system',
        content: `You are a smart AI assistant named "Maryam", working inside the MNova gaming dashboard.
Your task is to help the gamer, answer their questions, and give tips.
CRITICAL RULE: You MUST answer EXCLUSIVELY in ${langName}. Do NOT use any other language.
Keep answers very short and direct for Text-To-Speech. Do not use lists or complex emojis.`
      });
    }
  }

  async sendMessage(userMessage) {
    this.messageHistory.push({ role: 'user', content: userMessage });

    const groqKey = localStorage.getItem('groq_api_key');

    const fetchWithGroq = async () => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: this.messageHistory,
          temperature: 0.7,
          max_completion_tokens: 150
        })
      });
      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    };

    const fetchWithOpenRouter = async (modelName) => {
      const openRouterKey = localStorage.getItem('openrouter_api_key');
      if (!openRouterKey) throw new Error('OpenRouter API key missing');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'MNova Dashboard',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: this.messageHistory,
          temperature: 0.7,
          max_tokens: 150
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content;
    };

    try {
      if (groqKey) {
        // Use ultra-fast Groq Llama 70B!
        try {
          const assistantMessage = await fetchWithGroq();
          this.messageHistory.push({ role: 'assistant', content: assistantMessage });
          return assistantMessage;
        } catch (e) {
          console.warn('Groq LLM failed:', e);
          if (e.message.includes('401') || e.message.includes('403')) {
            return this.getLocalizedError('key');
          }
          console.warn('Falling back to OpenRouter...');
        }
      }

      // Fallback: OpenRouter Models
      const modelsToTry = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemini-2.0-flash-lite-preview-02-05:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'meta-llama/llama-3.2-3b-instruct:free'
      ];

      for (const model of modelsToTry) {
        try {
          const assistantMessage = await fetchWithOpenRouter(model);
          this.messageHistory.push({ role: 'assistant', content: assistantMessage });
          return assistantMessage;
        } catch (error) {
          console.warn(`Model ${model} failed, trying next... Error:`, error.message);
        }
      }
      throw new Error('All APIs failed');
    } catch (e) {
      console.error('Maryam API Error:', e);
      const lang = localStorage.getItem('ai_language') || localStorage.getItem('mnova_lang') || 'en';
      const loc = this.getErrorLocales(lang);
      
      let errorReason = loc.r_unknown;
      if (e.message.includes('Failed to fetch')) errorReason = loc.r_net;
      else if (e.message.includes('429')) errorReason = loc.r_rate;
      
      return loc.net.replace('{reason}', errorReason);
    }
  }

  getErrorLocales(lang) {
    const errs = {
      en: { key: 'Sorry, your Groq API key seems invalid. Please check it in Settings.', net: 'Sorry, I am facing high load or network issues right now. (Reason: {reason}). Please try again later.', r_unknown: 'Unknown', r_net: 'Network/Connection issue', r_rate: 'Rate Limit Exceeded' },
      ar: { key: 'عذراً، يبدو أن مفتاح Groq الخاص بك غير صالح. يرجى التأكد منه من الإعدادات.', net: 'عذراً، أواجه ضغطاً كبيراً أو مشكلة في الشبكة حالياً. (السبب: {reason}). يرجى المحاولة لاحقاً.', r_unknown: 'غير معروف', r_net: 'انقطاع بالانترنت أو مشكلة بالاتصال', r_rate: 'تجاوزت الحد المسموح' },
      es: { key: 'Lo siento, tu clave API de Groq parece no válida. Por favor, verifícala en los Ajustes.', net: 'Lo siento, estoy enfrentando alta carga o problemas de red. (Razón: {reason}). Por favor, intenta más tarde.', r_unknown: 'Desconocido', r_net: 'Problema de red/conexión', r_rate: 'Límite de tasa excedido' },
      fr: { key: 'Désolé, votre clé API Groq semble invalide. Veuillez la vérifier dans les Paramètres.', net: 'Désolé, je rencontre une forte charge ou des problèmes de réseau. (Raison : {reason}). Veuillez réessayer plus tard.', r_unknown: 'Inconnu', r_net: 'Problème de réseau/connexion', r_rate: 'Limite de taux dépassée' },
      de: { key: 'Entschuldigung, Ihr Groq-API-Schlüssel scheint ungültig zu sein. Bitte überprüfen Sie ihn in den Einstellungen.', net: 'Entschuldigung, ich habe derzeit hohe Auslastung oder Netzwerkprobleme. (Grund: {reason}). Bitte versuchen Sie es später erneut.', r_unknown: 'Unbekannt', r_net: 'Netzwerk-/Verbindungsproblem', r_rate: 'Ratenlimit überschritten' },
      ja: { key: '申し訳ありませんが、Groq APIキーが無効なようです。設定で確認してください。', net: '申し訳ありませんが、現在高負荷またはネットワークの問題が発生しています。(理由: {reason}) 後でもう一度お試しください。', r_unknown: '不明', r_net: 'ネットワーク/接続の問題', r_rate: 'レート制限を超過しました' },
      ko: { key: '죄송합니다. Groq API 키가 유효하지 않은 것 같습니다. 설정에서 확인해 주세요.', net: '죄송합니다. 현재 트래픽이 많거나 네트워크 문제가 발생했습니다. (원인: {reason}) 나중에 다시 시도해 주세요.', r_unknown: '알 수 없음', r_net: '네트워크/연결 문제', r_rate: '속도 제한 초과' },
      ru: { key: 'Извините, ваш ключ Groq API кажется недействительным. Пожалуйста, проверьте его в Настройках.', net: 'Извините, сейчас я сталкиваюсь с высокой нагрузкой или проблемами с сетью. (Причина: {reason}). Пожалуйста, попробуйте позже.', r_unknown: 'Неизвестно', r_net: 'Проблема с сетью/подключением', r_rate: 'Превышен лимит запросов' }
    };
    return errs[lang] || errs['en'];
  }

  getLocalizedError(type) {
    const lang = localStorage.getItem('ai_language') || localStorage.getItem('mnova_lang') || 'en';
    return this.getErrorLocales(lang)[type];
  }

  clearHistory() {
    this.messageHistory = [this.messageHistory[0]];
  }
}

export const maryamApi = new MaryamAPI();
