import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { preloadAllCoreAssets } from './utils/preloadAssets';

// Start preloading Welcome screen, background, celebration, and results assets immediately
void preloadAllCoreAssets();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
