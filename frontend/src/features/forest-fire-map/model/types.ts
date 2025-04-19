import L from "leaflet";

// Leaflet 확장 타입 정의
declare module "leaflet" {
  interface Map {
    toggleDistrictLayerHandler?: () => void;
    maintainLayerOrderHandler?: () => void;
  }
}

/**
 * 지도 구성 옵션
 */
export interface MapConfig {
  center: L.LatLngExpression;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * 마커 옵션
 */
export interface MarkerOptions extends L.MarkerOptions {
  id?: string;
  isSelected?: boolean;
}

/**
 * 마커 참조 타입
 */
export type MarkerRef = L.Marker & {
  id?: string;
  fireId?: string;
  eventHandler?: any;
};

/**
 * 마커 이벤트 핸들러
 */
export interface MarkerEventHandlers {
  onClick?: (e: L.LeafletMouseEvent) => void;
  onMouseOver?: (e: L.LeafletMouseEvent) => void;
  onMouseOut?: (e: L.LeafletMouseEvent) => void;
}

/**
 * GeoJSON 레이어 구성
 */
export interface GeoJsonLayerConfig {
  id: string;
  url: string;
  style?: L.PathOptions;
  minZoom?: number;
  maxZoom?: number;
}
