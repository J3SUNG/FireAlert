/**
 * GeoJson 데이터 관련 타입 정의
 */

export interface GeoJsonProperties {
  NL_NAME_1?: string;
  NL_NAME_2?: string;
  TYPE_2?: string;
  [key: string]: unknown;
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
  lat: number;
  lng: number;
}
