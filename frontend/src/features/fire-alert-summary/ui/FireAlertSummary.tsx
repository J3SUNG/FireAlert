import React from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';

interface FireAlertSummaryProps {
  fires: ForestFireData[];
}

export const FireAlertSummary: React.FC<FireAlertSummaryProps> = ({ fires }) => {
  // 상태별 산불 개수 계산
  const getStatusCounts = () => {
    const counts = {
      active: 0,
      contained: 0,
      extinguished: 0,
      total: fires.length
    };
    
    fires.forEach(fire => {
      if (fire.status === 'active') counts.active++;
      else if (fire.status === 'contained') counts.contained++;
      else if (fire.status === 'extinguished') counts.extinguished++;
    });
    
    return counts;
  };

  // 심각도별 산불 개수 계산
  const getSeverityCounts = () => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    fires.forEach(fire => {
      counts[fire.severity]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const severityCounts = getSeverityCounts();
  const currentDate = new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="bg-white px-4 py-3 border-b">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">전국 산불 현황</h2>
        <div className="text-sm text-gray-500">{currentDate} 기준</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-600 mb-2">상태별 현황</h3>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-red-600 font-bold">{statusCounts.active}</div>
              <div className="text-xs text-gray-500">진행중</div>
            </div>
            <div className="text-center">
              <div className="text-orange-500 font-bold">{statusCounts.contained}</div>
              <div className="text-xs text-gray-500">통제중</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-bold">{statusCounts.extinguished}</div>
              <div className="text-xs text-gray-500">진화완료</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-bold">{statusCounts.total}</div>
              <div className="text-xs text-gray-500">전체</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-600 mb-2">심각도별 현황</h3>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-red-600 font-bold">{severityCounts.critical}</div>
              <div className="text-xs text-gray-500">심각</div>
            </div>
            <div className="text-center">
              <div className="text-orange-500 font-bold">{severityCounts.high}</div>
              <div className="text-xs text-gray-500">높음</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 font-bold">{severityCounts.medium}</div>
              <div className="text-xs text-gray-500">중간</div>
            </div>
            <div className="text-center">
              <div className="text-blue-500 font-bold">{severityCounts.low}</div>
              <div className="text-xs text-gray-500">낮음</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 italic">
        최근 갱신: {new Date().toLocaleTimeString('ko-KR')}
      </div>
    </div>
  );
};
