import { useRef, useCallback } from "react";
import type { Map, LayerGroup } from "leaflet";

/**
 * 마커 상태 관리 훅
 */
export function useMarkerState() {
  const markersRef = useRef<Record<string, LayerGroup>>({});
  const isMarkerClickRef = useRef(false);

  const setMarker = useCallback((id: string, marker: LayerGroup) => {
    markersRef.current[id] = marker;
  }, []);

  const getMarker = useCallback((id: string) => {
    return markersRef.current[id];
  }, []);

  const removeMarker = useCallback((id: string, map: Map | null) => {
    const marker = markersRef.current[id];
    if (marker && map) {
      if ("off" in marker) {
        marker.off();
      }
      if ("eachLayer" in marker) {
        marker.eachLayer((layer) => {
          if ("off" in layer) {
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

  const clearAllMarkers = useCallback((map: Map | null) => {
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => {
      if (map.hasLayer(marker)) {
        if ("off" in marker) {
          marker.off();
        }
        if ("eachLayer" in marker) {
          marker.eachLayer((layer) => {
            if ("off" in layer) {
              layer.off();
            }
          });
        }
        marker.remove();
      }
    });
    markersRef.current = {};
  }, []);

  const removeStaleMarkers = useCallback((currentIds: Set<string>, map: Map | null) => {
    if (!map) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!currentIds.has(id)) {
        if ("off" in marker) {
          marker.off();
        }
        if ("eachLayer" in marker) {
          marker.eachLayer((layer) => {
            if ("off" in layer) {
              layer.off();
            }
          });
        }
        map.removeLayer(marker);
        delete markersRef.current[id];
      }
    });
  }, []);

  const setMarkerClicked = useCallback((clicked: boolean) => {
    isMarkerClickRef.current = clicked;
  }, []);

  const isMarkerClicked = useCallback(() => {
    return isMarkerClickRef.current;
  }, []);

  return {
    markers: markersRef.current,
    setMarker,
    getMarker,
    removeMarker,
    clearAllMarkers,
    removeStaleMarkers,

    setMarkerClicked,
    isMarkerClicked,
  };
}
