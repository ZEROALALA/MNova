const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/LanguageContext.jsx');
const localesDir = path.join(__dirname, '../src/locales');

if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

let content = fs.readFileSync(filePath, 'utf8');

const startIndex = content.indexOf('export const translations = {');
const codeToEval = content.substring(startIndex).replace('export function LanguageProvider', '/*').replace('export const translations', 'const translations');
// We just want to eval `const translations = { ... };`
// A safer way is to find the exact end of translations object.
const objStr = content.substring(startIndex + 'export const translations = '.length, content.indexOf('export function LanguageProvider'));

let translations;
try {
  eval('translations = ' + objStr);
} catch (e) {
  console.error('Failed to parse translations:', e);
  process.exit(1);
}

const langs = Object.keys(translations);

let imports = '';
let exportObj = 'export const translations = {\n';

langs.forEach((lang, index) => {
  const langObj = translations[lang];
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify(langObj, null, 2), 'utf8');
  console.log(`Wrote ${lang}.json`);
  
  imports += `import ${lang} from './locales/${lang}.json';\n`;
  exportObj += `  ${lang}${index < langs.length - 1 ? ',' : ''}\n`;
});

exportObj += '};\n';

const originalFunctionAndBelow = content.substring(content.indexOf('export function LanguageProvider'));

const newContent = `import React, { createContext, useState, useContext, useEffect } from 'react';

${imports}
const LanguageContext = createContext();

${exportObj}
${originalFunctionAndBelow}`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('LanguageContext.jsx refactored successfully.');
