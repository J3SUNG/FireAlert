// GeoJSON 타입 정의
export interface GeoJSONFeatureProperties {
  CTP_KOR_NM?: string;
  SIG_KOR_NM?: string;
  NAME_1?: string;
  NAME_2?: string;
  [key: string]: unknown;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][] | number[][][][];
}

export interface GeoJSONFeature {
  type: string;
  properties: GeoJSONFeatureProperties;
  geometry: GeoJSONGeometry;
}

export interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}
