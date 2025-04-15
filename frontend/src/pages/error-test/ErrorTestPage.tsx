import React, { useState } from "react";
import { ErrorBoundary, ErrorFallbackUI, getErrorService } from "../../shared/lib/errors";
import { ErrorSeverity, ErrorType } from "../../shared/lib/errors/types";
import "./ErrorTestPage.css";

// 에러 서비스 인스턴스 가져오기
const errorService = getErrorService();

// 다양한 에러 테스트 컴포넌트들
// 렌더링 에러를 발생시키는 컴포넌트
const RenderErrorComponent = () => {
  throw new Error("렌더링 중 발생한 에러");
  return <div>이 내용은 표시되지 않습니다</div>;
};

// 상태 변경에 의한 에러를 발생시키는 컴포넌트
const StateErrorComponent = () => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    throw new Error("상태 변경으로 인한 에러");
  }
  
  return (
    <button 
      className="error-button"
      onClick={() => setHasError(true)}
    >
      상태 변경 에러 발생
    </button>
  );
};

/**
 * 에러 테스트 페이지
 * 
 * 다양한 에러 상황을 테스트하기 위한 페이지
 */
const ErrorTestPage: React.FC = () => {
  // 에러 메시지 상태
  const [testMessages, setTestMessages] = useState<string[]>([]);
  
  // 테스트 메시지 추가 함수
  const addTestMessage = (message: string) => {
    setTestMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // 테스트 메시지 초기화
  const clearTestMessages = () => {
    setTestMessages([]);
  };

  // 에러 핸들러 등록/해제를 위한 상태
  const [isHandlerRegistered, setIsHandlerRegistered] = useState(false);
  
  // 커스텀 에러 핸들러
  const customErrorHandler = (error: any) => {
    addTestMessage(`에러 핸들러 호출됨: ${error.message || "알 수 없는 에러"}`);
  };
  
  // 에러 핸들러 등록/해제 토글
  const toggleErrorHandler = () => {
    if (isHandlerRegistered) {
      errorService.unregisterHandler(customErrorHandler);
      addTestMessage("에러 핸들러가 해제되었습니다");
    } else {
      errorService.registerHandler(customErrorHandler);
      addTestMessage("에러 핸들러가 등록되었습니다");
    }
    setIsHandlerRegistered(!isHandlerRegistered);
  };

  // 일반 에러 발생 테스트
  const triggerGeneralError = () => {
    const error = errorService.createError(
      "일반적인 에러 메시지", 
      ErrorType.UNKNOWN,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("일반 에러가 발생되었습니다");
  };
  
  // 네트워크 에러 발생 테스트
  const triggerNetworkError = () => {
    const error = errorService.createError(
      "네트워크 연결이 끊겼습니다", 
      ErrorType.NETWORK,
      { severity: ErrorSeverity.WARNING }
    );
    errorService.handleError(error);
    addTestMessage("네트워크 에러가 발생되었습니다");
  };
  
  // 인증 에러 발생 테스트
  const triggerAuthError = () => {
    const error = errorService.createError(
      "인증이 만료되었습니다", 
      ErrorType.AUTH,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("인증 에러가 발생되었습니다");
  };
  
  // 유효성 검증 에러 발생 테스트
  const triggerValidationError = () => {
    const error = errorService.createError(
      "입력값이 올바르지 않습니다", 
      ErrorType.VALIDATION,
      { severity: ErrorSeverity.WARNING }
    );
    errorService.handleError(error);
    addTestMessage("유효성 검증 에러가 발생되었습니다");
  };
  
  // 리소스 찾기 실패 에러 발생 테스트
  const triggerNotFoundError = () => {
    const error = errorService.createError(
      "요청한 리소스를 찾을 수 없습니다", 
      ErrorType.NOT_FOUND,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("NOT_FOUND 에러가 발생되었습니다");
  };
  
  // 지도 로딩 실패 에러 발생 테스트
  const triggerMapLoadError = () => {
    const error = errorService.createError(
      "지도를 로드하는데 실패했습니다", 
      ErrorType.MAP_LOAD_FAILED,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("지도 로딩 에러가 발생되었습니다");
  };
  
  // 산불 데이터 가져오기 실패 에러 발생 테스트
  const triggerFireDataFetchError = () => {
    const error = errorService.createError(
      "산불 데이터를 가져오는데 실패했습니다", 
      ErrorType.FIRE_DATA_FETCH_FAILED,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("산불 데이터 가져오기 에러가 발생되었습니다");
  };
  
  // 위치 정보 접근 불가 에러 발생 테스트
  const triggerGeolocationError = () => {
    const error = errorService.createError(
      "위치 정보에 접근할 수 없습니다", 
      ErrorType.GEOLOCATION_UNAVAILABLE,
      { severity: ErrorSeverity.WARNING }
    );
    errorService.handleError(error);
    addTestMessage("위치 정보 접근 에러가 발생되었습니다");
  };
  
  // 권한 거부 에러 발생 테스트
  const triggerPermissionError = () => {
    const error = errorService.createError(
      "이 작업을 수행할 권한이 없습니다", 
      ErrorType.PERMISSION_DENIED,
      { severity: ErrorSeverity.ERROR }
    );
    errorService.handleError(error);
    addTestMessage("권한 거부 에러가 발생되었습니다");
  };
  
  // 심각한 에러 발생 테스트
  const triggerCriticalError = () => {
    const error = errorService.createError(
      "심각한 시스템 오류가 발생했습니다", 
      ErrorType.UNKNOWN,
      { severity: ErrorSeverity.CRITICAL }
    );
    errorService.handleError(error);
    addTestMessage("심각한 에러가 발생되었습니다");
  };
  
  // 비동기 에러 발생 테스트
  const triggerAsyncError = () => {
    addTestMessage("비동기 에러 테스트 시작...");
    
    setTimeout(() => {
      try {
        // 의도적으로 에러 발생
        const nonExistentFunction = (window as any).nonExistentFunction;
        nonExistentFunction();
      } catch (error) {
        errorService.handleError(error);
        addTestMessage("비동기 에러가 발생되었습니다");
      }
    }, 1000);
  };

  return (
    <div className="error-test-page">
      <h1>에러 테스트 페이지</h1>
      
      <div className="test-container">
        <div className="test-section">
          <h2>에러 타입별 테스트</h2>
          
          <div className="button-grid">
            <button className="error-button" onClick={triggerGeneralError}>
              일반 에러
            </button>
            
            <button className="error-button" onClick={triggerNetworkError}>
              네트워크 에러
            </button>
            
            <button className="error-button" onClick={triggerAuthError}>
              인증 에러
            </button>
            
            <button className="error-button" onClick={triggerValidationError}>
              유효성 검증 에러
            </button>
            
            <button className="error-button" onClick={triggerNotFoundError}>
              리소스 찾기 실패
            </button>
            
            <button className="error-button" onClick={triggerMapLoadError}>
              지도 로딩 실패
            </button>
            
            <button className="error-button" onClick={triggerFireDataFetchError}>
              산불 데이터 가져오기 실패
            </button>
            
            <button className="error-button" onClick={triggerGeolocationError}>
              위치 정보 접근 불가
            </button>
            
            <button className="error-button" onClick={triggerPermissionError}>
              권한 거부
            </button>
            
            <button className="error-button" onClick={triggerCriticalError}>
              심각한 에러
            </button>
            
            <button className="error-button" onClick={triggerAsyncError}>
              비동기 에러
            </button>
          </div>
        </div>
        
        <div className="test-section">
          <h2>ErrorBoundary 테스트</h2>
          
          <div className="error-boundary-container">
            <h3>컴포넌트 렌더링 에러</h3>
            <ErrorBoundary component="RenderErrorTest" feature="error-testing">
              <div className="error-component-wrapper">
                <RenderErrorComponent />
              </div>
            </ErrorBoundary>
          </div>
          
          <div className="error-boundary-container">
            <h3>상태 변경 에러</h3>
            <ErrorBoundary component="StateErrorTest" feature="error-testing">
              <div className="error-component-wrapper">
                <StateErrorComponent />
              </div>
            </ErrorBoundary>
          </div>

          <div className="error-boundary-container">
            <h3>직접 확인하기</h3>
            <div className="error-component-wrapper">
              <ErrorFallbackUI 
                error={new Error("에러 UI 샘플")} 
                resetErrorBoundary={() => alert("다시 시도 버튼이 클릭되었습니다")} 
                component="ErrorTestComponent"
                feature="error-testing"
              />
            </div>
          </div>
        </div>
        
        <div className="test-section">
          <h2>에러 핸들러 테스트</h2>
          
          <button 
            className={`error-button ${isHandlerRegistered ? "active" : ""}`} 
            onClick={toggleErrorHandler}
          >
            {isHandlerRegistered ? "에러 핸들러 해제" : "에러 핸들러 등록"}
          </button>
          
          <h3>테스트 로그</h3>
          <div className="test-log">
            {testMessages.length > 0 ? (
              <>
                <button className="clear-button" onClick={clearTestMessages}>
                  로그 지우기
                </button>
                <ul>
                  {testMessages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>에러 테스트를 실행하면 로그가 여기에 표시됩니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorTestPage;