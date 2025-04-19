import type { Map, ControlPosition } from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 산불 지도 컴포넌트 Props
 */
export interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  legendPosition?: ControlPosition;
}

/**
 * 화재 마커 관리자 Props
 */
export interface FireMarkerManagerProps {
  map: Map | null;
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
  legendPosition?: ControlPosition;
  options?: Partial<any>;
  fires?: ForestFireData[];
}
