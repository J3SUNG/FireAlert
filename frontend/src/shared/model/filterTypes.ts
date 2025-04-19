/**
 * 산불 필터 타입 열거형
 */
export enum FireFilterType {
  ALL = "all",
  ACTIVE = "active",
  CONTAINED = "contained",
  EXTINGUISHED = "extinguished",
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
