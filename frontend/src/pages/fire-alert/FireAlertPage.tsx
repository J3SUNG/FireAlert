import React, { useMemo } from "react";
import { FireAlertHeader, FireAlertContent } from "../../features/fire-alert-ui";
import { useForestFireData } from "../../features/forest-fire-data";
import { useCurrentTime, useFireFilterAndSelection } from "../../shared/lib";
import { ErrorBoundary } from "../../shared/lib/errors";
import "../../features/fire-alert-ui/ui/index.css";
import "./FireAlertPage.css";

/**
 * 산불 알림 메인 페이지 컴포넌트 내용
 * 
 * 메모이제이션 적용으로 불필요한 렌더링 방지
 */
const FireAlertPageContent: React.FC = React.memo(() => {
  // 산불 데이터 및 상태 관리
  const { fires, loading, error, statusCounts, responseLevelCounts, handleReload } =
    useForestFireData();

  // 필터링 및 선택 상태 관리
  const {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  } = useFireFilterAndSelection(fires);

  // 시간 관련 기능
  const { currentTime, formatDate } = useCurrentTime();

  // 상태 변경시에만 버튼 레이블 재생성
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
        loading={loading}
        error={error}
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
 * 전국 산불 현황을 지도와 목록으로 보여주고 상태별 필터링 제공
 */
const FireAlertPage: React.FC = React.memo(() => {
  return (
    <ErrorBoundary component="FireAlertPage" feature="fire-alert">
      <FireAlertPageContent />
    </ErrorBoundary>
  );
});

export default FireAlertPage;