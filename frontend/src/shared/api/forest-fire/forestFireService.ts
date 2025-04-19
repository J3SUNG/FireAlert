import { ForestFireData } from "../../model/forestFire";
import { fetchData, handleApiError } from "./apiClient";
import { processForestFireData } from "./dataProcessor";
import { cacheService } from "./cacheService";
import { FIRE_LIST_ENDPOINT } from "../../constants/api";

/**
 * 산불 데이터 서비스
 */
export const forestFireService = {
  /**
   * 산불 데이터 가져오기
   */
  async getForestFires(
    options: {
      forceRefresh?: boolean;
      backgroundRefresh?: boolean;
    } = {}
  ): Promise<ForestFireData[]> {
    const { forceRefresh = false, backgroundRefresh = false } = options;

    if (!forceRefresh) {
      const cachedData = cacheService.getFireData();

      if (cachedData && !backgroundRefresh) {
        if (cacheService.isFireDataStale() && !cacheService.getFireDataCacheInfo().isFetching) {
          this.refreshDataInBackground();
        }
        return cachedData;
      }
    }

    try {
      if (backgroundRefresh) {
        cacheService.setFireDataFetching(true);
      }

      const data = await fetchData<Record<string, unknown>[]>(FIRE_LIST_ENDPOINT);

      const processedData = await processForestFireData(data);

      cacheService.setFireData(processedData);

      return processedData;
    } catch (error) {
      if (backgroundRefresh) {
        cacheService.setFireDataFetching(false);
      }

      throw handleApiError(error, "산불 데이터를 가져오는 중 오류가 발생했습니다.");
    }
  },

  /**
   * 백그라운드에서 데이터 새로고침
   */
  async refreshDataInBackground(): Promise<void> {
    try {
      await this.getForestFires({ backgroundRefresh: true });
    } catch (error) {
      console.warn("백그라운드 데이터 새로고침 실패:", error);
    }
  },

  /**
   * 데이터 캐시 상태 정보 가져오기
   */
  getCacheInfo() {
    return {
      ...cacheService.getFireDataCacheInfo(),
      lastUpdateTime: cacheService.getLastUpdateTime(),
    };
  },

  /**
   * 캐시 초기화
   */
  clearCache(
    options: {
      clearGeoJson?: boolean;
      globalInvalidation?: boolean;
    } = {}
  ): void {
    const { clearGeoJson = false, globalInvalidation = false } = options;

    cacheService.clearCache({
      clearFireData: true,
      clearGeoJson,
      globalInvalidation,
    });
  },
};
