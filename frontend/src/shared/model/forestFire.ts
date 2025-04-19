/**
 * 산불 데이터 인터페이스
 */
export interface ForestFireData {
  id: string;
  location: string;
  date: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "contained" | "extinguished";
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedArea: number;
  description?: string;
  province?: string;
  district?: string;
  extinguishPercentage?: string;
  responseLevelName?: string;
}
