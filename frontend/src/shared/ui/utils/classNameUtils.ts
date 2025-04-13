/**
 * 클래스명 유틸리티 - 여러 클래스를 병합
 * @param classes 결합할 클래스명의 배열 (undefined나 falsy 값은 무시됨)
 * @returns 병합된 클래스명 문자열
 */
export const combineClasses = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(" ");
};
