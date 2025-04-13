/**
 * 산불 지도 슬라이스 공개 API
 * 
 * 이 슬라이스는 지도 표시와 관련된 기능을 제공합니다.
 * 외부에서 필요한 컴포넌트, 훅, 타입만 선택적으로 내보냅니다.
 */

// UI 컴포넌트
import { ForestFireMap } from "./ui/ForestFireMap";

// 필요한 모델 타입
import { 
  ForestFireMapProps,
  MapConfig,
  MarkerRef,
  GeoJsonLayerConfig
} from "./model/types";

import { 
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  MAP_TILE_LAYER,
  GEOJSON_PATHS
} from "./model/mapSettings";

// 필요한 훅 및 유틸리티
import { 
  useMap, 
  useMarkerManager,
  useGeoJsonManager
} from "./lib";

// UI 컴포넌트 내보내기
export {
  ForestFireMap
};

// 필요한 타입만 내보내기
export type {
  ForestFireMapProps,
  MapConfig,
  MarkerRef,
  GeoJsonLayerConfig
};

// 지도 설정 상수 내보내기
export {
  DEFAULT_MAP_CENTER,
  DEFAULT_ZOOM,
  MAP_TILE_LAYER,
  GEOJSON_PATHS
};

// 핵심 훅만 내보내기
export {
  useMap,
  useMarkerManager,
  useGeoJsonManager
};
