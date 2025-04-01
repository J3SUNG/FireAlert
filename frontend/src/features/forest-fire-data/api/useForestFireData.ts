import { useState, useEffect, useCallback } from "react";
import { ForestFireData } from "../../../shared/types/forestFire";
import { forestFireApi } from "./forestFireApi";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../shared/utils/forestFireUtils";
import { useDataErrorHandling } from "../lib/useDataErrorHandling";
import { DataErrorCode } from "../model/dataErrorTypes";

export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 에러 처리 훅 사용
  const { 
    createFetchError, 
    createStateError,
    setError: handleError 
  } = useDataErrorHandling('useForestFireData');

  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setLoading(true);
      const data = await forestFireApi.getForestFires(forceRefresh);
      
      // 반환된 데이터 검증
      if (!data || data.length === 0) {
        // 데이터가 없는 경우 에러 처리
        const stateError = createStateError(
          DataErrorCode.EMPTY_RESPONSE,
          new Error("No fire data available"),
          "산불 데이터가 없습니다."
        );
        
        handleError(stateError);
        setError("산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setFires(data);
        setError(null);
      }
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