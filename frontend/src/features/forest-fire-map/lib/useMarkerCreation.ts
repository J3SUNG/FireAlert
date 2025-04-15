import { useCallback } from "react";
import type { Map, LayerGroup } from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

interface UseMarkerCreationOptions {
  onFireSelect?: (fire: ForestFireData) => void;
  setMarkerClicked: (clicked: boolean) => void;
}

/**
 * 마커 생성 및 업데이트 로직을 담당하는 훅
 */
export function useMarkerCreation({ onFireSelect, setMarkerClicked }: UseMarkerCreationOptions) {
  // 마커 생성 함수
  const createMarker = useCallback(
    async (fire: ForestFireData, isSelected: boolean, map: Map | null) => {
      if (!map) return null;

      try {
        // createFireMarker 유틸리티 함수를 사용하여 마커 생성
        const marker = await createFireMarker(fire, {
          isSelected,
          onClick: (selectedFire) => {
            if (onFireSelect) {
              // 마커 클릭 플래그 설정 (지도 클릭 이벤트와 구분)
              setMarkerClicked(true);
              onFireSelect(selectedFire);
            }
          },
          map: map,
        });

        // 지도에 마커 추가
        marker.addTo(map);

        return marker;
      } catch (error) {
        console.error(`마커 생성 오류 (ID: ${fire.id}):`, error);
        return null;
      }
    },
    [onFireSelect, setMarkerClicked]
  );

  // 유효한 산불 데이터 필터링 함수
  const filterValidFires = useCallback((fires: ForestFireData[]) => {
    return fires.filter((fire) => {
      // "산불외종료" 데이터 제외
      if (typeof fire.description === "string" && fire.description.includes("산불외종료")) {
        return false;
      }
      return true;
    });
  }, []);

  return {
    createMarker,
    filterValidFires,
  };
}
