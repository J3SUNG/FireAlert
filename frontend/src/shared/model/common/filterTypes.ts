/**
 * 필터 관련 타입 정의
 * 
 * 산불 데이터 필터링에 필요한 타입들을 정의합니다.
 */

/**
 * 산불 필터 타입 열거형
 */
export enum FireFilterType {
  ALL = "all",
  ACTIVE = "active",
  CONTAINED = "contained",
  EXTINGUISHED = "extinguished"
}

/**
 * 필터 버튼 레이블 타입
 */
export interface FilterType {
  all: string;
  active: string;
  contained: string;
  extinguished: string;
}
