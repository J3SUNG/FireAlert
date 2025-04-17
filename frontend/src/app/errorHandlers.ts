import { getErrorService } from "../shared/lib/errors";

/**
 * 애플리케이션 전역 에러 핸들러 설정
 *
 * 컴포넌트 외부의 에러를 캐치하여 일관된 방식으로 처리
 */
export const setupGlobalErrorHandlers = (): void => {
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