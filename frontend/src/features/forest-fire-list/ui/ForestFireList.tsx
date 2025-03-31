import { FC } from 'react';
import { ForestFireItem } from './ForestFireItem';
import { ForestFireListProps } from '../model/types';
import './forest-fire-list.css';

export const ForestFireList: FC<ForestFireListProps> = ({ 
  fires, 
  onFireSelect,
  selectedFireId,
  showFilter = true,
  filter = 'all',
  onFilterChange
}) => {
  const getButtonClass = (buttonFilter: 'all' | 'active' | 'contained' | 'extinguished') => {
    // 기본 클래스만 반환하고 fire-button으로 스타일을 적용
    // fire-button 요소가 fire-button--active-all 등의 클래스를 이미 받기 때문에
    // 추가 클래스는 필요 없음
    return '';
  };

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
              className={filter === 'all' ? 'fire-button fire-button--small fire-button--active-all' : 'fire-button fire-button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('all'); }}
            >
              전체
            </button>
            <button 
              className={filter === 'active' ? 'fire-button fire-button--small fire-button--active-red' : 'fire-button fire-button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('active'); }}
            >
              진행중
            </button>
            <button 
              className={filter === 'contained' ? 'fire-button fire-button--small fire-button--active-orange' : 'fire-button fire-button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('contained'); }}
            >
              통제중
            </button>
            <button 
              className={filter === 'extinguished' ? 'fire-button fire-button--small fire-button--active-green' : 'fire-button fire-button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('extinguished'); }}
            >
              진화완료
            </button>
          </div>
        </div>
      )}
      
      <div className={getContentClass()}>
        {fires.length > 0 ? (
          <div className="forest-fire-list__items">
            {fires.map(fire => (
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