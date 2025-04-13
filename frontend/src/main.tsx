import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./app/styles/index.css";
import "leaflet/dist/leaflet.css";

import { setupDefaultLeafletIcons } from "./shared/lib/leaflet/iconSetup";
import { getErrorService, ErrorBoundary } from "./shared/lib/errors";

/**
 * 애플리케이션 전역 에러 핸들러 설정
 *
 * 컴포넌트 외부의 에러를 캐치하여 일관된 방식으로 처리
 */
const setupGlobalErrorHandlers = () => {
  const errorService = getErrorService();

  // 처리되지 않은 Promise 에러 캐치
  window.addEventListener("unhandledrejection", (event) => {
    errorService.handleError(event.reason, {
      component: "Global",
      feature: "UnhandledRejection",
      timestamp: Date.now(),
    });
    console.error("Unhandled Promise Rejection:", event.reason);
  });

  // 런타임 에러 캐치
  window.addEventListener("error", (event) => {
    errorService.handleError(event.error, {
      component: "Global",
      feature: "RuntimeError",
      timestamp: Date.now(),
    });
    console.error("Global Runtime Error:", event.error);
  });
};

// Leaflet 기본 아이콘 설정 - 경로 문제 해결을 위해 필요
setupDefaultLeafletIcons();

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary component="App" feature="root">
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
