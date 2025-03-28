import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/globals.css';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS 추가

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
