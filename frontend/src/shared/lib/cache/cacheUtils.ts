/**
 * 범용 캐시 관리 함수
 * 데이터 캐싱을 위한 향상된 함수형 유틸리티입니다.
 * 타임스탬프 기반 무효화 전략을 포함합니다.
 * 
 * @template T 캐시할 데이터 유형
 * @param options 캐시 설정 옵션
 * @returns 캐시 관리 함수들의 객체
 */
export const createCache = <T>(options: {
  cacheDuration: number;  // 캐시 유효 기간 (밀리초)
  versionKey?: string;    // 캐시 버전 키 (로컬 스토리지에 저장될 키)
  allowStale?: boolean;   // 유효 기간이 지났어도 새 데이터를 가져오는 동안 기존 데이터 사용 여부
}) => {
  // 옵션 기본값 설정
  const { 
    cacheDuration,
    versionKey = 'cache_timestamp', 
    allowStale = false 
  } = options;
  
  // 클로저로 캐시 상태 관리
  let cachedData: T | null = null;
  let cacheTimestamp: number | null = null;
  let isStale = false;  // 캐시가 유효기간이 지났지만 아직 사용 가능한 상태
  let isFetching = false; // 현재 데이터를 가져오는 중인지 여부

  /**
   * 캐시 버전 확인
   * 외부에서 캐시 타임스탬프가 변경되었는지 확인
   */
  const checkCacheVersion = (): boolean => {
    if (!versionKey) return true;
    
    try {
      const globalTimestamp = localStorage.getItem(versionKey);
      
      // 글로벌 타임스탬프가 없으면 항상 유효
      if (!globalTimestamp) return true;
      
      // 로컬 캐시 타임스탬프가 없으면 무효
      if (!cacheTimestamp) return false;
      
      // 글로벌 타임스탬프보다 로컬 캐시 타임스탬프가 더 크거나 같으면 유효
      return cacheTimestamp >= parseInt(globalTimestamp, 10);
    } catch (error) {
      // localStorage 접근 오류 시 유효하다고 간주 (개발 환경 등에서 발생 가능)
      console.warn('캐시 버전 확인 중 오류 발생:', error);
      return true;
    }
  };

  /**
   * 현재 캐시된 데이터가 유효한지 확인
   * @returns 캐시가 유효하면 true, 그렇지 않으면 false
   */
  const isValid = (): boolean => {
    if (!cachedData || !cacheTimestamp) return false;
    
    const now = Date.now();
    const isExpired = now - cacheTimestamp > cacheDuration;
    const isVersionValid = checkCacheVersion();
    
    // 만료되었지만 버전이 유효하면 stale 상태로 표시
    if (isExpired && isVersionValid && allowStale) {
      isStale = true;
      return true;
    }
    
    // 만료되었거나 버전이 유효하지 않으면 무효
    if (isExpired || !isVersionValid) {
      return false;
    }
    
    // 만료되지 않았고 버전이 유효하면 신선한 상태
    isStale = false;
    return true;
  };

  /**
   * 캐시가 유효하지만 오래되었는지 확인
   * 백그라운드에서 새로고침이 필요한 경우 true 반환
   */
  const isStaleCache = (): boolean => {
    return isStale;
  };

  /**
   * 데이터를 캐시에 저장
   * @param data 캐시할 데이터
   */
  const setData = (data: T): void => {
    cachedData = data;
    cacheTimestamp = Date.now();
    isStale = false;
    isFetching = false;
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
    isStale = false;
    isFetching = false;
  };

  /**
   * 전역 캐시 무효화
   * 이 함수를 호출하면 해당 versionKey를 사용하는 모든 캐시가 무효화됩니다.
   */
  const invalidateGlobalCache = (): void => {
    if (!versionKey) return;
    
    try {
      localStorage.setItem(versionKey, Date.now().toString());
      clearCache();
    } catch (error) {
      console.warn('전역 캐시 무효화 중 오류 발생:', error);
    }
  };

  /**
   * 데이터 로드 상태 설정
   * 백그라운드 새로고침 시 사용
   */
  const setFetching = (fetching: boolean): void => {
    isFetching = fetching;
  };

  /**
   * 현재 데이터 로드 중인지 여부
   */
  const isFetchingData = (): boolean => {
    return isFetching;
  };

  /**
   * 캐시 메타데이터 가져오기
   */
  const getMetadata = () => {
    return {
      timestamp: cacheTimestamp,
      isStale,
      isFetching,
      isValid: isValid(),
    };
  };

  // 외부에서 사용할 함수들을 객체로 반환
  return {
    isValid,
    isStaleCache,
    setData,
    getData,
    clearCache,
    invalidateGlobalCache,
    setFetching,
    isFetchingData,
    getMetadata
  };
};