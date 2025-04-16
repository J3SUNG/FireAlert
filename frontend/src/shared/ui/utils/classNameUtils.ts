/**
 * 클래스명 유틸리티 - 여러 클래스를 병합
 * 
 * 여러 클래스를 하나의 문자열로 합치는 함수입니다.
 * 조건부 클래스를 쉽게 추가할 수 있으며, falsy 값은 자동으로 필터링됩니다.
 * 
 * @param classes 결합할 클래스명의 배열 (undefined나 falsy 값은 무시됨)
 * @returns 병합된 클래스명 문자열
 * 
 * @example
 * // "btn btn--primary is-active"
 * combineClasses("btn", "btn--primary", isActive && "is-active", null);
 */
export const combineClasses = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(" ");
};
