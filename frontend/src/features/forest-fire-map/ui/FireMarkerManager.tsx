import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import { createFireMarker } from '../utils/markerUtils';
import { FireMarkerManagerProps } from '../model/types';

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
  const markersRef = useRef<Record<string, L.LayerGroup>>({});
  
  // 마커 클릭 플래그
  const isMarkerClickRef = useRef(false);
  
  // 컴포넌트 언마운트 처리
  useEffect(() => {
    return () => {
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

    // 마커 생성 및 업데이트
    validFires.forEach((fire) => {
      try {
        // 이미 존재하는 마커 처리
        const existingMarker = markersRef.current[fire.id];
        if (existingMarker) {
          // 이미 선택된 마커인 경우 무시 (다른 useEffect에서 처리)
          if (fire.id === selectedFireId) {
            return;
          }
          
          // 선택되지 않은 기존 마커는 그대로 유지
          return;
        }
        
        // 선택된 마커인지 확인
        const isSelected = fire.id === selectedFireId;
        
        // 새 마커 생성
        const newMarker = createFireMarker(fire, {
          isSelected,
          onClick: (selectedFire) => {
            if (onFireSelect) {
              // 마커 클릭 플래그 설정
              isMarkerClickRef.current = true;
              onFireSelect(selectedFire);
            }
          },
          map: map // 지도 객체 전달
        });
        
        // 지도에 레이어 그룹 추가
        newMarker.addTo(map);
        
        // 참조에 마커 저장
        markersRef.current[fire.id] = newMarker;
      } catch (error) {
        console.error(`Error creating marker for fire ID ${fire.id}:`, error);
      }
    });
  }, [map, fires, onFireSelect, isGeoJsonLoaded]);
  
  // 선택된 산불로 지도 이동 및 마커 업데이트
  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;
    
    try {
      // 선택된 마커 처리
      if (typeof selectedFireId === "string") {
        const fire = fires.find((f) => f.id === selectedFireId);
        
        if (fire) {
          const oldMarker = markersRef.current[selectedFireId];
          if (oldMarker) {
            // 기존 마커 제거 후 새로 만들기
            map.removeLayer(oldMarker);
          }
          
          // 선택된 마커는 isSelected를 true로 설정하여 크기 키움
          const newMarker = createFireMarker(fire, {
            isSelected: true,
            onClick: (selectedFire) => {
              if (onFireSelect) {
                isMarkerClickRef.current = true;
                onFireSelect(selectedFire);
              }
            },
            map: map // 지도 객체 전달
          });
          
          // 지도에 레이어 그룹 추가
          newMarker.addTo(map);
          
          // 마커 참조 갱신
          markersRef.current[selectedFireId] = newMarker;
          
          // 지도 이동
          map.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
        }
      }
    } catch (error) {
      console.error("Error updating selected marker:", error);
    }
  }, [selectedFireId, fires, map, isGeoJsonLoaded, onFireSelect]);
  
  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};