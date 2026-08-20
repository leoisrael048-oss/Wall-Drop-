import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for 100% offline gameplay resilience (only on http/https)
if (
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  window.location.protocol !== 'file:' &&
  process.env.NODE_ENV === 'production'
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[SW] Service worker registration ignored:', err);
    });
  });
}

