/**
 * 범용 캐시 관리 함수
 * 데이터 캐싱을 위한 함수형 유틸리티입니다.
 * 
 * @template T 캐시할 데이터 유형
 * @param cacheDuration 캐시 유효 기간 (밀리초)
 * @returns 캐시 관리 함수들의 객체
 */
export const createCache = <T>(cacheDuration: number) => {
  // 클로저로 캐시 상태 관리
  let cachedData: T | null = null;
  let cacheTimestamp: number | null = null;

  /**
   * 현재 캐시된 데이터가 유효한지 확인
   * @returns 캐시가 유효하면 true, 그렇지 않으면 false
   */
  const isValid = (): boolean => {
    if (!cachedData || !cacheTimestamp) return false;
    const now = Date.now();
    return now - cacheTimestamp < cacheDuration;
  };

  /**
   * 데이터를 캐시에 저장
   * @param data 캐시할 데이터
   */
  const setData = (data: T): void => {
    cachedData = data;
    cacheTimestamp = Date.now();
  };

  /**
   * 캐시된 데이터 가져오기
   * @returns 캐시된 데이터 또는 null
   */
  const getData = (): T | null => {
    return isValid() ? cachedData : null;
  };

  /**
   * 캐시 초기화
   */
  const clearCache = (): void => {
    cachedData = null;
    cacheTimestamp = null;
  };

  // 외부에서 사용할 함수들을 객체로 반환
  return {
    isValid,
    setData,
    getData,
    clearCache
  };
};
