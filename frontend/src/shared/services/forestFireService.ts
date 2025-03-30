import axios from "axios";
import { ForestFireData } from "../types/forestFire";
import { convertStatus, extractLocation, getResponseLevel } from "../utils/forestFireUtils";
import { geoJsonService } from "./geoJsonService";

/**
 * API 요청에 사용하는 유틸리티 함수
 */
export const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 산불 데이터 서비스 구현체
 */
export class ForestFireService {
  private readonly API_URL: string;
  private cachedFireData: ForestFireData[] | null = null;
  
  constructor(apiUrl = "http://localhost:4000/api/fireList") {
    this.API_URL = apiUrl;
  }

  /**
   * 모든 산불 데이터 조회
   */
  async getForestFires(): Promise<ForestFireData[]> {
    if (this.cachedFireData) {
      return this.cachedFireData;
    }
    
    try {
      const data = await fetchData<Record<string, unknown>[]>(this.API_URL);
      const processedData = await this.processForestFireData(data);
      
      this.cachedFireData = processedData;
      return processedData;
    } catch (error) {
      console.error("산불 데이터 가져오기 실패:", error);
      return [];
    }
  }

  /**
   * 시/도별 산불 데이터 조회
   */
  async getFiresByProvince(province: string): Promise<ForestFireData[]> {
    const fires = await this.getForestFires();
    return fires.filter((fire) => fire.province === province);
  }

  /**
   * 상태별 산불 데이터 조회
   */
  async getFiresByStatus(status: ForestFireData["status"]): Promise<ForestFireData[]> {
    const fires = await this.getForestFires();
    return fires.filter((fire) => fire.status === status);
  }

  /**
   * ID로 산불 데이터 조회
   */
  async getFireById(id: string): Promise<ForestFireData | undefined> {
    const fires = await this.getForestFires();
    return fires.find((fire) => fire.id === id);
  }

  /**
   * API 응답 데이터 처리
   */
  private async processForestFireData(apiData: Record<string, unknown>[]): Promise<ForestFireData[]> {
    const processedData: ForestFireData[] = [];
    
    // 한국 GeoJSON 데이터 로드
    const geoJsonData = await geoJsonService.loadGeoJsonData('/assets/map/gadm41_KOR_2.json');
    if (!geoJsonData) {
      console.error("GeoJSON 데이터 로드 실패");
      return [];
    }
    
    for (let i = 0; i < apiData.length; i++) {
      const item = apiData[i];
      
      const dateStr = typeof item.date === "string" ? item.date : "";
      const formattedDate = dateStr.length === 8
        ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        : dateStr;

      const extinguishPercentage = typeof item.percentage === "string" || typeof item.percentage === "number"
        ? String(item.percentage)
        : "0";

      const statusText = typeof item.status === "string" ? item.status : "";
      const status = convertStatus(statusText, extinguishPercentage);

      const responseLevelName = typeof item.issueName === "string" ? item.issueName : "1단계";
      const severity = getResponseLevel(responseLevelName);

      const location = typeof item.location === "string" ? item.location : "";
      const sigungu = typeof item.sigungu === "string" ? item.sigungu : undefined;
      const { province, district } = extractLocation(location, sigungu);

      const coordinates = geoJsonService.getCoordinatesByName(geoJsonData, province, district);
      
      if (!coordinates) {
        console.warn(`위치 좌표를 찾을 수 없음: ${location}`);
        continue;
      }

      const affectedArea = typeof item.area === "number" ? item.area : 0;

      const itemIndex = typeof item.index === "string" || typeof item.index === "number"
        ? item.index
        : i + 1;

      processedData.push({
        id: `ff-${String(itemIndex)}`,
        location,
        date: formattedDate,
        severity,
        status,
        coordinates,
        affectedArea,
        province,
        district,
        extinguishPercentage,
        responseLevelName,
        description: typeof item.description === "string" ? item.description : undefined
      });
    }

    return processedData;
  }
}

// 서비스 싱글톤 인스턴스 생성
export const forestFireService = new ForestFireService();
