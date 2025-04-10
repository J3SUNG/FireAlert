/**
 * 지도 관련 라이브러리 함수 및 후크 내보내기
 * 
 * 외부에서 사용할 수 있는 필요한 기능들을 노출합니다
 */

// 후크 내보내기
export { useMap } from "./useMap";
export { useGeoJsonLayers } from "./useGeoJsonLayers";
// 유틸리티 함수 내보내기
export { createFireMarker } from "./markerUtils";
// 마커 관련 후크
export { useMarkerState } from "./useMarkerState";
export { useMarkerCreation } from "./useMarkerCreation";
export { useMarkerManager } from "./useMarkerManager";

// GeoJSON 관련 후크
export { useGeoJsonState } from "./useGeoJsonState";
export { useGeoJsonManager } from "./useGeoJsonManager";
// Leaflet 관련 서비스 함수
export {
  initializeLeafletMap,
  destroyLeafletMap,
  setMapView,
  setMapBounds,
  addMarker,
  removeMarker,
  loadGeoJson,
  removeGeoJson,
  addFireMarker,
  mapLeafletEvent,
  getMapZoom,
  panToPosition
} from "./LeafletMapService";

// 에러 처리
export { useMapErrorHandling } from "./useMapErrorHandling";

// Leaflet 관련 후크
export { useLeafletMap } from "./useLeafletMap";
