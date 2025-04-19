/**
 * 통합된 에러 코드 정의
 */

export enum GeneralErrorCode {
  UNKNOWN = "GEN-001",
  NETWORK = "GEN-002",
  TIMEOUT = "GEN-003",
  VALIDATION = "GEN-004",
  PERMISSION = "GEN-005",
}

export enum DataErrorCode {
  FETCH_FAILED = "DATA-001",
  PARSE_FAILED = "DATA-002",
  VALIDATION_FAILED = "DATA-003",
  TRANSFORM_FAILED = "DATA-004",
  TIMEOUT = "DATA-005",
  EMPTY_RESPONSE = "DATA-006",
  CACHE_ERROR = "DATA-007",

  FIRE_DATA_FETCH_FAILED = "FIRE-001",
  FIRE_DATA_UPDATE_FAILED = "FIRE-002",
  FIRE_DATA_PARSE_FAILED = "FIRE-003",
}

export enum MapErrorCode {
  CONTAINER_NOT_FOUND = "MAP-001",
  INITIALIZATION_FAILED = "MAP-002",
  MARKER_CREATION_FAILED = "MAP-003",
  MARKER_UPDATE_FAILED = "MAP-004",
  MARKER_REMOVAL_FAILED = "MAP-005",
  EVENT_BINDING_FAILED = "MAP-006",

  GEOJSON_LOAD_FAILED = "GEO-001",
  GEOJSON_PARSE_ERROR = "GEO-002",
  GEOJSON_RENDERING_ERROR = "GEO-003",

  GEOLOCATION_FAILED = "LOC-001",
  BOUNDS_INVALID = "LOC-002",
  PERMISSION_DENIED = "LOC-003",
}

/**
 * 공통 에러 메시지 매핑
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [GeneralErrorCode.UNKNOWN]: "알 수 없는 오류가 발생했습니다.",
  [GeneralErrorCode.NETWORK]: "네트워크 연결에 문제가 발생했습니다.",
  [GeneralErrorCode.TIMEOUT]: "요청 시간이 초과되었습니다.",
  [GeneralErrorCode.VALIDATION]: "데이터 유효성 검증에 실패했습니다.",
  [GeneralErrorCode.PERMISSION]: "필요한 권한이 없습니다.",

  [DataErrorCode.FETCH_FAILED]: "데이터를 가져오는데 실패했습니다.",
  [DataErrorCode.PARSE_FAILED]: "데이터 분석 중 오류가 발생했습니다.",
  [DataErrorCode.VALIDATION_FAILED]: "유효하지 않은 데이터 형식입니다.",
  [DataErrorCode.TRANSFORM_FAILED]: "데이터 변환 중 오류가 발생했습니다.",
  [DataErrorCode.TIMEOUT]: "데이터 요청 시간이 초과되었습니다.",
  [DataErrorCode.EMPTY_RESPONSE]: "받은 데이터가 없습니다.",
  [DataErrorCode.CACHE_ERROR]: "캐시 처리 중 오류가 발생했습니다.",

  [DataErrorCode.FIRE_DATA_FETCH_FAILED]:
    "산불 데이터를 가져오는데 실패했습니다. 네트워크 연결을 확인해주세요.",
  [DataErrorCode.FIRE_DATA_UPDATE_FAILED]:
    "산불 데이터 업데이트에 실패했습니다. 잠시 후 다시 시도해주세요.",
  [DataErrorCode.FIRE_DATA_PARSE_FAILED]:
    "산불 데이터 분석 중 오류가 발생했습니다. 데이터 형식이 올바른지 확인해주세요.",

  [MapErrorCode.CONTAINER_NOT_FOUND]: "지도를 표시할 컨테이너를 찾을 수 없습니다.",
  [MapErrorCode.INITIALIZATION_FAILED]: "지도 초기화에 실패했습니다.",
  [MapErrorCode.MARKER_CREATION_FAILED]: "지도 마커 생성에 실패했습니다.",
  [MapErrorCode.MARKER_UPDATE_FAILED]: "지도 마커 업데이트에 실패했습니다.",
  [MapErrorCode.MARKER_REMOVAL_FAILED]: "지도 마커 제거에 실패했습니다.",
  [MapErrorCode.EVENT_BINDING_FAILED]: "지도 이벤트 바인딩에 실패했습니다.",
  [MapErrorCode.GEOJSON_LOAD_FAILED]: "지도 데이터를 가져오는데 실패했습니다.",
  [MapErrorCode.GEOJSON_PARSE_ERROR]: "지도 데이터 파싱 중 오류가 발생했습니다.",
  [MapErrorCode.GEOJSON_RENDERING_ERROR]: "지도 데이터 렌더링 중 오류가 발생했습니다.",
  [MapErrorCode.GEOLOCATION_FAILED]: "현재 위치를 가져오는데 실패했습니다.",
  [MapErrorCode.BOUNDS_INVALID]: "유효하지 않은 지도 범위입니다.",
  [MapErrorCode.PERMISSION_DENIED]: "위치 정보 권한이 거부되었습니다.",
};

/**
 * 에러 코드로부터 메시지 조회
 */
export function getErrorMessage(code: string, fallback = "오류가 발생했습니다."): string {
  return ERROR_MESSAGES[code] || fallback;
}
