import { useState, useEffect, useCallback } from "react";
import { ForestFireData } from "../../../shared/model/forestFire";
import { forestFireApi } from "./forestFireApi";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../shared/lib/forestFireUtils";
import { useAsyncOperation } from "../../../shared/lib/errors";

/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 * 서버에서 산불 데이터를 가져오고, 상태별 카운트 및 대응단계별 카운트를 계산합니다.
 * 로딩, 오류 상태 및 데이터 재로딩 기능을 제공합니다.
 *
 * @returns 산불 데이터 관리에 필요한 상태와 함수들
 */
export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  
  // 새 에러 처리 훅 사용
  const { 
    isLoading, 
    hasError, 
    errorMessage, 
    execute, 
    clearError 
  } = useAsyncOperation<ForestFireData[]>("useForestFireData", "forest-fire-data");

  /**
   * 산불 데이터 로드 함수
   * 서버에서 산불 데이터를 가져와 상태를 갱신합니다.
   *
   * @param {boolean} forceRefresh 캐시된 데이터를 무시하고 강제로 새로 가져오기 위한 플래그
   * @returns {Promise<void>}
   */
  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    const result = await execute(async () => {
      try {
        const data = await forestFireApi.getForestFires(forceRefresh);
        return data || [];
      } catch (err) {
        // 표준 Error로 변환하여 던지기
        throw new Error(
          err instanceof Error 
            ? err.message 
            : "산불 데이터를 가져오는 중 오류가 발생했습니다."
        );
      }
    }, {
      functionName: 'loadData',
      action: '산불 데이터 로딩'
    });
    
    if (result) {
      setFires(result);
    }
  }, [execute]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // 상태별 카운트 계산
  const statusCounts = calculateStatusCounts(fires);

  // 대응단계별 카운트 계산
  const responseLevelCounts = calculateResponseLevelCounts(fires);

  /**
   * 데이터 재로드 함수
   * 캐시를 지우고 산불 데이터를 다시 가져오는 함수입니다.
   */
  const handleReload = useCallback((): void => {
    clearError();
    forestFireApi.clearCache();
    void loadData(true);
  }, [loadData, clearError]);

  return {
    fires,
    loading: isLoading,
    error: hasError ? errorMessage : null,
    statusCounts,
    responseLevelCounts,
    handleReload,
  };
}
