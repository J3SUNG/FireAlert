import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 산불 데이터 상태 인터페이스
 * 앱 전체에서 사용하는 산불 데이터의 상태를 정의합니다
 */
export interface ForestFireDataState {
  fires: ForestFireData[];          // 산불 데이터 목록
  loading: boolean;                // 로딩 상태
  error: string | null;            // 에러 메시지
  statusCounts: {                  // 상태별 개수
    active: number;                // 진행중인 산불 개수
    contained: number;             // 통제중인 산불 개수
    extinguished: number;          // 진화완료된 산불 개수
    all: number;                   // 전체 산불 개수
  };
  responseLevelCounts: {           // 대응 단계별 개수
    level1: number;                // 1단계 대응 산불 개수
    level2: number;                // 2단계 대응 산불 개수
    level3: number;                // 3단계 대응 산불 개수
    initial: number;               // 초기 대응 산불 개수
  };
}
