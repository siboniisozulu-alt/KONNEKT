
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for the GitHub Pages app.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      {
        scope: import.meta.env.BASE_URL
      }
    ).catch(error => {
      console.error(
        'KONNEKT service worker registration failed:',
        error
      );
    });
  });
}

