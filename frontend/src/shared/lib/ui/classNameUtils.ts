import { FireFilterType } from "../../model/common/filterTypes";

/**
 * 클래스명 유틸리티 - 여러 클래스를 병합
 * @param classes 결합할 클래스명의 배열 (undefined나 falsy 값은 무시됨)
 * @returns 병합된 클래스명 문자열
 */
export const combineClasses = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 필터 버튼 클래스 생성 유틸리티
 * 상태 필터 종류와 활성화 상태에 따라 클래스 생성
 * 
 * @param filter 필터 유형
 * @param selectedFilter 현재 선택된 필터
 * @returns 적절한 CSS 클래스 문자열
 */
export const getFilterButtonClass = (
  filter: FireFilterType,
  selectedFilter: FireFilterType
): string => {
  const baseClass = "fire-button";
  const isActive = filter === selectedFilter;
  
  if (!isActive) {
    return baseClass;
  }
  
  switch (filter) {
    case "all":
      return `${baseClass} fire-button--active-all`;
    case "active":
      return `${baseClass} fire-button--active-red`;
    case "contained":
      return `${baseClass} fire-button--active-orange`;
    case "extinguished":
      return `${baseClass} fire-button--active-green`;
    default:
      return baseClass;
  }
};

/**
 * 필터 버튼 레이블 생성 유틸리티
 * 
 * @param counts 상태별 카운트
 * @returns 필터별 버튼 레이블 객체
 */
export const getFilterButtonLabels = (counts: {
  total: number;
  active: number;
  contained: number;
  extinguished: number;
}) => ({
  all: `전체 (${counts.total})`,
  active: `진화중 (${counts.active})`,
  contained: `통제중 (${counts.contained})`,
  extinguished: `진화완료 (${counts.extinguished})`,
});
