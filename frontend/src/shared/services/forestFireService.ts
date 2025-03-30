import axios from "axios";
import { ForestFireData } from "../types/forestFire";
import { convertStatus, extractLocation, getResponseLevel } from "../utils/forestFireUtils";
import { geoJsonService } from "./geoJsonService";

// 캐시 상태
let cachedFireData: ForestFireData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시 유효시간

/**
 * API 요청에 사용하는 유틸리티 함수
 */
export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

/**
 * 캐시 데이터가 유효한지 확인
 */
const isCacheValid = (): boolean => {
  if (!cachedFireData || !cacheTimestamp) return false;
  
  const now = Date.now();
  return now - cacheTimestamp < CACHE_DURATION;
};

/**
 * 데이터 캐시 저장
 */
const saveToCache = (data: ForestFireData[]): void => {
  cachedFireData = data;
  cacheTimestamp = Date.now();
};

/**
 * 날짜 문자열 포맷팅
 */
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";
  
  return dateStr.length === 8
    ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    : dateStr;
};

/**
 * API 관련 데이터에서 필요한 데이터 추출
 */
const extractItemData = (item: Record<string, unknown>, index: number): {
  date: string;
  extinguishPercentage: string;
  status: ForestFireData['status'];
  severity: ForestFireData['severity'];
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
    description
  };
};

/**
 * API 응답 데이터 처리
 */
const processForestFireData = async (
  apiData: Record<string, unknown>[]
): Promise<ForestFireData[]> => {
  const processedData: ForestFireData[] = [];

  // 한국 GeoJSON 데이터 로드
  const geoJsonData = await geoJsonService.loadGeoJsonData("/assets/map/gadm41_KOR_2.json");
  if (!geoJsonData) {
    // GeoJSON 데이터 로드 실패 처리
    return [];
  }

  for (let i = 0; i < apiData.length; i++) {
    const item = apiData[i];
    
    // 필요한 데이터 추출
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
      description
    } = extractItemData(item, i);
    
    // 지역 정보 추출
    const { province, district } = extractLocation(location, sigungu);

    // 좌표 가져오기
    const coordinates = geoJsonService.getCoordinatesByName(geoJsonData, province, district);

    if (!coordinates) {
      // 위치 좌표를 찾을 수 없는 경우 처리
      continue;
    }

    // 산불 데이터 생성
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

// 산불 데이터 서비스 객체
export const forestFireService = {
  /**
   * 모든 산불 데이터 조회
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
    } catch (_error) {
      // 산불 데이터 가져오기 오류 처리
      return [];
    }
  },

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    cachedFireData = null;
    cacheTimestamp = null;
  }
};
