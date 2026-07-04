const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/LanguageContext.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const helpKeys = {
  en: {
    help_title: 'Comprehensive App Guide',
    help_intro: 'Welcome to your ultimate gaming hub! This app is designed to be the central station for all your games across different storefronts, packed with advanced features and an AI assistant.',
    help_sec1_title: 'Game Management (Library)',
    help_sec1_text: 'Add games from multiple platforms (Steam, Xbox, etc.) into one place. Use the "Scan Games" button to auto-detect installed games. You can customize covers, backgrounds, and add Trailers that play when hovering.',
    help_sec2_title: 'AI Voice Assistant',
    help_sec2_text: 'The app features a smart assistant (Maryam / MNova). You can talk or chat with it to help you with app settings or get general gaming info. Voice profiles can be changed in Settings.',
    help_sec3_title: 'Themes and Customization',
    help_sec3_text: 'We feature multiple layouts inspired by famous consoles (PS5, Xbox, Nexus). Switch between them via the Theme icon in the top bar. You can also toggle "Dynamic Backgrounds" in Settings.',
    help_sec4_title: 'Live Translation & Tools',
    help_sec4_text: 'By pressing (Ctrl+T) you can instantly capture and translate your screen inside any game. Make sure your games run in (Windowed) mode for the translation bar to appear.'
  },
  ar: {
    help_title: 'دليل شامل لاستخدام التطبيق',
    help_intro: 'مرحباً بك في منصة الألعاب الخاصة بك! تم تصميم هذا التطبيق ليكون المركز الأساسي لجميع ألعابك من مختلف المتاجر، مع ميزات متقدمة ومساعد ذكي.',
    help_sec1_title: 'إدارة الألعاب (المكتبة)',
    help_sec1_text: 'يمكنك إضافة ألعابك من منصات متعددة (مثل Steam و Xbox وغيرها) في مكان واحد. استخدم زر "مزامنة الألعاب" للبحث التلقائي عن ألعابك المثبتة. يمكنك أيضاً تخصيص الغلاف، الخلفية، وحتى إضافة عروض دعائية (Trailers) لكل لعبة لتظهر عند التمرير عليها.',
    help_sec2_title: 'المساعد الصوتي والذكاء الاصطناعي',
    help_sec2_text: 'يحتوي التطبيق على مساعد ذكي (مريم / MNova) يمكنك التحدث معه أو الكتابة إليه ليساعدك في إعدادات التطبيق أو حتى إعطائك معلومات عامة حول الألعاب. يمكنك تغيير صوت المساعد من الإعدادات.',
    help_sec3_title: 'الواجهات والتخصيص',
    help_sec3_text: 'لدينا واجهات متعددة مستوحاة من أشهر منصات اللعب (PS5، Xbox، Nexus). يمكنك التبديل بينها عبر أيقونة "الواجهات" في الشريط العلوي. كما يمكنك تفعيل أو إلغاء تفعيل "الخلفيات الديناميكية" من قائمة الإعدادات.',
    help_sec4_title: 'الترجمة الفورية والأدوات',
    help_sec4_text: 'باستخدام اختصار (Ctrl+T) يمكنك التقاط الشاشة وترجمتها فورياً بداخل أي لعبة. تأكد من أن الألعاب تعمل بوضع (Windowed) لضمان ظهور شريط الترجمة.'
  },
  es: {
    help_title: 'Guía Completa de la Aplicación',
    help_intro: '¡Bienvenido a tu centro de juegos definitivo! Esta aplicación centraliza tus juegos con funciones avanzadas y un asistente de IA.',
    help_sec1_title: 'Gestión de Juegos (Biblioteca)',
    help_sec1_text: 'Agrega juegos de múltiples plataformas en un solo lugar. Usa "Escanear Juegos" para detectar juegos instalados automáticamente. Personaliza carátulas y fondos.',
    help_sec2_title: 'Asistente de Voz con IA',
    help_sec2_text: 'La aplicación incluye un asistente inteligente (Maryam / MNova). Habla o chatea con él para obtener ayuda o información general.',
    help_sec3_title: 'Temas y Personalización',
    help_sec3_text: 'Múltiples diseños inspirados en consolas famosas (PS5, Xbox, Nexus). Cambia entre ellos mediante el ícono de Temas.',
    help_sec4_title: 'Traducción en Vivo y Herramientas',
    help_sec4_text: 'Presionando (Ctrl+T) puedes capturar y traducir la pantalla al instante dentro de cualquier juego. Asegúrate de jugar en modo ventana.'
  },
  fr: {
    help_title: 'Guide Complet de l\'Application',
    help_intro: 'Bienvenue dans votre centre de jeu ultime ! Centralisez tous vos jeux avec des fonctionnalités avancées et une IA.',
    help_sec1_title: 'Gestion des Jeux (Bibliothèque)',
    help_sec1_text: 'Ajoutez des jeux de plusieurs plateformes. Utilisez le bouton pour détecter automatiquement les jeux installés. Personnalisez les couvertures et fonds.',
    help_sec2_title: 'Assistant Vocal IA',
    help_sec2_text: 'L\'application dispose d\'un assistant intelligent (Maryam / MNova). Discutez avec pour obtenir de l\'aide ou des infos sur les jeux.',
    help_sec3_title: 'Thèmes et Personnalisation',
    help_sec3_text: 'Plusieurs mises en page inspirées de consoles célèbres. Changez-les via l\'icône Thème dans la barre supérieure.',
    help_sec4_title: 'Traduction en Direct & Outils',
    help_sec4_text: 'En appuyant sur (Ctrl+T), capturez et traduisez instantanément votre écran dans n\'importe quel jeu. Jouez en mode fenêtré.'
  },
  de: {
    help_title: 'Umfassendes App-Handbuch',
    help_intro: 'Willkommen in Ihrem ultimativen Gaming-Hub! Zentralisieren Sie alle Spiele mit erweiterten Funktionen und einem KI-Assistenten.',
    help_sec1_title: 'Spielverwaltung (Bibliothek)',
    help_sec1_text: 'Fügen Sie Spiele von mehreren Plattformen hinzu. Verwenden Sie "Spiele scannen" für die automatische Erkennung. Personalisieren Sie Cover und Hintergründe.',
    help_sec2_title: 'KI-Sprachassistent',
    help_sec2_text: 'Die App bietet einen intelligenten Assistenten. Sprechen oder chatten Sie mit ihm für Hilfe oder Informationen.',
    help_sec3_title: 'Themen und Anpassung',
    help_sec3_text: 'Mehrere Layouts inspiriert von berühmten Konsolen. Wechseln Sie diese über das Theme-Symbol.',
    help_sec4_title: 'Live-Übersetzung & Werkzeuge',
    help_sec4_text: 'Drücken Sie (Strg+T), um den Bildschirm sofort zu erfassen und zu übersetzen. Stellen Sie sicher, dass das Spiel im Fenstermodus läuft.'
  },
  ja: {
    help_title: '総合アプリガイド',
    help_intro: '究極のゲーミングハブへようこそ！様々なプラットフォームのゲームを高度な機能とAIアシスタントと共に一元管理します。',
    help_sec1_title: 'ゲーム管理 (ライブラリ)',
    help_sec1_text: '複数のプラットフォームのゲームを1箇所にまとめます。「ゲームをスキャン」で自動検出。カバーや背景のカスタマイズが可能です。',
    help_sec2_title: 'AI音声アシスタント',
    help_sec2_text: 'スマートアシスタント（Maryam / MNova）を搭載。設定のサポートやゲーム情報の取得が可能です。',
    help_sec3_title: 'テーマとカスタマイズ',
    help_sec3_text: '有名コンソールにインスパイアされた複数のレイアウト。トップバーのアイコンから簡単に切り替えられます。',
    help_sec4_title: 'ライブ翻訳＆ツール',
    help_sec4_text: '(Ctrl+T)を押すことで、ゲーム中の画面を瞬時に翻訳できます。必ず「ウィンドウモード」でプレイしてください。'
  },
  ko: {
    help_title: '종합 앱 가이드',
    help_intro: '최고의 게이밍 허브에 오신 것을 환영합니다! 고급 기능과 AI 어시스턴트가 통합된 중앙 관리 앱입니다.',
    help_sec1_title: '게임 관리 (라이브러리)',
    help_sec1_text: '여러 플랫폼의 게임을 한 곳에 추가하세요. "게임 스캔" 버튼으로 자동 감지할 수 있습니다.',
    help_sec2_title: 'AI 음성 어시스턴트',
    help_sec2_text: '스마트 어시스턴트 (Maryam / MNova)를 지원합니다. 대화하거나 채팅하여 앱 설정 및 게임 정보를 얻으세요.',
    help_sec3_title: '테마 및 사용자 정의',
    help_sec3_text: '유명 콘솔에서 영감을 받은 여러 레이아웃. 상단 바의 테마 아이콘을 통해 전환하세요.',
    help_sec4_title: '실시간 번역 및 도구',
    help_sec4_text: '(Ctrl+T)를 눌러 게임 내에서 화면을 즉시 캡처하고 번역하세요. "창 모드"로 실행해야 합니다.'
  },
  ru: {
    help_title: 'Полное руководство по приложению',
    help_intro: 'Добро пожаловать в ваш идеальный игровой хаб! Это приложение централизует все ваши игры, добавляя ИИ-ассистента.',
    help_sec1_title: 'Управление играми (Библиотека)',
    help_sec1_text: 'Добавляйте игры с нескольких платформ в одно место. Используйте "Сканировать игры" для автоматического поиска. Настраивайте обложки и фоны.',
    help_sec2_title: 'ИИ-голосовой ассистент',
    help_sec2_text: 'В приложении есть умный ассистент (Maryam / MNova). Общайтесь с ним для помощи по настройкам и информации об играх.',
    help_sec3_title: 'Темы и кастомизация',
    help_sec3_text: 'Доступно несколько тем, вдохновленных известными консолями. Переключайтесь между ними через иконку на верхней панели.',
    help_sec4_title: 'Живой перевод и инструменты',
    help_sec4_text: 'Нажав (Ctrl+T), вы можете мгновенно перевести экран прямо в игре. Убедитесь, что игра запущена в оконном режиме.'
  }
};

const regex = /(\s*)([a-z]{2}):\s*{([^}]*)}/g;

content = content.replace(regex, (match, p1, lang, inner) => {
  if (helpKeys[lang]) {
    const keys = Object.entries(helpKeys[lang]).map(([k, v]) => `${k}: '${v.replace(/'/g, "\\'")}'`).join(', ');
    return `${p1}${lang}: {${inner.endsWith(',') ? inner : inner + ','}\n    ${keys}\n  }`;
  }
  return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('LanguageContext updated for HelpModal!');
