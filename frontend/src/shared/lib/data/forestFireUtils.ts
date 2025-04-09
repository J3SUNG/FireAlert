/**
 * 산불 데이터 변환 관련 유틸리티 함수 모음
 */

import { ForestFireData } from "../../model/forestFire";

/**
 * 산불 상태 코드 변환
 * 시스템에서 사용하는 상태 코드로 변환합니다.
 * 
 * @param {string} status 원본 상태 명칭
 * @param {string} percentage 진화율
 * @returns {ForestFireData["status"]} 변환된 상태 코드
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
 * 산불 대응 단계 이름을 기준으로 시스템에서 사용하는 위험도 태그로 변환합니다.
 * 
 * @param {string} issueName 대응 단계 이름
 * @returns {ForestFireData["severity"]} 위험도 태그
 */
export const getResponseLevel = (issueName: string): ForestFireData["severity"] => {
  if (issueName.includes("3단계")) return "critical";
  if (issueName.includes("2단계")) return "high";
  if (issueName.includes("1단계")) return "medium";
  return "low";
};

/**
 * 진화율에 따라 색상 코드 결정
 * 진화율 값에 따라 적절한 표시 색상을 반환합니다.
 * 
 * @param {string} percentage 진화율 문자열
 * @returns {string} 표시할 16진수 색상 코드
 */
export const getExtinguishPercentageColor = (percentage: string): string => {
  const percentageNum = parseInt(percentage, 10);
  if (percentageNum < 50) return "#ef4444"; // 빨간색 (50% 미만)
  if (percentageNum < 100) return "#f97316"; // 주황색 (50% 이상, 100% 미만)
  return "#22c55e"; // 초록색 (100%)
};
