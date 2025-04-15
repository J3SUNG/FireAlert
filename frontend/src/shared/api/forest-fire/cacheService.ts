import { createCache } from "../../lib/cache/cacheUtils";
import { ForestFireData } from "../../model/forestFire";
import { CACHE_DURATION_MS } from '../../constants/api';

/** 
 * 캐시 관리자 인스턴스 생성
 * 산불 데이터와 GeoJSON 데이터를 위한 별도의 캐시를 생성합니다.
 */
export const fireDataCache = createCache<ForestFireData[]>(CACHE_DURATION_MS);

// GeoJSON 데이터는 변화가 적으므로 더 긴 캐시 기간 사용
export const geoJsonCache = createCache<any>(24 * 60 * 60 * 1000); // 24시간 캐시

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
   */
  clearCache(options: { clearFireData?: boolean; clearGeoJson?: boolean } = {}): void {
    const { clearFireData = true, clearGeoJson = false } = options;
    
    if (clearFireData) {
      fireDataCache.clearCache();
    }
    
    if (clearGeoJson) {
      geoJsonCache.clearCache();
    }
  }
};
