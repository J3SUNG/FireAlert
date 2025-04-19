import { useEffect, useCallback } from "react";
import type { Map } from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";
import { useMarkerState } from "./useMarkerState";
import { useMarkerCreation } from "./useMarkerCreation";

interface UseMarkerManagerProps {
  map: Map | null;
  fires: ForestFireData[];
  selectedFireId: string | undefined | null;
  onFireSelect?: (fire: ForestFireData) => void;
  isGeoJsonLoaded: boolean;
}

/**
 * 통합 마커 관리 훅
 */
export function useMarkerManager({
  map,
  fires,
  selectedFireId,
  onFireSelect,
  isGeoJsonLoaded,
}: UseMarkerManagerProps) {
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

  const { createMarker, filterValidFires } = useMarkerCreation({
    onFireSelect,
    setMarkerClicked,
  });

  useEffect(() => {
    const hasMarkers = Object.keys(markers).length > 0;

    return () => {
      if (hasMarkers) {
        clearAllMarkers(map);
      }
    };
  }, [map, clearAllMarkers, markers]);

  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    const handleMapClick = () => {
      setTimeout(() => {
        if (onFireSelect && selectedFireId && !isMarkerClicked()) {
          const currentFire = fires.find((f) => f.id === selectedFireId);
          if (currentFire) {
            onFireSelect(currentFire);
          }
        }

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

  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    const updateMarkers = async () => {
      const validFires = filterValidFires(fires);

      const currentFireIds = new Set(validFires.map((fire) => fire.id));

      removeStaleMarkers(currentFireIds, map);

      for (const fire of validFires) {
        const existingMarker = getMarker(fire.id);
        if (existingMarker) {
          if (fire.id === selectedFireId) {
            continue;
          }

          continue;
        }

        const isSelected = fire.id === selectedFireId;
        const newMarker = await createMarker(fire, isSelected, map);

        if (newMarker) {
          setMarker(fire.id, newMarker);
        }
      }
    };

    void updateMarkers();
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

  useEffect(() => {
    if (!map || !isGeoJsonLoaded) return;

    const updateSelectedMarker = async () => {
      try {
        if (typeof selectedFireId === "string") {
          const fire = fires.find((f) => f.id === selectedFireId);

          if (fire) {
            const oldMarker = getMarker(selectedFireId);
            if (oldMarker) {
              map.removeLayer(oldMarker);
            }

            const newMarker = await createMarker(fire, true, map);

            if (newMarker) {
              setMarker(selectedFireId, newMarker);

              map.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
            }
          }
        }
      } catch (error) {
        console.error("선택된 마커 업데이트 오류:", error);
      }
    };

    void updateSelectedMarker();
  }, [selectedFireId, fires, map, isGeoJsonLoaded, createMarker, getMarker, setMarker]);

  return {
    markers,

    refreshMarkers: useCallback(async () => {
      const validFires = filterValidFires(fires);
      const currentFireIds = new Set(validFires.map((fire) => fire.id));

      removeStaleMarkers(currentFireIds, map);

      for (const fire of validFires) {
        const isSelected = fire.id === selectedFireId;
        removeMarker(fire.id, map);
        const newMarker = await createMarker(fire, isSelected, map);
        if (newMarker) {
          setMarker(fire.id, newMarker);
        }
      }
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
