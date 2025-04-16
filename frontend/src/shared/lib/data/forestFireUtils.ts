/**
 * 산불 데이터 변환 관련 유틸리티 함수 모음
 * 
 * 산불 데이터의 상태 코드, 위험도, 색상 등을 결정하는 함수들을 포함합니다.
 */

import { ForestFireData } from "../../model/forestFire";

/**
 * 산불 상태 코드 변환
 * 
 * 원본 상태 명칭과 진화율을 기준으로 내부 상태 코드로 변환합니다.
 * - 진화율 100%: "extinguished" (진화완료)
 * - "진화완료" 포함: "extinguished" (진화완료)
 * - "진화중" 또는 "진행" 포함: "active" (진행중)
 * - 기타: "contained" (통제중)
 * 
 * @param status 원본 상태 텍스트
 * @param percentage 진화율 문자열
 * @returns 내부에서 사용하는 상태 코드
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
 * 
 * 단계 이름에 따라 위험도 심각도를 결정합니다.
 * - "3단계": "critical" (심각)
 * - "2단계": "high" (높음)
 * - "1단계": "medium" (중간)
 * - 기타: "low" (낮음)
 * 
 * @param issueName 대응 단계 이름
 * @returns 위험도 심각도 코드
 */
export const getResponseLevel = (issueName: string): ForestFireData["severity"] => {
  if (issueName.includes("3단계")) return "critical";
  if (issueName.includes("2단계")) return "high";
  if (issueName.includes("1단계")) return "medium";
  return "low";
};

/**
 * 진화율에 따라 색상 코드 결정
 * 
 * 진행 상황을 시각적으로 표현하기 위한 색상 변환합니다.
 * - 50% 미만: 빨간색 (#ef4444)
 * - 50% 이상 100% 미만: 주황색 (#f97316)
 * - 100%: 초록색 (#22c55e)
 * 
 * @param percentage 진화율 문자열
 * @returns 색상 코드(HEX)
 */
export const getExtinguishPercentageColor = (percentage: string): string => {
  const percentageNum = parseInt(percentage, 10);
  if (percentageNum < 50) return "#ef4444"; // 빨간색 (50% 미만)
  if (percentageNum < 100) return "#f97316"; // 주황색 (50% 이상, 100% 미만)
  return "#22c55e"; // 초록색 (100%)
};
