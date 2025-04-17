import React, { useEffect } from 'react';
import Router from './Router';
import { ErrorBoundary } from '../shared/lib/errors';
import { setupGlobalErrorHandlers } from './errorHandlers';
import { setupLeaflet } from './setupLeaflet';

/**
 * 애플리케이션 최상위 컴포넌트
 * 
 * 앱 초기화 및 전역 설정을 처리합니다.
 */
const App: React.FC = () => {
  // 컴포넌트 마운트 시 초기화 수행
  useEffect(() => {
    // Leaflet 기본 아이콘 설정
    setupLeaflet();
    
    // 전역 에러 핸들러 설정
    setupGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary component="App" feature="root">
      <Router />
    </ErrorBoundary>
  );
};

export default App;