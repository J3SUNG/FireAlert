export interface ForestFireData {
  id: string;
  location: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'extinguished';
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedArea: number; // 면적 (헥타르)
  description?: string;
  province?: string; // 시도 (NL_NAME_1)
  district?: string; // 시군구 (NL_NAME_2)
  extinguishPercentage?: string; // 진화율
  responseLevelName?: string; // 대응단계 이름
}
