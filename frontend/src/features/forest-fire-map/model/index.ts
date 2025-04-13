/**
 * 지도 슬라이스 모델 세그먼트 공개 API
 * 
 * 지도 관련 타입과 설정을 정의합니다.
 * 이 모듈은 feature 내부에서 사용하는 타입들을 내보냅니다.
 */

// 필요한 타입들만 선택적으로 내보내기
import {
  ForestFireMapProps,
  MapConfig,
  MarkerOptions,
  MarkerRef,
  MarkerEventHandlers,
  GeoJsonLayerConfig
} from "./types";

// 설정 값
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  MAP_TILE_LAYER,
  GEOJSON_PATHS
} from "./mapSettings";

// 지역 위치 데이터
import {
  PROVINCE_COORDINATES
} from "./provinceLocations";

// 에러 관련
import {
  createMapInitializationError,
  createGeoJsonLoadError,
  createMarkerCreationError
} from "./mapErrorTypes";

// 타입 내보내기
export type {
  ForestFireMapProps,
  MapConfig,
  MarkerOptions,
  MarkerRef,
  MarkerEventHandlers,
  GeoJsonLayerConfig
};

// 설정 상수 내보내기
export {
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  MAP_TILE_LAYER,
  GEOJSON_PATHS,
  PROVINCE_COORDINATES
};

// 에러 유틸리티 내보내기
export {
  createMapInitializationError,
  createGeoJsonLoadError,
  createMarkerCreationError
};
