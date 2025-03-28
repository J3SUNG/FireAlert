import { FC } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';

interface ForestFireItemProps {
  fire: ForestFireData;
  onSelect?: (fire: ForestFireData) => void;
  isSelected?: boolean;
}

export const ForestFireItem: FC<ForestFireItemProps> = ({ fire, onSelect, isSelected }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(fire);
    }
  };

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid',
    borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
    borderRadius: '8px',
    backgroundColor: isSelected ? '#eff6ff' : 'white',
    cursor: 'pointer',
    boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    transition: 'all 0.2s ease'
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
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    marginBottom: '4px'
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280'
  };

  const badgeContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    marginLeft: '8px'
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
      padding: '2px 8px',
      borderRadius: '9999px',
      backgroundColor: bgColor,
      color: textColor
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
      padding: '2px 8px',
      borderRadius: '9999px',
      backgroundColor: bgColor,
      color: textColor,
      display: 'flex',
      alignItems: 'center'
    };
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4b5563',
    marginTop: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical'
  };
  
  const getStatusIcon = (status: ForestFireData['status']) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '4px'
    };
    
    let style: React.CSSProperties;
    
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
    
    return <span style={style}></span>;
  };
  
  const getSeverityLabel = (severity: ForestFireData['severity']) => {
    switch (severity) {
      case 'low': return '낮음';
      case 'medium': return '중간';
      case 'high': return '높음';
      case 'critical': return '심각';
      default: return '알 수 없음';
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
          <span style={getSeverityBadgeStyle(fire.severity)}>
            {getSeverityLabel(fire.severity)}
          </span>
          <span style={getStatusBadgeStyle(fire.status)}>
            {getStatusIcon(fire.status)}
            {getStatusLabel(fire.status)}
          </span>
        </div>
      </div>
      {fire.description && (
        <p style={descriptionStyle}>{fire.description}</p>
      )}
    </div>
  );
};