import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css';

import { setupDefaultLeafletIcons } from './shared/lib/leaflet/iconSetup';

/**
 * 애플리케이션 초기화 시 Leaflet 기본 아이콘 설정
 * Leaflet 라이브러리의 기본 마커 아이콘 경로 문제를 해결하기 위해 필요함
 */
setupDefaultLeafletIcons();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
