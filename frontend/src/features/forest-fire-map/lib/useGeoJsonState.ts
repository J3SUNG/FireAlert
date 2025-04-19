import { useRef, useCallback } from "react";
import L from "leaflet";

/**
 * GeoJSON 레이어 상태 관리 훅
 */
export function useGeoJsonState() {
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});

  const provinceMarkersRef = useRef<L.Marker[]>([]);
  const districtMarkersRef = useRef<L.Marker[]>([]);

  const setProvinceLayer = useCallback((layer: L.GeoJSON) => {
    geoJsonLayersRef.current.provinces = layer;
  }, []);

  const setDistrictLayer = useCallback((layer: L.GeoJSON) => {
    geoJsonLayersRef.current.districts = layer;
  }, []);

  const getProvinceLayer = useCallback(() => {
    return geoJsonLayersRef.current.provinces;
  }, []);

  const getDistrictLayer = useCallback(() => {
    return geoJsonLayersRef.current.districts;
  }, []);

  const addProvinceMarker = useCallback((marker: L.Marker) => {
    provinceMarkersRef.current.push(marker);
  }, []);

  const addDistrictMarker = useCallback((marker: L.Marker) => {
    districtMarkersRef.current.push(marker);
  }, []);

  const cleanupLayers = useCallback(
    (map: L.Map | null, markerHandlerMap?: Map<L.Marker, () => void>) => {
      if (!map) return;

      const { provinces, districts } = geoJsonLayersRef.current;

      if (provinces) {
        if ("off" in provinces) {
          provinces.off();
        }

        if (map.hasLayer(provinces)) {
          map.removeLayer(provinces);
        }
      }

      if (districts) {
        if ("off" in districts) {
          districts.off();
        }

        if (map.hasLayer(districts)) {
          map.removeLayer(districts);
        }
      }

      provinceMarkersRef.current.forEach((marker) => {
        if ("off" in marker) {
          marker.off();
        }

        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
      provinceMarkersRef.current = [];

      districtMarkersRef.current.forEach((marker) => {
        if (map && markerHandlerMap?.has(marker)) {
          const handler = markerHandlerMap.get(marker);
          if (handler) {
            map.off("zoomend", handler);
            markerHandlerMap.delete(marker);
          }
        }

        if ("off" in marker) {
          marker.off();
        }

        if (map && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
      districtMarkersRef.current = [];

      geoJsonLayersRef.current = {};
    },
    []
  );

  return {
    layers: geoJsonLayersRef.current,
    provinceMarkers: provinceMarkersRef.current,
    districtMarkers: districtMarkersRef.current,

    setProvinceLayer,
    setDistrictLayer,
    getProvinceLayer,
    getDistrictLayer,

    addProvinceMarker,
    addDistrictMarker,

    cleanupLayers,
  };
}
