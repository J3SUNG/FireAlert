import React from "react";
import { FireAlertSidebarProps } from "../model/types";
import { ForestFireList } from "../../../features/forest-fire-list";

/**
 * 산불 알림 사이드바 컴포넌트
 * 산불 데이터 현황 및 목록을 표시합니다.
 * 
 * @param props 사이드바 컴포넌트 속성
 * @returns {JSX.Element} 사이드바 UI
 */
export const FireAlertSidebar: React.FC<FireAlertSidebarProps> = ({
  filteredData,
  selectedFilter,
  selectedFireId,
  handleFireSelect,
  setSelectedFilter,
}) => {
  return (
    <div className="fire-alert__sidebar">
      <div className="fire-alert__sidebar-header">
        <h2 className="fire-alert__sidebar-title">산불 데이터 현황</h2>
        <p className="fire-alert__sidebar-subtitle">
          {filteredData.length === 0 ? (
            selectedFilter === "all" ?
              "현재 진행 중인 산불이 없습니다." :
              `현재 ${selectedFilter === "active" ? "진화중인" : selectedFilter === "contained" ? "통제중인" : "진화완료된"} 산불이 없습니다.`
          ) : (
            selectedFilter === "all" ?
              `현재 ${String(filteredData.length)}건의 산불 정보가 표시되고 있습니다.` :
              `현재 ${selectedFilter === "active" ? "진화중인" : selectedFilter === "contained" ? "통제중인" : "진화완료된"} 산불 ${String(filteredData.length)}건이 표시되고 있습니다.`
          )}
        </p>
      </div>

      <div className="fire-alert__sidebar-content">
        <ForestFireList
          fires={filteredData}
          showFilter={false}
          selectedFireId={selectedFireId}
          onFireSelect={handleFireSelect}
          filter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>
    </div>
  );
};