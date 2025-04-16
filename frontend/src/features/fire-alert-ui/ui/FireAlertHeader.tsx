import React from "react";
import { FireAlertHeaderProps } from "../model/types";
import { Button } from "../../../shared/ui/components";
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
 * 접근성 향상:
 * - ARIA 영역과 라이브 리전 추가
 * - 키보드 탐색 지원
 * - 의미론적 HTML 구조
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
  // 키보드 이벤트 핸들러 (탭 이동 및 접근성 지원)
  const handleKeyDown = (e: React.KeyboardEvent, filter: FireFilterType) => {
    // Enter 또는 Space 키 누를 때 필터 변경
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedFilter(filter);
    }
  };

  return (
    <header className="fire-alert__header" role="banner">
      <div className="fire-alert__logo-container">
        <div className="fire-alert__logo-icon" aria-hidden="true">🔥</div>
        <h1 className="fire-alert__logo-text">
          <span className="fire-alert__logo-text--fire">불씨</span>알림
        </h1>
        <span className="fire-alert__subtitle" aria-label={APP_TITLE.subtitle}>{APP_TITLE.subtitle}</span>
      </div>

      <div className="fire-alert__filter-container" role="toolbar" aria-label="산불 데이터 필터">
        <Button 
          variant="all"
          isActive={selectedFilter === FireFilterType.ALL}
          onClick={() => setSelectedFilter(FireFilterType.ALL)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.ALL)}
          ariaLabel={`전체 산불 데이터 보기 (${buttonLabels.all.split(' ')[0]}건)`}
          data-filter="all"
        >
          {buttonLabels.all}
        </Button>
        <Button 
          variant="active"
          isActive={selectedFilter === FireFilterType.ACTIVE}
          onClick={() => setSelectedFilter(FireFilterType.ACTIVE)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.ACTIVE)}
          ariaLabel={`진행중인 산불 데이터 보기 (${buttonLabels.active.split(' ')[0]}건)`}
          data-filter="active"
        >
          {buttonLabels.active}
        </Button>
        <Button
          variant="contained"
          isActive={selectedFilter === FireFilterType.CONTAINED}
          onClick={() => setSelectedFilter(FireFilterType.CONTAINED)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.CONTAINED)}
          ariaLabel={`통제중인 산불 데이터 보기 (${buttonLabels.contained.split(' ')[0]}건)`}
          data-filter="contained"
        >
          {buttonLabels.contained}
        </Button>
        <Button
          variant="extinguished"
          isActive={selectedFilter === FireFilterType.EXTINGUISHED}
          onClick={() => setSelectedFilter(FireFilterType.EXTINGUISHED)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.EXTINGUISHED)}
          ariaLabel={`진화완료된 산불 데이터 보기 (${buttonLabels.extinguished.split(' ')[0]}건)`}
          data-filter="extinguished"
        >
          {buttonLabels.extinguished}
        </Button>
      </div>

      <div className="fire-alert__timestamp" aria-live="polite">
        최종 업데이트: <time dateTime={new Date(currentTime).toISOString()}>{formatDate(currentTime)}</time>
      </div>
    </header>
  );
};