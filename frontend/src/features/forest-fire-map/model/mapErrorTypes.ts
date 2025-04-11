import { ErrorCategory, ErrorSeverity, AppError, ErrorType } from "../../../shared/errors";

/**
 * 지도 특화 에러 카테고리
 */
export enum MapErrorCategory {
  MAP_INITIALIZATION = "map_initialization",
  MAP_INTERACTION = "map_interaction",
  GEOJSON_LOADING = "geojson_loading",
  MARKER_CREATION = "marker_creation",
  MARKER_UPDATE = "marker_update",
}

/**
 * 지도 에러 코드
 */
export enum MapErrorCode {
  // 초기화 관련 에러
  CONTAINER_NOT_FOUND = "MAP001",
  INITIALIZATION_FAILED = "MAP002",

  // GeoJSON 관련 에러
  GEOJSON_FETCH_FAILED = "GEO001",
  GEOJSON_PARSE_ERROR = "GEO002",
  GEOJSON_RENDERING_ERROR = "GEO003",

  // 마커 관련 에러
  MARKER_CREATION_FAILED = "MRK001",
  MARKER_UPDATE_FAILED = "MRK002",
  MARKER_REMOVAL_FAILED = "MRK003",

  // 상호작용 관련 에러
  EVENT_BINDING_FAILED = "EVT001",
}

/**
 * 지도 에러 메시지 매핑
 */
export const MAP_ERROR_MESSAGES: Record<MapErrorCode, string> = {
  [MapErrorCode.CONTAINER_NOT_FOUND]: "지도를 표시할 컨테이너를 찾을 수 없습니다.",
  [MapErrorCode.INITIALIZATION_FAILED]: "지도 초기화에 실패했습니다.",

  [MapErrorCode.GEOJSON_FETCH_FAILED]: "지도 데이터를 가져오는데 실패했습니다.",
  [MapErrorCode.GEOJSON_PARSE_ERROR]: "지도 데이터 파싱 중 오류가 발생했습니다.",
  [MapErrorCode.GEOJSON_RENDERING_ERROR]: "지도 데이터 렌더링 중 오류가 발생했습니다.",

  [MapErrorCode.MARKER_CREATION_FAILED]: "지도 마커 생성에 실패했습니다.",
  [MapErrorCode.MARKER_UPDATE_FAILED]: "지도 마커 업데이트에 실패했습니다.",
  [MapErrorCode.MARKER_REMOVAL_FAILED]: "지도 마커 제거에 실패했습니다.",

  [MapErrorCode.EVENT_BINDING_FAILED]: "지도 이벤트 바인딩에 실패했습니다.",
};

/**
 * 지도 특화 에러 생성 함수
 *
 * 에러 코드를 기반으로 구조화된 에러 객체 생성
 */
export function createMapError(
  code: MapErrorCode,
  originalError?: Error,
  additionalInfo?: string
): AppError {
  const baseMessage = MAP_ERROR_MESSAGES[code] || "지도 작업 중 오류가 발생했습니다.";
  const message = additionalInfo ? `${baseMessage} ${additionalInfo}` : baseMessage;

  // 코드 접두사로 에러 카테고리 결정
  let category: ErrorCategory = ErrorCategory.GENERAL;
  let mapCategory: MapErrorCategory = MapErrorCategory.MAP_INITIALIZATION;

  if (code.startsWith("MAP")) {
    category = ErrorCategory.UI;
    mapCategory = MapErrorCategory.MAP_INITIALIZATION;
  } else if (code.startsWith("GEO")) {
    category = ErrorCategory.DATA;
    mapCategory = MapErrorCategory.GEOJSON_LOADING;
  } else if (code.startsWith("MRK")) {
    category = ErrorCategory.UI;
    mapCategory =
      code === MapErrorCode.MARKER_UPDATE_FAILED
        ? MapErrorCategory.MARKER_UPDATE
        : MapErrorCategory.MARKER_CREATION;
  } else if (code.startsWith("EVT")) {
    category = ErrorCategory.UI;
    mapCategory = MapErrorCategory.MAP_INTERACTION;
  }

  return {
    message,
    type: ErrorType.MAP_LOAD_FAILED, // 추가: 필수 type 속성
    severity: ErrorSeverity.ERROR,
    category,
    code,
    originalError,
    context: {
      feature: "forest-fire-map",
      timestamp: Date.now(),
      params: {
        mapCategory,
      },
    },
    options: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true
    },
    timestamp: Date.now()
  };
}