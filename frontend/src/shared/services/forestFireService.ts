import axios from "axios";
import { ForestFireData } from "../types/forestFire";

// 간소화된 HTTP 요청 함수
const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    console.error("데이터 요청 오류:", error);
    throw error;
  }
};

// 위치 정보 추출 유틸리티
export const extractLocation = (location: string, sigungu?: string): { province: string; district: string } => {
  if (!location || location === "") return { province: "기타", district: "" };

  // 시도 약어 매핑
  const provinceMap: Record<string, string> = {
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
  };

  const parts = location.split(" ").filter(part => part.trim() !== "");
  let province = "기타";
  let district = "";

  // 시도 추출
  if (parts.length > 0) {
    // 시도명 확인
    if (
      parts[0].includes("도") ||
      parts[0].includes("시") ||
      parts[0].includes("특별") ||
      parts[0].includes("광역")
    ) {
      province = parts[0];
    } 
    // 약어 처리
    else if (provinceMap[parts[0]]) {
      province = provinceMap[parts[0]];
    }
  }

  // 시군구 추출
  if (typeof sigungu === "string" && sigungu.trim().length > 0) {
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

// 상태 변환 유틸리티
export const convertStatus = (status: string, percentage: string): ForestFireData["status"] => {
  if (percentage === "100") return "extinguished";
  if (status === "") return "active";
  if (status.includes("진화완료")) return "extinguished";
  if (status.includes("진화중") || status.includes("진행")) return "active";
  return "contained";
};

export const getResponseLevel = (issueName: string): ForestFireData["severity"] => {
  if (issueName.includes("3단계")) return "critical";
  if (issueName.includes("2단계")) return "high";
  if (issueName.includes("1단계")) return "medium";
  return "low";
};

// 기본 좌표 데이터 (GeoJSON 로드가 실패할 경우를 대비)
const defaultCoordinates: Record<string, { lat: number; lng: number }> = {
  // 시도별 좌표
  '강원도': { lat: 37.880, lng: 127.730 },
  '경기도': { lat: 37.400, lng: 127.550 },
  '경상남도': { lat: 35.460, lng: 128.210 },
  '경상북도': { lat: 36.020, lng: 128.940 },
  '광주광역시': { lat: 35.160, lng: 126.850 },
  '대구광역시': { lat: 35.870, lng: 128.600 },
  '대전광역시': { lat: 36.350, lng: 127.380 },
  '부산광역시': { lat: 35.180, lng: 129.080 },
  '서울특별시': { lat: 37.570, lng: 126.980 },
  '세종특별자치시': { lat: 36.480, lng: 127.290 },
  '울산광역시': { lat: 35.540, lng: 129.310 },
  '인천광역시': { lat: 37.460, lng: 126.700 },
  '전라남도': { lat: 34.870, lng: 126.990 },
  '전라북도': { lat: 35.720, lng: 127.150 },
  '제주특별자치도': { lat: 33.500, lng: 126.530 },
  '충청남도': { lat: 36.660, lng: 126.670 },
  '충청북도': { lat: 36.800, lng: 127.700 },
  '기타': { lat: 36.500, lng: 127.500 },
  
  // 주요 시군구 좌표
  '서울 강남구': { lat: 37.517, lng: 127.047 },
  '서울 강서구': { lat: 37.550, lng: 126.849 },
  '부산 해운대구': { lat: 35.163, lng: 129.163 },
  '대구 수성구': { lat: 35.858, lng: 128.630 },
  '인천 중구': { lat: 37.473, lng: 126.621 },
  '광주 북구': { lat: 35.174, lng: 126.927 },
  '대전 유성구': { lat: 36.362, lng: 127.356 },
  '울산 남구': { lat: 35.543, lng: 129.330 },
};

// GeoJSON 기반 좌표 검색 서비스
export class GeoJsonService {
  private geoJsonData: any = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private loadError = false;

  // GeoJSON 데이터 로드
  async loadGeoJsonData(): Promise<void> {
    if (this.geoJsonData) return; // 이미 로드된 경우
    if (this.loadError) return; // 이전에 로드 실패한 경우
    if (this.isLoading) return this.loadPromise!; // 로드 중인 경우

    this.isLoading = true;
    this.loadPromise = new Promise<void>(async (resolve) => {
      try {
        console.log("GeoJSON 데이터 로드 시도...");
        // 상대 경로를 사용하여 public 폴더 접근 
        const response = await fetch('../assets/map/gadm41_KOR_2.json');
        
        if (!response.ok) {
          throw new Error(`HTTP 오류: ${response.status}`);
        }
        
        this.geoJsonData = await response.json();
        console.log("GeoJSON 데이터 로드 성공:", this.geoJsonData ? "데이터 있음" : "데이터 없음");
        this.isLoading = false;
        resolve();
      } catch (error) {
        console.error("GeoJSON 데이터 로드 오류:", error);
        this.loadError = true;
        this.isLoading = false;
        resolve(); // 오류가 발생해도 Promise는 resolve
      }
    });

    return this.loadPromise;
  }

  // 지역명으로 좌표 검색
  async getCoordinatesByName(province: string, district?: string): Promise<{ lat: number; lng: number }> {
    try {
      await this.loadGeoJsonData();
      
      console.log("좌표 검색 요청:", { province, district });
      
      // GeoJSON 데이터가 로드되지 않았을 경우 기본값 사용
      if (!this.geoJsonData || !this.geoJsonData.features || this.geoJsonData.features.length === 0) {
        console.log("GeoJSON 데이터 없음, 기본 좌표 사용");
        return this.getDefaultCoordinates(province, district);
      }

      // 정확한 지역명 검색
      const fullName = district ? `${province} ${district}` : province;
      if (defaultCoordinates[fullName]) {
        console.log(`기본 좌표 매핑에서 발견: ${fullName}`);
        return defaultCoordinates[fullName];
      }

      // 시군구 검색 (district에 값이 있을 경우)
      if (district) {
        const districtFeatures = this.geoJsonData.features.filter((feature: any) => {
          const props = feature.properties;
          if (!props.NL_NAME_1 || !props.NL_NAME_2) return false;
          
          const matchProvince = props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1);
          const matchDistrict = props.NL_NAME_2.includes(district) || district.includes(props.NL_NAME_2);
          
          return matchProvince && matchDistrict;
        });

        console.log(`${province} ${district} 검색 결과:`, districtFeatures.length);
        
        if (districtFeatures.length > 0) {
          const coords = this.getCentroid(districtFeatures[0]);
          console.log("GeoJSON에서 찾은 좌표:", coords);
          return coords;
        }
      }

      // 시도 검색
      const provinceFeatures = this.geoJsonData.features.filter((feature: any) => {
        const props = feature.properties;
        return props.NL_NAME_1 && (props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1));
      });

      console.log(`${province} 검색 결과:`, provinceFeatures.length);
      
      if (provinceFeatures.length > 0) {
        // 시도의 모든 구역 중앙 좌표 계산
        let sumLat = 0;
        let sumLng = 0;
        let count = 0;
        
        provinceFeatures.forEach((feature: any) => {
          const centroid = this.getCentroid(feature);
          sumLat += centroid.lat;
          sumLng += centroid.lng;
          count++;
        });
        
        if (count > 0) {
          const avgCoords = {
            lat: sumLat / count,
            lng: sumLng / count
          };
          console.log("시도 평균 좌표:", avgCoords);
          return avgCoords;
        }
      }

      // 기본값 반환
      console.log("좌표를 찾지 못함, 기본 좌표 사용");
      return this.getDefaultCoordinates(province, district);
      
    } catch (error) {
      console.error("좌표 검색 처리 오류:", error);
      return this.getDefaultCoordinates(province, district);
    }
  }

  // 기본 좌표 가져오기
  private getDefaultCoordinates(province: string, district?: string): { lat: number; lng: number } {
    // 시군구 좌표 시도
    if (district) {
      const fullName = `${province} ${district}`;
      if (defaultCoordinates[fullName]) {
        return defaultCoordinates[fullName];
      }
    }
    
    // 시도 좌표 시도
    if (defaultCoordinates[province]) {
      return defaultCoordinates[province];
    }
    
    // 최종 기본값 (한국 중앙)
    return { lat: 36.5, lng: 127.5 };
  }

  // 지역의 중심점 계산
  private getCentroid(feature: any): { lat: number; lng: number } {
    try {
      if (!feature.geometry) {
        console.warn("형상 정보 없음:", feature);
        return { lat: 36.5, lng: 127.5 };
      }
      
      // 포인트 타입
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng };
      } 
      
      // 폴리곤 타입
      if (feature.geometry.type === 'Polygon') {
        // 첫 번째 링(외부 링)의 모든 점 평균
        const coordinates = feature.geometry.coordinates[0];
        const sumLat = coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0);
        const sumLng = coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0);
        const count = coordinates.length;
        
        return {
          lat: sumLat / count,
          lng: sumLng / count
        };
      }
      
      // 멀티폴리곤 타입
      if (feature.geometry.type === 'MultiPolygon') {
        // 모든 폴리곤의 첫 번째 링 점들 평균
        let sumLat = 0;
        let sumLng = 0;
        let totalPoints = 0;
        
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          const ring = polygon[0]; // 첫 번째 링
          ring.forEach((coord: number[]) => {
            sumLng += coord[0];
            sumLat += coord[1];
            totalPoints++;
          });
        });
        
        if (totalPoints > 0) {
          return {
            lat: sumLat / totalPoints,
            lng: sumLng / totalPoints
          };
        }
      }

      console.warn("지원되지 않는 형상 타입:", feature.geometry.type);
      return { lat: 36.5, lng: 127.5 };
    } catch (error) {
      console.error("중심점 계산 오류:", error);
      return { lat: 36.5, lng: 127.5 };
    }
  }
}

// 산불 데이터 서비스
export class ForestFireService {
  private readonly API_URL = "http://localhost:4000/api/fireList";
  private readonly geoJsonService: GeoJsonService;
  private cachedFireData: ForestFireData[] | null = null;
  
  constructor() {
    this.geoJsonService = new GeoJsonService();
    
    // 미리 GeoJSON 로드 시작
    this.geoJsonService.loadGeoJsonData().catch(error => {
      console.error("초기 GeoJSON 로드 오류:", error);
    });
  }

  async getForestFires(): Promise<ForestFireData[]> {
    // 캐시된 데이터가 있으면 반환
    if (this.cachedFireData) {
      return this.cachedFireData;
    }
    
    try {
      const data = await fetchData<Record<string, unknown>[]>(this.API_URL);
      const processedData = await this.processForestFireData(data);
      
      // 처리된 데이터 캐싱
      this.cachedFireData = processedData;
      return processedData;
    } catch (error) {
      console.error("산불 데이터를 가져오는 중 오류 발생:", error);
      return [];
    }
  }

  async getFiresByProvince(province: string): Promise<ForestFireData[]> {
    const fires = await this.getForestFires();
    return fires.filter((fire) => fire.province === province);
  }

  async getFiresByStatus(status: ForestFireData["status"]): Promise<ForestFireData[]> {
    const fires = await this.getForestFires();
    return fires.filter((fire) => fire.status === status);
  }

  async getFireById(id: string): Promise<ForestFireData | undefined> {
    const fires = await this.getForestFires();
    return fires.find((fire) => fire.id === id);
  }

  // API 데이터 처리
  private async processForestFireData(apiData: Record<string, unknown>[]): Promise<ForestFireData[]> {
    const processedData: ForestFireData[] = [];
    
    for (let i = 0; i < apiData.length; i++) {
      const item = apiData[i];
      
      // 날짜 포맷팅
      const dateStr = typeof item.date === "string" ? item.date : "";
      const formattedDate = dateStr.length === 8
        ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
        : dateStr;

      // 진화율
      const extinguishPercentage = typeof item.percentage === "string" || typeof item.percentage === "number"
        ? String(item.percentage)
        : "0";

      // 상태 변환
      const statusText = typeof item.status === "string" ? item.status : "";
      const status = convertStatus(statusText, extinguishPercentage);

      // 대응 단계
      const responseLevelName = typeof item.issueName === "string" ? item.issueName : "1단계";
      const severity = getResponseLevel(responseLevelName);

      // 위치 정보
      const location = typeof item.location === "string" ? item.location : "";
      const sigungu = typeof item.sigungu === "string" ? item.sigungu : undefined;
      const { province, district } = extractLocation(location, sigungu);

      // 좌표 가져오기 - 각 산불마다 고유한 좌표를 가지도록 일부 랜덤성 추가
      const baseCoords = await this.geoJsonService.getCoordinatesByName(province, district);
      const jitter = 0.01; // 최대 1km 정도의 오차 (실제 데이터에서는 제거)
      const coordinates = {
        lat: baseCoords.lat + (Math.random() * 2 - 1) * jitter,
        lng: baseCoords.lng + (Math.random() * 2 - 1) * jitter
      };

      // 피해 면적
      const affectedArea = typeof item.area === "number" ? item.area : 0;

      // 고유 ID
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
      });
    }

    return processedData;
  }
}

// 통계 기능
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

// 싱글톤 인스턴스
export const forestFireService = new ForestFireService();