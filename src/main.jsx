import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import TranslatorOverlay from './components/TranslatorOverlay.jsx';
import { LanguageProvider } from './LanguageContext.jsx';

function Root() {
  const [isOverlay, setIsOverlay] = useState(false);

  useEffect(() => {
    const checkOverlay = () => {
      setIsOverlay(window.location.href.includes('overlay'));
    };
    window.addEventListener('hashchange', checkOverlay);
    checkOverlay();
    return () => window.removeEventListener('hashchange', checkOverlay);
  }, []);

  if (isOverlay) {
    return <TranslatorOverlay />;
  }

  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);

