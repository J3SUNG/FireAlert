import React from 'react';

// 정적 지도 컴포넌트 - Leaflet 없이 단순 이미지 사용
const StaticMap = ({ items }) => {
  // 항목 데이터를 기반으로 표시
  const displayItems = items && items.length > 0 
    ? items.slice(0, Math.min(items.length, 5)) // 최대 5개 표시
    : [];
  
  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-[500px] border border-gray-300 rounded-md shadow-md relative overflow-hidden">
        {/* 한국 지도 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/South_Korea_location_map.svg/800px-South_Korea_location_map.svg.png")',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundColor: '#e8f4f8'
          }}
        ></div>
        
        {/* 도시 위치에 마커 배치 (절대 위치) */}
        {displayItems.map((item, index) => {
          // 완료 여부에 따른 색상 결정
          let color = '#999';
          if (item.issueName) {
            if (item.issueName.includes('3')) color = '#ff4d4d';
            else if (item.issueName.includes('2')) color = '#ffa500';
            else if (item.issueName.includes('1')) color = '#ffff66';
            else color = '#cce5ff';
          }
          
          if (item.status && item.status.includes('완료')) {
            color = '#4CAF50';
          }
          
          // 위치 좌표 (% 기준)
          const positions = [
            { left: '42%', top: '26%' }, // 서울
            { left: '30%', top: '38%' }, // 대전
            { left: '68%', top: '55%' }, // 울산
            { left: '58%', top: '65%' }, // 부산
            { left: '38%', top: '75%' }  // 전주
          ];
          
          const pos = positions[index % positions.length];
          
          return (
            <div 
              key={index}
              className="absolute w-10 h-10 flex items-center justify-center rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:z-20"
              style={{
                left: pos.left,
                top: pos.top,
                backgroundColor: color,
                color: 'white',
                fontWeight: 'bold',
                zIndex: 10,
                border: '2px solid white'
              }}
              title={`${item.location || '위치 정보 없음'} - ${item.percentage || 0}% - ${item.status || '정보 없음'}`}
            >
              {item.percentage || 0}%
            </div>
          );
        })}
      </div>
      
      {/* 범례 */}
      <div className="p-2 text-sm text-gray-600 bg-white border-t flex justify-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-1 border border-gray-300 rounded-sm"></div>
            <span>3단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 mr-1 border border-gray-300 rounded-sm"></div>
            <span>2단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-300 mr-1 border border-gray-300 rounded-sm"></div>
            <span>1단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-300 mr-1 border border-gray-300 rounded-sm"></div>
            <span>초기대응</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-1 border border-gray-300 rounded-sm"></div>
            <span>진화완료</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticMap;