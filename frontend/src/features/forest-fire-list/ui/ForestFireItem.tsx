import { FC } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';
import { ForestFireItemProps } from '../model/types';
import './forest-fire-list.css';

export const ForestFireItem: FC<ForestFireItemProps> = ({ fire, onSelect, isSelected }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(fire);
    }
  };

  const getResponseLevelLabel = (severity: ForestFireData['severity']) => {
    switch (severity) {
      case 'low': return '1단계';
      case 'medium': return '1단계';
      case 'high': return '2단계';
      case 'critical': return '3단계';
      default: return '대응단계 불명';
    }
  };
  
  const getStatusLabel = (status: ForestFireData['status']) => {
    switch (status) {
      case 'active': return '진행중';
      case 'contained': return '통제중';
      case 'extinguished': return '진화완료';
      default: return '알 수 없음';
    }
  };

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

  const getStatusBadgeClass = (status: ForestFireData['status'], percentage?: string) => {
    let className = 'forest-fire-item__status-badge';
    
    // 진화율에 따른 배경색 결정
    if (percentage) {
      const percentNum = parseInt(percentage, 10);
      if (!isNaN(percentNum)) {
        if (percentNum >= 100) {
          return `${className} forest-fire-item__status-badge--extinguished`; // 완료 - 초록색
        } else if (percentNum >= 50) {
          return `${className} forest-fire-item__status-badge--contained`; // 50% 이상 - 주황색
        } else {
          return `${className} forest-fire-item__status-badge--active`; // 50% 미만 - 빨간색
        }
      }
    }
    
    // 기본 상태 기반 배경색
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

  const renderSeverityBadge = (fire: ForestFireData) => {
    return (
      <span className={getSeverityBadgeClass(fire.severity)}>
        대응단계: {fire.responseLevelName ?? getResponseLevelLabel(fire.severity)}
      </span>
    );
  };


  const renderStatusBadge = (fire: ForestFireData) => {
    const percentage = fire.extinguishPercentage ?? '0';
    
    if (fire.status === 'active' || fire.status === 'contained') {
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
      className={`forest-fire-item ${isSelected === true ? 'forest-fire-item--selected' : ''}`}
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
      {typeof fire.description === 'string' && fire.description !== '' && (
        <p className="forest-fire-item__description">{fire.description}</p>
      )}
    </div>
  );
};