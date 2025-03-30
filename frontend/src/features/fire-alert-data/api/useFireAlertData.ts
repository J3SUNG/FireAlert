import { useState, useEffect, useCallback } from "react";
import { ForestFireData } from "../../../shared/types/forestFire";
import { forestFireService } from "../../../shared/services";
import {
  calculateResponseLevelCounts,
  calculateStatusCounts,
} from "../../../shared/utils/forestFireUtils";

/**
 * 산불 데이터 및 관련 상태를 관리하는 커스텀 훅 (SRP)
 */
export function useFireAlertData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로딩 함수
  const loadData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      setLoading(true);
      const data = await forestFireService.getForestFires(forceRefresh);

      setFires(data);
      setError(null);
    } catch (_) {
      // 산불 데이터 가져오기 오류 처리
      setError("산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로딩
  useEffect(() => {
    void loadData();
  }, [loadData]);

  // 상태 카운트 계산 (유틸리티 함수로 분리)
  const statusCounts = calculateStatusCounts(fires);

  // 대응단계별 카운트 (유틸리티 함수로 분리)
  const responseLevelCounts = calculateResponseLevelCounts(fires);

  // 화면 리로드 핸들러
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
