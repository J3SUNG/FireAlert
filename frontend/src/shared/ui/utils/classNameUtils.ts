/**
 * 클래스명 유틸리티 - 여러 클래스를 병합
 */
export const combineClasses = (...classes: (string | undefined | false | null)[]) => {
  return classes.filter(Boolean).join(" ");
};
