import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './app/styles/index.css';
import 'leaflet/dist/leaflet.css';

import { setupDefaultLeafletIcons } from './shared/lib/leaflet/iconSetup';
import { getErrorService, ErrorBoundary } from './shared/lib/errors';

/**
 * 애플리케이션 전역 에러 핸들러 설정
 * 컴포넌트 외부에서 발생하는 에러(비동기 작업, 이벤트 핸들러 등)를 잡아냄
 */
const setupGlobalErrorHandlers = () => {
  const errorService = getErrorService();
  
  // 처리되지 않은 전역 Promise 에러 핸들러
  window.addEventListener('unhandledrejection', (event) => {
    errorService.handleError(event.reason, {
      component: 'Global',
      feature: 'UnhandledRejection',
      timestamp: Date.now()
    });
    console.error('Unhandled Promise Rejection:', event.reason);
  });
  
  // 전역 런타임 에러 핸들러
  window.addEventListener('error', (event) => {
    errorService.handleError(event.error, {
      component: 'Global',
      feature: 'RuntimeError',
      timestamp: Date.now()
    });
    console.error('Global Runtime Error:', event.error);
  });
};

/**
 * 애플리케이션 초기화 시 Leaflet 기본 아이콘 설정
 * Leaflet 라이브러리의 기본 마커 아이콘 경로 문제를 해결하기 위해 필요함
 */
setupDefaultLeafletIcons();

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary component="App" feature="root">
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
