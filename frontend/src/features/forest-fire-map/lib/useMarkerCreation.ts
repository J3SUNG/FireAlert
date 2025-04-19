import { useCallback } from "react";
import type { Map } from "leaflet";
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
  const createMarker = useCallback(
    async (fire: ForestFireData, isSelected: boolean, map: Map | null) => {
      if (!map) return null;

      try {
        const marker = await createFireMarker(fire, {
          isSelected,
          onClick: (selectedFire) => {
            if (onFireSelect) {
              setMarkerClicked(true);
              onFireSelect(selectedFire);
            }
          },
          map: map,
        });

        marker.addTo(map);

        return marker;
      } catch (error) {
        console.error(`마커 생성 오류 (ID: ${fire.id}):`, error);
        return null;
      }
    },
    [onFireSelect, setMarkerClicked]
  );

  const filterValidFires = useCallback((fires: ForestFireData[]) => {
    return fires.filter((fire) => {
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
