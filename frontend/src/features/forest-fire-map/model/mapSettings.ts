import L from "leaflet";

/**
 * 지도 기본 중심점
 * 한국 중심점 좌표
 */
export const DEFAULT_MAP_CENTER: L.LatLngExpression = [36.0, 127.7];

/**
 * 지도 기본 줌 레벨
 */
export const DEFAULT_ZOOM = 7;

/**
 * 지도 타일 레이어 URL
 * 기본 배경 지도로 사용할 OpenStreetMap 타일 URL
 */
export const MAP_TILE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * 지도 초기 설정
 * 한국 중심의 지도를 위한 기본 설정값
 */
export const MAP_INIT_OPTIONS = {
  center: DEFAULT_MAP_CENTER, // 한국 중심점
  zoom: DEFAULT_ZOOM,
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: true,
  zoomSnap: 0.1,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 120,
  minZoom: 6.5,
  maxZoom: 12,
};

/**
 * 한국의 지도 경계
 * 한국 전체를 포함하는 지도 범위
 */
export const KOREA_BOUNDS = {
  southWest: L.latLng(33.0, 124.5),
  northEast: L.latLng(38.7, 131.0),
};

/**
 * GeoJSON 파일 경로
 * 행정구역 경계 데이터 파일 경로
 */
export const GEOJSON_PATHS = {
  provinces: "/assets/map/gadm41_KOR_1.json",
  districts: "/assets/map/gadm41_KOR_2.json",
};

/**
 * 지도 경계 스타일 시스템
 * 
 * 시도/시군구 경계선과 영역의 스타일을 중앙에서 관리
 */
export const createGeoJsonStyles = () => {
  // 공통 기본 스타일
  const baseGeoBoundaryStyle: L.PathOptions = {
    dashArray: "",
    lineCap: "butt" as L.LineCapShape,
    lineJoin: "miter" as L.LineJoinShape,
    opacity: 1.0,
    interactive: false, // 마우스 이벤트 비활성화
  };

  // 시도 스타일
  const provinceStyle: L.PathOptions = {
    ...baseGeoBoundaryStyle,
    color: "#ffffff", // 하양색 경계선
    weight: 3.5, // 시도 경계선 두께
    fillColor: "#e0f2fe", // 시도 지역 배경색 - 연한 파란색
    fillOpacity: 0.85, // 배경색 불투명도
    className: "province-path",
    renderer: new L.SVG({ padding: 0 }), // 패딩 없는 SVG 렌더러
  };

  // 시군구 스타일
  const districtStyle: L.PathOptions = {
    ...baseGeoBoundaryStyle,
    color: "#ffffff", // 하양색
    weight: 1, // 가는 선
    fillColor: "transparent",
    fillOpacity: 0,
    className: "district-path",
    renderer: new L.SVG({ padding: 0 }), // 패딩 없는 SVG 렌더러
  };

  // 확대 레벨에 따른 시군구 스타일 생성
  const getDistrictStyleByZoom = (zoom: number): L.PathOptions => {
    // 줌 레벨에 따른 스타일 변경
    if (zoom >= 9) {
      return {
        ...districtStyle,
        weight: 1, // 높은 줌 레벨에서 1px
      };
    } else if (zoom >= 8) {
      return {
        ...districtStyle,
        weight: 1, // 중간 줌 레벨에서 1px
      };
    } else {
      return {
        ...districtStyle, // 낮은 줌 레벨에서 기본
      };
    }
  };

  // SVG 경계선 스타일 직접 설정
  const applyDistrictSvgStyle = (path: SVGPathElement): void => {
    if (!path || !path.classList) return;

    if (!path.classList.contains("province-boundary")) {
      path.classList.add("district-boundary");
      path.setAttribute("stroke", districtStyle.color || "#ffffff");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("stroke-opacity", String(districtStyle.opacity || 1));
      path.setAttribute("fill-opacity", "0");
      path.setAttribute("stroke-linecap", "butt");
      path.setAttribute("stroke-linejoin", "miter");
      path.setAttribute("filter", "none");
      path.setAttribute("pointer-events", "none");
    }
  };

  // 시도 경계선 SVG 스타일 적용
  const applyProvinceSvgStyle = (path: SVGPathElement): void => {
    if (!path || !path.classList) return;

    path.classList.add("province-boundary");
    path.setAttribute("stroke", provinceStyle.color || "#ffffff");
    path.setAttribute("stroke-width", String(provinceStyle.weight || 3.5));
    path.setAttribute("stroke-opacity", String(provinceStyle.opacity || 1));
    path.setAttribute("fill", provinceStyle.fillColor || "#e0f2fe");
    path.setAttribute("fill-opacity", String(provinceStyle.fillOpacity || 0.85));
    path.setAttribute("filter", "none");
    path.setAttribute("pointer-events", "none");
  };

  // 강제 시군구 스타일 적용 (일관성 유지)
  const forceApplyDistrictStyle = (layer: L.GeoJSON | null, map: L.Map | null): void => {
    if (!layer || !map || !map.hasLayer(layer)) return;

    // 레이어에 스타일 적용
    layer.setStyle(districtStyle);

    // SVG 엘리먼트에 직접 스타일 적용
    try {
      const mapContainer = map.getContainer();
      if (!mapContainer) return;

      const mapSvg = mapContainer.querySelector("svg");
      if (!mapSvg) return;

      const paths = mapSvg.querySelectorAll("path.district-path, path.district-boundary");
      paths.forEach((path) => {
        applyDistrictSvgStyle(path as SVGPathElement);
      });
    } catch (error) {
      console.error("시군구 스타일 강제 적용 오류:", error);
    }
  };

  return {
    provinceStyle,
    districtStyle,
    getDistrictStyleByZoom,
    applyDistrictSvgStyle,
    applyProvinceSvgStyle,
    forceApplyDistrictStyle,
  };
};

// 스타일 시스템 초기화 및 내보내기
export const geoJsonStyles = createGeoJsonStyles();

// 중앙 스타일 설정 - 외부에서 사용할 스타일
export const PROVINCES_STYLE = geoJsonStyles.provinceStyle;
export const DISTRICTS_STYLE = geoJsonStyles.districtStyle;

/**
 * 심각도별 마커 크기
 * 산불의 심각도에 따른 마커 사이즈 정의
 */
export const MARKER_SIZES = {
  critical: 28,
  high: 25,
  medium: 22,
  low: 20,
};

/**
 * 상태별 텍스트
 * 산불 상태에 대한 한글 표시 텍스트
 */
export const STATUS_TEXT = {
  active: "진행중",
  contained: "통제중",
  extinguished: "진화완료",
};

/**
 * 심각도별 텍스트
 * 산불 위험도에 대한 한글 표시 텍스트
 */
export const SEVERITY_TEXT = {
  critical: "심각",
  high: "높음",
  medium: "중간",
  low: "낮음",
};

/**
 * 지도 배경색
 * 지도 컨테이너의 기본 배경색
 */
export const MAP_BACKGROUND_COLOR = "#bae6fd";