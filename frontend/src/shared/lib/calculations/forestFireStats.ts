/**
 * 산불 통계 계산 관련 유틸리티 함수 모음
 */
import { ForestFireData } from "../../model/forestFire";

/**
 * 상태별 카운트 계산
 */
export const calculateStatusCounts = (fires: ForestFireData[]) => {
  return {
    total: fires.length,
    active: fires.filter((fire) => fire.status === "active").length,
    contained: fires.filter((fire) => fire.status === "contained").length,
    extinguished: fires.filter((fire) => fire.status === "extinguished").length,
  };
};

/**
 * 대응 단계별 카운트 계산
 */
export const calculateResponseLevelCounts = (fires: ForestFireData[]) => {
  return {
    level3: fires.filter((f) => f.severity === "critical").length,
    level2: fires.filter((f) => f.severity === "high").length,
    level1: fires.filter((f) => f.severity === "medium").length,
    initial: fires.filter((f) => f.severity === "low").length,
  };
};
