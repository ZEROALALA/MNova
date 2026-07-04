const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/LanguageContext.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const topbarKeys = {
  en: {
    topbar_info: 'INFO',
    topbar_scan_games: 'SCAN GAMES'
  },
  ar: {
    topbar_info: 'المعلومات',
    topbar_scan_games: 'بحث الألعاب'
  },
  es: {
    topbar_info: 'INFO',
    topbar_scan_games: 'ESCANEAR JUEGOS'
  },
  fr: {
    topbar_info: 'INFO',
    topbar_scan_games: 'SCANNER JEUX'
  },
  de: {
    topbar_info: 'INFO',
    topbar_scan_games: 'SPIELE SCANNEN'
  },
  ja: {
    topbar_info: '情報',
    topbar_scan_games: 'ゲームスキャン'
  },
  ko: {
    topbar_info: '정보',
    topbar_scan_games: '게임 스캔'
  },
  ru: {
    topbar_info: 'ИНФО',
    topbar_scan_games: 'СКАНИРОВАТЬ'
  }
};

const regex = /(\s*)([a-z]{2}):\s*{([^}]*)}/g;

content = content.replace(regex, (match, p1, lang, inner) => {
  if (topbarKeys[lang]) {
    const keys = Object.entries(topbarKeys[lang]).map(([k, v]) => `${k}: '${v.replace(/'/g, "\\'")}'`).join(', ');
    return `${p1}${lang}: {${inner.endsWith(',') ? inner : inner + ','}\n    ${keys}\n  }`;
  }
  return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('LanguageContext updated for TopBar!');
