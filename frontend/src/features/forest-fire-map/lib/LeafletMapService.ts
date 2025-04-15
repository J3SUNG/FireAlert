// Leaflet 타입만 임포트 하고, 실제 라이브러리는 동적으로 로드
import type { Map, LayerGroup, GeoJSON, LatLngBounds, Marker } from "leaflet";

// 타입 별칭 정의
type LeafletModule = typeof import("leaflet");

// Leaflet 동적 로드 함수
async function loadLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}

// Leaflet 인스턴스 캐싱
let LeafletInstance: LeafletModule | null = null;
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

/**
 * Leaflet 맵 관련 유틸리티 함수 모음
 */

/**
 * 맵 초기화
 * 
 * 지정된 컨테이너에 Leaflet 맵 인스턴스 생성
 */
export async function initializeLeafletMap(container: HTMLElement, options: {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}): Promise<Map> {
  // Leaflet 동적 로드
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;
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

/**
 * 맵 제거
 * 
 * 맵 인스턴스 정리
 */
export function destroyLeafletMap(map: Map): void {
  if (map) {
    map.remove();
  }
}

/**
 * 뷰 설정
 * 
 * 맵의 중심점과 줌 레벨 변경
 */
export function setMapView(map: Map, position: { lat: number; lng: number; zoom?: number }): void {
  if (!map) return;
  
  const currentZoom = map.getZoom();
  map.setView([position.lat, position.lng], position.zoom || currentZoom);
}

/**
 * 경계 설정
 * 
 * 맵의 경계 제한 설정
 */
export async function setMapBounds(map: Map, bounds: {
  southWest: { lat: number; lng: number };
  northEast: { lat: number; lng: number };
}): Promise<void> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;
  if (!map) return;
  
  const latLngBounds = L.latLngBounds(
    [bounds.southWest.lat, bounds.southWest.lng],
    [bounds.northEast.lat, bounds.northEast.lng]
  );
  
  map.setMaxBounds(latLngBounds);
}

/**
 * 기본 마커 추가
 * 
 * 지정된 위치에 마커 생성 및 추가
 */
export async function addMarker(
  map: Map,
  position: { lat: number; lng: number },
  data: any,
  options: {
    isSelected?: boolean;
    opacity?: number;
    onClick?: (data: any) => void;
  } = {}
): Promise<{ id: string; marker: LayerGroup }> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;
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

/**
 * 마커 제거
 * 
 * 맵에서 마커 레이어 제거
 */
export function removeMarker(map: Map, marker: LayerGroup): void {
  if (!map) return;
  
  marker.removeFrom(map);
}

/**
 * GeoJSON 로드
 * 
 * 지정된 URL에서 GeoJSON 데이터 로드하여 맵에 표시
 */
export async function loadGeoJson(
  map: Map,
  url: string,
  options: any = {}
): Promise<{ id: string; layer: GeoJSON }> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;
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

/**
 * GeoJSON 제거
 * 
 * 맵에서 GeoJSON 레이어 제거
 */
export function removeGeoJson(map: Map, layer: GeoJSON): void {
  if (!map) return;
  
  layer.removeFrom(map);
}

/**
 * 산불 마커 추가
 * 
 * 산불 데이터로 커스텀 마커 생성 및 추가
 */
export async function addFireMarker(
  map: Map,
  fire: ForestFireData,
  options: {
    isSelected?: boolean;
    onClick?: (data: ForestFireData) => void;
  } = {}
): Promise<{ id: string; marker: LayerGroup }> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
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

/**
 * 이벤트 매핑
 * 
 * 내부 이벤트명을 Leaflet 이벤트명으로 변환
 */
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

/**
 * 줌 레벨 가져오기
 * 
 * 현재 맵의 줌 레벨 반환
 */
export function getMapZoom(map: Map): number {
  if (!map) return 0;
  return map.getZoom();
}

/**
 * 특정 위치로 지도 이동
 * 
 * 애니메이션과 함께 지정된 위치로 이동
 */
export function panToPosition(map: Map, position: { lat: number; lng: number }): void {
  if (!map) return;
  map.panTo([position.lat, position.lng]);
}
