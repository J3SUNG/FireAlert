import React, { useState } from 'react';
import useAlerts from '../../alerts/hooks/useAlerts';
import FireList from '../../alerts/ui/FireList';
// import SimpleGeoJsonMap from '../../map/ui/SimpleGeoJsonMap';
import SimpleMapTest from '../../map/ui/SimpleMapTest';

// 단일 책임 원칙(SRP): 이 컴포넌트는 메인 대시보드 UI 표시에만 책임을 가짐
const MainDashboard: React.FC = () => {
  const { alerts, loading, error } = useAlerts();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 필터링된 데이터 계산
  const filteredAlerts = React.useMemo(() => {
    if (filterStatus === 'all') {
      return alerts;
    } else if (filterStatus === 'active') {
      return alerts.filter(item => 
        item.status && (
          item.status.includes('진화중') || 
          item.status.includes('진행') || 
          item.status.includes('대응')
        )
      );
    } else if (filterStatus === 'completed') {
      return alerts.filter(item => 
        item.status && item.status.includes('완료')
      );
    }
    return alerts;
  }, [alerts, filterStatus]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">🔥 산불 데이터 현황</h1>
          <div className="text-sm text-gray-500">최종 업데이트: {new Date().toLocaleString('ko-KR')}</div>
        </div>
      </header>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="p-4 text-center">
            <div role="status">
              <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-gray-600">산불 데이터를 불러오는 중입니다...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg max-w-md mx-auto">
            <p className="text-lg font-semibold">데이터를 불러오지 못했습니다</p>
            <p className="mt-2 text-sm">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row p-3 gap-4">
          {/* 좌측: 산불 데이터 목록 (20%) */}
          <div className="w-full md:w-1/5">
            {/* 데이터 필터링 컨트롤 */}
            <div className="mb-4 flex md:flex-col items-center bg-white p-3 rounded shadow-sm">
              <span className="mr-3 md:mr-0 md:mb-2 text-sm font-medium text-gray-700">필터:</span>
              <div className="flex md:flex-col md:w-full space-x-2 md:space-x-0 md:space-y-2">
                <button 
                  className={`px-3 py-1 md:w-full text-sm rounded ${filterStatus === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilterStatus('all')}
                >
                  전체보기
                </button>
                <button 
                  className={`px-3 py-1 md:w-full text-sm rounded ${filterStatus === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilterStatus('active')}
                >
                  진행중
                </button>
                <button 
                  className={`px-3 py-1 md:w-full text-sm rounded ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setFilterStatus('completed')}
                >
                  완료
                </button>
              </div>
              <div className="ml-auto md:ml-0 md:mt-2 text-sm text-gray-500">
                총 {filteredAlerts.length}건
              </div>
            </div>

            {/* 산불 데이터 목록 */}
            <div className="bg-white rounded shadow-sm overflow-auto max-h-[calc(100vh-220px)]">
              <div className="p-2">
                <FireList items={filteredAlerts} />
              </div>
            </div>
          </div>

          {/* 우측: 지도 영역 (80%) */}
          <div className="w-full md:w-4/5 bg-white rounded shadow-sm overflow-hidden">
            <SimpleMapTest />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;