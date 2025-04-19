/**
 * 범용 캐시 관리 함수
 */
export const createCache = <T>(options: {
  cacheDuration: number;
  versionKey?: string;
  allowStale?: boolean;
}) => {
  const { cacheDuration, versionKey = "cache_timestamp", allowStale = false } = options;

  let cachedData: T | null = null;
  let cacheTimestamp: number | null = null;
  let isStale = false;
  let isFetching = false;

  /**
   * 캐시 버전 확인
   */
  const checkCacheVersion = (): boolean => {
    if (!versionKey) return true;

    try {
      const globalTimestamp = localStorage.getItem(versionKey);

      if (!globalTimestamp) return true;

      if (!cacheTimestamp) return false;

      return cacheTimestamp >= parseInt(globalTimestamp, 10);
    } catch (error) {
      console.warn("캐시 버전 확인 중 오류 발생:", error);
      return true;
    }
  };

  /**
   * 현재 캐시된 데이터가 유효한지 확인
   */
  const isValid = (): boolean => {
    if (!cachedData || !cacheTimestamp) return false;

    const now = Date.now();
    const isExpired = now - cacheTimestamp > cacheDuration;
    const isVersionValid = checkCacheVersion();

    if (isExpired && isVersionValid && allowStale) {
      isStale = true;
      return true;
    }

    if (isExpired || !isVersionValid) {
      return false;
    }

    isStale = false;
    return true;
  };

  /**
   * 캐시가 유효하지만 오래되었는지 확인
   */
  const isStaleCache = (): boolean => {
    return isStale;
  };

  /**
   * 데이터를 캐시에 저장
   */
  const setData = (data: T): void => {
    cachedData = data;
    cacheTimestamp = Date.now();
    isStale = false;
    isFetching = false;
  };

  /**
   * 캐시된 데이터 가져오기
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
   */
  const invalidateGlobalCache = (): void => {
    if (!versionKey) return;

    try {
      localStorage.setItem(versionKey, Date.now().toString());
      clearCache();
    } catch (error) {
      console.warn("전역 캐시 무효화 중 오류 발생:", error);
    }
  };

  /**
   * 데이터 로드 상태 설정
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

  return {
    isValid,
    isStaleCache,
    setData,
    getData,
    clearCache,
    invalidateGlobalCache,
    setFetching,
    isFetchingData,
    getMetadata,
  };
};
