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
 * 서버에서 산불 데이터를 가져오고, 상태별 카운트 및 대응단계별 카운트를 계산합니다.
 * 로딩, 오류 상태 및 데이터 재로딩 기능을 제공합니다.
 *
 * @returns 산불 데이터 관리에 필요한 상태와 함수들
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

  /**
   * 데이터 로드 함수
   * 서버에서 산불 데이터를 가져와 상태를 갱신합니다.
   *
   * @param {boolean} forceRefresh 캐시된 데이터를 무시하고 강제로 새로 가져오기 위한 플래그
   * @returns {Promise<void>}
   */
  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    const result = await execute(async () => {
      try {
        // forestFireApi 대신 직접 forestFireService 사용
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

  // 상태별 카운트 계산 - useMemo 사용하여 추가 렌더링 방지
  const statusCounts = useMemo(() => calculateStatusCounts(fires), [fires]);

  // 대응단계별 카운트 계산 - useMemo 사용하여 추가 렌더링 방지
  const responseLevelCounts = useMemo(() => calculateResponseLevelCounts(fires), [fires]);

  /**
   * 데이터 재로드 함수
   * 캐시를 지우고 산불 데이터를 다시 가져오는 함수입니다.
   */
  const handleReload = useCallback((): void => {
    clearError();
    // forestFireApi 대신 직접 forestFireService 사용
    forestFireService.clearCache(); // GeoJSON 캐시는 유지 (false 옵션)
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
