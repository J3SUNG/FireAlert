import { ForestFireData } from "../../model/forestFire";
import { fetchData, handleApiError } from "./apiClient";
import { processForestFireData } from "./dataProcessor";
import { cacheService } from "./cacheService";
import { FIRE_LIST_ENDPOINT } from '../../constants/api';

/**
 * 산불 데이터 서비스
 * 
 * 산불 데이터를 가져오고 관리하는 기능을 제공합니다.
 * 타임스탬프 기반 캐시 무효화 전략을 적용합니다.
 */
export const forestFireService = {
  /**
   * 산불 데이터 가져오기
   * 서버에서 산불 데이터를 가져온 후 처리하여 반환합니다.
   * 캐시 기능을 활용하여 불필요한 API 호출을 줄입니다.
   * 
   * @param {Object} [options={}] 데이터 가져오기 옵션
   * @param {boolean} [options.forceRefresh=false] 캐시 무시 옵션
   * @param {boolean} [options.backgroundRefresh=false] 백그라운드 새로고침 옵션
   * @returns {Promise<ForestFireData[]>} 산불 데이터 배열
   */
  async getForestFires(options: {
    forceRefresh?: boolean;
    backgroundRefresh?: boolean;
  } = {}): Promise<ForestFireData[]> {
    const { forceRefresh = false, backgroundRefresh = false } = options;
    
    // 캐시된 데이터 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cachedData = cacheService.getFireData();
      
      // 데이터가 캐시되어 있고, 백그라운드 새로고침이 아니면 캐시 데이터 반환
      if (cachedData && !backgroundRefresh) {
        // 캐시가 오래되었지만 유효하면 백그라운드에서 새로고침 시도
        if (cacheService.isFireDataStale() && !cacheService.getFireDataCacheInfo().isFetching) {
          this.refreshDataInBackground();
        }
        return cachedData;
      }
    }

    try {
      // 백그라운드 새로고침 시 로딩 상태 설정
      if (backgroundRefresh) {
        cacheService.setFireDataFetching(true);
      }
      
      // API에서 데이터 가져오기
      const data = await fetchData<Record<string, unknown>[]>(FIRE_LIST_ENDPOINT);
      
      // 데이터 처리 및 변환
      const processedData = await processForestFireData(data);

      // 처리된 데이터 캐싱
      cacheService.setFireData(processedData);
      
      return processedData;
    } catch (error) {
      // 로딩 상태 초기화
      if (backgroundRefresh) {
        cacheService.setFireDataFetching(false);
      }
      
      // 에러를 표준화하여 throw
      throw handleApiError(
        error, 
        "산불 데이터를 가져오는 중 오류가 발생했습니다."
      );
    }
  },

  /**
   * 백그라운드에서 데이터 새로고침
   * 사용자 경험을 방해하지 않고 데이터를 업데이트합니다.
   * 
   * @returns {Promise<void>}
   */
  async refreshDataInBackground(): Promise<void> {
    try {
      await this.getForestFires({ backgroundRefresh: true });
    } catch (error) {
      console.warn('백그라운드 데이터 새로고침 실패:', error);
    }
  },

  /**
   * 데이터 캐시 상태 정보 가져오기
   * 
   * @returns 캐시 메타데이터 객체
   */
  getCacheInfo() {
    return {
      ...cacheService.getFireDataCacheInfo(),
      lastUpdateTime: cacheService.getLastUpdateTime()
    };
  },

  /**
   * 캐시 초기화
   * 산불 데이터 와 GeoJSON 캐시를 제거하여 다음 호출 시 새로운 데이터를 가져오도록 합니다.
   * 
   * @param {Object} [options={}] 캐시 초기화 옵션
   * @param {boolean} [options.clearGeoJson=false] GeoJSON 캐시도 초기화할지 여부
   * @param {boolean} [options.globalInvalidation=false] 전역 캐시 무효화 여부
   */
  clearCache(options: {
    clearGeoJson?: boolean;
    globalInvalidation?: boolean;
  } = {}): void {
    const { clearGeoJson = false, globalInvalidation = false } = options;
    
    cacheService.clearCache({
      clearFireData: true,
      clearGeoJson,
      globalInvalidation
    });
  },
};