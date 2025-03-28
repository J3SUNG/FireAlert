// API 관련 상수
export const API_BASE_URL = 'http://localhost:4000/api';
export const API_TIMEOUT = 10000;

// 지도 관련 상수
export const MAP_DEFAULTS = {
  center: [36.5, 127.5], // 한국 중앙
  zoom: 7,
  minZoom: 6,
  maxZoom: 10
};

// 한국 전체 지도 여백 설정
export const KOREA_EXTENT = {
  minLng: 125.0,
  maxLng: 131.0,
  minLat: 33.0,
  maxLat: 38.5
};

// 시도별 색상 매핑
export const REGION_COLORS = {
  "서울특별시": "#ff9e9e",
  "부산광역시": "#ffbb9e",
  "대구광역시": "#ffe09e",
  "인천광역시": "#fffb9e",
  "광주광역시": "#c6ff9e",
  "대전광역시": "#9effed",
  "울산광역시": "#9eb0ff",
  "세종특별자치시": "#dc9eff",
  "경기도": "#ff9ed4",
  "강원도": "#ffda9e",
  "충청북도": "#cbff9e",
  "충청남도": "#9effcb",
  "전라북도": "#9effe3",
  "전라남도": "#9ed6ff",
  "경상북도": "#c19eff",
  "경상남도": "#ff9ec1",
  "제주특별자치도": "#ffa9a9"
};

// 산불 단계 색상
export const FIRE_LEVEL_COLORS = {
  level3: "#ff4d4d", // 3단계 - 적색(고위험)
  level2: "#ffa500", // 2단계 - 주황색(중위험)
  level1: "#ffff66", // 1단계 - 황색(주의)
  initial: "#cce5ff", // 초기대응 - 하늘색
  default: "#eeeeee" // 기본 - 회색
};
