import { createCache } from "../../lib/cache/cacheUtils";
import { ForestFireData } from "../../model/forestFire";
import { CACHE_DURATION_MS } from '../../constants/api';

/**
 * 캐시 버전 키 (전역 캐시 관리용)
 */
export const CACHE_KEYS = {
  FIRE_DATA: 'fire_data_version',
  GEO_JSON: 'geo_json_version'
};

/** 
 * 캐시 관리자 인스턴스 생성
 * 산불 데이터와 GeoJSON 데이터를 위한 별도의 캐시를 생성합니다.
 * 타임스탬프 기반 캐시 무효화 전략 적용
 */
export const fireDataCache = createCache<ForestFireData[]>({
  cacheDuration: CACHE_DURATION_MS,
  versionKey: CACHE_KEYS.FIRE_DATA,
  allowStale: true
});

// GeoJSON 데이터는 변화가 적으므로 더 긴 캐시 기간 사용
export const geoJsonCache = createCache<any>({
  cacheDuration: 24 * 60 * 60 * 1000, // 24시간 캐시
  versionKey: CACHE_KEYS.GEO_JSON, 
  allowStale: false
});

/**
 * 캐시 관리를 위한 서비스 객체
 */
export const cacheService = {
  /**
   * 산불 데이터 캐시에서 데이터 가져오기
   * 
   * @returns {ForestFireData[] | null} 캐시된 데이터 또는 null
   */
  getFireData(): ForestFireData[] | null {
    return fireDataCache.getData();
  },

  /**
   * 산불 데이터를 캐시에 저장
   * 
   * @param {ForestFireData[]} data 저장할 데이터
   */
  setFireData(data: ForestFireData[]): void {
    fireDataCache.setData(data);
  },

  /**
   * 산불 데이터 캐시가 오래되었는지 확인
   * 백그라운드 새로고침에 사용
   * 
   * @returns {boolean} 캐시가 오래되었으면 true
   */
  isFireDataStale(): boolean {
    return fireDataCache.isStaleCache();
  },

  /**
   * 산불 데이터 캐시의 상태 정보 가져오기
   * 
   * @returns 캐시 메타데이터 객체
   */
  getFireDataCacheInfo() {
    return fireDataCache.getMetadata();
  },

  /**
   * 데이터 로드 상태 설정
   * 백그라운드 새로고침 시 사용
   */
  setFireDataFetching(fetching: boolean): void {
    fireDataCache.setFetching(fetching);
  },

  /**
   * GeoJSON 캐시에서 데이터 가져오기
   * 
   * @returns {any | null} 캐시된 GeoJSON 데이터 또는 null
   */
  getGeoJsonData(): any | null {
    return geoJsonCache.getData();
  },

  /**
   * GeoJSON 데이터를 캐시에 저장
   * 
   * @param {any} data 저장할 GeoJSON 데이터
   */
  setGeoJsonData(data: any): void {
    geoJsonCache.setData(data);
  },

  /**
   * 모든 캐시 또는 선택적으로 특정 캐시 초기화
   * 
   * @param {Object} options 캐시 초기화 옵션
   * @param {boolean} [options.clearFireData=true] 산불 데이터 캐시 초기화 여부
   * @param {boolean} [options.clearGeoJson=false] GeoJSON 캐시 초기화 여부
   * @param {boolean} [options.globalInvalidation=false] 전역 캐시 무효화 여부
   */
  clearCache(options: { 
    clearFireData?: boolean; 
    clearGeoJson?: boolean;
    globalInvalidation?: boolean;
  } = {}): void {
    const { 
      clearFireData = true, 
      clearGeoJson = false,
      globalInvalidation = false 
    } = options;
    
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
   * 
   * @returns {string} 포맷팅된 시간 또는 '캐시 정보 없음'
   */
  getLastUpdateTime(): string {
    const metadata = fireDataCache.getMetadata();
    if (!metadata.timestamp) return '캐시 정보 없음';
    
    return new Date(metadata.timestamp).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};