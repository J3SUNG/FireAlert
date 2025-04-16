import React from "react";
import { ForestFireData } from "../model/forestFire";

/**
 * FireStatusSummary 컴포넌트 프롭스 인터페이스
 */
interface FireStatusSummaryProps {
  level3Count: number;
  level2Count: number;
  level1Count: number;
  initialCount: number;
  selectedFilter?: "all" | "active" | "contained" | "extinguished";
  filteredFires?: ForestFireData[];
}

/**
 * 산불 상태 요약 컴포넌트
 * 
 * 산불 대응 단계별 개수를 시각적으로 표시
 * 접근성 속성 추가: 적절한 ARIA 속성 및 역할
 */
export const FireStatusSummary: React.FC<FireStatusSummaryProps> = ({
  level3Count,
  level2Count,
  level1Count,
  initialCount,
  selectedFilter = "all",
  filteredFires = []
}) => {
  // 선택된 필터에 따라 표시할 데이터 계산
  const calculateFilteredCounts = () => {
    if (selectedFilter === "all") {
      return {
        initial: initialCount, 
        level1: level1Count, 
        level2: level2Count, 
        level3: level3Count
      };
    }
    
    // 필터링된 산불만 고려하여 대응단계별 카운트 계산
    return {
      initial: filteredFires.filter(f => f.severity === "low").length,
      level1: filteredFires.filter(f => f.severity === "medium").length,
      level2: filteredFires.filter(f => f.severity === "high").length,
      level3: filteredFires.filter(f => f.severity === "critical").length,
    };
  };
  
  const counts = calculateFilteredCounts();
  
  // 선택된 필터에 따른 설명 생성
  const getSummaryDescription = () => {
    if (selectedFilter === "all") {
      return "전체 산불의 대응단계별 현황";
    } else {
      const filterName = 
        selectedFilter === "active" ? "진행중인" : 
        selectedFilter === "contained" ? "통제중인" : "진화완료된";
      return `${filterName} 산불의 대응단계별 현황`;
    }
  };
  
  return (
    <section 
      className="fire-alert__status-summary" 
      aria-labelledby="fire-summary-title"
      role="region"
    >
      <h3 
        id="fire-summary-title" 
        className="fire-alert__summary-title"
      >
        산불대응현황
      </h3>
      <div className="fire-alert__summary-grid" role="presentation">
        <div className="fire-alert__summary-item fire-alert__summary-item--initial">
          <div className="fire-alert__summary-item-content">
            <div className="fire-alert__label-group">
              <div 
                className="fire-alert__color-indicator fire-alert__color-indicator--initial"
                aria-hidden="true"
              ></div>
              <span 
                className="fire-alert__summary-label"
                id="initial-level-label"
              >
                초기대응
              </span>
            </div>
            <span 
              className="fire-alert__summary-value fire-alert__summary-value--initial"
              aria-labelledby="initial-level-label"
            >
              {counts.initial}
            </span>
          </div>
        </div>
        <div className="fire-alert__summary-item fire-alert__summary-item--level1">
          <div className="fire-alert__summary-item-content">
            <div className="fire-alert__label-group">
              <div 
                className="fire-alert__color-indicator fire-alert__color-indicator--level1"
                aria-hidden="true"
              ></div>
              <span 
                className="fire-alert__summary-label"
                id="level1-label"
              >
                1단계
              </span>
            </div>
            <span 
              className="fire-alert__summary-value fire-alert__summary-value--level1"
              aria-labelledby="level1-label"
            >
              {counts.level1}
            </span>
          </div>
        </div>
        <div className="fire-alert__summary-item fire-alert__summary-item--level2">
          <div className="fire-alert__summary-item-content">
            <div className="fire-alert__label-group">
              <div 
                className="fire-alert__color-indicator fire-alert__color-indicator--level2"
                aria-hidden="true"
              ></div>
              <span 
                className="fire-alert__summary-label"
                id="level2-label"
              >
                2단계
              </span>
            </div>
            <span 
              className="fire-alert__summary-value fire-alert__summary-value--level2"
              aria-labelledby="level2-label"
            >
              {counts.level2}
            </span>
          </div>
        </div>
        <div className="fire-alert__summary-item fire-alert__summary-item--level3">
          <div className="fire-alert__summary-item-content">
            <div className="fire-alert__label-group">
              <div 
                className="fire-alert__color-indicator fire-alert__color-indicator--level3"
                aria-hidden="true"
              ></div>
              <span 
                className="fire-alert__summary-label"
                id="level3-label"
              >
                3단계
              </span>
            </div>
            <span 
              className="fire-alert__summary-value fire-alert__summary-value--level3"
              aria-labelledby="level3-label"
            >
              {counts.level3}
            </span>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {getSummaryDescription()}: 초기대응 {counts.initial}건, 1단계 {counts.level1}건, 
        2단계 {counts.level2}건, 3단계 {counts.level3}건.
      </div>
    </section>
  );
};
