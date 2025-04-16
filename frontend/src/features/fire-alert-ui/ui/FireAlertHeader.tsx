import React from "react";
import { FireAlertHeaderProps } from "../model/types";
import { APP_TITLE } from "../../../shared/constants";
import { FireFilterType } from "../../../shared/model/common/filterTypes";
import "./FireAlertHeader.css";

/**
 * 산불 알림 헤더 컴포넌트
 * 
 * 애플리케이션 상단 헤더 영역을 표시합니다.
 * 로고, 필터 버튼 그룹, 최종 업데이트 시간을 포함합니다.
 * 각 필터 버튼에는 해당 상태의 산불 개수가 표시됩니다.
 * 
 * @param selectedFilter 현재 선택된 필터
 * @param setSelectedFilter 필터 변경 핸들러
 * @param buttonLabels 버튼 레이블 객체 (각 상태별 텍스트+개수)
 * @param getButtonClass 버튼 클래스 계산 함수
 * @param currentTime 현재 시간
 * @param formatDate 날짜 포맷팅 함수
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
        <span className="fire-alert__subtitle">{APP_TITLE.subtitle}</span>
      </div>

      <div className="fire-alert__filter-container">
        <button className={getButtonClass(FireFilterType.ALL)} onClick={() => setSelectedFilter(FireFilterType.ALL)} data-filter="all">
          {buttonLabels.all}
        </button>
        <button className={getButtonClass(FireFilterType.ACTIVE)} onClick={() => setSelectedFilter(FireFilterType.ACTIVE)} data-filter="active">
          {buttonLabels.active}
        </button>
        <button
          className={getButtonClass(FireFilterType.CONTAINED)}
          onClick={() => setSelectedFilter(FireFilterType.CONTAINED)}
          data-filter="contained"
        >
          {buttonLabels.contained}
        </button>
        <button
          className={getButtonClass(FireFilterType.EXTINGUISHED)}
          onClick={() => setSelectedFilter(FireFilterType.EXTINGUISHED)}
          data-filter="extinguished"
        >
          {buttonLabels.extinguished}
        </button>
      </div>

      <div className="fire-alert__timestamp">최종 업데이트: {formatDate(currentTime)}</div>
    </header>
  );
};