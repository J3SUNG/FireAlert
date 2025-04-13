/**
 * 공통 모델 세그먼트 공개 API
 *
 * 프로젝트 전체에서 사용하는 공통 타입을 정의합니다.
 * 필요한 타입만 선택적으로 내보냅니다.
 */

// 산불 데이터 모델
import type {
  ForestFireData,
  ForestFireStatus,
  ResponseLevel,
  ForestFireLocation,
  ForestFireCoordinates,
  ForestFireStats
} from "./forestFire";

// GeoJSON 데이터 모델
import type {
  GeoJsonData,
  GeoJsonFeature,
  GeoJsonProperties
} from "./geoJson";

// 산불 데이터 타입 내보내기
export type {
  ForestFireData,
  ForestFireStatus,
  ResponseLevel,
  ForestFireLocation,
  ForestFireCoordinates,
  ForestFireStats
};

// GeoJSON 데이터 타입 내보내기
export type {
  GeoJsonData,
  GeoJsonFeature,
  GeoJsonProperties
};
