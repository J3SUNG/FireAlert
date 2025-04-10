import { useState, useEffect, useCallback, useMemo } from "react";
import { ForestFireData } from "../../../../shared/model/forestFire";
import { forestFireService } from "../../../../shared/api/forestFireService";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../../shared/lib/calculations/forestFireStats";
import { useAsyncOperation } from "../../../../shared/lib/errors";

/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 * 
 * 서버에서 데이터를 가져오고 상태별/대응단계별 카운트를 계산합니다.
 */
export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  
  // 에러 처리 훅 사용
  const { 
    isLoading, 
    hasError, 
    errorMessage, 
    execute, 
    clearError 
  } = useAsyncOperation<ForestFireData[]>("useForestFireData", "forest-fire-data");

  // 데이터 로드 함수 - 캐시 사용 여부 선택 가능
  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    const result = await execute(async () => {
      try {
        const data = await forestFireService.getForestFires(forceRefresh);
        return data || [];
      } catch (err) {
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

  // 상태별 카운트 계산 - 불필요한 계산 방지
  const statusCounts = useMemo(() => calculateStatusCounts(fires), [fires]);

  // 대응단계별 카운트 계산 - 불필요한 계산 방지
  const responseLevelCounts = useMemo(() => calculateResponseLevelCounts(fires), [fires]);

  // 데이터 재로드 함수 - 캐시 초기화 후 새로 로드
  const handleReload = useCallback((): void => {
    clearError();
    forestFireService.clearCache();
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