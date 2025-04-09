import React from "react";
import { FireAlertContentProps } from "../model/types";
import { ForestFireMap } from "../../../features/forest-fire-map";
import { FireStatusSummary } from "../../../shared";
import { FireAlertSidebar } from "./FireAlertSidebar";
import { LOADING_MESSAGE, ERROR_MESSAGES, BUTTON_TEXT } from "../../../shared/constants";
import "./FireAlertContent.css";

/**
 * 산불 알림 컨텐츠 컴포넌트
 * 로딩 상태, 에러 상태, 지도와 사이드바를 표시합니다.
 * 
 * @param props 컨텐츠 컴포넌트 속성
 * @returns {JSX.Element} 컨텐츠 UI
 */
export const FireAlertContent: React.FC<FireAlertContentProps> = ({
  loading,
  error,
  handleReload,
  filteredData,
  selectedFireId,
  selectedFilter,
  handleFireSelect,
  responseLevelCounts,
  setSelectedFilter,
}) => {
  if (loading) {
    return (
      <div className="fire-alert__content">
        <div className="fire-alert__loading-container">
          <div className="fire-alert__spinner"></div>
          <p className="fire-alert__loading-text">{LOADING_MESSAGE}</p>
        </div>
      </div>
    );
  }

  if (error !== null && error !== "") {
    return (
      <div className="fire-alert__content">
        <div className="fire-alert__error-container">
          <p className="fire-alert__error-text">{error || ERROR_MESSAGES.default}</p>
          <button className="fire-alert__retry-button" onClick={handleReload}>
            {BUTTON_TEXT.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fire-alert__content">
      <div className="fire-alert__map-container">
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
    </div>
  );
};