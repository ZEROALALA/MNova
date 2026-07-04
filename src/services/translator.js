import { GoogleGenerativeAI } from "@google/generative-ai";

export const translator = {
  async translateImage(base64Image) {
    const apiKey = localStorage.getItem('openrouter_api_key');
    if (!apiKey) {
      return "يرجى إضافة مفتاح OpenRouter API في إعدادات التطبيق أولاً لتشغيل الترجمة.";
    }

    const targetLang = localStorage.getItem('translation_language') || 'Arabic (MSA)';

    try {
      const modelsToTry = [
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "nvidia/nemotron-nano-12b-v2-vl:free",
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
      ];
      
      const prompt = `You are a professional video game translator. Look at this screenshot from a video game. 
1. Find the main text, dialogue, or subtitles. 
2. Translate it accurately to ${targetLang} (or gaming terms where appropriate). 
3. ONLY return the ${targetLang} translation. Do not include the original English text or any other explanation. 
4. If there is no visible text, return exactly the word: "EMPTY_TEXT".`;

      let lastError;
      for (const modelName of modelsToTry) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
              "X-Title": "MNova Translator"
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: base64Image } }
                  ]
                }
              ]
            })
          });

          const textData = await res.text();
          let data;
          try {
            data = JSON.parse(textData);
          } catch (e) {
            throw new Error(`[${res.status}] ${textData.substring(0, 100)}...`);
          }
          
          if (!res.ok) {
            throw new Error(`[${res.status}] ${data.error?.message || JSON.stringify(data)}`);
          }

          let text = data.choices[0]?.message?.content?.trim() || "";
          
          if (text.includes("EMPTY_TEXT")) {
            return "";
          }
          return text;
        } catch (err) {
          console.warn(`Model ${modelName} failed:`, err.message);
          lastError = err;
        }
      }
      throw lastError;

    } catch (error) {
      console.error("Translation Error:", error);
      return `حدث خطأ: ${error.message || 'مشكلة غير معروفة في الاتصال بالـ API'}. تأكد من صحة المفتاح.`;
    }
  }
};
