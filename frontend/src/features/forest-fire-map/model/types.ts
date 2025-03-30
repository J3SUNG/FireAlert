import L from 'leaflet';
import { ForestFireData } from '../../../shared/types/forestFire';

/**
 * 산불 지도 컴포넌트 Props
 */
export interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  legendPosition?: L.ControlPosition;
}

/**
 * 화재 마커 관리자 Props
 */
export interface FireMarkerManagerProps {
  map: L.Map | null;
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  isGeoJsonLoaded: boolean;
}

/**
 * 맵 후크 옵션
 */
export interface UseMapOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  legendPosition?: L.ControlPosition;
  options?: Partial<any>; // MAP_INIT_OPTIONS의 타입을 any로 간단히 표현
}

/**
 * 맵 로딩 인디케이터 Props
 */
export interface MapLoadingIndicatorProps {
  isLoading: boolean;
}
