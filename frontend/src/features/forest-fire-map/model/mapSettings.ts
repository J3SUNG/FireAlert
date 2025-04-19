import L from "leaflet";

/**
 * 지도 기본 중심점
 */
export const DEFAULT_MAP_CENTER: L.LatLngExpression = [36.0, 127.7];

/**
 * 지도 기본 줌 레벨
 */
export const DEFAULT_ZOOM = 7;

/**
 * 지도 타일 레이어 URL
 */
export const MAP_TILE_LAYER = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * 지도 초기 설정
 */
export const MAP_INIT_OPTIONS = {
  center: DEFAULT_MAP_CENTER,
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
 */
export const KOREA_BOUNDS = {
  southWest: L.latLng(33.0, 124.5),
  northEast: L.latLng(38.7, 131.0),
};

/**
 * GeoJSON 파일 경로
 */
export const GEOJSON_PATHS = {
  provinces: "/assets/map/gadm41_KOR_1.json",
  districts: "/assets/map/gadm41_KOR_2.json",
};

/**
 * 지도 경계 스타일 시스템
 */
export const createGeoJsonStyles = () => {
  const baseGeoBoundaryStyle: L.PathOptions = {
    dashArray: "",
    lineCap: "butt" as L.LineCapShape,
    lineJoin: "miter" as L.LineJoinShape,
    opacity: 1.0,
    interactive: false,
  };

  const provinceStyle: L.PathOptions = {
    ...baseGeoBoundaryStyle,
    color: "#ffffff",
    weight: 3.5,
    fillColor: "#e0f2fe",
    fillOpacity: 0.85,
    className: "province-path",
    renderer: new L.SVG({ padding: 0 }),
  };

  const districtStyle: L.PathOptions = {
    ...baseGeoBoundaryStyle,
    color: "#ffffff",
    weight: 1,
    fillColor: "transparent",
    fillOpacity: 0,
    className: "district-path",
    renderer: new L.SVG({ padding: 0 }),
  };

  const getDistrictStyleByZoom = (zoom: number): L.PathOptions => {
    if (zoom >= 9) {
      return {
        ...districtStyle,
        weight: 1,
      };
    } else if (zoom >= 8) {
      return {
        ...districtStyle,
        weight: 1,
      };
    } else {
      return {
        ...districtStyle,
      };
    }
  };

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

  const forceApplyDistrictStyle = (layer: L.GeoJSON | null, map: L.Map | null): void => {
    if (!layer || !map || !map.hasLayer(layer)) return;

    layer.setStyle(districtStyle);

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

export const geoJsonStyles = createGeoJsonStyles();

export const PROVINCES_STYLE = geoJsonStyles.provinceStyle;
export const DISTRICTS_STYLE = geoJsonStyles.districtStyle;

/**
 * 심각도별 마커 크기
 */
export const MARKER_SIZES = {
  critical: 28,
  high: 25,
  medium: 22,
  low: 20,
};

/**
 * 상태별 텍스트
 */
export const STATUS_TEXT = {
  active: "진행중",
  contained: "통제중",
  extinguished: "진화완료",
};

/**
 * 심각도별 텍스트
 */
export const SEVERITY_TEXT = {
  critical: "심각",
  high: "높음",
  medium: "중간",
  low: "낮음",
};

/**
 * 지도 배경색
 */
export const MAP_BACKGROUND_COLOR = "#bae6fd";
