import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingIndicator } from "../shared/ui";

const FireAlertPage = lazy(() => import("../pages/fire-alert/FireAlertPage"));
const ErrorTestPage = lazy(() => import("../pages/error-test/ErrorTestPage"));

/**
 * 애플리케이션 라우팅 컴포넌트
 */
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingIndicator message="페이지를 불러오는 중입니다..." />}>
        <Routes>
          <Route path="/" element={<FireAlertPage />} />
          <Route path="/error-test" element={<ErrorTestPage />} />
          <Route path="*" element={<FireAlertPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
