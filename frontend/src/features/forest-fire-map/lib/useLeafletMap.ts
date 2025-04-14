import { useRef, useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { ForestFireData } from '../../../shared/model/forestFire';
import { createFireMarker } from './markerUtils';

interface MapPosition {
  lat: number;
  lng: number;
  zoom?: number;
}

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}

interface MarkerOptions {
  isSelected?: boolean;
  opacity?: number;
  onClick?: (data: any) => void;
}

interface UseLeafletMapOptions {
  initialOptions?: Partial<MapOptions>;
  onMapReady?: (map: L.Map) => void;
}

/**
 * Leaflet 맵을 사용하기 위한 훅
 */
export function useLeafletMap({ 
  initialOptions = {},
  onMapReady
}: UseLeafletMapOptions = {}) {
  // 맵 인스턴스 참조
  const mapRef = useRef<L.Map | null>(null);
  
  // 초기화 상태
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 마커 관리
  const markersRef = useRef<Record<string, L.LayerGroup>>({});
  const geoJsonLayersRef = useRef<Record<string, L.GeoJSON>>({});
  
  // 컨테이너 참조
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 맵 초기화 함수
  const initializeMap = useCallback((container: HTMLElement) => {
    try {
      // 이미 초기화된 경우 먼저 제거
      if (mapRef.current) {
        mapRef.current.remove();
      }
      
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
      const map = L.map(container, {
        center: [defaultOptions.center.lat, defaultOptions.center.lng],
        zoom: defaultOptions.zoom,
        minZoom: defaultOptions.minZoom,
        maxZoom: defaultOptions.maxZoom,
        zoomControl: defaultOptions.zoomControl,
        attributionControl: defaultOptions.attributionControl
      });
      
      // 기본 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // 참조 저장
      mapRef.current = map;
      
      // 초기화 완료 상태 설정
      setIsInitialized(true);
      
      // 콜백 호출
      if (onMapReady) {
        onMapReady(map);
      }
      
      return map;
    } catch (err) {
      console.error('맵 초기화 오류:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  }, [initialOptions, onMapReady]);
  
  // 맵 제거 함수
  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      // 모든 이벤트 리스너 명시적 제거
      mapRef.current.off();
      
      // 모든 마커 레이어 정리
      Object.values(markersRef.current).forEach(marker => {
        if (mapRef.current) marker.removeFrom(mapRef.current);
      });
      
      // 모든 GeoJSON 레이어 정리
      Object.values(geoJsonLayersRef.current).forEach(layer => {
        if (mapRef.current) layer.removeFrom(mapRef.current);
      });
      
      // 맵 인스턴스 제거
      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current = {};
      geoJsonLayersRef.current = {};
      setIsInitialized(false);
    }
  }, []);
  
  // 이벤트 리스너 추가 함수 
  const addEventListener = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (mapRef.current) {
      mapRef.current.on(event, handler);
    }
  }, []);
  
  // 이벤트 리스너 제거 함수
  const removeEventListener = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (mapRef.current) {
      if (handler) {
        mapRef.current.off(event, handler);
      } else {
        mapRef.current.off(event);
      }
    }
  }, []);
  
  // 위치 변경 함수
  const setMapView = useCallback((position: MapPosition) => {
    if (mapRef.current) {
      const zoom = position.zoom !== undefined ? position.zoom : mapRef.current.getZoom();
      mapRef.current.setView([position.lat, position.lng], zoom);
    }
  }, []);
  
  // 마커 추가 함수
  const addMarker = useCallback((position: { lat: number; lng: number }, data: any, options: MarkerOptions = {}) => {
    if (!mapRef.current) return null;
    
    const marker = L.marker([position.lat, position.lng], {
      zIndexOffset: options.isSelected ? 1000 : 0,
      opacity: options.opacity || 1
    });
    
    if (options.onClick) {
      marker.on('click', () => {
        if (options.onClick) {
          options.onClick(data);
        }
      });
    }
    
    const layerGroup = L.layerGroup([marker]);
    layerGroup.addTo(mapRef.current);
    
    const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    markersRef.current[id] = layerGroup;
    
    return id;
  }, []);
  
  // 마커 제거 함수
  const removeMarker = useCallback((id: string) => {
    if (!mapRef.current) return;
    
    const marker = markersRef.current[id];
    if (marker) {
      // 이벤트 리스너 제거 및 정리
      if ('off' in marker) marker.off();
      marker.removeFrom(mapRef.current);
      delete markersRef.current[id];
    }
  }, []);
  
  // 산불 마커 추가 함수
  const addFireMarker = useCallback((fire: ForestFireData, options: MarkerOptions = {}) => {
    if (!mapRef.current) return null;
    
    const id = fire.id;
    
    // createFireMarker 유틸리티 사용
    const marker = createFireMarker(fire, {
      isSelected: options.isSelected || false,
      onClick: (selectedFire) => {
        if (options.onClick) {
          options.onClick(selectedFire);
        }
      },
      map: mapRef.current
    });
    
    marker.addTo(mapRef.current);
    markersRef.current[id] = marker;
    
    return id;
  }, []);
  
  // 산불 마커 업데이트 함수
  const updateFireMarker = useCallback((id: string, _isSelected: boolean) => { // 사용하지 않는 매개변수 앞에 밑줄 추가
    if (!mapRef.current) return;
    
    const marker = markersRef.current[id];
    if (marker) {
      marker.removeFrom(mapRef.current);
      delete markersRef.current[id];
      
      // 새 마커는 addFireMarker로 다시 추가해야 함
    }
  }, []);
  
  // GeoJSON 추가 함수
  const loadGeoJson = useCallback(async (url: string, options: any = {}) => {
    if (!mapRef.current) throw new Error("Map is not initialized");
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
      }
      
      const data = await response.json();
      const layer = L.geoJSON(data, {
        style: options.style || {},
        onEachFeature: options.onEachFeature,
      });
      
      if (options.addToMap !== false) {
        layer.addTo(mapRef.current);
      }
      
      const id = `geojson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      geoJsonLayersRef.current[id] = layer;
      
      return id;
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      throw error;
    }
  }, []);
  
  // GeoJSON 제거 함수
  const removeGeoJson = useCallback((id: string) => {
    if (!mapRef.current) return;
    
    const layer = geoJsonLayersRef.current[id];
    if (layer) {
      layer.removeFrom(mapRef.current);
      delete geoJsonLayersRef.current[id];
    }
  }, []);
  
  // 컴포넌트 마운트 시 자동 초기화
  useEffect(() => {
    // containerRef.current가 있고 아직 초기화되지 않은 경우에만 초기화
    if (containerRef.current && !isInitialized && !mapRef.current) {
      initializeMap(containerRef.current);
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      destroyMap();
    };
  }, [initializeMap, destroyMap, isInitialized]); // 의존성 배열 명시적 추가
  
  return {
    map: mapRef.current,
    isInitialized,
    error,
    containerRef,
    initializeMap,
    destroyMap,
    addEventListener,
    removeEventListener,
    setMapView,
    addMarker,
    removeMarker,
    addFireMarker,
    updateFireMarker,
    loadGeoJson,
    removeGeoJson,
    getZoom: () => mapRef.current?.getZoom() || 0,
    panTo: (position: MapPosition) => mapRef.current?.panTo([position.lat, position.lng])
  };
}