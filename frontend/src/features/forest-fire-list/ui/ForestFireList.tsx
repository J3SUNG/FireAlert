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

  /**
   * 컨텐츠 영역의 CSS 클래스명 계산
   * 필터 표시 여부에 따라 적절한 클래스를 반환합니다.
   * 
   * @returns {string} CSS 클래스명
   */
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
              className={filter === 'all' ? 'fire-alert__button fire-alert__button--small fire-alert__button--active-all' : 'fire-alert__button fire-alert__button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('all'); }}
            >
              전체
            </button>
            <button 
              className={filter === 'active' ? 'fire-alert__button fire-alert__button--small fire-alert__button--active-red' : 'fire-alert__button fire-alert__button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('active'); }}
            >
              진행중
            </button>
            <button 
              className={filter === 'contained' ? 'fire-alert__button fire-alert__button--small fire-alert__button--active-orange' : 'fire-alert__button fire-alert__button--small'}
              onClick={() => { if (onFilterChange) onFilterChange('contained'); }}
            >
              통제중
            </button>
            <button 
              className={filter === 'extinguished' ? 'fire-alert__button fire-alert__button--small fire-alert__button--active-green' : 'fire-alert__button fire-alert__button--small'}
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
              ? '현재 진행 중인 산불이 없습니다.'
              : `현재 ${filter === 'active' ? '진화중인' : filter === 'contained' ? '통제중인' : '진화완료된'} 산불이 없습니다.`
            }
          </div>
        )}
      </div>
    </div>
  );
};