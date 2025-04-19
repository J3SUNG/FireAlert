import type { Map, LayerGroup, GeoJSON } from "leaflet";

type LeafletModule = typeof import("leaflet");

async function loadLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}

let LeafletInstance: LeafletModule | null = null;
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

/**
 * Leaflet 맵 관련 유틸리티 함수 모음
 */

/**
 * 맵 초기화
 */
export async function initializeLeafletMap(
  container: HTMLElement,
  options: {
    center: { lat: number; lng: number };
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    attributionControl?: boolean;
  }
): Promise<Map> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;

  const map = L.map(container, {
    center: [options.center.lat, options.center.lng],
    zoom: options.zoom,
    minZoom: options.minZoom,
    maxZoom: options.maxZoom,
    zoomControl: options.zoomControl !== false,
    attributionControl: options.attributionControl !== false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  return map;
}

/**
 * 맵 제거
 */
export function destroyLeafletMap(map: Map): void {
  if (map) {
    map.remove();
  }
}

/**
 * 뷰 설정
 */
export function setMapView(map: Map, position: { lat: number; lng: number; zoom?: number }): void {
  if (!map) return;

  const currentZoom = map.getZoom();
  map.setView([position.lat, position.lng], position.zoom || currentZoom);
}

/**
 * 경계 설정
 */
export async function setMapBounds(
  map: Map,
  bounds: {
    southWest: { lat: number; lng: number };
    northEast: { lat: number; lng: number };
  }
): Promise<void> {
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

  const marker = L.marker([position.lat, position.lng], {
    zIndexOffset: options.isSelected ? 1000 : 0,
    opacity: options.opacity || 1,
  });

  if (options.onClick) {
    marker.on("click", () => {
      if (options.onClick) {
        options.onClick(data);
      }
    });
  }

  const layerGroup = L.layerGroup([marker]);
  layerGroup.addTo(map);

  const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return { id, marker: layerGroup };
}

/**
 * 마커 제거
 */
export function removeMarker(map: Map, marker: LayerGroup): void {
  if (!map) return;

  marker.removeFrom(map);
}

/**
 * GeoJSON 로드
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
      layer.addTo(map);
    }

    const id = `geojson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return { id, layer };
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
    throw error;
  }
}

/**
 * GeoJSON 제거
 */
export function removeGeoJson(map: Map, layer: GeoJSON): void {
  if (!map) return;

  layer.removeFrom(map);
}

/**
 * 산불 마커 추가
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

  const id = fire.id;

  const marker = createFireMarker(fire, {
    isSelected: options.isSelected || false,
    onClick: (selectedFire) => {
      if (options.onClick) {
        options.onClick(selectedFire);
      }
    },
    map: map,
  });

  marker.addTo(map);

  return { id, marker };
}

/**
 * 이벤트 매핑
 */
export function mapLeafletEvent(event: string): string {
  const eventMap: Record<string, string> = {
    click: "click",
    zoomChange: "zoomend",
    dragEnd: "dragend",
    layerAdd: "layeradd",
    layerRemove: "layerremove",
  };

  return eventMap[event] || event;
}

/**
 * 줌 레벨 가져오기
 */
export function getMapZoom(map: Map): number {
  if (!map) return 0;
  return map.getZoom();
}

/**
 * 특정 위치로 지도 이동
 */
export function panToPosition(map: Map, position: { lat: number; lng: number }): void {
  if (!map) return;
  map.panTo([position.lat, position.lng]);
}
