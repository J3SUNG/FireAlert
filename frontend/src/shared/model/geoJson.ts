/**
 * GeoJson 데이터 관련 타입 정의
 */

export interface GeoJsonProperties {
  NL_NAME_1?: string;  // 시도명
  NL_NAME_2?: string;  // 시군구명
  TYPE_2?: string;     // 지역 타입
  [key: string]: unknown;  // 기타 속성
}

export interface GeoJsonGeometry {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon' | 'MultiPoint' | 'MultiLineString' | 'GeometryCollection';
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: GeoJsonProperties;
  geometry: GeoJsonGeometry;
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface Coordinates {
  lat: number;  // 위도
  lng: number;  // 경도
}
