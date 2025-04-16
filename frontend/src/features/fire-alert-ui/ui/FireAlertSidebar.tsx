import React from "react";
import { FireAlertSidebarProps } from "../model/types";
import { ForestFireList } from "../../../features/forest-fire-list";
import { FireFilterType } from "../../../shared/model/common/filterTypes";
import "./FireAlertSidebar.css";

/**
 * 산불 알림 사이드바 컴포넌트
 * 
 * 화면 오른쪽에 표시되는 산불 목록 사이드바입니다.
 * 산불 데이터 현황 요약과 함께 필터링된 산불 목록을 표시합니다.
 * 현재 필터 조건과 데이터 개수에 따라 적절한 메시지를 표시합니다.
 * 
 * 접근성 향상:
 * - 적절한 ARIA 역할 정의
 * - 상태 변경 알림
 * - 키보드 접근성 지원
 * 
 * @param filteredData 필터링된 산불 데이터 배열
 * @param selectedFilter 현재 선택된 필터
 * @param selectedFireId 선택된 산불 ID
 * @param handleFireSelect 산불 선택 핸들러
 * @param setSelectedFilter 필터 변경 핸들러
 */
export const FireAlertSidebar: React.FC<FireAlertSidebarProps> = ({
  filteredData,
  selectedFilter,
  selectedFireId,
  handleFireSelect,
  setSelectedFilter,
}) => {
  // 필터 유형에 따른 설명 메시지 생성
  const getSummaryDescription = () => {
    if (filteredData.length === 0) {
      return selectedFilter === FireFilterType.ALL 
        ? "현재 진행 중인 산불이 없습니다." 
        : `현재 ${selectedFilter === FireFilterType.ACTIVE ? "진화중인" : selectedFilter === FireFilterType.CONTAINED ? "통제중인" : "진화완료된"} 산불이 없습니다.`;
    } else {
      return selectedFilter === FireFilterType.ALL 
        ? `현재 ${String(filteredData.length)}건의 산불 정보가 표시되고 있습니다.` 
        : `현재 ${selectedFilter === FireFilterType.ACTIVE ? "진화중인" : selectedFilter === FireFilterType.CONTAINED ? "통제중인" : "진화완료된"} 산불 ${String(filteredData.length)}건이 표시되고 있습니다.`;
    }
  };

  const summaryDescription = getSummaryDescription();

  return (
    <aside className="fire-alert__sidebar" aria-label="산불 데이터 목록">
      <div className="fire-alert__sidebar-header">
        <h2 className="fire-alert__sidebar-title" id="fire-list-heading">산불 데이터 현황</h2>
        <p 
          className="fire-alert__sidebar-subtitle" 
          id="fire-list-summary"
          aria-live="polite"
        >
          {summaryDescription}
        </p>
      </div>

      <div 
        className="fire-alert__sidebar-content" 
        role="region" 
        aria-labelledby="fire-list-heading"
      >
        <ForestFireList
          fires={filteredData}
          showFilter={false}
          selectedFireId={selectedFireId}
          onFireSelect={handleFireSelect}
          filter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>
    </aside>
  );
};