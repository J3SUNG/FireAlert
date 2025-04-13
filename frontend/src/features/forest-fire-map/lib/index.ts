/**
 * 지도 슬라이스 라이브러리 세그먼트 공개 API
 * 
 * 지도 관련 유틸리티 함수와 훅을 제공합니다.
 * 이 모듈은 주로 feature 내부에서 사용하지만,
 * 일부 핵심 기능은 feature 외부에서도 사용할 수 있습니다.
 */

// 핵심 지도 훅
import { useMap } from "./useMap";
import { useLeafletMap } from "./useLeafletMap";

// 마커 관련 훅
import { useMarkerManager } from "./useMarkerManager";
import { useMarkerCreation } from "./useMarkerCreation";
import { useMarkerState } from "./useMarkerState";

// GeoJSON 관련 훅
import { useGeoJsonManager } from "./useGeoJsonManager";
import { useGeoJsonLayers } from "./useGeoJsonLayers";
import { useGeoJsonState } from "./useGeoJsonState";

// 지도 초기화 관련 훅
import { useMapInitialization } from "./hooks/useMapInitialization";

// 에러 처리 훅
import { useMapErrorHandling } from "./useMapErrorHandling";

// 유틸리티 함수
import { createFireMarker } from "./markerUtils";

// 서비스 함수 (중요한 것만 선택)
import {
  initializeLeafletMap,
  destroyLeafletMap,
  setMapView,
  addMarker,
  removeMarker,
  loadGeoJson,
  removeGeoJson
} from "./LeafletMapService";

// 핵심 지도 훅 내보내기
export {
  useMap,
  useLeafletMap
};

// 마커 관련 훅 내보내기
export {
  useMarkerManager,
  useMarkerCreation,
  useMarkerState
};

// GeoJSON 관련 훅 내보내기
export {
  useGeoJsonManager,
  useGeoJsonLayers,
  useGeoJsonState
};

// 지도 초기화 훅 내보내기
export {
  useMapInitialization
};

// 에러 처리 훅 내보내기
export {
  useMapErrorHandling
};

// 유틸리티 함수 내보내기
export {
  createFireMarker
};

// 주요 서비스 함수 내보내기
export {
  initializeLeafletMap,
  destroyLeafletMap,
  setMapView,
  addMarker,
  removeMarker,
  loadGeoJson,
  removeGeoJson
};
