import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 산불 데이터 관리 상태 인터페이스
 *
 * 앱 전체에서 사용하는 산불 데이터의 상태를 정의합니다.
 */
export interface ForestFireDataState {
  fires: ForestFireData[];
  loading: boolean;
  error: string | null;
  statusCounts: {
    active: number;
    contained: number;
    extinguished: number;
    all: number;
  };
  responseLevelCounts: {
    level1: number;
    level2: number;
    level3: number;
    initial: number;
  };
}
