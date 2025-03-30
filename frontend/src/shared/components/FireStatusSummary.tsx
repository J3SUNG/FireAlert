import React from "react";

interface FireStatusSummaryProps {
  level3Count: number;
  level2Count: number;
  level1Count: number;
  initialCount: number;
}

/**
 * 산불 상태 요약 컴포넌트 (SRP)
 */
export const FireStatusSummary: React.FC<FireStatusSummaryProps> = ({
  level3Count,
  level2Count,
  level1Count,
  initialCount,
}) => {
  return (
    <div className="fire-alert__status-summary">
      <h3 className="fire-alert__summary-title">산불 대응단계 현황</h3>
      <div className="fire-alert__summary-grid">
        <div className="fire-alert__summary-item">
          <span className="fire-alert__summary-label">초기진화단계</span>
          <span className="fire-alert__summary-value fire-alert__summary-value--initial">
            {initialCount}
          </span>
        </div>
        <div className="fire-alert__summary-item">
          <span className="fire-alert__summary-label">대응단계 1단계</span>
          <span className="fire-alert__summary-value fire-alert__summary-value--level1">
            {level1Count}
          </span>
        </div>
        <div className="fire-alert__summary-item">
          <span className="fire-alert__summary-label">대응단계 2단계</span>
          <span className="fire-alert__summary-value fire-alert__summary-value--level2">
            {level2Count}
          </span>
        </div>
        <div className="fire-alert__summary-item">
          <span className="fire-alert__summary-label">대응단계 3단계</span>
          <span className="fire-alert__summary-value fire-alert__summary-value--level3">
            {level3Count}
          </span>
        </div>
      </div>
    </div>
  );
};
