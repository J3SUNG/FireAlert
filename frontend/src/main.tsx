import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS 명시적 로드

// leaflet 아이콘 관련 이슈 해결
import L from 'leaflet';

// leaflet 아이콘 경로 문제 해결
// `any` 사용을 방지하기 위한 타입 정의
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: unknown;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error('Root element not found');
}
