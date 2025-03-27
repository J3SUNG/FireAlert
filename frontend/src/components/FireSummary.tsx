import React from 'react';

interface FireItem {
  index: string;
  location: string;
  sigungu: string;
  percentage: string;
  date: string;
  issueName: string;
  status: string;
}

interface FireSummaryProps {
  items: FireItem[];
}

const FireSummary: React.FC<FireSummaryProps> = ({ items }) => {
  if (!items || !items.length) {
    return <div className="text-center py-2">데이터가 없습니다.</div>;
  }

  // 요약 데이터 계산
  const totalFires = items.length;
  const activeFires = items.filter(item => 
    item.status && (
      item.status.includes('진화중') || 
      item.status.includes('진행') || 
      item.status.includes('대응')
    )
  ).length;
  const completedFires = items.filter(item => 
    item.status && item.status.includes('완료')
  ).length;

  // 심각도별 분류
  const level3Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('3') || item.issueName.includes('세'))
  ).length;
  const level2Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('2') || item.issueName.includes('이'))
  ).length;
  const level1Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('1') || item.issueName.includes('일'))
  ).length;

  // 최근 발생한 산불 (가장 최근 3개)
  const recentFires = [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 전체 현황 요약 */}
      <div className="bg-white rounded-md shadow-sm p-3">
        <h2 className="text-base font-semibold mb-2">🔍 현재 산불 현황</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-lg font-bold">{totalFires}</div>
            <div className="text-xs text-gray-600">전체</div>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <div className="text-lg font-bold text-orange-600">{activeFires}</div>
            <div className="text-xs text-gray-600">진행 중</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-lg font-bold text-green-600">{completedFires}</div>
            <div className="text-xs text-gray-600">진화 완료</div>
          </div>
        </div>
      </div>

      {/* 위험도 분류 */}
      <div className="bg-white rounded-md shadow-sm p-3">
        <h2 className="text-base font-semibold mb-2">⚠️ 위험도 분류</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 p-2 rounded">
            <div className="text-lg font-bold text-red-600">{level3Fires}</div>
            <div className="text-xs text-gray-600">3단계 (고위험)</div>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <div className="text-lg font-bold text-amber-600">{level2Fires}</div>
            <div className="text-xs text-gray-600">2단계 (중위험)</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded">
            <div className="text-lg font-bold text-yellow-600">{level1Fires}</div>
            <div className="text-xs text-gray-600">1단계 (주의)</div>
          </div>
        </div>
      </div>

      {/* 최근 발생 */}
      <div className="bg-white rounded-md shadow-sm p-3">
        <h2 className="text-base font-semibold mb-2">🆕 최근 발생 지역</h2>
        <ul className="space-y-1">
          {recentFires.map((fire, index) => (
            <li key={index} className="text-sm border-b pb-1">
              <div className="font-medium truncate">{fire.location}</div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  {`${fire.date.slice(0, 4)}-${fire.date.slice(4, 6)}-${fire.date.slice(6, 8)}`}
                </span>
                <span className={`${fire.status && fire.status.includes('완료') ? 'text-green-600' : 'text-orange-600'}`}>
                  {fire.status || '상태 정보 없음'}
                </span>
              </div>
            </li>
          ))}
          {recentFires.length === 0 && (
            <li className="text-center text-gray-500 py-2">
              최근 발생 데이터가 없습니다.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FireSummary;
