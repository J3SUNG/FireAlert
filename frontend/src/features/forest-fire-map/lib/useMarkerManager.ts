import { useEffect, useCallback } from "react";
import L from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";
import { useMarkerState } from "./useMarkerState";
import { useMarkerCreation } from "./useMarkerCreation";

interface UseMarkerManagerProps {
  map: L.Map | null;
  fires: ForestFireData[];
  selectedFireId: string | undefined | null;
  onFireSelect?: (fire: ForestFireData) => void;
  isGeoJsonLoaded: boolean;
}

/**
 * 통합 마커 관리 훅 - 마커 상태, 생성, 업데이트 로직을 조합
 */
export function useMarkerManager({
  map,
  fires,
  selectedFireId,
  onFireSelect,
  isGeoJsonLoaded,
}: UseMarkerManagerProps) {
  // 마커 상태 관리 훅
  const {
    markers,
    setMarker,
    getMarker,
    removeMarker,
    clearAllMarkers,
    removeStaleMarkers,
    setMarkerClicked,
    isMarkerClicked,
  } = useMarkerState();

  // 마커 생성 훅
  const { createMarker, filterValidFires } = useMarkerCreation({
    onFireSelect,
    setMarkerClicked,
  });

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    // 마커가 있는 경우에만 마커 정리
    const hasMarkers = Object.keys(markers).length > 0;
    
    return () => {
      // 마운트 해제 시 모든 마커 제거 및 이벤트 리스너 및 메모리 제거
      if (hasMarkers) {
        clearAllMarkers(map);
      }
    };
  }, [map, clearAllMarkers, markers]);

  // 빈 영역 클릭 이벤트 처리 - 선택 마커 해제
  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    const handleMapClick = () => {
      // 약간의 지연을 두어 마커 클릭이 먼저 처리되도록 함
      setTimeout(() => {
        // 마커 클릭이 아닌 경우에만 선택 해제 처리
        if (onFireSelect && selectedFireId && !isMarkerClicked()) {
          // 선택된 산불 찾기
          const currentFire = fires.find((f) => f.id === selectedFireId);
          if (currentFire) {
            onFireSelect(currentFire); // 동일한 산불을 다시 클릭하면 선택 해제
          }
        }

        // 플래그 초기화
        setMarkerClicked(false);
      }, 10);
    };

    // 이벤트 등록
    map.on("click", handleMapClick);

    return () => {
      // 이벤트 제거
      map.off("click", handleMapClick);
    };
  }, [
    map,
    isGeoJsonLoaded,
    onFireSelect,
    selectedFireId,
    fires,
    isMarkerClicked,
    setMarkerClicked,
  ]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    // 지도나 GeoJSON 레이어가 없으면 실행하지 않음
    if (!map || !isGeoJsonLoaded) return;

    // "산불외종료" 데이터 무시
    const validFires = filterValidFires(fires);

    // 유효한 ID 목록 생성
    const currentFireIds = new Set(validFires.map((fire) => fire.id));

    // 현재 fires에 없는 마커 제거
    removeStaleMarkers(currentFireIds, map);

    // 마커 생성 및 업데이트
    validFires.forEach((fire) => {
      // 이미 존재하는 마커 처리
      const existingMarker = getMarker(fire.id);
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
      const newMarker = createMarker(fire, isSelected, map);

      // 참조에 마커 저장
      if (newMarker) {
        setMarker(fire.id, newMarker);
      }
    });
  }, [
    map,
    fires,
    onFireSelect,
    isGeoJsonLoaded,
    selectedFireId,
    createMarker,
    filterValidFires,
    getMarker,
    removeStaleMarkers,
    setMarker,
  ]);

  // 선택된 산불로 지도 이동 및 마커 업데이트
  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    try {
      // 선택된 마커 처리
      if (typeof selectedFireId === "string") {
        const fire = fires.find((f) => f.id === selectedFireId);

        if (fire) {
          const oldMarker = getMarker(selectedFireId);
          if (oldMarker) {
            // 기존 마커 제거
            map.removeLayer(oldMarker);
          }

          // 선택된 마커는 isSelected를 true로 설정하여 크기 키움
          const newMarker = createMarker(fire, true, map);

          // 마커 참조 갱신
          if (newMarker) {
            setMarker(selectedFireId, newMarker);

            // 지도 이동
            map.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
          }
        }
      }
    } catch (error) {
      console.error("선택된 마커 업데이트 오류:", error);
    }
  }, [selectedFireId, fires, map, isGeoJsonLoaded, createMarker, getMarker, setMarker]);

  // 외부에서 사용할 메서드 반환
  return {
    // 마커 상태에 접근할 수 있도록 readonly로 제공
    markers,

    // 수동으로 마커를 갱신하기 위한 함수
    refreshMarkers: useCallback(() => {
      // 유효한 산불만 필터링
      const validFires = filterValidFires(fires);

      // 현재 fires에 없는 마커 제거
      const currentFireIds = new Set(validFires.map((fire) => fire.id));
      removeStaleMarkers(currentFireIds, map);

      // 모든 마커 재생성
      validFires.forEach((fire) => {
        const isSelected = fire.id === selectedFireId;
        removeMarker(fire.id, map);
        const newMarker = createMarker(fire, isSelected, map);
        if (newMarker) {
          setMarker(fire.id, newMarker);
        }
      });
    }, [
      map,
      fires,
      selectedFireId,
      createMarker,
      filterValidFires,
      removeMarker,
      removeStaleMarkers,
      setMarker,
    ]),
  };
}
