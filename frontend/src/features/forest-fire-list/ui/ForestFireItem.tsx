import { FC } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';
import './forest-fire-list.css';

interface ForestFireItemProps {
  fire: ForestFireData;
  onSelect?: (fire: ForestFireData) => void;
  isSelected?: boolean;
}

// 리스코프 치환 원칙(LSP)을 고려하여 설계된 컴포넌트
// 상위 타입인 ForestFireData를 파라미터로 받아 처리
export const ForestFireItem: FC<ForestFireItemProps> = ({ fire, onSelect, isSelected }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(fire);
    }
  };

  // 대응단계 레이블
  const getResponseLevelLabel = (severity: ForestFireData['severity']) => {
    switch (severity) {
      case 'low': return '1단계';
      case 'medium': return '1단계';
      case 'high': return '2단계';
      case 'critical': return '3단계';
      default: return '대응단계 불명';
    }
  };
  
  // 상태 레이블
  const getStatusLabel = (status: ForestFireData['status']) => {
    switch (status) {
      case 'active': return '진행중';
      case 'contained': return '통제중';
      case 'extinguished': return '진화완료';
      default: return '알 수 없음';
    }
  };

  // 심각도 배지 클래스
  const getSeverityBadgeClass = (severity: ForestFireData['severity']) => {
    let className = 'forest-fire-item__severity-badge';
    
    switch (severity) {
      case 'low':
        className += ' forest-fire-item__severity-badge--low';
        break;
      case 'medium':
        className += ' forest-fire-item__severity-badge--medium';
        break;
      case 'high':
        className += ' forest-fire-item__severity-badge--high';
        break;
      case 'critical':
        className += ' forest-fire-item__severity-badge--critical';
        break;
    }
    
    return className;
  };

  // 상태 배지 클래스
  const getStatusBadgeClass = (status: ForestFireData['status']) => {
    let className = 'forest-fire-item__status-badge';
    
    switch (status) {
      case 'active':
        className += ' forest-fire-item__status-badge--active';
        break;
      case 'contained':
        className += ' forest-fire-item__status-badge--contained';
        break;
      case 'extinguished':
        className += ' forest-fire-item__status-badge--extinguished';
        break;
    }
    
    return className;
  };

  // 상태 아이콘 클래스
  const getStatusIconClass = (status: ForestFireData['status']) => {
    let className = 'forest-fire-item__status-icon';
    
    switch (status) {
      case 'active':
        className += ' forest-fire-item__status-icon--active';
        break;
      case 'contained':
        className += ' forest-fire-item__status-icon--contained';
        break;
      case 'extinguished':
        className += ' forest-fire-item__status-icon--extinguished';
        break;
    }
    
    return className;
  };

  // 진화율과 대응단계를 포함한 정보 표시
  const renderSeverityBadge = (fire: ForestFireData) => {
    return (
      <span className={getSeverityBadgeClass(fire.severity)}>
        대응단계: {fire.responseLevelName || getResponseLevelLabel(fire.severity)}
      </span>
    );
  };

  // 상태 배지 표시 (진화율 포함)
  const renderStatusBadge = (fire: ForestFireData) => {
    // 진화율 추출 및 형식화
    const percentage = fire.extinguishPercentage || '0';
    
    // 상태 표시
    if (fire.status === 'active' || fire.status === 'contained') {
      return (
        <span className={getStatusBadgeClass(fire.status)}>
          <span className={getStatusIconClass(fire.status)}></span>
          진화율: {percentage}%
        </span>
      );
    }
    
    // 진화완료인 경우
    return (
      <span className={getStatusBadgeClass(fire.status)}>
        <span className={getStatusIconClass(fire.status)}></span>
        {getStatusLabel(fire.status)}
      </span>
    );
  };

  return (
    <div 
      className={`forest-fire-item ${isSelected ? 'forest-fire-item--selected' : ''}`}
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
      {fire.description && (
        <p className="forest-fire-item__description">{fire.description}</p>
      )}
    </div>
  );
};