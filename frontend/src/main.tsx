import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 기본 설정 불러오기
import { setupDefaultLeafletIcons } from './shared/utils/leaflet/iconSetup';

// Leaflet 아이콘 초기화
setupDefaultLeafletIcons();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
