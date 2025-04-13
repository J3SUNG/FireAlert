import React, { FC, useCallback, useMemo } from "react";
import { ForestFireItemProps } from "../model/types";
import { combineClasses } from "../../../shared/ui/utils/classNameUtils";
import "./ForestFireList.css";

/**
 * 산불 항목 컴포넌트
 * 개별 산불 데이터를 표시하는 카드 형태의 컴포넌트입니다.
 * 산불 위치, 발생 일자, 영향 면적, 대응 단계, 진화율 등의 정보를 포함합니다.
 *
 * 메모이제이션을 적용하여 불필요한 렌더링을 방지합니다.
 *
 * @param {ForestFireItemProps} props 산불 항목 속성
 * @returns {JSX.Element} 산불 항목 컴포넌트
 */
export const ForestFireItem: FC<ForestFireItemProps> = React.memo(
  ({ fire, onSelect, isSelected }) => {
    /**
     * 산불 항목 클릭 이벤트 처리
     * useCallback으로 메모이제이션하여 불필요한 함수 재생성을 방지합니다.
     */
    const handleClick = useCallback(() => {
      if (onSelect) {
        onSelect(fire);
      }
    }, [onSelect, fire]);

    /**
     * 대응단계 라벨 가져오기
     * 산불 위험 등급을 한글 대응단계로 변환합니다.
     */
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

    /**
     * 산불 상태 라벨 가져오기
     * 산불 상태에 따른 한글 라벨을 반환합니다.
     */
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

    /**
     * 산불 위험도에 따른 배지 클래스 가져오기
     * 위험도에 따라 다른 스타일을 적용하기 위한 CSS 클래스를 반환합니다.
     */
    const severityBadgeClass = useMemo(() => {
      return combineClasses(
        "forest-fire-item__severity-badge",
        fire.severity === "low" && "forest-fire-item__severity-badge--low",
        fire.severity === "medium" && "forest-fire-item__severity-badge--medium",
        fire.severity === "high" && "forest-fire-item__severity-badge--high",
        fire.severity === "critical" && "forest-fire-item__severity-badge--critical"
      );
    }, [fire.severity]);

    /**
     * 산불 상태 아이콘 클래스 가져오기
     * 산불 상태에 따른 아이콘 스타일을 적용하기 위한 CSS 클래스를 반환합니다.
     */
    const statusIconClass = useMemo(() => {
      return combineClasses(
        "forest-fire-item__status-icon",
        fire.status === "active" && "forest-fire-item__status-icon--active",
        fire.status === "contained" && "forest-fire-item__status-icon--contained",
        fire.status === "extinguished" && "forest-fire-item__status-icon--extinguished"
      );
    }, [fire.status]);

    /**
     * 컨테이너 클래스
     */
    const containerClass = useMemo(() => {
      return `forest-fire-item ${isSelected === true ? "forest-fire-item--selected" : ""}`;
    }, [isSelected]);

    /**
     * 진화율 또는 상태 표시
     */
    const statusBadgeContent = useMemo(() => {
      const percentage = fire.extinguishPercentage ?? "0";

      if (fire.status === "active" || fire.status === "contained") {
        return (
          <>
            <span className={statusIconClass}></span>
            진화율: <span>{percentage}%</span>
          </>
        );
      }

      return (
        <>
          <span className={statusIconClass}></span>
          {statusLabel}
        </>
      );
    }, [fire.status, fire.extinguishPercentage, statusIconClass, statusLabel]);

    return (
      <div className={containerClass} onClick={handleClick}>
        <div className="forest-fire-item__content">
          <div className="forest-fire-item__info">
            <h3 className="forest-fire-item__title">{fire.location}</h3>
            <div className="forest-fire-item__meta">
              <span className="forest-fire-item__date">{fire.date}</span>
              <span className="forest-fire-item__separator">•</span>
              <span className="forest-fire-item__area">{fire.affectedArea}ha</span>
            </div>
          </div>
          <div className="forest-fire-item__badge-container">
            <span className={severityBadgeClass}>
              대응단계: {fire.responseLevelName ?? responseLevelLabel}
            </span>
            <span className="forest-fire-item__status-badge">{statusBadgeContent}</span>
          </div>
        </div>
        {typeof fire.description === "string" && fire.description !== "" && (
          <p className="forest-fire-item__description">{fire.description}</p>
        )}
      </div>
    );
  }
);
