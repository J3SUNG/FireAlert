import React from "react";
import { FireAlertHeaderProps } from "../model/types";

/**
 * 산불 알림 헤더 컴포넌트
 * 로고, 필터 버튼, 타임스탬프를 표시합니다.
 * 
 * @param props 헤더 컴포넌트 속성
 * @returns {JSX.Element} 헤더 UI
 */
export const FireAlertHeader: React.FC<FireAlertHeaderProps> = ({
  selectedFilter,
  setSelectedFilter,
  buttonLabels,
  getButtonClass,
  currentTime,
  formatDate,
}) => {
  return (
    <header className="fire-alert__header">
      <div className="fire-alert__logo-container">
        <div className="fire-alert__logo-icon">🔥</div>
        <h1 className="fire-alert__logo-text">
          <span className="fire-alert__logo-text--fire">불씨</span>알림
        </h1>
        <span className="fire-alert__subtitle">전국 산불 모니터링 시스템</span>
      </div>

      <div className="fire-alert__filter-container">
        <button className={getButtonClass("all")} onClick={() => setSelectedFilter("all")} data-filter="all">
          {buttonLabels.all}
        </button>
        <button className={getButtonClass("active")} onClick={() => setSelectedFilter("active")} data-filter="active">
          {buttonLabels.active}
        </button>
        <button
          className={getButtonClass("contained")}
          onClick={() => setSelectedFilter("contained")}
          data-filter="contained"
        >
          {buttonLabels.contained}
        </button>
        <button
          className={getButtonClass("extinguished")}
          onClick={() => setSelectedFilter("extinguished")}
          data-filter="extinguished"
        >
          {buttonLabels.extinguished}
        </button>
      </div>

      <div className="fire-alert__timestamp">최종 업데이트: {formatDate(currentTime)}</div>
    </header>
  );
};