import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ForestFireData,
  forestFireService,
  calculateResponseLevelCounts,
  calculateStatusCounts,
  useAsyncOperation,
} from "../../../shared";

/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 */
export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const { isLoading, hasError, errorMessage, execute, clearError } = useAsyncOperation<
    ForestFireData[]
  >("useForestFireData", "forest-fire-data");

  const loadData = useCallback(
    async (options: { forceRefresh?: boolean; silent?: boolean } = {}): Promise<void> => {
      const { forceRefresh = false, silent = false } = options;

      const result = await execute(
        async () => {
          try {
            const data = await forestFireService.getForestFires({ forceRefresh });
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
          silent,
        }
      );

      if (result) {
        setFires(result);
      }
    },
    [execute]
  );

  useEffect(() => {
    void loadData();

    const intervalId = setInterval(() => {
      forestFireService
        .refreshDataInBackground()
        .then(() => {
          const freshData = forestFireService.getCacheInfo();
          if (freshData.timestamp) {
            loadData({ silent: true });
          }
        })
        .catch(() => {});
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  const statusCounts = useMemo(() => calculateStatusCounts(fires), [fires]);

  const responseLevelCounts = useMemo(() => calculateResponseLevelCounts(fires), [fires]);

  const handleReload = useCallback(
    (globalInvalidation = false): void => {
      clearError();
      forestFireService.clearCache({ globalInvalidation });
      void loadData({ forceRefresh: true });
    },
    [loadData, clearError]
  );

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
