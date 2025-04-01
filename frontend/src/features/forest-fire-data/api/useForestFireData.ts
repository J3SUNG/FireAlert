import { useState, useEffect, useCallback } from "react";
import { ForestFireData } from "../../../shared/model/forestFire";
import { forestFireApi } from "./forestFireApi";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../shared/lib/forestFireUtils";
import { useDataErrorHandling } from "../lib/useDataErrorHandling";
import { DataErrorCode } from "../model/dataErrorTypes";

/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 * 서버에서 산불 데이터를 가져오고, 상태별 카운트 및 대응단계별 카운트를 계산합니다.
 * 로딩, 오류 상태 및 데이터 재로딩 기능을 제공합니다.
 *
 * @returns 산불 데이터 관리에 필요한 상태와 함수들
 */
export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 오류 처리를 위한 훅 사용
  const { createFetchError, setError: handleError } = useDataErrorHandling("useForestFireData");

  /**
   * 산불 데이터 로드 함수
   * 서버에서 산불 데이터를 가져와 상태를 갱신합니다.
   *
   * @param {boolean} forceRefresh 캐시된 데이터를 무시하고 강제로 새로 가져오기 위한 플래그
   * @returns {Promise<void>}
   */
  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setLoading(true);
      const data = await forestFireApi.getForestFires(forceRefresh);

      // 반환된 데이터 설정
      setFires(data || []);
      setError(null);
    } catch (err) {
      // 데이터 페칭 오류 처리
      const fetchError = createFetchError(
        DataErrorCode.FETCH_FAILED,
        err instanceof Error ? err : new Error("Unknown error"),
        "서버와의 통신 중 오류가 발생했습니다."
      );

      handleError(fetchError);
      setError("산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const statusCounts = calculateStatusCounts(fires);

  const responseLevelCounts = calculateResponseLevelCounts(fires);

  /**
   * 데이터 재로드 함수
   * 캐시를 지우고 산불 데이터를 다시 가져오는 함수입니다.
   */
  const handleReload = useCallback((): void => {
    // 에러 상태 초기화
    forestFireApi.clearCache();
    void loadData(true);
  }, [loadData]);

  return {
    fires,
    loading,
    error,
    statusCounts,
    responseLevelCounts,
    handleReload,
  };
}
