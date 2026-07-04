const fs = require('fs');

const filePath = './src/LanguageContext.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const newKeys = {
  en: {
    settings_sys_tools: 'System Tools',
    settings_sys_tools_desc: 'Quick access to system tools and monitoring.',
    settings_groq_title: 'Groq API Key (Fast AI & Voice)',
    settings_groq_desc: 'Enter your Groq API key to enable ultra-fast voice transcription and the main AI model.',
    settings_get_key: 'Get Free Key',
    settings_openrouter_title: 'OpenRouter API Key (Fallback AI)',
    settings_openrouter_desc: 'Enter your OpenRouter API key as a fallback when Groq is busy.',
    settings_trans_lang_title: 'On-Screen Translation Language',
    settings_trans_lang_desc: 'Choose the language you want to translate game text into.',
    settings_ai_voice_title: 'AI Assistant Voice & Persona',
    settings_ai_voice_desc: 'Choose the persona and voice of your AI assistant (Maryam or MNova).',
    settings_save_btn: 'Save',
    settings_saved_btn: 'Saved!'
  },
  ar: {
    settings_sys_tools: 'أدوات النظام',
    settings_sys_tools_desc: 'وصول سريع لأدوات النظام ومراقبة الأداء.',
    settings_groq_title: 'مفتاح Groq API (ذكاء وصوت سريع)',
    settings_groq_desc: 'أدخل مفتاح Groq الخاص بك لتفعيل تعرف الصوتيات السريع جداً والنموذج الذكي الأساسي للتطبيق.',
    settings_get_key: 'احصل على مفتاح مجاني',
    settings_openrouter_title: 'مفتاح OpenRouter API (بديل)',
    settings_openrouter_desc: 'أدخل مفتاح OpenRouter الخاص بك كبديل (Fallback) في حال كان سيرفر Groq مشغولاً.',
    settings_trans_lang_title: 'لغة الترجمة الشاشية',
    settings_trans_lang_desc: 'اختر اللغة التي تريد ترجمة نصوص الألعاب إليها.',
    settings_ai_voice_title: 'صوت وشخصية المساعد',
    settings_ai_voice_desc: 'اختر شخصية وصوت المساعد الخاص بك (مريم أو أم نوفا).',
    settings_save_btn: 'حفظ',
    settings_saved_btn: 'تم الحفظ!'
  },
  es: {
    settings_sys_tools: 'Herramientas del Sistema',
    settings_sys_tools_desc: 'Acceso rápido a herramientas de monitoreo.',
    settings_groq_title: 'Clave de Groq API (IA y Voz rápida)',
    settings_groq_desc: 'Introduce tu clave API de Groq para transcripción ultrarrápida.',
    settings_get_key: 'Obtener Clave Gratis',
    settings_openrouter_title: 'Clave de OpenRouter API (Respaldo)',
    settings_openrouter_desc: 'Introduce tu clave API como respaldo cuando Groq esté ocupado.',
    settings_trans_lang_title: 'Idioma de Traducción en Pantalla',
    settings_trans_lang_desc: 'Elige el idioma para traducir el texto de los juegos.',
    settings_ai_voice_title: 'Voz y Persona del Asistente',
    settings_ai_voice_desc: 'Elige la persona y voz de tu asistente (Maryam o MNova).',
    settings_save_btn: 'Guardar',
    settings_saved_btn: '¡Guardado!'
  },
  fr: {
    settings_sys_tools: 'Outils Système',
    settings_sys_tools_desc: 'Accès rapide aux outils système et à la surveillance.',
    settings_groq_title: 'Clé API Groq (IA & Voix rapides)',
    settings_groq_desc: 'Entrez votre clé API Groq pour la transcription vocale ultra-rapide.',
    settings_get_key: 'Obtenir une clé',
    settings_openrouter_title: 'Clé API OpenRouter (Secours)',
    settings_openrouter_desc: 'Entrez votre clé API en cas d\'indisponibilité de Groq.',
    settings_trans_lang_title: 'Langue de Traduction à l\'Écran',
    settings_trans_lang_desc: 'Choisissez la langue pour traduire le texte des jeux.',
    settings_ai_voice_title: 'Voix et Personnage de l\'Assistant',
    settings_ai_voice_desc: 'Choisissez le personnage et la voix de votre assistant.',
    settings_save_btn: 'Enregistrer',
    settings_saved_btn: 'Enregistré!'
  },
  de: {
    settings_sys_tools: 'System-Tools',
    settings_sys_tools_desc: 'Schneller Zugriff auf System-Tools und Überwachung.',
    settings_groq_title: 'Groq API-Schlüssel (Schnelle KI)',
    settings_groq_desc: 'Geben Sie Ihren Groq API-Schlüssel für ultraschnelle Spracherkennung ein.',
    settings_get_key: 'Kostenlosen Schlüssel holen',
    settings_openrouter_title: 'OpenRouter API-Schlüssel (Ersatz)',
    settings_openrouter_desc: 'Geben Sie Ihren OpenRouter API-Schlüssel als Ersatz ein.',
    settings_trans_lang_title: 'Bildschirm-Übersetzungssprache',
    settings_trans_lang_desc: 'Wählen Sie die Sprache für die Übersetzung von Spieltexten.',
    settings_ai_voice_title: 'Stimme und Charakter des KI-Assistenten',
    settings_ai_voice_desc: 'Wählen Sie Charakter und Stimme Ihres KI-Assistenten.',
    settings_save_btn: 'Speichern',
    settings_saved_btn: 'Gespeichert!'
  },
  ja: {
    settings_sys_tools: 'システムツール',
    settings_sys_tools_desc: 'システムツールや監視へのクイックアクセス。',
    settings_groq_title: 'Groq APIキー（高速AI＆音声）',
    settings_groq_desc: '超高速な音声文字変換のためにGroq APIキーを入力してください。',
    settings_get_key: '無料キーを取得',
    settings_openrouter_title: 'OpenRouter APIキー（予備AI）',
    settings_openrouter_desc: 'Groqが混雑している時の予備として入力してください。',
    settings_trans_lang_title: '画面翻訳言語',
    settings_trans_lang_desc: 'ゲーム内のテキストを翻訳する言語を選択してください。',
    settings_ai_voice_title: 'AIアシスタントの音声とペルソナ',
    settings_ai_voice_desc: 'アシスタントのペルソナと音声を選択してください。',
    settings_save_btn: '保存',
    settings_saved_btn: '保存しました！'
  },
  ko: {
    settings_sys_tools: '시스템 도구',
    settings_sys_tools_desc: '시스템 도구 및 모니터링에 빠른 액세스.',
    settings_groq_title: 'Groq API 키 (고속 AI 및 음성)',
    settings_groq_desc: '초고속 음성 전사를 위해 Groq API 키를 입력하세요.',
    settings_get_key: '무료 키 받기',
    settings_openrouter_title: 'OpenRouter API 키 (대비용)',
    settings_openrouter_desc: 'Groq이 바쁠 때 대비용으로 API 키를 입력하세요.',
    settings_trans_lang_title: '화면 번역 언어',
    settings_trans_lang_desc: '게임 텍스트를 번역할 언어를 선택하세요.',
    settings_ai_voice_title: 'AI 어시스턴트 음성 및 페르소나',
    settings_ai_voice_desc: '어시스턴트의 페르소나 및 음성을 선택하세요.',
    settings_save_btn: '저장',
    settings_saved_btn: '저장됨!'
  },
  ru: {
    settings_sys_tools: 'Системные инструменты',
    settings_sys_tools_desc: 'Быстрый доступ к системным инструментами и мониторингу.',
    settings_groq_title: 'Ключ Groq API (Быстрый ИИ)',
    settings_groq_desc: 'Введите ключ Groq API для сверхбыстрого распознавания речи.',
    settings_get_key: 'Получить бесплатный ключ',
    settings_openrouter_title: 'Ключ OpenRouter API (Запасной)',
    settings_openrouter_desc: 'Введите ключ OpenRouter API в качестве запасного.',
    settings_trans_lang_title: 'Язык экранного перевода',
    settings_trans_lang_desc: 'Выберите язык для перевода игрового текста.',
    settings_ai_voice_title: 'Голос и персонаж ИИ-ассистента',
    settings_ai_voice_desc: 'Выберите персонажа и голос вашего ИИ-ассистента.',
    settings_save_btn: 'Сохранить',
    settings_saved_btn: 'Сохранено!'
  }
};

const regex = /(\s*)([a-z]{2}):\s*{([^}]*)}/g;

content = content.replace(regex, (match, p1, lang, inner) => {
  if (newKeys[lang]) {
    const keys = Object.entries(newKeys[lang]).map(([k, v]) => `${k}: '${v.replace(/'/g, "\\'")}'`).join(', ');
    return `${p1}${lang}: {${inner.endsWith(',') ? inner : inner + ','}\n    ${keys}\n  }`;
  }
  return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('LanguageContext updated!');
