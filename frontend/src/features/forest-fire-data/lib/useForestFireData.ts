import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ForestFireData,
  forestFireService,
  calculateResponseLevelCounts,
  calculateStatusCounts,
  useAsyncOperation
} from "../../../shared";

/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 *
 * 서버에서 데이터를 가져오고 상태별/대응단계별 카운트를 계산합니다.
 * 타임스탬프 기반 캐시 무효화 전략을 적용합니다.
 */
export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 에러 처리 훅 사용
  const { isLoading, hasError, errorMessage, execute, clearError } = useAsyncOperation<
    ForestFireData[]
  >("useForestFireData", "forest-fire-data");

  // 데이터 로드 함수 - 옵션을 통해 더 유연하게 제어 가능
  const loadData = useCallback(
    async (options: { forceRefresh?: boolean; silent?: boolean } = {}): Promise<void> => {
      const { forceRefresh = false, silent = false } = options;
      
      const result = await execute(
        async () => {
          try {
            const data = await forestFireService.getForestFires({ forceRefresh });
            // 캐시 정보 업데이트
            const cacheInfo = forestFireService.getCacheInfo();
            setLastUpdated(cacheInfo.lastUpdateTime);
            return data || [];
          } catch (err) {
            throw new Error(
              err instanceof Error ? err.message : "산불 데이터를 가져오는 중 오류가 발생했습니다."
            );
          }
        },
        {
          functionName: "loadData",
          action: "산불 데이터 로딩",
          silent // silent가 true면 로딩 상태가 UI에 표시되지 않음
        }
      );

      if (result) {
        setFires(result);
      }
    },
    [execute]
  );

  // 주기적인 백그라운드 갱신 처리
  useEffect(() => {
    // 컴포넌트 마운트 시 데이터 로드
    void loadData();

    // 5분마다 백그라운드에서 데이터 갱신 시도
    const intervalId = setInterval(() => {
      forestFireService.refreshDataInBackground()
        .then(() => {
          // 성공적으로 새로고침된 경우 최신 데이터로 UI 업데이트
          const freshData = forestFireService.getCacheInfo();
          if (freshData.timestamp) {
            loadData({ silent: true });
          }
        })
        .catch(() => {
          // 백그라운드 새로고침 실패 시 조용히 무시
        });
    }, 5 * 60 * 1000); // 5분 간격

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, [loadData]);

  // 상태별 카운트 계산 - 불필요한 계산 방지
  const statusCounts = useMemo(() => calculateStatusCounts(fires), [fires]);

  // 대응단계별 카운트 계산 - 불필요한 계산 방지
  const responseLevelCounts = useMemo(() => calculateResponseLevelCounts(fires), [fires]);

  // 데이터 재로드 함수 - 캐시 초기화 후 새로 로드
  const handleReload = useCallback(
    (globalInvalidation = false): void => {
      clearError();
      forestFireService.clearCache({ globalInvalidation });
      void loadData({ forceRefresh: true });
    },
    [loadData, clearError]
  );

  // 캐시 정보 가져오기
  const getCacheInfo = useCallback(() => {
    return forestFireService.getCacheInfo();
  }, []);

  return {
    fires,
    isLoading,
    hasError: hasError ? errorMessage : null,
    statusCounts,
    responseLevelCounts,
    lastUpdated,
    handleReload,
    getCacheInfo,
  };
}