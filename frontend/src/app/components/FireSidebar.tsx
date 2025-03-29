import React from 'react';
import { ForestFireData } from '../../shared/types/forestFire';
import { ForestFireList } from '../../features/forest-fire-list/ui/ForestFireList';

interface FireSidebarProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect: (fire: ForestFireData) => void;
  filterName: string;
  count: number;
}

/**
 * 산불 정보 사이드바 컴포넌트 (SRP)
 */
export const FireSidebar: React.FC<FireSidebarProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
  filterName,
  count
}) => {
  return (
    <div className="fire-alert__sidebar">
      <div className="fire-alert__sidebar-header">
        <h2 className="fire-alert__sidebar-title">산불 데이터 현황</h2>
        <p className="fire-alert__sidebar-subtitle">
          {filterName === 'all'
            ? `현재 ${count}건의 산불 정보가 표시되고 있습니다.`
            : `현재 ${filterName} 산불 ${count}건이 표시되고 있습니다.`}
        </p>
      </div>

      <div className="fire-alert__sidebar-content">
        <ForestFireList
          fires={fires}
          showFilter={false}
          selectedFireId={selectedFireId}
          onFireSelect={onFireSelect}
        />
      </div>
    </div>
  );
};