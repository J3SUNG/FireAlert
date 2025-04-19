import React from "react";
import { FireAlertHeaderProps } from "../model";
import { Button, APP_TITLE, FireFilterType } from "../../../shared";
import "./FireAlertHeader.css";

/**
 * 산불 알림 헤더 컴포넌트
 *
 * 애플리케이션 상단 헤더 영역을 표시합니다.
 * 로고, 필터 버튼 그룹, 최종 업데이트 시간을 포함합니다.
 * 각 필터 버튼에는 해당 상태의 산불 개수가 표시됩니다.
 */
export const FireAlertHeader: React.FC<FireAlertHeaderProps> = ({
  selectedFilter,
  setSelectedFilter,
  buttonLabels,
  currentTime,
  formatDate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, filter: FireFilterType) => {
    // Enter 또는 Space 키 누를 때 필터 변경
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedFilter(filter);
    }
  };

  return (
    <header className="fire-alert__header" role="banner">
      <div className="fire-alert__logo-container">
        <div className="fire-alert__logo-icon" aria-hidden="true">
          🔥
        </div>
        <h1 className="fire-alert__logo-text">
          <span className="fire-alert__logo-text--fire">불씨</span>알림
        </h1>
        <span className="fire-alert__subtitle" aria-label={APP_TITLE.subtitle}>
          {APP_TITLE.subtitle}
        </span>
      </div>

      <div className="fire-alert__filter-container" role="toolbar" aria-label="산불 데이터 필터">
        <Button
          variant="all"
          isActive={selectedFilter === FireFilterType.ALL}
          onClick={() => setSelectedFilter(FireFilterType.ALL)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.ALL)}
          ariaLabel={`전체 산불 데이터 보기 (${buttonLabels.all.split(" ")[0]}건)`}
          data-filter="all"
        >
          {buttonLabels.all}
        </Button>
        <Button
          variant="active"
          isActive={selectedFilter === FireFilterType.ACTIVE}
          onClick={() => setSelectedFilter(FireFilterType.ACTIVE)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.ACTIVE)}
          ariaLabel={`진행중인 산불 데이터 보기 (${buttonLabels.active.split(" ")[0]}건)`}
          data-filter="active"
        >
          {buttonLabels.active}
        </Button>
        <Button
          variant="contained"
          isActive={selectedFilter === FireFilterType.CONTAINED}
          onClick={() => setSelectedFilter(FireFilterType.CONTAINED)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.CONTAINED)}
          ariaLabel={`통제중인 산불 데이터 보기 (${buttonLabels.contained.split(" ")[0]}건)`}
          data-filter="contained"
        >
          {buttonLabels.contained}
        </Button>
        <Button
          variant="extinguished"
          isActive={selectedFilter === FireFilterType.EXTINGUISHED}
          onClick={() => setSelectedFilter(FireFilterType.EXTINGUISHED)}
          onKeyDown={(e) => handleKeyDown(e, FireFilterType.EXTINGUISHED)}
          ariaLabel={`진화완료된 산불 데이터 보기 (${buttonLabels.extinguished.split(" ")[0]}건)`}
          data-filter="extinguished"
        >
          {buttonLabels.extinguished}
        </Button>
      </div>

      <div className="fire-alert__timestamp" aria-live="polite">
        최종 업데이트:{" "}
        <time dateTime={new Date(currentTime).toISOString()}>{formatDate(currentTime)}</time>
      </div>
    </header>
  );
};
