import { useState, useEffect } from 'react';
import { ForestFireData } from '../../shared/types/forestFire';
import { forestFireService } from '../../shared/services/forestFireService';

/**
 * 산불 데이터 및 관련 상태를 관리하는 커스텀 훅 (SRP)
 */
export function useFireAlertData() {
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 로딩
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await forestFireService.getForestFires();
        setFires(data);
        setError(null);
      } catch (err) {
        console.error("산불 데이터를 가져오는 중 오류 발생:", err);
        setError("산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // 상태 카운트 계산 (ISP: 필요한 정보만 계산)
  const statusCounts = {
    total: fires.length,
    active: fires.filter((fire) => fire.status === "active").length,
    contained: fires.filter((fire) => fire.status === "contained").length,
    extinguished: fires.filter((fire) => fire.status === "extinguished").length,
  };

  // 대응단계별 카운트
  const responseLevelCounts = {
    level3: fires.filter((f) => f.severity === "critical").length,
    level2: fires.filter((f) => f.severity === "high").length,
    level1: fires.filter((f) => f.severity === "medium" || f.severity === "low").length,
  };

  // 화면 리로드 핸들러
  const handleReload = (): void => {
    window.location.reload();
  };

  return {
    fires,
    loading,
    error,
    statusCounts,
    responseLevelCounts,
    handleReload
  };
}