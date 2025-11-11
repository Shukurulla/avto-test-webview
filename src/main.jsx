import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import './styles/global.css';

// Service Worker'ni register qilish (rasmlarni cache qilish uchun)
if (import.meta.env.PROD || import.meta.env.DEV) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
