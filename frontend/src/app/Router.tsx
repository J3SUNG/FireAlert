import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingIndicator } from "../shared/ui";

// 코드 분할을 위해 React.lazy 사용
const FireAlertPage = lazy(() => import("../pages/fire-alert/FireAlertPage"));

/**
 * 애플리케이션 라우팅 컴포넌트
 * 코드 분할(Code Splitting)을 적용하여 초기 로드 시간을 단축합니다.
 * React.lazy와 Suspense를 사용하여 페이지 컴포넌트를 필요할 때만 로드합니다.
 * 
 * @returns {JSX.Element} 라우팅 구조가 적용된 BrowserRouter 컴포넌트
 */
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingIndicator message="페이지를 불러오는 중입니다..." />}>
        <Routes>
          <Route path="/" element={<FireAlertPage />} />
          <Route path="*" element={<FireAlertPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
