/**
 * 산불 필터 타입
 */
export type FireFilterType = "all" | "active" | "contained" | "extinguished";

/**
 * 필터 버튼 레이블 타입
 */
export interface FilterType {
  all: string;          // 모든 산불 레이블
  active: string;       // 진행 중인 산불 레이블
  contained: string;    // 통제 중인 산불 레이블
  extinguished: string; // 진화 완료된 산불 레이블
}
