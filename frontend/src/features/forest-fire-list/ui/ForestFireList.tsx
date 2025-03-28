import { FC, useState } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';
import { ForestFireItem } from './ForestFireItem';
import './forest-fire-list.css';

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

  // 버튼 클래스 계산 함수
  const getButtonClass = (buttonFilter: 'all' | 'active' | 'contained' | 'extinguished') => {
    let className = 'forest-fire-list__button';
    
    if (buttonFilter === filter) {
      className += ` forest-fire-list__button--${buttonFilter}-active`;
    }
    
    return className;
  };

  // 컨텐츠 클래스 계산
  const getContentClass = () => {
    let className = 'forest-fire-list__content';
    
    if (showFilter) {
      className += ' forest-fire-list__content--with-filter';
    } else {
      className += ' forest-fire-list__content--without-filter';
    }
    
    return className;
  };

  return (
    <div className="forest-fire-list">
      {showFilter && (
        <div className="forest-fire-list__filter-container">
          <div className="forest-fire-list__button-group">
            <button 
              className={getButtonClass('all')}
              onClick={() => setFilter('all')}
            >
              전체
            </button>
            <button 
              className={getButtonClass('active')}
              onClick={() => setFilter('active')}
            >
              진행중
            </button>
            <button 
              className={getButtonClass('contained')}
              onClick={() => setFilter('contained')}
            >
              통제중
            </button>
            <button 
              className={getButtonClass('extinguished')}
              onClick={() => setFilter('extinguished')}
            >
              진화완료
            </button>
          </div>
        </div>
      )}
      
      <div className={getContentClass()}>
        {filteredFires.length > 0 ? (
          <div className="forest-fire-list__items">
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
          <div className="forest-fire-list__empty-message">
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