import L from "leaflet";

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
  provinces: "/assets/map/gadm41_KOR_1.json",
  districts: "/assets/map/gadm41_KOR_2.json",
};

/**
 * 지도 경계 스타일 시스템
 * - 모든 시도/시군구 경계 스타일을 중앙 관리하기 위한 모듈
 * - CSS 정의 대신 JavaScript 객체로 통합 관리
 */
export const createGeoJsonStyles = () => {
  // 공통 기본 스타일 (모든 경계선에 적용될 기본 스타일)
  const baseGeoBoundaryStyle: L.PathOptions = {
    dashArray: "",
    lineCap: "butt" as L.LineCapShape,
    lineJoin: "miter" as L.LineJoinShape,
    opacity: 1.0,
    interactive: false, // 마우스 이벤트 처리하지 않음
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

  // 확대 레벨에 따른 시군구 스타일 생성 함수
  const getDistrictStyleByZoom = (zoom: number): L.PathOptions => {
    // 기본 시군구 스타일에 확대 레벨별 스타일 적용
    if (zoom >= 9) {
      return {
        ...districtStyle,
        weight: 1, // 높은 줌 레벨에서 1px 두께 유지
      };
    } else if (zoom >= 8) {
      return {
        ...districtStyle,
        weight: 1, // 중간 줌 레벨에서 1px 두께 유지
      };
    } else {
      return {
        ...districtStyle, // 낮은 줌 레벨에서 기본 스타일 사용
      };
    }
  };

  // SVG 경계선 스타일 직접 설정 함수 - DOM 직접 조작 대신 중앙화
  const applyDistrictSvgStyle = (path: SVGPathElement): void => {
    if (!path || !path.classList) return;

    // 모든 district 클래스가 있는 경로에 동일한 스타일 적용
    if (!path.classList.contains("province-boundary")) {
      path.classList.add("district-boundary");
      // 시군구 경계선 스타일 직접 적용
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

  // 시도 경계선 SVG 스타일 적용 함수
  const applyProvinceSvgStyle = (path: SVGPathElement): void => {
    if (!path || !path.classList) return;

    path.classList.add("province-boundary");
    // 시도 경계선 스타일 직접 적용
    path.setAttribute("stroke", provinceStyle.color || "#ffffff");
    path.setAttribute("stroke-width", String(provinceStyle.weight || 3.5));
    path.setAttribute("stroke-opacity", String(provinceStyle.opacity || 1));
    path.setAttribute("fill", provinceStyle.fillColor || "#e0f2fe");
    path.setAttribute("fill-opacity", String(provinceStyle.fillOpacity || 0.85));
    path.setAttribute("filter", "none");
    path.setAttribute("pointer-events", "none");
  };

  // 강제 시군구 스타일 적용 함수 (일관된 스타일 유지를 위해 사용)
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