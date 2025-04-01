import { useRef, useCallback } from 'react';
import L from 'leaflet';
import { GeoJsonProperties } from '../../../shared/types/geoJson';

/**
 * GeoJSON 레이어 상태 관리 훅
 * 지도 레이어의 생성, 업데이트, 제거 등의 상태 관리
 */
export function useGeoJsonState() {
  // GeoJSON 레이어 참조 저장
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});
  
  // 레이블 마커 참조
  const provinceMarkersRef = useRef<L.Marker[]>([]);
  const districtMarkersRef = useRef<L.Marker[]>([]);
  
  // 레이어 설정 함수
  const setProvinceLayer = useCallback((layer: L.GeoJSON) => {
    geoJsonLayersRef.current.provinces = layer;
  }, []);
  
  const setDistrictLayer = useCallback((layer: L.GeoJSON) => {
    geoJsonLayersRef.current.districts = layer;
  }, []);
  
  // 레이어 조회 함수
  const getProvinceLayer = useCallback(() => {
    return geoJsonLayersRef.current.provinces;
  }, []);
  
  const getDistrictLayer = useCallback(() => {
    return geoJsonLayersRef.current.districts;
  }, []);
  
  // 마커 관리 함수
  const addProvinceMarker = useCallback((marker: L.Marker) => {
    provinceMarkersRef.current.push(marker);
  }, []);
  
  const addDistrictMarker = useCallback((marker: L.Marker) => {
    districtMarkersRef.current.push(marker);
  }, []);
  
  // 레이어 제거 함수
  const cleanupLayers = useCallback((map: L.Map | null) => {
    if (!map) return;
    
    const { provinces, districts } = geoJsonLayersRef.current;
    
    // 레이어 제거
    if (provinces && map.hasLayer(provinces)) {
      map.removeLayer(provinces);
    }
    
    if (districts && map.hasLayer(districts)) {
      map.removeLayer(districts);
    }
    
    // 시도 레이블 마커 제거
    provinceMarkersRef.current.forEach((marker) => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    provinceMarkersRef.current = [];
    
    // 시군구 레이블 마커 제거
    districtMarkersRef.current.forEach((marker) => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
    districtMarkersRef.current = [];
    
    // 참조 초기화
    geoJsonLayersRef.current = {};
  }, []);
  
  return {
    // 레이어 참조
    layers: geoJsonLayersRef.current,
    provinceMarkers: provinceMarkersRef.current,
    districtMarkers: districtMarkersRef.current,
    
    // 레이어 관리 함수
    setProvinceLayer,
    setDistrictLayer,
    getProvinceLayer,
    getDistrictLayer,
    
    // 마커 관리 함수
    addProvinceMarker,
    addDistrictMarker,
    
    // 정리 함수
    cleanupLayers
  };
}