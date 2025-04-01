import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FireAlertPage } from "../pages";

/**
 * 애플리케이션 라우팅 컴포넌트
 * 기본 경로('/')와 잘못된 경로('*')를 모두 FireAlertPage로 라우팅합니다.
 * @returns {JSX.Element} 라우팅 구조가 적용된 BrowserRouter 컴포넌트
 */
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
