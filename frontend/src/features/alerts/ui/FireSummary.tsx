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

// 날짜 형식을 YYYY-MM-DD로 변환하는 헬퍼 함수
const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return '-';
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
};

// 현재 상태에 따라 색상 클래스 반환
const getStatusColorClass = (status: string): string => {
  if (!status) return 'text-gray-500';
  
  if (status.includes('완료')) {
    return 'text-green-600 font-medium';
  } else if (status.includes('진화중')) {
    return 'text-orange-600 font-medium';
  } else {
    return 'text-gray-600';
  }
};

const FireSummary: React.FC<FireSummaryProps> = ({ items }) => {
  if (!items || !items.length) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-500">산불 데이터가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-1">현재 활성화된 산불이 없습니다.</p>
      </div>
    );
  }

  // 요약 데이터 계산 (더 정확한 필터링 로직 적용)
  const totalFires = items.length;
  const activeFires = items.filter(item => 
    item.status && (
      item.status.includes('진화중') || 
      item.status.includes('진행') || 
      item.status.includes('대응') ||
      !item.status.includes('완료')
    )
  ).length;
  const completedFires = items.filter(item => 
    item.status && item.status.includes('완료')
  ).length;

  // 심각도별 분류 (테스트 버전 발전)
  const level3Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('3') || item.issueName.includes('세'))
  ).length;
  const level2Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('2') || item.issueName.includes('이'))
  ).length;
  const level1Fires = items.filter(item => 
    item.issueName && (item.issueName.includes('1') || item.issueName.includes('일'))
  ).length;
  const initialFires = items.filter(item =>
    item.issueName && (item.issueName.includes('초기') || !item.issueName.match(/[123일이세]/))
  ).length;

  // 진행률 평균 계산
  const averagePercentage = Math.round(
    items.reduce((sum, item) => sum + (parseInt(item.percentage) || 0), 0) / (items.length || 1)
  );

  // 최근 발생한 산불 (가장 최근 3개)
  const recentFires = [...items]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* 전체 현황 요약 */}
      <div className="bg-white rounded-md shadow-sm p-3 hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <span className="inline-block w-5 h-5 mr-1 bg-red-500 rounded-full flex items-center justify-center text-white">
            🔥
          </span>
          현재 산불 현황
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded border border-gray-100">
            <div className="text-lg font-bold">{totalFires}</div>
            <div className="text-xs text-gray-600">전체</div>
          </div>
          <div className="bg-orange-50 p-2 rounded border border-orange-100">
            <div className="text-lg font-bold text-orange-600">{activeFires}</div>
            <div className="text-xs text-gray-600">진행 중</div>
          </div>
          <div className="bg-green-50 p-2 rounded border border-green-100">
            <div className="text-lg font-bold text-green-600">{completedFires}</div>
            <div className="text-xs text-gray-600">진화 완료</div>
          </div>
        </div>

        {/* 진행률 정보 추가 */}
        <div className="mt-2 bg-blue-50 p-2 rounded flex items-center justify-center border border-blue-100">
          <div className="text-center">
            <div className="text-xs text-gray-600">평균 진행률</div>
            <div className="text-lg font-bold text-blue-600">{averagePercentage}%</div>
          </div>
        </div>
      </div>

      {/* 위험도 분류 */}
      <div className="bg-white rounded-md shadow-sm p-3 hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <span className="inline-block w-5 h-5 mr-1 bg-yellow-500 rounded-full flex items-center justify-center text-white">
            ⚠️
          </span>
          위험도 분류
        </h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-red-50 p-2 rounded border border-red-100">
            <div className="text-lg font-bold text-red-600">{level3Fires}</div>
            <div className="text-xs text-gray-600">3단계</div>
          </div>
          <div className="bg-amber-50 p-2 rounded border border-amber-100">
            <div className="text-lg font-bold text-amber-600">{level2Fires}</div>
            <div className="text-xs text-gray-600">2단계</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
            <div className="text-lg font-bold text-yellow-600">{level1Fires}</div>
            <div className="text-xs text-gray-600">1단계</div>
          </div>
          <div className="bg-blue-50 p-2 rounded border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{initialFires}</div>
            <div className="text-xs text-gray-600">초기</div>
          </div>
        </div>

        {/* 비율 채널 그래프 추가 */}
        <div className="mt-2 h-3 bg-gray-200 rounded overflow-hidden flex">
          {level3Fires > 0 && (
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${(level3Fires / totalFires) * 100}%` }}
              title={`3단계: ${level3Fires}개 (${Math.round((level3Fires / totalFires) * 100)}%)`}
            />
          )}
          {level2Fires > 0 && (
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${(level2Fires / totalFires) * 100}%` }}
              title={`2단계: ${level2Fires}개 (${Math.round((level2Fires / totalFires) * 100)}%)`}
            />
          )}
          {level1Fires > 0 && (
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(level1Fires / totalFires) * 100}%` }}
              title={`1단계: ${level1Fires}개 (${Math.round((level1Fires / totalFires) * 100)}%)`}
            />
          )}
          {initialFires > 0 && (
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${(initialFires / totalFires) * 100}%` }}
              title={`초기대응: ${initialFires}개 (${Math.round((initialFires / totalFires) * 100)}%)`}
            />
          )}
        </div>
      </div>

      {/* 최근 발생 */}
      <div className="bg-white rounded-md shadow-sm p-3 hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold mb-2 flex items-center">
          <span className="inline-block w-5 h-5 mr-1 bg-blue-500 rounded-full flex items-center justify-center text-white">
            📈
          </span>
          최근 발생 지역
        </h2>
        <ul className="space-y-2">
          {recentFires.map((fire, index) => (
            <li key={index} className="text-sm border-b pb-2 last:border-0">
              <div className="font-medium truncate">{fire.location}</div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {formatDate(fire.date)}
                </span>
                <span className={getStatusColorClass(fire.status)}>
                  {fire.status || '상태 정보 없음'}
                </span>
              </div>
              <div className="mt-1 flex items-center text-xs">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{
                      width: `${parseInt(fire.percentage) || 0}%`,
                      backgroundColor: fire.status && fire.status.includes('완료') ? '#22c55e' : '#f97316'
                    }}
                  />
                </div>
                <span className="ml-1 text-gray-600 min-w-[32px] text-right">{fire.percentage}%</span>
              </div>
            </li>
          ))}
          {recentFires.length === 0 && (
            <li className="text-center text-gray-500 py-6 flex flex-col items-center justify-center">
              <span className="block text-4xl mb-2">📝</span>
              최근 발생 데이터가 없습니다.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FireSummary;
