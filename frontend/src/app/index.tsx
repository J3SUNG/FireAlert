import React from 'react';
import Router from './Router';

/**
 * 애플리케이션 최상위 컴포넌트
 * 해당 컴포넌트는 애플리케이션의 라우팅 구조를 관리하는 Router를 렌더링합니다.
 * @returns {JSX.Element} 라우터 컴포넌트
 */
const App: React.FC = () => {
  return <Router />;
};

export default App;