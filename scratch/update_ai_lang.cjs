const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const langs = ['en', 'ar', 'es', 'fr', 'de', 'ja', 'ko', 'ru'];

const aiLangKeys = {
  en: {
    settings_ai_lang_title: 'AI Assistant Language',
    settings_ai_lang_desc: 'Select the language the AI assistant should speak and understand.'
  },
  ar: {
    settings_ai_lang_title: 'لغة المساعد الذكي',
    settings_ai_lang_desc: 'اختر اللغة التي يجب أن يتحدث بها المساعد الذكي.'
  },
  es: {
    settings_ai_lang_title: 'Idioma del Asistente IA',
    settings_ai_lang_desc: 'Selecciona el idioma que el asistente debe hablar.'
  },
  fr: {
    settings_ai_lang_title: 'Langue de l\'Assistant IA',
    settings_ai_lang_desc: 'Sélectionnez la langue que l\'assistant doit parler.'
  },
  de: {
    settings_ai_lang_title: 'Sprache des KI-Assistenten',
    settings_ai_lang_desc: 'Wählen Sie die Sprache, die der Assistent sprechen soll.'
  },
  ja: {
    settings_ai_lang_title: 'AIアシスタントの言語',
    settings_ai_lang_desc: 'AIアシスタントが話す言語を選択してください。'
  },
  ko: {
    settings_ai_lang_title: 'AI 어시스턴트 언어',
    settings_ai_lang_desc: 'AI 어시스턴트가 말할 언어를 선택하세요.'
  },
  ru: {
    settings_ai_lang_title: 'Язык ИИ-Ассистента',
    settings_ai_lang_desc: 'Выберите язык, на котором должен говорить ассистент.'
  }
};

langs.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, aiLangKeys[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}.json`);
  }
});
