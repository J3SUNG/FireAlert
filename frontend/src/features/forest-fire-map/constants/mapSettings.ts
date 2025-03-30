import L from 'leaflet';

// 지도 초기 설정
export const MAP_INIT_OPTIONS = {
  center: [36.0, 127.7] as L.LatLngExpression, // 한국 중심점
  zoom: 7,
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: true,
  zoomSnap: 0.1,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 120,
  minZoom: 6.5,
  maxZoom: 12,
};

// 한국의 지도 경계
export const KOREA_BOUNDS = {
  southWest: L.latLng(33.0, 124.5),
  northEast: L.latLng(38.7, 131.0),
};

// GeoJSON 파일 경로
export const GEOJSON_PATHS = {
  provinces: '/assets/map/gadm41_KOR_1.json',
  districts: '/assets/map/gadm41_KOR_2.json',
};

// GeoJSON 스타일 설정
export const PROVINCES_STYLE = {
  color: "#333333", // 검정색 경계선
  weight: 2, // 시도 경계선 두께
  opacity: 0.8,
  fillColor: "#e0f2fe",
  fillOpacity: 0.95,
};

export const DISTRICTS_STYLE = {
  color: "#666666", // 약간 더 밝은 경계선
  weight: 1,
  opacity: 0.7,
  fillColor: "transparent",
  fillOpacity: 0,
};

// 심각도별 마커 크기
export const MARKER_SIZES = {
  critical: 28,
  high: 25,
  medium: 22,
  low: 20,
};

// 상태별 텍스트
export const STATUS_TEXT = {
  active: "진행중",
  contained: "통제중",
  extinguished: "진화완료",
};

// 심각도별 텍스트
export const SEVERITY_TEXT = {
  critical: "심각",
  high: "높음",
  medium: "중간",
  low: "낮음",
};

// 지도 배경색
export const MAP_BACKGROUND_COLOR = "#bae6fd";
