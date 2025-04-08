import L from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

/**
 * Leaflet 맵 관련 유틸리티 함수 모음
 * 이전의 클래스 구조에서 함수형 접근으로 변경
 */

// 맵 초기화
export function initializeLeafletMap(container: HTMLElement, options: {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}): L.Map {
  // Leaflet 맵 인스턴스 생성
  const map = L.map(container, {
    center: [options.center.lat, options.center.lng],
    zoom: options.zoom,
    minZoom: options.minZoom,
    maxZoom: options.maxZoom,
    zoomControl: options.zoomControl !== false,
    attributionControl: options.attributionControl !== false,
  });
  
  // 기본 타일 레이어 추가
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  return map;
}

// 맵 제거
export function destroyLeafletMap(map: L.Map): void {
  if (map) {
    map.remove();
  }
}

// 뷰 설정
export function setMapView(map: L.Map, position: { lat: number; lng: number; zoom?: number }): void {
  if (!map) return;
  
  const currentZoom = map.getZoom();
  map.setView([position.lat, position.lng], position.zoom || currentZoom);
}

// 경계 설정
export function setMapBounds(map: L.Map, bounds: {
  southWest: { lat: number; lng: number };
  northEast: { lat: number; lng: number };
}): void {
  if (!map) return;
  
  const latLngBounds = L.latLngBounds(
    [bounds.southWest.lat, bounds.southWest.lng],
    [bounds.northEast.lat, bounds.northEast.lng]
  );
  
  map.setMaxBounds(latLngBounds);
}

// 기본 마커 추가
export function addMarker(
  map: L.Map,
  position: { lat: number; lng: number },
  data: any,
  options: {
    isSelected?: boolean;
    opacity?: number;
    onClick?: (data: any) => void;
  } = {}
): { id: string; marker: L.LayerGroup } {
  if (!map) throw new Error("Map is not initialized");
  
  // 마커 생성
  const marker = L.marker([position.lat, position.lng], {
    zIndexOffset: options.isSelected ? 1000 : 0,
    opacity: options.opacity || 1,
  });
  
  // 클릭 이벤트 등록
  if (options.onClick) {
    marker.on("click", () => {
      if (options.onClick) {
        options.onClick(data);
      }
    });
  }
  
  // 레이어 그룹 생성 후 맵에 추가
  const layerGroup = L.layerGroup([marker]);
  layerGroup.addTo(map);
  
  // 고유 ID 생성
  const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return { id, marker: layerGroup };
}

// 마커 제거
export function removeMarker(map: L.Map, marker: L.LayerGroup): void {
  if (!map) return;
  
  marker.removeFrom(map);
}

// GeoJSON 로드
export async function loadGeoJson(
  map: L.Map,
  url: string,
  options: any = {}
): Promise<{ id: string; layer: L.GeoJSON }> {
  if (!map) throw new Error("Map is not initialized");
  
  try {
    // GeoJSON 데이터 가져오기
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // GeoJSON 레이어 생성
    const layer = L.geoJSON(data, {
      style: options.style || {},
      onEachFeature: options.onEachFeature,
    });
    
    // 맵에 추가
    if (options.addToMap !== false) {
      layer.addTo(map);
    }
    
    // ID 생성
    const id = `geojson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return { id, layer };
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
    throw error;
  }
}

// GeoJSON 제거
export function removeGeoJson(map: L.Map, layer: L.GeoJSON): void {
  if (!map) return;
  
  layer.removeFrom(map);
}

// 산불 마커 추가
export function addFireMarker(
  map: L.Map,
  fire: ForestFireData,
  options: {
    isSelected?: boolean;
    onClick?: (data: ForestFireData) => void;
  } = {}
): { id: string; marker: L.LayerGroup } {
  if (!map) throw new Error("Map is not initialized");
  
  // 마커 ID (산불 ID 사용)
  const id = fire.id;
  
  // createFireMarker 유틸리티 사용
  const marker = createFireMarker(fire, {
    isSelected: options.isSelected || false,
    onClick: (selectedFire) => {
      if (options.onClick) {
        options.onClick(selectedFire);
      }
    },
    map: map,
  });
  
  // 맵에 추가
  marker.addTo(map);
  
  return { id, marker };
}

// 이벤트 매핑 (필요한 경우 사용)
export function mapLeafletEvent(event: string): string {
  // 이벤트 매핑
  const eventMap: Record<string, string> = {
    "click": "click",
    "zoomChange": "zoomend",
    "dragEnd": "dragend",
    "layerAdd": "layeradd",
    "layerRemove": "layerremove",
  };
  
  return eventMap[event] || event;
}

// 줌 레벨 가져오기
export function getMapZoom(map: L.Map): number {
  if (!map) return 0;
  return map.getZoom();
}

// 특정 위치로 지도 이동
export function panToPosition(map: L.Map, position: { lat: number; lng: number }): void {
  if (!map) return;
  map.panTo([position.lat, position.lng]);
}
