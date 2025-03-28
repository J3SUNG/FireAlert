import React from 'react';
import Router from './Router';
import './styles/global.css';

// 단일 책임 원칙(SRP): 이 컴포넌트는 앱 초기화에만 책임을 가짐
const App: React.FC = () => {
  return <Router />;
};

export default App;