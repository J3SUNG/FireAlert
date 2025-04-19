import { getErrorService } from "../shared/lib/errors";

/**
 * 애플리케이션 전역 에러 핸들러 설정
 */
export const setupGlobalErrorHandlers = (): void => {
  const errorService = getErrorService();

  window.addEventListener("unhandledrejection", (event) => {
    errorService.handleError(event.reason, {
      component: "Global",
      feature: "UnhandledRejection",
      timestamp: Date.now(),
    });
    console.error("Unhandled Promise Rejection:", event.reason);
  });

  window.addEventListener("error", (event) => {
    errorService.handleError(event.error, {
      component: "Global",
      feature: "RuntimeError",
      timestamp: Date.now(),
    });
    console.error("Global Runtime Error:", event.error);
  });
};
