import { ErrorCategory, ErrorSeverity, AppError, ErrorType } from "../../../shared/lib/errors";
import { MapErrorCode, getErrorMessage } from "../../../shared/lib/errors/errorCodes";

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
 * 산불 지도 특화 에러 메시지 (feature별 특화 메시지가 필요한 경우)
 */
export const FOREST_FIRE_MAP_MESSAGES: Record<string, string> = {
  [MapErrorCode.INITIALIZATION_FAILED]:
    "산불 지도 초기화에 실패했습니다. 페이지를 새로고침 해보세요.",
  [MapErrorCode.GEOJSON_LOAD_FAILED]: "산불 발생 지역 경계 데이터를 불러오는데 실패했습니다.",
};

/**
 * 산불 지도 feature 특화 에러 생성 함수
 *
 * 산불 지도 슬라이스에 특화된 에러 컨텍스트를 포함합니다
 */
export function createForestFireMapError(
  code: MapErrorCode,
  originalError?: Error,
  additionalInfo?: string
): AppError {
  // feature 특화 메시지 또는 공통 메시지 사용
  const baseMessage = FOREST_FIRE_MAP_MESSAGES[code] || getErrorMessage(code);
  const message = additionalInfo ? `${baseMessage} ${additionalInfo}` : baseMessage;

  // 에러 유형에 따라 카테고리와 타입 분류
  const category: ErrorCategory = ErrorCategory.MAP;
  const type: ErrorType = ErrorType.MAP_LOAD_FAILED;
  let mapCategory: MapErrorCategory = MapErrorCategory.MAP_INITIALIZATION;

  // 코드 접두사로 에러 카테고리 결정
  if (code.startsWith("MAP-")) {
    mapCategory = MapErrorCategory.MAP_INITIALIZATION;
  } else if (code.startsWith("GEO-")) {
    mapCategory = MapErrorCategory.GEOJSON_LOADING;
  } else if (
    code === MapErrorCode.MARKER_CREATION_FAILED ||
    code === MapErrorCode.MARKER_UPDATE_FAILED
  ) {
    mapCategory =
      code === MapErrorCode.MARKER_UPDATE_FAILED
        ? MapErrorCategory.MARKER_UPDATE
        : MapErrorCategory.MARKER_CREATION;
  } else if (code === MapErrorCode.EVENT_BINDING_FAILED) {
    mapCategory = MapErrorCategory.MAP_INTERACTION;
  }

  return {
    message,
    type,
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
      log: true,
    },
    timestamp: Date.now(),
  };
}

/**
 * 지도 초기화 실패 에러 생성 함수
 *
 * 산불 지도 초기화에 실패했을 때 사용
 */
export function createMapInitializationError(
  originalError?: Error,
  additionalInfo?: string
): AppError {
  return createForestFireMapError(
    MapErrorCode.INITIALIZATION_FAILED,
    originalError,
    additionalInfo
  );
}

/**
 * GeoJSON 로드 실패 에러 생성 함수
 *
 * 지역 경계 데이터 로드에 실패했을 때 사용
 */
export function createGeoJsonLoadError(originalError?: Error, additionalInfo?: string): AppError {
  return createForestFireMapError(MapErrorCode.GEOJSON_LOAD_FAILED, originalError, additionalInfo);
}

/**
 * 마커 생성 실패 에러 생성 함수
 *
 * 산불 마커 생성에 실패했을 때 사용
 */
export function createMarkerCreationError(
  originalError?: Error,
  additionalInfo?: string
): AppError {
  return createForestFireMapError(
    MapErrorCode.MARKER_CREATION_FAILED,
    originalError,
    additionalInfo
  );
}
