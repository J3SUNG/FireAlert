import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FireAlertPage from './FireAlertPage';

// 단일 책임 원칙(SRP): 이 컴포넌트는 라우팅 구성에만 책임을 가짐
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FireAlertPage />} />
        <Route path="*" element={<FireAlertPage />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Router;
