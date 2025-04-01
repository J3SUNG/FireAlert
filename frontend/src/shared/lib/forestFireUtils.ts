/**
 * 산불 관련 유틸리티 함수 모음
 * 산불 데이터 처리와 관련된 다양한 함수를 제공합니다.
 */

import { ForestFireData } from "../model/forestFire";
import { provinceShortNames } from "./locationFormat";

/**
 * 위치 문자열에서 시도와 시군구 추출
 * 주소 문자열에서 시도(또는 신청자치시/광역시)와 시군구를 파싱합니다.
 * 
 * @param {string} location 전체 주소 문자열
 * @param {string} [sigungu] 시군구 정보
 * @returns {{ province: string; district: string }} 시도와 시군구 정보
 */
export const extractLocation = (location: string, sigungu?: string): { province: string; district: string } => {
  if (!location || location === "") return { province: "기타", district: "" };

  const provinceMap: Record<string, string> = {};
  
  for (const [fullName, shortName] of Object.entries(provinceShortNames)) {
    provinceMap[shortName] = fullName;
  }
  
  Object.assign(provinceMap, {
    '강원': '강원도',
    '경기': '경기도',
    '경남': '경상남도',
    '경북': '경상북도',
    '광주': '광주광역시',
    '대구': '대구광역시',
    '대전': '대전광역시',
    '부산': '부산광역시',
    '서울': '서울특별시',
    '세종': '세종특별자치시',
    '울산': '울산광역시',
    '인천': '인천광역시',
    '전남': '전라남도',
    '전북': '전라북도',
    '제주': '제주특별자치도',
    '충남': '충청남도',
    '충북': '충청북도',
  });

  const parts = location.split(" ").filter(part => part.trim() !== "");
  let province = "기타";
  let district = "";

  if (parts.length > 0) {
    if (
      parts[0].includes("도") ||
      parts[0].includes("시") ||
      parts[0].includes("특별") ||
      parts[0].includes("광역")
    ) {
      province = parts[0];
    } 
    else if (provinceMap[parts[0]]) {
      province = provinceMap[parts[0]];
    }
  }

  if (sigungu && sigungu.trim().length > 0) {
    district = sigungu.trim();
  } else if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].endsWith("시") || parts[i].endsWith("군") || parts[i].endsWith("구")) {
        district = parts[i];
        break;
      }
    }
  }

  return { province, district };
};

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
