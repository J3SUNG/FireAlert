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
 * 통합 마커 관리 훅
 * 
 * 마커의 생성, 상태 관리, 이벤트 핸들링을 담당
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

  // 컴포넌트 언마운트 시 마커 정리
  useEffect(() => {
    const hasMarkers = Object.keys(markers).length > 0;
    
    return () => {
      if (hasMarkers) {
        clearAllMarkers(map);
      }
    };
  }, [map, clearAllMarkers, markers]);

  // 빈 영역 클릭 시 선택된 마커 해제
  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    const handleMapClick = () => {
      // 마커 클릭 이벤트와 충돌 방지를 위한 지연 처리
      setTimeout(() => {
        if (onFireSelect && selectedFireId && !isMarkerClicked()) {
          const currentFire = fires.find((f) => f.id === selectedFireId);
          if (currentFire) {
            onFireSelect(currentFire); // 선택 해제를 위해 동일 산불 다시 전달
          }
        }

        // 클릭 상태 초기화
        setMarkerClicked(false);
      }, 10);
    };

    map.on("click", handleMapClick);

    return () => {
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
    if (!map || !isGeoJsonLoaded) return;

    // 유효한 산불 데이터만 필터링
    const validFires = filterValidFires(fires);

    // 현재 존재하는 산불 ID 목록
    const currentFireIds = new Set(validFires.map((fire) => fire.id));

    // 지도에서 제거된 산불의 마커 삭제
    removeStaleMarkers(currentFireIds, map);

    // 각 산불에 대한 마커 처리
    validFires.forEach((fire) => {
      // 이미 존재하는 마커 확인
      const existingMarker = getMarker(fire.id);
      if (existingMarker) {
        // 선택된 마커는 별도로 처리
        if (fire.id === selectedFireId) {
          return;
        }

        // 기존 마커 유지
        return;
      }

      // 새 마커 생성 (선택 상태 반영)
      const isSelected = fire.id === selectedFireId;
      const newMarker = createMarker(fire, isSelected, map);

      // 생성된 마커 저장
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
      if (typeof selectedFireId === "string") {
        const fire = fires.find((f) => f.id === selectedFireId);

        if (fire) {
          // 기존 마커 제거
          const oldMarker = getMarker(selectedFireId);
          if (oldMarker) {
            map.removeLayer(oldMarker);
          }

          // 선택된 상태의 새 마커 생성
          const newMarker = createMarker(fire, true, map);

          if (newMarker) {
            setMarker(selectedFireId, newMarker);

            // 선택된 산불로 지도 중심 이동
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
    markers,

    // 수동 마커 갱신 함수
    refreshMarkers: useCallback(() => {
      const validFires = filterValidFires(fires);
      const currentFireIds = new Set(validFires.map((fire) => fire.id));
      
      removeStaleMarkers(currentFireIds, map);

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