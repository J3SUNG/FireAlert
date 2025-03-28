import { FC } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';

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

  // 진화율에 따라 색상 배정
  const getExtinguishPercentageColor = (percentage: string): string => {
    const value = parseInt(percentage, 10);
    if (value === 100) return '#22c55e'; // 완료: 초록색
    if (value >= 50) return '#f97316';  // 50% 이상: 주황색
    return '#ef4444';                   // 50% 미만: 빨강색
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    padding: '14px',
    border: '1px solid',
    borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
    borderRadius: '10px',
    backgroundColor: isSelected ? '#f0f7ff' : 'white',
    cursor: 'pointer',
    boxShadow: isSelected ? '0 4px 8px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    transition: 'all 0.2s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const infoStyle: React.CSSProperties = {
    flex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '6px',
    letterSpacing: '-0.3px'
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280'
  };

  const provinceStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4b5563',
    marginBottom: '2px',
    fontWeight: isSelected ? 500 : 'normal'
  };

  const badgeContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    marginLeft: '8px'
  };

  // 진화율과 대응단계를 포함한 정보 표시
  const renderSeverityBadge = (fire: ForestFireData) => {
    return (
      <span style={getSeverityBadgeStyle(fire.severity)}>
        대응단계: {fire.responseLevelName || getResponseLevelLabel(fire.severity)}
      </span>
    );
  };

  // 상태 배지 표시 (진화율 포함)
  const renderStatusBadge = (fire: ForestFireData) => {
    // 진화율 추출 및 형식화
    const percentage = fire.extinguishPercentage || '0';
    const percentageNum = parseInt(percentage, 10);
    
    // 진화율에 따라 색상 설정
    if (fire.status === 'active' || fire.status === 'contained') {
      const percentColor = getExtinguishPercentageColor(percentage);
      const customStyle = {
        ...getStatusBadgeStyle(fire.status),
        backgroundColor: percentageNum === 100 ? '#dcfce7' : percentageNum >= 50 ? '#ffedd5' : '#fee2e2',
        color: percentColor
      };
      
      return (
        <span style={customStyle}>
          {getStatusIcon(fire.status, percentColor)}
          진화율: {percentage}%
        </span>
      );
    }
    
    // 진화완료인 경우
    return (
      <span style={getStatusBadgeStyle(fire.status)}>
        {getStatusIcon(fire.status)}
        {getStatusLabel(fire.status)}
      </span>
    );
  };

  const getSeverityBadgeStyle = (severity: ForestFireData['severity']) => {
    let bgColor, textColor;
    
    switch (severity) {
      case 'low':
        bgColor = '#dbeafe';
        textColor = '#1e40af';
        break;
      case 'medium':
        bgColor = '#fef9c3';
        textColor = '#854d0e';
        break;
      case 'high':
        bgColor = '#ffedd5';
        textColor = '#9a3412';
        break;
      case 'critical':
        bgColor = '#fee2e2';
        textColor = '#b91c1c';
        break;
      default:
        bgColor = '#f3f4f6';
        textColor = '#374151';
    }
    
    return {
      fontSize: '12px',
      padding: '3px 8px',
      borderRadius: '6px',
      backgroundColor: bgColor,
      color: textColor,
      fontWeight: 500
    };
  };

  const getStatusBadgeStyle = (status: ForestFireData['status']) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'active':
        bgColor = '#fee2e2';
        textColor = '#b91c1c';
        break;
      case 'contained':
        bgColor = '#ffedd5';
        textColor = '#9a3412';
        break;
      case 'extinguished':
        bgColor = '#dcfce7';
        textColor = '#166534';
        break;
      default:
        bgColor = '#f3f4f6';
        textColor = '#374151';
    }
    
    return {
      fontSize: '12px',
      padding: '3px 8px',
      borderRadius: '6px',
      backgroundColor: bgColor,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      fontWeight: 500
    };
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4b5563',
    marginTop: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.4'
  };
  
  const getStatusIcon = (status: ForestFireData['status'], iconColor?: string) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '6px'
    };
    
    let style: React.CSSProperties;
    
    // 색상이 지정되면 그 색상 사용
    if (iconColor) {
      style = {
        ...baseStyle,
        backgroundColor: iconColor,
        animation: status === 'active' ? 'pulse 1.5s infinite' : 'none'
      };
    } else {
      // 기본 색상 사용
      switch (status) {
        case 'active':
          style = {
            ...baseStyle,
            backgroundColor: '#ef4444',
            animation: 'pulse 1.5s infinite'
          };
          break;
        case 'contained':
          style = {
            ...baseStyle,
            backgroundColor: '#f97316'
          };
          break;
        case 'extinguished':
          style = {
            ...baseStyle,
            backgroundColor: '#22c55e'
          };
          break;
        default:
          style = {
            ...baseStyle,
            backgroundColor: '#9ca3af'
          };
      }
    }
    
    return <span style={style}></span>;
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

  return (
    <div 
      style={containerStyle}
      onClick={handleClick}
    >
      <div style={contentStyle}>
        <div style={infoStyle}>
          <h3 style={titleStyle}>{fire.location}</h3>
          <div style={metaStyle}>
            <span style={{ marginRight: '4px' }}>{fire.date}</span>
            <span style={{ margin: '0 4px' }}>•</span>
            <span>{fire.affectedArea}ha</span>
          </div>
        </div>
        <div style={badgeContainerStyle}>
          {renderSeverityBadge(fire)}
          {renderStatusBadge(fire)}
        </div>
      </div>
      {fire.description && (
        <p style={descriptionStyle}>{fire.description}</p>
      )}
    </div>
  );
};