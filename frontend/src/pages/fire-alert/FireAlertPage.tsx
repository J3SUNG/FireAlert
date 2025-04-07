import React from "react";
import { FireAlertHeader, FireAlertContent } from "../../features/fire-alert-ui";
import { useForestFireData } from "../../features/forest-fire-data";
import { useCurrentTime, useFireFilterAndSelection } from "../../shared/lib";
import "./fire-alert.css";

/**
 * 산불 알림 메인 페이지 컴포넌트
 * 전국의 산불 현황을 지도와 목록 형태로 보여주며, 상태별 필터링을 제공합니다.
 * @returns {JSX.Element} 산불 알림 페이지 UI
 */
const FireAlertPage: React.FC = () => {
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

  // 버튼 레이블 생성
  const buttonLabels = getFilterButtonLabels(statusCounts);

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
};

export default FireAlertPage;