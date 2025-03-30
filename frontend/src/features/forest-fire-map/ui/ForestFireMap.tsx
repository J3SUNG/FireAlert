import React, { FC, useRef, useState, useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ForestFireData } from "../../../shared/types/forestFire";
import { MapLoadingIndicator } from "../components/MapLoadingIndicator";
import { useGeoJsonLayers } from "../hooks/useGeoJsonLayers";
import { useMap } from "../hooks/useMap";
import { GEOJSON_PATHS } from "../constants/mapSettings";
import { FireMarkerManager } from "../components/FireMarkerManager";
import "./map.css";

interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  legendPosition?: L.ControlPosition;
}

/**
 * 산불 지도 컴포넌트
 */
export const ForestFireMap: FC<ForestFireMapProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
  legendPosition = "bottomleft",
}) => {
  // 지도 컴포넌트 참조
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // 마커 관리자 안정성을 위한 키 생성
  // 컴포넌트가 마운트될 때 한 번만 생성되고 변경되지 않음
  const markerManagerKey = useMemo(() => `marker-manager-${Date.now()}`, []);

  // useMap 훅을 사용한 지도 관리 - 메모이제이션으로 안정화
  const mapOptions = useMemo(() => ({ 
    containerRef: mapContainerRef,
    legendPosition,
  }), [legendPosition]);
  
  const { map, isMapLoaded } = useMap(mapOptions);
  
  // 지도가 로드되었을 때 DOM이 완전히 렌더링되었는지 확인
  useEffect(() => {
    if (isMapLoaded && map) {
      const timer = setTimeout(() => {
        try {
          // 지도 컨테이너가 DOM에 있는지 확인
          const container = map.getContainer();
          if (container && document.body.contains(container)) {
            setMapReady(true);
          }
        } catch (error) {
          console.error('지도 렌더링 확인 중 오류:', error);
          // 오류가 있어도 지도를 사용할 수 있도록 설정
          setMapReady(true);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      // 컴포넌트 언마운트 시 맵 상태 리셋
      setMapReady(false);
    };
  }, [isMapLoaded, map]);

  // GeoJSON 레이어 관리 - 지도가 준비되었을 때만 실행
  const { isGeoJsonLoaded } = useGeoJsonLayers(mapReady ? map : null, {
    provincesUrl: GEOJSON_PATHS.provinces,
    districtsUrl: GEOJSON_PATHS.districts,
  });

  return (
    <div className="forest-fire-map">
      <div ref={mapContainerRef} className="forest-fire-map__container"></div>

      {mapReady && map && (
        <FireMarkerManager
          key={markerManagerKey} // 안정성을 위해 고유 키 적용
          map={map}
          fires={fires}
          selectedFireId={selectedFireId}
          onFireSelect={onFireSelect}
          isGeoJsonLoaded={isGeoJsonLoaded}
        />
      )}

      <MapLoadingIndicator isLoading={!isMapLoaded || !isGeoJsonLoaded} />
    </div>
  );
};
