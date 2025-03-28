import { FC, useState } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';
import { ForestFireItem } from './ForestFireItem';

interface ForestFireListProps {
  fires: ForestFireData[];
  onFireSelect?: (fire: ForestFireData) => void;
  selectedFireId?: string;
  showFilter?: boolean;
}

export const ForestFireList: FC<ForestFireListProps> = ({ 
  fires, 
  onFireSelect,
  selectedFireId,
  showFilter = true
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'contained' | 'extinguished'>('all');
  
  const filteredFires = fires.filter(fire => {
    if (filter === 'all') return true;
    return fire.status === filter;
  });

  const containerStyle: React.CSSProperties = {
    height: '100%'
  };
  
  const filterContainerStyle: React.CSSProperties = {
    padding: '16px 16px 8px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };
  
  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px'
  };
  
  const buttonBaseStyle: React.CSSProperties = {
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    whiteSpace: 'nowrap'
  };
  
  const getButtonStyle = (buttonFilter: 'all' | 'active' | 'contained' | 'extinguished') => {
    let bgColor, textColor;
    
    if (buttonFilter === filter) {
      switch (buttonFilter) {
        case 'all': 
          bgColor = '#3b82f6'; 
          textColor = 'white';
          break;
        case 'active': 
          bgColor = '#ef4444'; 
          textColor = 'white';
          break;
        case 'contained': 
          bgColor = '#f97316'; 
          textColor = 'white';
          break;
        case 'extinguished': 
          bgColor = '#22c55e'; 
          textColor = 'white';
          break;
      }
    } else {
      bgColor = '#e5e7eb';
      textColor = '#4b5563';
    }
    
    return {
      ...buttonBaseStyle,
      backgroundColor: bgColor,
      color: textColor
    };
  };
  
  const listContainerStyle: React.CSSProperties = {
    padding: '8px',
    overflowY: 'auto',
    height: showFilter ? 'calc(100% - 50px)' : '100%'
  };
  
  const fireListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };
  
  const emptyMessageStyle: React.CSSProperties = {
    padding: '16px',
    textAlign: 'center',
    color: '#6b7280'
  };

  return (
    <div style={containerStyle}>
      {showFilter && (
        <div style={filterContainerStyle}>
          <div style={buttonGroupStyle}>
            <button 
              style={getButtonStyle('all')}
              onClick={() => setFilter('all')}
            >
              전체
            </button>
            <button 
              style={getButtonStyle('active')}
              onClick={() => setFilter('active')}
            >
              진행중
            </button>
            <button 
              style={getButtonStyle('contained')}
              onClick={() => setFilter('contained')}
            >
              통제중
            </button>
            <button 
              style={getButtonStyle('extinguished')}
              onClick={() => setFilter('extinguished')}
            >
              진화완료
            </button>
          </div>
        </div>
      )}
      
      <div style={listContainerStyle}>
        {filteredFires.length > 0 ? (
          <div style={fireListStyle}>
            {filteredFires.map(fire => (
              <ForestFireItem 
                key={fire.id} 
                fire={fire} 
                onSelect={onFireSelect}
                isSelected={selectedFireId === fire.id}
              />
            ))}
          </div>
        ) : (
          <div style={emptyMessageStyle}>
            {filter === 'all' 
              ? '산불 데이터가 없습니다.'
              : `${filter === 'active' ? '진행중인' : filter === 'contained' ? '통제중인' : '진화완료된'} 산불이 없습니다.`
            }
          </div>
        )}
      </div>
    </div>
  );
};