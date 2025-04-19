/**
 * 산불 데이터 변환 관련 유틸리티 함수 모음
 */
import { ForestFireData } from "../../model/forestFire";

/**
 * 산불 상태 코드 변환
 */
export const convertStatus = (status: string, percentage: string): ForestFireData["status"] => {
  if (percentage === "100") return "extinguished";
  if (status === "") return "active";
  if (status.includes("진화완료")) return "extinguished";
  if (status.includes("진화중") || status.includes("진행")) return "active";
  return "contained";
};

/**
 * 대응 단계 이름으로 위험도 결정
 */
export const getResponseLevel = (issueName: string): ForestFireData["severity"] => {
  if (issueName.includes("3단계")) return "critical";
  if (issueName.includes("2단계")) return "high";
  if (issueName.includes("1단계")) return "medium";
  return "low";
};

/**
 * 진화율에 따라 색상 코드 결정
 */
export const getExtinguishPercentageColor = (percentage: string): string => {
  const percentageNum = parseInt(percentage, 10);
  if (percentageNum < 50) return "#ef4444";
  if (percentageNum < 100) return "#f97316";
  return "#22c55e";
};
