import React from "react";
import { FireAlertContentProps } from "../model/types";
import { ForestFireMap } from "../../../features/forest-fire-map";
import { FireStatusSummary } from "../../../shared";
import { FireAlertSidebar } from "./FireAlertSidebar";
import { LOADING_MESSAGE, ERROR_MESSAGES, BUTTON_TEXT } from "../../../shared/constants";
import "./FireAlertContent.css";

/**
 * 산불 알림 콘텐츠 컴포넌트
 *
 * 산불 알림 페이지의 주요 콘텐츠 영역을 관리합니다.
 * 로딩 상태, 오류 표시, 지도, 산불 목록 사이드바를 표시합니다.
 * 데이터 상태(로딩/오류/데이터)에 따라 적절한 화면을 렌더링합니다.
 *
 * 접근성 향상:
 * - ARIA 영역과 라이브 리전 추가
 * - 상태 변경 알림
 * - 키보드 접근성 개선
 * 
 * @param isLoading 로딩 상태
 * @param hasError 오류 메시지
 * @param handleReload 새로고침 핸들러
 * @param filteredData 필터링된 산불 데이터
 * @param selectedFireId 선택된 산불 ID
 * @param selectedFilter 선택된 필터
 * @param handleFireSelect 산불 선택 핸들러
 * @param responseLevelCounts 대응단계별 산불 개수
 * @param setSelectedFilter 필터 변경 핸들러
 */
export const FireAlertContent: React.FC<FireAlertContentProps> = ({
  isLoading,
  hasError,
  handleReload,
  filteredData,
  selectedFireId,
  selectedFilter,
  handleFireSelect,
  responseLevelCounts,
  setSelectedFilter,
}) => {
  // 로딩 상태 시 표시할 내용
  if (isLoading) {
    return (
      <main className="fire-alert__content" role="main">
        <div className="fire-alert__loading-container" aria-live="polite" aria-busy="true">
          <div className="fire-alert__spinner" role="progressbar" aria-valuetext={LOADING_MESSAGE}></div>
          <p className="fire-alert__loading-text">{LOADING_MESSAGE}</p>
        </div>
      </main>
    );
  }

  // 에러 상태 시 표시할 내용
  if (hasError !== null && hasError !== "") {
    return (
      <main className="fire-alert__content" role="main">
        <div className="fire-alert__error-container" aria-live="assertive">
          <p className="fire-alert__error-text" role="alert">{hasError || ERROR_MESSAGES.default}</p>
          <button 
            className="fire-alert__retry-button" 
            onClick={handleReload}
            aria-label="데이터 다시 불러오기"
          >
            {BUTTON_TEXT.retry}
          </button>
        </div>
      </main>
    );
  }

  // 정상 데이터 표시
  return (
    <main className="fire-alert__content" role="main">
      <div className="fire-alert__map-container" aria-label="산불 발생 지도">
        <ForestFireMap
          fires={filteredData}
          selectedFireId={selectedFireId}
          onFireSelect={handleFireSelect}
          legendPosition="bottomleft"
        />

        <FireStatusSummary
          level3Count={responseLevelCounts.level3}
          level2Count={responseLevelCounts.level2}
          level1Count={responseLevelCounts.level1}
          initialCount={responseLevelCounts.initial}
          selectedFilter={selectedFilter}
          filteredFires={filteredData}
        />
      </div>

      <FireAlertSidebar
        filteredData={filteredData}
        selectedFilter={selectedFilter}
        selectedFireId={selectedFireId}
        handleFireSelect={handleFireSelect}
        setSelectedFilter={setSelectedFilter}
      />
    </main>
  );
};