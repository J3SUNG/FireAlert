import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ForestFireData } from '../../../shared/types/forestFire';
import { mapService } from '../model/mapService';
import { createMapLegend } from '../lib/mapUtils';

export const useKoreaMap = (fires: ForestFireData[]) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [hasAddedMarkers, setHasAddedMarkers] = useState<boolean>(false);

  // Leaflet CSS 로드 확인
  useEffect(() => {
    // 이미 존재하는 Leaflet CSS 태그 확인
    const existingLink = document.querySelector('link[href*="leaflet.css"]');
    
    if (!existingLink) {
      // Leaflet CSS가 로드되지 않은 경우 직접 추가
      console.log('Leaflet CSS 직접 추가함');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (mapRef.current || !containerRef.current) {
      return; // 이미 맵이 초기화되었거나 컨테이너가 없다면 종료
    }

    // 지도 초기화
    console.log("지도 초기화 시작");
    mapRef.current = mapService.initMap(containerRef.current);
    
    // 범례 추가
    const legend = createMapLegend();
    legend.addTo(mapRef.current);

    // GeoJSON 로드 및 레이어 추가
    const loadGeoJsonLayers = async () => {
      try {
        const geoJsonData = await mapService.loadGeoJsonData();
        if (geoJsonData) {
          mapService.addDistrictLayer(geoJsonData);
        } else {
          console.log("GeoJSON 데이터 로드 실패, 기본 지도만 표시");
        }
        
        // 지도가 로드됐다고 표시 (GeoJSON 실패해도 지도는 표시)
        setIsMapLoaded(true);
      } catch (error) {
        console.error("지도 로드 오류:", error);
        // 오류가 발생해도 지도는 로드됐다고 표시
        setIsMapLoaded(true);
      }
    };

    loadGeoJsonLayers();

    // 컴포넌트 언마운트 시 정리
    return () => {
      mapService.cleanup();
      mapRef.current = null;
    };
  }, []);

  // 산불 마커 추가 (fires가 변경될 때만 업데이트)
  useEffect(() => {
    if (!isMapLoaded) return;
    
    console.log("산불 마커 추가:", fires.length);
    mapService.addFireMarkers(fires);
    setHasAddedMarkers(true);
  }, [fires, isMapLoaded]);

  return {
    containerRef,
    isMapLoaded: isMapLoaded && hasAddedMarkers, // 마커까지 추가되면 완전히 로드된 것으로 간주
    selectFire: (fireId: string) => mapService.selectFire(fireId)
  };
};
