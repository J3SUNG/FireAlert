import axios from "axios";
import { ForestFireData } from "../types/forestFire";
import { provinceShortNames } from "../utils/locationFormat";

const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

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

export class GeoJsonService {
  private geoJsonData: any = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private loadError = false;

  async loadGeoJsonData(): Promise<void> {
    if (this.geoJsonData) return;
    if (this.loadError) return;
    if (this.isLoading) return this.loadPromise!;

    this.isLoading = true;
    this.loadPromise = new Promise<void>((resolve) => {
      const loadData = async () => {
        try {
          const response = await fetch('../assets/map/gadm41_KOR_2.json');
          
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
          
          this.geoJsonData = await response.json();

          this.isLoading = false;
          resolve();
        } catch (errorMsg) {
          this.loadError = true;
          this.isLoading = false;
          resolve();
        }
      };

      loadData().catch(() => {
        this.loadError = true;
        this.isLoading = false;
        resolve();
      });
    });

    return this.loadPromise;
  }

  async getCoordinatesByName(province: string, district?: string): Promise<{ lat: number; lng: number } | null> {
    try {
      await this.loadGeoJsonData();
      
      if (!this.geoJsonData?.features?.length) {
        return null;
      }

      if (district) {
        const districtFeatures = this.geoJsonData.features.filter((feature: any) => {
          const props = feature.properties;
          if (!props.NL_NAME_1 || !props.NL_NAME_2) return false;
          
          const matchProvince = props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1);
          const matchDistrict = props.NL_NAME_2.includes(district) || district.includes(props.NL_NAME_2);
          
          return matchProvince && matchDistrict;
        });
        
        if (districtFeatures.length > 0) {
          const coords = this.getCentroid(districtFeatures[0]);
          return coords;
        }
      }

      const provinceFeatures = this.geoJsonData.features.filter((feature: any) => {
        const props = feature.properties;
        return props.NL_NAME_1 && (props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1));
      });
      
      if (provinceFeatures.length > 0) {
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

          return avgCoords;
        }
      }

      return null;
      
    } catch (errorMsg) {
      return null;
    }
  }

  private getCentroid(feature: any): { lat: number; lng: number } {
    try {
      if (!feature.geometry) {
        throw new Error("지오메트리 정보 없음");
      }
      
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        return { lat, lng };
      } 
      
      if (feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates[0];
        const sumLat = coordinates.reduce((sum: number, coord: number[]) => sum + coord[1], 0);
        const sumLng = coordinates.reduce((sum: number, coord: number[]) => sum + coord[0], 0);
        const count = coordinates.length;
        
        return {
          lat: sumLat / count,
          lng: sumLng / count
        };
      }
      
      if (feature.geometry.type === 'MultiPolygon') {
        let sumLat = 0;
        let sumLng = 0;
        let totalPoints = 0;
        
        feature.geometry.coordinates.forEach((polygon: number[][][]) => {
          const ring = polygon[0];
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

      throw new Error(`지원되지 않는 지오메트리 형식: ${feature.geometry.type}`);
    } catch (errorMsg) {
      throw errorMsg;
    }
  }
}

export class ForestFireService {
  private readonly API_URL = "http://localhost:4000/api/fireList";
  private readonly geoJsonService: GeoJsonService;
  private cachedFireData: ForestFireData[] | null = null;
  
  constructor() {
    this.geoJsonService = new GeoJsonService();
    this.geoJsonService.loadGeoJsonData().catch(() => {});
  }

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

  private async processForestFireData(apiData: Record<string, unknown>[]): Promise<ForestFireData[]> {
    const processedData: ForestFireData[] = [];
    
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

      const coordinates = await this.geoJsonService.getCoordinatesByName(province, district);
      
      if (!coordinates) {
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
      });
    }

    return processedData;
  }
}

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

export const forestFireService = new ForestFireService();