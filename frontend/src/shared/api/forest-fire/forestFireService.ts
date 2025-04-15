import { ForestFireData } from "../../model/forestFire";
import { fetchData, handleApiError } from "./apiClient";
import { processForestFireData } from "./dataProcessor";
import { cacheService } from "./cacheService";
import { FIRE_LIST_ENDPOINT } from '../../constants/api';

/**
 * 산불 데이터 서비스
 * 
 * 산불 데이터를 가져오고 관리하는 기능을 제공합니다.
 */
export const forestFireService = {
  /**
   * 산불 데이터 가져오기
   * 서버에서 산불 데이터를 가져온 후 처리하여 반환합니다.
   * 캐시 기능을 활용하여 불필요한 API 호출을 줄입니다.
   * 
   * @param {boolean} [forceRefresh=false] 캐시 무시 옵션
   * @returns {Promise<ForestFireData[]>} 산불 데이터 배열
   */
  async getForestFires(forceRefresh = false): Promise<ForestFireData[]> {
    // 캐시된 데이터 확인 (강제 새로고침이 아닌 경우)
    if (!forceRefresh) {
      const cachedData = cacheService.getFireData();
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // API에서 데이터 가져오기
      const data = await fetchData<Record<string, unknown>[]>(FIRE_LIST_ENDPOINT);
      
      // 데이터 처리 및 변환
      const processedData = await processForestFireData(data);

      // 처리된 데이터 캐싱
      cacheService.setFireData(processedData);
      
      return processedData;
    } catch (error) {
      // 에러를 표준화하여 throw
      throw handleApiError(
        error, 
        "산불 데이터를 가져오는 중 오류가 발생했습니다."
      );
    }
  },

  /**
   * 캐시 초기화
   * 산불 데이터 와 GeoJSON 캐시를 제거하여 다음 호출 시 새로운 데이터를 가져오도록 합니다.
   * 
   * @param {boolean} [clearGeoJson=false] GeoJSON 캐시도 초기화할지 여부
   */
  clearCache(clearGeoJson = false): void {
    cacheService.clearCache({
      clearFireData: true,
      clearGeoJson
    });
  },
};
