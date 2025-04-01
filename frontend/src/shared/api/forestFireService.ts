import axios from "axios";
import { ForestFireData } from "../model/forestFire";
import { convertStatus, extractLocation, getResponseLevel } from "../lib/forestFireUtils";
import { geoJsonService } from "./geoJsonService";

/** 캐시된 산불 데이터 */
let cachedFireData: ForestFireData[] | null = null;
/** 캐시 타임스탬프 */
let cacheTimestamp: number | null = null;
/** 캐시 유효 기간 (5분) */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * 데이터 가져오기 유틸리티 함수
 * 지정된 URL에서 데이터를 가져옵니다.
 * 
 * @param {string} url 데이터를 가져올 URL
 * @returns {Promise<T>} 가져온 데이터
 */
export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

/**
 * 캐시 유효성 검사
 * 현재 캐시된 데이터가 유효한지 확인합니다.
 * 
 * @returns {boolean} 캐시가 유효하면 true, 그렇지 않으면 false
 */
const isCacheValid = (): boolean => {
  if (!cachedFireData || !cacheTimestamp) return false;

  const now = Date.now();
  return now - cacheTimestamp < CACHE_DURATION;
};

/**
 * 데이터를 캐시에 저장
 * 산불 데이터와 현재 타임스탬프를 캐시에 저장합니다.
 * 
 * @param {ForestFireData[]} data 캐시할 산불 데이터
 */
const saveToCache = (data: ForestFireData[]): void => {
  cachedFireData = data;
  cacheTimestamp = Date.now();
};

/**
 * 날짜 문자열 포맷팅
 * YYYYMMDD 형식의 날짜 문자열을 YYYY-MM-DD 형식으로 변환합니다.
 * 
 * @param {string} dateStr 포맷팅할 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";

  return dateStr.length === 8
    ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    : dateStr;
};

/**
 * API에서 가져온 산불 데이터 항목을 추출하고 포맷팅하는 함수
 * API에서 가져온 원데이터를 내부 형식에 맞게 변환합니다.
 * 
 * @param {Record<string, unknown>} item API에서 가져온 데이터 항목
 * @param {number} index 항목 인덱스
 * @returns 추출된 필요한 데이터 필드
 */
const extractItemData = (
  item: Record<string, unknown>,
  index: number
): {
  date: string;
  extinguishPercentage: string;
  status: ForestFireData["status"];
  severity: ForestFireData["severity"];
  location: string;
  sigungu?: string;
  affectedArea: number;
  itemId: string;
  responseLevelName: string;
  description?: string;
} => {
  const dateStr = typeof item.date === "string" ? item.date : "";
  const formattedDate = formatDateString(dateStr);

  const extinguishPercentage =
    typeof item.percentage === "string" || typeof item.percentage === "number"
      ? String(item.percentage)
      : "0";

  const statusText = typeof item.status === "string" ? item.status : "";
  const status = convertStatus(statusText, extinguishPercentage);

  const responseLevelName = typeof item.issueName === "string" ? item.issueName : "1단계";
  const severity = getResponseLevel(responseLevelName);

  const location = typeof item.location === "string" ? item.location : "";
  const sigungu = typeof item.sigungu === "string" ? item.sigungu : undefined;

  const affectedArea = typeof item.area === "number" ? item.area : 0;

  const itemIndex =
    typeof item.index === "string" || typeof item.index === "number" ? item.index : index + 1;

  const description = typeof item.description === "string" ? item.description : undefined;

  return {
    date: formattedDate,
    extinguishPercentage,
    status,
    severity,
    location,
    sigungu,
    affectedArea,
    itemId: `ff-${String(itemIndex)}`,
    responseLevelName,
    description,
  };
};

/**
 * 산불 데이터 처리 함수
 * API에서 가져온 데이터를 애플리케이션에서 사용할 형식으로 처리합니다.
 * GeoJSON 데이터를 활용하여 좌표를 추출합니다.
 * 
 * @param {Record<string, unknown>[]} apiData API에서 받은 원데이터 배열
 * @returns {Promise<ForestFireData[]>} 처리된 산불 데이터 배열
 */
const processForestFireData = async (
  apiData: Record<string, unknown>[]
): Promise<ForestFireData[]> => {
  const processedData: ForestFireData[] = [];

  const geoJsonData = await geoJsonService.loadGeoJsonData("/assets/map/gadm41_KOR_2.json");
  if (!geoJsonData) {
    return [];
  }

  for (let i = 0; i < apiData.length; i++) {
    const item = apiData[i];

    const {
      date,
      extinguishPercentage,
      status,
      severity,
      location,
      sigungu,
      affectedArea,
      itemId,
      responseLevelName,
      description,
    } = extractItemData(item, i);

    const { province, district } = extractLocation(location, sigungu);

    const coordinates = geoJsonService.getCoordinatesByName(geoJsonData, province, district);

    if (!coordinates) {
      continue;
    }

    processedData.push({
      id: itemId,
      location,
      date,
      severity,
      status,
      coordinates,
      affectedArea,
      province,
      district,
      extinguishPercentage,
      responseLevelName,
      description,
    });
  }

  return processedData;
};

export const forestFireService = {
  /**
   * 산불 데이터 가져오기
   * 서버에서 산불 데이터를 가져온 후 처리하여 반환합니다.
   * 캐시 기능을 활용하여 불필요한 API 호출을 줄입니다.
   * 
   * @param {boolean} [forceRefresh=false] 캐시 무시 옵션
   * @returns {Promise<ForestFireData[]>} 산불 데이터 배열
   */
  async getForestFires(forceRefresh = false): Promise<ForestFireData[]> {
    if (!forceRefresh && isCacheValid()) {
      return cachedFireData!;
    }

    try {
      const data = await fetchData<Record<string, unknown>[]>("http://localhost:4000/api/fireList");
      const processedData = await processForestFireData(data);

      saveToCache(processedData);
      return processedData;
    } catch (_) {
      // 에러 발생 시에도 빈 배열 반환
      return [];
    }
  },

  /**
   * 캐시 초기화
   * 산불 데이터 캐시를 제거하여 다음 호출 시 새로운 데이터를 가져오도록 합니다.
   */
  clearCache(): void {
    cachedFireData = null;
    cacheTimestamp = null;
  },
};
