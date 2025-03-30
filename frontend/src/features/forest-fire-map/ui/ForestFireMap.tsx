import React, { FC, useRef, useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapLoadingIndicator } from "../components/MapLoadingIndicator";
import { useGeoJsonLayers } from "../hooks/useGeoJsonLayers";
import { useMap } from "../hooks/useMap";
import { GEOJSON_PATHS } from "../constants/mapSettings";
import { FireMarkerManager } from "../components/FireMarkerManager";
import { ForestFireMapProps } from "../model/types";
import "./map.css";

/**
 * 산불 지도 컴포넌트
 */
export const ForestFireMap: FC<ForestFireMapProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
  legendPosition = "bottomleft",
}) => {
  // 고유 ID 생성 (렌더링 간 안정성 보장)
  const instanceId = useMemo(() => `map-${Date.now()}`, []);
  
  // 지도 컨테이너 DOM 참조
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // 지도 로드 상태 관리
  const [mapReady, setMapReady] = useState(false);
  const [geoJsonReady, setGeoJsonReady] = useState(false);
  
  // 컴포넌트 마운트 상태 추적
  const mountedRef = useRef(true);

  // 맵 초기화 및 관리
  const { map, isMapLoaded } = useMap({
    containerRef: mapContainerRef,
    legendPosition,
  });

  // 지도 로드 완료 시 준비 상태 업데이트
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (isMapLoaded && map && mapContainerRef.current) {
      // 지연을 통해 DOM이 완전히 렌더링될 때까지 대기
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setMapReady(true);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [isMapLoaded, map]);

  // GeoJSON 레이어 초기화 (지도가 준비된 경우에만)
  const { isGeoJsonLoaded } = useGeoJsonLayers(
    mapReady && map ? map : null,
    {
      provincesUrl: GEOJSON_PATHS.provinces,
      districtsUrl: GEOJSON_PATHS.districts,
    }
  );

  // GeoJSON 로드 상태 감지
  useEffect(() => {
    if (!mountedRef.current) return;
    
    if (isGeoJsonLoaded) {
      setGeoJsonReady(true);
    }
  }, [isGeoJsonLoaded]);

  // 컴포넌트 마운트/언마운트 시 정리
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 마커 관리자 키 (안정적인 메모리 관리)
  const markerManagerKey = useMemo(() => `markers-${instanceId}`, [instanceId]);

  return (
    <div className="forest-fire-map" data-instance-id={instanceId}>
      <div 
        ref={mapContainerRef} 
        className="forest-fire-map__container" 
        data-map-instance={instanceId}
      ></div>

      {/* 지도와 GeoJSON이 모두 로드된 경우에만 마커 표시 */}
      {mapReady && geoJsonReady && map && (
        <FireMarkerManager
          key={markerManagerKey}
          map={map}
          fires={fires}
          selectedFireId={selectedFireId}
          onFireSelect={onFireSelect}
          isGeoJsonLoaded={true}
        />
      )}

      {/* 로딩 표시기 */}
      <MapLoadingIndicator isLoading={!mapReady || !geoJsonReady} />
    </div>
  );
};