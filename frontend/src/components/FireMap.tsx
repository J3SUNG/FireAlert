import { useEffect, useRef, useState } from "react";
import { drawEnhancedMap } from "../enhancedMap";
import "leaflet/dist/leaflet.css";

interface FireMapProps {
  items: any[];
}

const FireMap: React.FC<FireMapProps> = ({ items }) => {
  const mapInitializedRef = useRef(false);
  const [mapHeight, setMapHeight] = useState('600px');

  // 화면 크기에 맞게 지도 높이 계산
  useEffect(() => {
    const updateMapHeight = () => {
      // 전체 화면 높이에서 헤더와 요약 영역 높이를 뺀 값으로 설정
      const windowHeight = window.innerHeight;
      const headerHeight = 70; // 대략적인 헤더 높이
      const summaryHeight = 180; // 대략적인 요약 컴포넌트 높이
      const footerHeight = 40; // 범례 영역 높이
      const availableHeight = windowHeight - headerHeight - summaryHeight - footerHeight;
      setMapHeight(`${Math.max(400, availableHeight)}px`);
    };
    
    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    
    return () => {
      window.removeEventListener('resize', updateMapHeight);
    };
  }, []);

  // 지도 초기화 및 데이터 로드
  useEffect(() => {
    console.log("FireMap 컴포넌트 렌더링. 데이터 개수:", items.length);

    // 아직 맵이 초기화되지 않았고, 데이터가 있는 경우만 지도 그리기
    if (items.length > 0 && !mapInitializedRef.current) {
      // DOM이 완전히 렌더링된 후에 지도 초기화하기 위해 약간의 지연 추가
      const timeoutId = setTimeout(() => {
        try {
          console.log("지도 초기화 시작...");
          drawEnhancedMap("map", items);
          mapInitializedRef.current = true;
        } catch (error) {
          console.error("지도 그리기 오류:", error);
        }
      }, 500);

      // cleanup 함수에서 타이머 제거
      return () => clearTimeout(timeoutId);
    }

    // 컴포넌트 언마운트 시 클린업
    return () => {
      console.log("지도 컴포넌트 언마운트");
    };
  }, [items]);

  return (
    <div className="flex flex-col h-full">
      <div
        id="map"
        data-testid="map-container"
        className="w-full border flex-1"
        style={{
          position: "relative",
          height: mapHeight,
          width: "100%",
          backgroundColor: "#fafafa",
          border: "1px solid #ddd"
        }}
      />
      <div className="p-2 text-sm text-gray-600 bg-white border-t flex justify-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#ff4d4d] mr-1 border border-gray-400"></div>
            <span>3단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#ffa500] mr-1 border border-gray-400"></div>
            <span>2단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#ffff66] mr-1 border border-gray-400"></div>
            <span>1단계</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#cce5ff] mr-1 border border-gray-400"></div>
            <span>초기대응</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#4CAF50] mr-1 border border-gray-400"></div>
            <span>진화완료</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireMap;
