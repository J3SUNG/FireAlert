import React, { useMemo } from "react";
import { FireAlertHeader, FireAlertContent } from "../../features/fire-alert-ui";
import { useForestFireData } from "../../features/forest-fire-data";
import { useCurrentTime, useFireFilterAndSelection } from "../../shared/lib";
import { ErrorBoundary } from "../../shared/lib/errors";
import "./FireAlertPage.css";

/**
 * 산불 알림 메인 페이지 컴포넌트 내용
 *
 * 산불 데이터 표시와 필터링 기능을 제공합니다.
 * 메모이제이션을 적용하여 불필요한 렌더링을 방지합니다.
 */
const FireAlertPageContent: React.FC = React.memo(() => {
  // 산불 데이터 관리 후크
  const { fires, isLoading, hasError, statusCounts, responseLevelCounts, handleReload } =
    useForestFireData();

  // 필터링 및 선택 관리 후크
  const {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  } = useFireFilterAndSelection(fires);

  // 현재 시간 관리 후크
  const { currentTime, formatDate } = useCurrentTime();

  // 버튼 레이블 메모이제이션
  const buttonLabels = useMemo(() => {
    return getFilterButtonLabels(statusCounts);
  }, [getFilterButtonLabels, statusCounts]);

  return (
    <div className="fire-alert">
      <FireAlertHeader
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        buttonLabels={buttonLabels}
        getButtonClass={getButtonClass}
        currentTime={currentTime}
        formatDate={formatDate}
      />

      <FireAlertContent
        isLoading={isLoading}
        hasError={hasError}
        handleReload={handleReload}
        filteredData={filteredData}
        selectedFireId={selectedFireId}
        selectedFilter={selectedFilter}
        handleFireSelect={handleFireSelect}
        responseLevelCounts={responseLevelCounts}
        setSelectedFilter={setSelectedFilter}
      />
    </div>
  );
});

/**
 * 산불 알림 메인 페이지 컴포넌트
 *
 * 에러 바운더리로 감싸 오류 범위를 지정합니다.
 * 전국 산불 현황을 지도와 목록으로 보여주고 상태별 필터링을 제공합니다.
 */
const FireAlertPage: React.FC = React.memo(() => {
  return (
    <ErrorBoundary component="FireAlertPage" feature="fire-alert">
      <FireAlertPageContent />
    </ErrorBoundary>
  );
});

export default FireAlertPage;
