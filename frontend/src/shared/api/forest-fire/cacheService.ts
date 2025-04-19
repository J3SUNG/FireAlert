import { createCache } from "../../lib/cache/cacheUtils";
import { ForestFireData } from "../../model/forestFire";
import { CACHE_DURATION_MS } from "../../constants/api";

/**
 * 캐시 버전 키
 */
export const CACHE_KEYS = {
  FIRE_DATA: "fire_data_version",
  GEO_JSON: "geo_json_version",
};

export const fireDataCache = createCache<ForestFireData[]>({
  cacheDuration: CACHE_DURATION_MS,
  versionKey: CACHE_KEYS.FIRE_DATA,
  allowStale: true,
});

export const geoJsonCache = createCache<any>({
  cacheDuration: 24 * 60 * 60 * 1000,
  versionKey: CACHE_KEYS.GEO_JSON,
  allowStale: false,
});

/**
 * 캐시 관리를 위한 서비스 객체
 */
export const cacheService = {
  /**
   * 산불 데이터 캐시에서 데이터 가져오기
   */
  getFireData(): ForestFireData[] | null {
    return fireDataCache.getData();
  },

  /**
   * 산불 데이터를 캐시에 저장
   */
  setFireData(data: ForestFireData[]): void {
    fireDataCache.setData(data);
  },

  /**
   * 산불 데이터 캐시가 오래되었는지 확인
   */
  isFireDataStale(): boolean {
    return fireDataCache.isStaleCache();
  },

  /**
   * 산불 데이터 캐시의 상태 정보 가져오기
   */
  getFireDataCacheInfo() {
    return fireDataCache.getMetadata();
  },

  /**
   * 데이터 로드 상태 설정
   */
  setFireDataFetching(fetching: boolean): void {
    fireDataCache.setFetching(fetching);
  },

  /**
   * GeoJSON 캐시에서 데이터 가져오기
   */
  getGeoJsonData(): any | null {
    return geoJsonCache.getData();
  },

  /**
   * GeoJSON 데이터를 캐시에 저장
   */
  setGeoJsonData(data: any): void {
    geoJsonCache.setData(data);
  },

  /**
   * 모든 캐시 또는 선택적으로 특정 캐시 초기화
   */
  clearCache(
    options: {
      clearFireData?: boolean;
      clearGeoJson?: boolean;
      globalInvalidation?: boolean;
    } = {}
  ): void {
    const { clearFireData = true, clearGeoJson = false, globalInvalidation = false } = options;

    if (clearFireData) {
      if (globalInvalidation) {
        fireDataCache.invalidateGlobalCache();
      } else {
        fireDataCache.clearCache();
      }
    }

    if (clearGeoJson) {
      if (globalInvalidation) {
        geoJsonCache.invalidateGlobalCache();
      } else {
        geoJsonCache.clearCache();
      }
    }
  },

  /**
   * 마지막 업데이트 시간 포맷팅
   */
  getLastUpdateTime(): string {
    const metadata = fireDataCache.getMetadata();
    if (!metadata.timestamp) return "캐시 정보 없음";

    return new Date(metadata.timestamp).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },
};
