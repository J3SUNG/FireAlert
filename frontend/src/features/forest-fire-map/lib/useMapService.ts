import { useRef, useState, useEffect, useCallback } from 'react';
import { MapService, MapOptions, MapEventType, MapPosition } from '../model/mapTypes';
import { getMapService, MapServiceType, resetMapService } from './mapServiceFactory';

interface UseMapServiceOptions {
  mapType?: MapServiceType;
  initialOptions?: Partial<MapOptions>;
  onMapReady?: (mapService: MapService) => void;
}

/**
 * 맵 서비스를 사용하기 위한 훅
 * Leaflet 직접 의존성을 추상화된 MapService 인터페이스로 대체
 */
export function useMapService({ 
  mapType = MapServiceType.LEAFLET,
  initialOptions = {},
  onMapReady
}: UseMapServiceOptions = {}) {
  // 맵 서비스 인스턴스 참조
  const mapServiceRef = useRef<MapService | null>(null);
  
  // 초기화 상태
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 맵 초기화 함수
  const initializeMap = useCallback((container: HTMLElement) => {
    try {
      // 이미 초기화된 경우 먼저 제거
      if (mapServiceRef.current) {
        mapServiceRef.current.destroy();
      }
      
      // 맵 서비스 인스턴스 가져오기
      const mapService = getMapService(mapType);
      
      // 기본 옵션 설정
      const defaultOptions: MapOptions = {
        center: { lat: 36.0, lng: 127.7 },
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        zoomControl: true,
        attributionControl: true,
        ...initialOptions
      };
      
      // 맵 초기화
      mapService.initialize(container, defaultOptions);
      
      // 참조 저장
      mapServiceRef.current = mapService;
      
      // 초기화 완료 상태 설정
      setIsInitialized(true);
      
      // 콜백 호출
      if (onMapReady) {
        onMapReady(mapService);
      }
      
      return mapService;
    } catch (err) {
      console.error('맵 초기화 오류:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [mapType, initialOptions, onMapReady]);
  
  // 맵 제거 함수
  const destroyMap = useCallback(() => {
    if (mapServiceRef.current) {
      mapServiceRef.current.destroy();
      mapServiceRef.current = null;
      resetMapService();
      setIsInitialized(false);
    }
  }, []);
  
  // 이벤트 리스너 추가 함수 
  const addEventListener = useCallback((event: MapEventType | string, handler: (...args: any[]) => void) => {
    if (mapServiceRef.current) {
      mapServiceRef.current.on(event, handler);
    }
  }, []);
  
  // 이벤트 리스너 제거 함수
  const removeEventListener = useCallback((event: MapEventType | string, handler?: (...args: any[]) => void) => {
    if (mapServiceRef.current) {
      mapServiceRef.current.off(event, handler);
    }
  }, []);
  
  // 위치 변경 함수
  const setMapView = useCallback((position: MapPosition) => {
    if (mapServiceRef.current) {
      mapServiceRef.current.setView(position);
    }
  }, []);
  
  // 컴포넌트 마운트 시 자동 초기화
  useEffect(() => {
    // containerRef.current가 있고 아직 초기화되지 않은 경우에만 초기화
    if (containerRef.current && !isInitialized && !mapServiceRef.current) {
      initializeMap(containerRef.current);
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      destroyMap();
    };
  }, []); // 마운트/언마운트 시에만 실행
  
  return {
    mapService: mapServiceRef.current,
    isInitialized,
    error,
    containerRef,
    initializeMap,
    destroyMap,
    addEventListener,
    removeEventListener,
    setMapView
  };
}