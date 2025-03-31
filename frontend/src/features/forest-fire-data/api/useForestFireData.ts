import { useState, useEffect, useCallback } from "react";
import { ForestFireData } from "../../../shared/types/forestFire";
import { forestFireService } from "../../../shared/services";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../shared/utils/forestFireUtils";

export function useForestFireData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setLoading(true);
      const data = await forestFireService.getForestFires(forceRefresh);

      setFires(data);
      setError(null);
    } catch (_) {
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
    forestFireService.clearCache();
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