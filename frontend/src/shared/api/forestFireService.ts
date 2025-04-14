import axios from "axios";
import { ForestFireData } from "../model/forestFire";
import { extractLocation } from "../lib/formatting/locationFormat";
import { convertStatus, getResponseLevel } from "../lib/data/forestFireUtils";
import { geoJsonService } from "./geoJsonService";
import { createCache } from "../lib/cache/cacheUtils";
import { CACHE_DURATION_MS, FIRE_LIST_ENDPOINT, GEO_JSON_PATH } from '../constants/api';

/** 
 * 캐시 관리자 인스턴스 생성
 * 산불 데이터와 GeoJSON 데이터를 위한 별도의 캐시를 생성합니다.
 */
const fireDataCache = createCache<ForestFireData[]>(CACHE_DURATION_MS);
const geoJsonCache = createCache<any>(24 * 60 * 60 * 1000); // 24시간 캐시

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
 * 캐시된 GeoJSON 데이터 가져오기
 * 캐시에서 GeoJSON 데이터를 가져오거나, 필요한 경우 새로 로드합니다.
 * 
 * @returns {Promise<any>} GeoJSON 데이터
 */
const getGeoJsonData = async (): Promise<any> => {
  const cachedData = geoJsonCache.getData();
  if (cachedData) {
    return cachedData;
  }
  
  const geoJsonData = await geoJsonService.loadGeoJsonData(GEO_JSON_PATH);
  if (geoJsonData) {
    geoJsonCache.setData(geoJsonData);
  }
  return geoJsonData;
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

  // 캐시를 활용한 GeoJSON 데이터 로드
  const geoJsonData = await getGeoJsonData();
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
    if (!forceRefresh) {
      const cachedData = fireDataCache.getData();
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const data = await fetchData<Record<string, unknown>[]>(FIRE_LIST_ENDPOINT);
      const processedData = await processForestFireData(data);

      fireDataCache.setData(processedData);
      return processedData;
    } catch (error) {
      // 에러를 표준화하여 throw
      throw new Error(
        error instanceof Error
          ? `산불 데이터를 가져오는 중 오류: ${error.message}`
          : "산불 데이터를 가져오는 중 오류가 발생했습니다."
      );
    }
  },

  /**
   * 캐시 초기화
   * 산불 데이터 와 GeoJSON 캐시를 제거하여 다음 호출 시 새로운 데이터를 가져오도록 합니다.
   * @param {boolean} [clearGeoJson=false] GeoJSON 캐시도 초기화할지 여부
   */
  clearCache(clearGeoJson = false): void {
    fireDataCache.clearCache();
    
    // GeoJSON 캐시는 선택적으로 초기화 (자주 변경되지 않음)
    if (clearGeoJson) {
      geoJsonCache.clearCache();
    }
  },
};
