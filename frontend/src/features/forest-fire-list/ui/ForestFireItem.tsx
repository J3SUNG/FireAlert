import { FC } from "react";
import { ForestFireData } from "../../../shared/types/forestFire";
import { ForestFireItemProps } from "../model/types";
import "./forest-fire-list.css";

/**
 * 산불 항목 컴포넌트
 * 개별 산불 데이터를 표시하는 카드 형태의 컴포넌트입니다.
 * 산불 위치, 발생 일자, 영향 면적, 대응 단계, 진화율 등의 정보를 포함합니다.
 * 
 * @param {ForestFireItemProps} props 산불 항목 속성
 * @returns {JSX.Element} 산불 항목 컴포넌트
 */
export const ForestFireItem: FC<ForestFireItemProps> = ({ fire, onSelect, isSelected }) => {
  /**
   * 산불 항목 클릭 이벤트 처리
   * 화살표 함수로 정의하여 this 바인딩 방지
   */
  const handleClick = () => {
    if (onSelect) {
      onSelect(fire);
    }
  };

  /**
   * 산불 위험도에 따른 대응단계 라벨 가져오기
   * 산불 위험 등급을 한글 대응단계로 변환합니다.
   * 
   * @param {ForestFireData["severity"]} severity 산불 위험도
   * @returns {string} 대응단계 라벨
   */
  const getResponseLevelLabel = (severity: ForestFireData["severity"]) => {
    switch (severity) {
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
  };

  /**
   * 산불 상태 라벨 가져오기
   * 산불 상태에 따른 한글 라벨을 반환합니다.
   * 
   * @param {ForestFireData["status"]} status 산불 상태
   * @returns {string} 산불 상태 라벨
   */
  const getStatusLabel = (status: ForestFireData["status"]) => {
    switch (status) {
      case "active":
        return "진행중";
      case "contained":
        return "통제중";
      case "extinguished":
        return "진화완료";
      default:
        return "알 수 없음";
    }
  };

  /**
   * 산불 위험도에 따른 배지 클래스 가져오기
   * 위험도에 따라 다른 스타일을 적용하기 위한 CSS 클래스를 반환합니다.
   * 
   * @param {ForestFireData["severity"]} severity 산불 위험도
   * @returns {string} CSS 클래스명
   */
  const getSeverityBadgeClass = (severity: ForestFireData["severity"]) => {
    let className = "forest-fire-item__severity-badge";

    switch (severity) {
      case "low":
        className += " forest-fire-item__severity-badge--low";
        break;
      case "medium":
        className += " forest-fire-item__severity-badge--medium";
        break;
      case "high":
        className += " forest-fire-item__severity-badge--high";
        break;
      case "critical":
        className += " forest-fire-item__severity-badge--critical";
        break;
    }

    return className;
  };

  /**
   * 산불 상태 배지 클래스 가져오기
   * 
   * @param {ForestFireData["status"]} status 산불 상태
   * @param {string} [percentage] 진화율
   * @returns {string} CSS 클래스명
   */
  const getStatusBadgeClass = (_status: ForestFireData["status"], _percentage?: string) => {
    // 진화율과 진화완료 배경색 제거
    return "forest-fire-item__status-badge";
  };

  /**
   * 산불 상태 아이콘 클래스 가져오기
   * 산불 상태에 따른 아이콘 스타일을 적용하기 위한 CSS 클래스를 반환합니다.
   * 
   * @param {ForestFireData["status"]} status 산불 상태
   * @returns {string} CSS 클래스명
   */
  const getStatusIconClass = (status: ForestFireData["status"]) => {
    let className = "forest-fire-item__status-icon";

    switch (status) {
      case "active":
        className += " forest-fire-item__status-icon--active";
        break;
      case "contained":
        className += " forest-fire-item__status-icon--contained";
        break;
      case "extinguished":
        className += " forest-fire-item__status-icon--extinguished";
        break;
    }

    return className;
  };

  /**
   * 산불 위험도 배지 렌더링
   * 산불의 대응단계를 표시하는 배지를 렌더링합니다.
   * 
   * @param {ForestFireData} fire 산불 데이터
   * @returns {JSX.Element} 위험도 배지 컴포넌트
   */
  const renderSeverityBadge = (fire: ForestFireData) => {
    return (
      <span className={getSeverityBadgeClass(fire.severity)}>
        대응단계: {fire.responseLevelName ?? getResponseLevelLabel(fire.severity)}
      </span>
    );
  };

  /**
   * 산불 상태 배지 렌더링
   * 산불의 현재 상태와 진화율을 표시하는 배지를 렌더링합니다.
   * 진행중/통제중인 산불는 진화율을, 진화완료된 산불는 상태를 표시합니다.
   * 
   * @param {ForestFireData} fire 산불 데이터
   * @returns {JSX.Element} 상태 배지 컴포넌트
   */
  const renderStatusBadge = (fire: ForestFireData) => {
    const percentage = fire.extinguishPercentage ?? "0";

    if (fire.status === "active" || fire.status === "contained") {
      return (
        <span className={getStatusBadgeClass(fire.status, percentage)}>
          <span className={getStatusIconClass(fire.status)}></span>
          진화율: <span>{percentage}%</span>
        </span>
      );
    }

    return (
      <span className={getStatusBadgeClass(fire.status)}>
        <span className={getStatusIconClass(fire.status)}></span>
        {getStatusLabel(fire.status)}
      </span>
    );
  };

  return (
    <div
      className={`forest-fire-item ${isSelected === true ? "forest-fire-item--selected" : ""}`}
      onClick={handleClick}
    >
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
          {renderSeverityBadge(fire)}
          {renderStatusBadge(fire)}
        </div>
      </div>
      {typeof fire.description === "string" && fire.description !== "" && (
        <p className="forest-fire-item__description">{fire.description}</p>
      )}
    </div>
  );
};
