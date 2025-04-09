import { useRef, useCallback } from 'react';
import L from 'leaflet';
// ForestFireData 타입은 사용되지 않음

/**
 * 마커 상태 관리 훅
 * 마커의 생성, 업데이트, 삭제 등 상태 관리 로직을 중앙화
 */
export function useMarkerState() {
  // 마커 레이어 참조 저장
  const markersRef = useRef<Record<string, L.LayerGroup>>({});
  // 마커 클릭 플래그 (지도 클릭 이벤트와 구분하기 위함)
  const isMarkerClickRef = useRef(false);

  // 마커 저장 함수
  const setMarker = useCallback((id: string, marker: L.LayerGroup) => {
    markersRef.current[id] = marker;
  }, []);

  // 마커 조회 함수
  const getMarker = useCallback((id: string) => {
    return markersRef.current[id];
  }, []);

  // 마커 삭제 함수
  const removeMarker = useCallback((id: string, map: L.Map | null) => {
    const marker = markersRef.current[id];
    if (marker && map) {
      // 이벤트 리스너 제거
      if ('off' in marker) {
        marker.off();
      }
      // 레이어그룹의 경우 각 레이어도 이벤트 제거
      if ('eachLayer' in marker) {
        marker.eachLayer((layer) => {
          if ('off' in layer) {
            layer.off();
          }
        });
      }
      map.removeLayer(marker);
      delete markersRef.current[id];
      return true;
    }
    return false;
  }, []);

  // 모든 마커 삭제 함수
  const clearAllMarkers = useCallback((map: L.Map | null) => {
    if (!map) return;
    
    Object.values(markersRef.current).forEach(marker => {
      if (map.hasLayer(marker)) {
        // 우선 이벤트 리스너 제거
        if ('off' in marker) {
          marker.off();
        }
        // 레이어그룹의 경우 각 레이어도 이벤트 제거
        if ('eachLayer' in marker) {
          marker.eachLayer((layer) => {
            if ('off' in layer) {
              layer.off();
            }
          });
        }
        // 마커 제거
        marker.remove();
      }
    });
    markersRef.current = {};
  }, []);

  // 선택되지 않은 마커 필터링 함수
  const removeStaleMarkers = useCallback((currentIds: Set<string>, map: L.Map | null) => {
    if (!map) return;
    
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!currentIds.has(id)) {
        // 이벤트 리스너 제거
        if ('off' in marker) {
          marker.off();
        }
        // 레이어그룹의 경우 각 레이어도 이벤트 제거
        if ('eachLayer' in marker) {
          marker.eachLayer((layer) => {
            if ('off' in layer) {
              layer.off();
            }
          });
        }
        map.removeLayer(marker);
        delete markersRef.current[id];
      }
    });
  }, []);

  // 마커 클릭 플래그 설정 함수
  const setMarkerClicked = useCallback((clicked: boolean) => {
    isMarkerClickRef.current = clicked;
  }, []);

  // 마커 클릭 여부 확인 함수
  const isMarkerClicked = useCallback(() => {
    return isMarkerClickRef.current;
  }, []);

  return {
    // 마커 상태 관리
    markers: markersRef.current,
    setMarker,
    getMarker,
    removeMarker,
    clearAllMarkers,
    removeStaleMarkers,
    
    // 클릭 상태 관리
    setMarkerClicked,
    isMarkerClicked
  };
}