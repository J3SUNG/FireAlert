import { FC, useEffect } from "react";
import L from "leaflet";
import { useGeoJsonManager } from "../lib/useGeoJsonManager";
import { GEOJSON_PATHS } from "../model/mapSettings";
import { useMapErrorHandling } from "../lib/useMapErrorHandling";
import { MapErrorCode } from "../model/mapErrorTypes";

interface GeoJsonLayerManagerProps {
  map: L.Map | null;
  onLayersLoaded: () => void;
}

/**
 * GeoJSON 레이어 관리 컴포넌트
 * 시도/시군구 경계 데이터를 지도에 표시합니다.
 */
export const GeoJsonLayerManager: FC<GeoJsonLayerManagerProps> = ({ map, onLayersLoaded }) => {
  const { hasError, userMessage, createGeoJsonError, setError } =
    useMapErrorHandling("GeoJsonLayerManager");

  const { isGeoJsonLoaded } = useGeoJsonManager(map, {
    provincesUrl: GEOJSON_PATHS.provinces,
    districtsUrl: GEOJSON_PATHS.districts,
  });

  useEffect(() => {
    try {
      if (isGeoJsonLoaded) {
        onLayersLoaded();
      }
    } catch (error) {
      setError(
        createGeoJsonError(
          MapErrorCode.GEOJSON_RENDERING_ERROR,
          error instanceof Error ? error : new Error("Unknown error")
        )
      );

      onLayersLoaded();
    }
  }, [isGeoJsonLoaded, onLayersLoaded, setError]);

  if (hasError) {
    console.warn(`GeoJson 로드 오류: ${userMessage}`);
  }

  return null;
};
