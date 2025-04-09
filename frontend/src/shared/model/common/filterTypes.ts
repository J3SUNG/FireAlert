/**
 * 산불 필터 타입
 * 산불 상태별 필터링을 위한 타입 정의
 */
export type FireFilterType = "all" | "active" | "contained" | "extinguished";

/**
 * 필터 버튼 레이블 타입
 */
export interface FilterType {
  /** 모든 산불 레이블 */
  all: string;
  /** 진행 중인 산불 레이블 */
  active: string;
  /** 진화 중인 산불 레이블 */
  contained: string;
  /** 진화 완료된 산불 레이블 */
  extinguished: string;
}
