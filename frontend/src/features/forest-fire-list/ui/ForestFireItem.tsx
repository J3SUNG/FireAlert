import React, { FC, useCallback, useMemo } from "react";
import { ForestFireItemProps } from "../model/types";
import { combineClasses } from "../../../shared/ui/utils/classNameUtils";
import "./ForestFireList.css";

/**
 * 산불 항목 컴포넌트
 * 개별 산불 데이터를 표시하는 카드 형태의 컴포넌트입니다.
 */
export const ForestFireItem: FC<ForestFireItemProps> = React.memo(
  ({ fire, onSelect, isSelected }) => {
    const handleClick = useCallback(() => {
      if (onSelect) {
        onSelect(fire);
      }
    }, [onSelect, fire]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onSelect) {
            onSelect(fire);
          }
        }
      },
      [onSelect, fire]
    );

    const responseLevelLabel = useMemo(() => {
      switch (fire.severity) {
        case "low":
          return "초기대응";
        case "medium":
          return "1단계";
        case "high":
          return "2단계";
        case "critical":
          return "3단계";
        default:
          return "대응단계 불명";
      }
    }, [fire.severity]);

    const statusLabel = useMemo(() => {
      switch (fire.status) {
        case "active":
          return "진행중";
        case "contained":
          return "통제중";
        case "extinguished":
          return "진화완료";
        default:
          return "알 수 없음";
      }
    }, [fire.status]);

    const severityBadgeClass = useMemo(() => {
      return combineClasses(
        "forest-fire-item__severity-badge",
        fire.severity === "low" && "forest-fire-item__severity-badge--low",
        fire.severity === "medium" && "forest-fire-item__severity-badge--medium",
        fire.severity === "high" && "forest-fire-item__severity-badge--high",
        fire.severity === "critical" && "forest-fire-item__severity-badge--critical"
      );
    }, [fire.severity]);

    const statusIconClass = useMemo(() => {
      return combineClasses(
        "forest-fire-item__status-icon",
        fire.status === "active" && "forest-fire-item__status-icon--active",
        fire.status === "contained" && "forest-fire-item__status-icon--contained",
        fire.status === "extinguished" && "forest-fire-item__status-icon--extinguished"
      );
    }, [fire.status]);

    const containerClass = useMemo(() => {
      return `forest-fire-item ${isSelected === true ? "forest-fire-item--selected" : ""}`;
    }, [isSelected]);

    const statusBadgeContent = useMemo(() => {
      const percentage = fire.extinguishPercentage ?? "0";

      if (fire.status === "active" || fire.status === "contained") {
        return (
          <>
            <span className={statusIconClass} aria-hidden="true"></span>
            진화율: <span>{percentage}%</span>
          </>
        );
      }

      return (
        <>
          <span className={statusIconClass} aria-hidden="true"></span>
          {statusLabel}
        </>
      );
    }, [fire.status, fire.extinguishPercentage, statusIconClass, statusLabel]);

    const getAccessibleDescription = useMemo(() => {
      const location = fire.location;
      const date = fire.date;
      const area = `${fire.affectedArea}헥타르`;
      const responseLevel = fire.responseLevelName ?? responseLevelLabel;
      const status = statusLabel;
      const extinguishPercentage = fire.extinguishPercentage
        ? `진화율 ${fire.extinguishPercentage}퍼센트`
        : "";
      const description = fire.description ? `. 추가정보: ${fire.description}` : "";

      return `${location}, ${date}에 발생, ${area} 면적, 대응단계 ${responseLevel}, 상태: ${status} ${extinguishPercentage}${description}`;
    }, [fire, responseLevelLabel, statusLabel]);

    return (
      <div
        className={containerClass}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={getAccessibleDescription}
      >
        <div className="forest-fire-item__content">
          <div className="forest-fire-item__info">
            <h3 className="forest-fire-item__title">{fire.location}</h3>
            <div className="forest-fire-item__meta">
              <span className="forest-fire-item__date">
                <time dateTime={new Date(fire.date).toISOString()}>{fire.date}</time>
              </span>
              <span className="forest-fire-item__separator" aria-hidden="true">
                •
              </span>
              <span className="forest-fire-item__area">{fire.affectedArea}ha</span>
            </div>
          </div>
          <div className="forest-fire-item__badge-container">
            <span
              className={severityBadgeClass}
              aria-label={`대응단계: ${fire.responseLevelName ?? responseLevelLabel}`}
            >
              대응단계: {fire.responseLevelName ?? responseLevelLabel}
            </span>
            <span
              className="forest-fire-item__status-badge"
              aria-label={`상태: ${
                fire.status === "active" || fire.status === "contained"
                  ? `진화율 ${fire.extinguishPercentage ?? "0"}%`
                  : statusLabel
              }`}
            >
              {statusBadgeContent}
            </span>
          </div>
        </div>
        {typeof fire.description === "string" && fire.description !== "" && (
          <p className="forest-fire-item__description">{fire.description}</p>
        )}
      </div>
    );
  }
);
