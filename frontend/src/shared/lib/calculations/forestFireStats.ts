/**
 * 산불 통계 계산 관련 유틸리티 함수 모음
 */

import { ForestFireData } from "../../model/forestFire";

/**
 * 산불 데이터 통계 계산
 * 지역별, 위험도별, 상태별 통계를 계산합니다.
 * 
 * @param {ForestFireData[]} fires 산불 데이터 배열
 * @returns 산불 통계 정보 객체
 */
export const getForestFireStatistics = (fires: ForestFireData[]) => {
  const provinceStats = {} as Record<
    string,
    { count: number; active: number; contained: number; extinguished: number; totalArea: number }
  >;

  fires.forEach((fire) => {
    const province = fire.province ?? "기타";
    if (!(province in provinceStats)) {
      provinceStats[province] = {
        count: 0,
        active: 0,
        contained: 0,
        extinguished: 0,
        totalArea: 0,
      };
    }

    const stats = provinceStats[province];
    stats.count += 1;
    stats.totalArea += fire.affectedArea;

    if (fire.status === "active") stats.active += 1;
    else if (fire.status === "contained") stats.contained += 1;
    else stats.extinguished += 1;
  });

  const severityStats = {
    critical: fires.filter((f) => f.severity === "critical").length,
    high: fires.filter((f) => f.severity === "high").length,
    medium: fires.filter((f) => f.severity === "medium").length,
    low: fires.filter((f) => f.severity === "low").length,
  };

  const statusStats = {
    total: fires.length,
    active: fires.filter((f) => f.status === "active").length,
    contained: fires.filter((f) => f.status === "contained").length,
    extinguished: fires.filter((f) => f.status === "extinguished").length,
  };

  const totalArea = fires.reduce((sum, fire) => sum + fire.affectedArea, 0);

  return {
    provinceStats,
    severityStats,
    statusStats,
    totalArea,
  };
};

/**
 * 상태별 카운트 계산
 * 산불 상태별(진행중, 통제중, 진화완료) 개수를 계산합니다.
 * 
 * @param {ForestFireData[]} fires 산불 데이터 배열
 * @returns {{ total: number, active: number, contained: number, extinguished: number }} 상태별 카운트
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
 * 산불 대응 단계별 개수를 계산합니다.
 * 
 * @param {ForestFireData[]} fires 산불 데이터 배열
 * @returns {{ level3: number, level2: number, level1: number, initial: number }} 대응 단계별 카운트
 */
export const calculateResponseLevelCounts = (fires: ForestFireData[]) => {
  return {
    level3: fires.filter((f) => f.severity === "critical").length,
    level2: fires.filter((f) => f.severity === "high").length,
    level1: fires.filter((f) => f.severity === "medium").length,
    initial: fires.filter((f) => f.severity === "low").length,
  };
};
