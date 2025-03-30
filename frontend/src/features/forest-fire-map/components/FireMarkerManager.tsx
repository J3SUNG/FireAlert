import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ForestFireData } from '../../../shared/types/forestFire';
import { createFireMarker } from '../utils/markerUtils';

interface FireMarkerManagerProps {
  map: L.Map | null;
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  isGeoJsonLoaded: boolean;
}

/**
 * 산불 마커 관리 컴포넌트
 */
export const FireMarkerManager: FC<FireMarkerManagerProps> = ({
  map,
  fires,
  selectedFireId,
  onFireSelect,
  isGeoJsonLoaded
}) => {
  // 마커 참조
  const markersRef = useRef<Record<string, L.Marker>>({});
  
  // 마커 클릭 플래그
  const isMarkerClickRef = useRef(false);
  
  // 컴포넌트 언마운트 처리
  useEffect(() => {
    return () => {
      console.log('FireMarkerManager unmounting - cleaning up markers');
      // 언마운트시에만 실행되는 클린업 코드
      if (map) {
        Object.values(markersRef.current).forEach(marker => {
          marker.remove();
        });
        markersRef.current = {};
      }
    };
  }, [map]);
  
  // 마커 생성 및 관리 - 컴포넌트 초기화시 한번만 실행
  useEffect(() => {
    // 지도나 GeoJSON 레이어가 없으면 실행하지 않음
    if (!map || !isGeoJsonLoaded) return;
    
    // 지도 빈 영역 클릭 이벤트 추가 - 산불 선택 해제 기능
    map.on('click', () => {
      // 약간의 지연을 두어 마커 클릭이 먼저 처리되도록 함
      setTimeout(() => {
        // 마커 클릭이 아닌 경우에만 선택 해제 처리
        if (onFireSelect && selectedFireId && !isMarkerClickRef.current) {
          // 산불 선택 해제
          const currentFire = fires.find(f => f.id === selectedFireId);
          if (currentFire) {
            onFireSelect(currentFire); // 동일한 산불을 다시 클릭하는 경우 해제됨
          }
        }
        
        // 플래그 초기화
        isMarkerClickRef.current = false;
      }, 10); // 짧은 지연 추가
    });
    
    return () => {
      // 컴포넌트 언마운트 시 이벤트 제거
      map.off('click');
    };
  }, [map, isGeoJsonLoaded, onFireSelect, selectedFireId, fires]);
  
  // 마커 생성 효과 - fires가 변경될 때만 실행
  useEffect(() => {
    // 지도나 GeoJSON 레이어가 없으면 실행하지 않음
    if (!map || !isGeoJsonLoaded) return;

    console.log('Markers rendering - fires changed');
    
    // "산불외종료" 데이터 무시
    const validFires = fires.filter(fire => {
      if (typeof fire.description === 'string' && fire.description.includes('산불외종료')) {
        return false;
      }
      return true;
    });

    // 기존 마커 삭제 여부 확인용 집합 생성
    const currentFireIds = new Set(validFires.map(fire => fire.id));
    
    // 현재 fires에 없는 마커만 제거
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!currentFireIds.has(id)) {
        marker.remove();
        delete markersRef.current[id];
      }
    });

    // 새로운 혹은 변경된 마커만 추가
    validFires.forEach((fire) => {
      const existingMarker = markersRef.current[fire.id];
      
      // 이미 존재하는 마커는 건너뛰기
      if (existingMarker) return;
      
      try {
        const newMarker = createFireMarker(fire, {
          onClick: (selectedFire) => {
            if (onFireSelect) {
              // 마커 클릭 플래그 설정
              isMarkerClickRef.current = true;
              onFireSelect(selectedFire);
            }
          }
        }).addTo(map);
        
        // 참조에 마커 저장
        markersRef.current[fire.id] = newMarker;
      } catch (err) {
        console.error(`마커 생성 오류 (${fire.id}):`, err);
      }
    });
  }, [map, fires, onFireSelect, isGeoJsonLoaded]);
  
  // 선택된 산불로 지도 이동
  useEffect(() => {
    if (typeof selectedFireId !== "string" || !map || !isGeoJsonLoaded) return;
    
    try {
      // 선택된 마커가 존재하는지 확인
      if (!Object.prototype.hasOwnProperty.call(markersRef.current, selectedFireId)) {
        return;
      }
      
      const fire = fires.find((f) => f.id === selectedFireId);
      if (fire) {
        // 지도 이동
        map.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
      }
    } catch (error) {
      console.error("선택된 마커 처리 중 오류 발생:", error);
    }
  }, [selectedFireId, fires, map, isGeoJsonLoaded]);
  
  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};