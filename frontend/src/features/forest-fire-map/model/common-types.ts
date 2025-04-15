import type { Map, ControlPosition } from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 산불 지도 컴포넌트 Props
 */
export interface ForestFireMapProps {
  fires: ForestFireData[];              // 표시할 산불 데이터 배열
  selectedFireId?: string;              // 선택된 산불 ID
  onFireSelect?: (fire: ForestFireData) => void;  // 산불 선택 핸들러
  legendPosition?: ControlPosition;   // 범례 위치
}

/**
 * 화재 마커 관리자 Props
 */
export interface FireMarkerManagerProps {
  map: Map | null;                    // 지도 인스턴스
  fires: ForestFireData[];              // 표시할 산불 데이터 배열
  selectedFireId?: string;              // 선택된 산불 ID
  onFireSelect?: (fire: ForestFireData) => void;  // 산불 선택 핸들러
  isGeoJsonLoaded: boolean;             // GeoJSON 로드 완료 여부
}

/**
 * 맵 후크 옵션
 */
export interface UseMapOptions {
  containerRef: React.RefObject<HTMLDivElement>;  // 지도 컨테이너 참조
  legendPosition?: ControlPosition;   // 범례 위치
  options?: Partial<any>;               // 지도 초기화 옵션
  fires?: ForestFireData[];             // 표시할 산불 데이터 배열
}
