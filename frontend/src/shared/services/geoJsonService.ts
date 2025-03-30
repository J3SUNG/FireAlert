import { GeoJsonData, GeoJsonFeature, Coordinates } from '../types/geoJson';

/**
 * GeoJson 데이터를 관리하는 서비스
 */
export class GeoJsonService {
  private geoJsonData: GeoJsonData | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private loadError = false;

  /**
   * GeoJSON 데이터를 로드합니다.
   * @param url GeoJSON 파일 경로
   */
  async loadGeoJsonData(url: string): Promise<GeoJsonData | null> {
    if (this.geoJsonData) return this.geoJsonData;
    if (this.loadError) return null;
    if (this.isLoading) {
      await this.loadPromise;
      return this.geoJsonData;
    }

    this.isLoading = true;
    this.loadPromise = new Promise<void>((resolve) => {
      const loadData = async () => {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
          
          this.geoJsonData = await response.json() as GeoJsonData;

          this.isLoading = false;
          resolve();
        } catch (errorMsg) {
          console.error('GeoJSON 데이터 로드 중 오류:', errorMsg);
          this.loadError = true;
          this.isLoading = false;
          resolve();
        }
      };

      loadData().catch((error) => {
        console.error('GeoJSON 데이터 로드 중 오류:', error);
        this.loadError = true;
        this.isLoading = false;
        resolve();
      });
    });

    await this.loadPromise;
    return this.geoJsonData;
  }

  /**
   * 지역 이름으로 좌표 찾기
   * @param geoJsonData GeoJSON 데이터
   * @param province 시/도 이름
   * @param district 시/군/구 이름 (옵션)
   */
  getCoordinatesByName(
    geoJsonData: GeoJsonData,
    province: string,
    district?: string
  ): Coordinates | null {
    try {
      if (!geoJsonData?.features?.length) {
        return null;
      }

      if (district) {
        const districtFeatures = geoJsonData.features.filter((feature) => {
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

      const provinceFeatures = geoJsonData.features.filter((feature) => {
        const props = feature.properties;
        return props.NL_NAME_1 && (props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1));
      });
      
      if (provinceFeatures.length > 0) {
        let sumLat = 0;
        let sumLng = 0;
        let count = 0;
        
        provinceFeatures.forEach((feature) => {
          const centroid = this.getCentroid(feature);
          if (centroid) {
            sumLat += centroid.lat;
            sumLng += centroid.lng;
            count++;
          }
        });
        
        if (count > 0) {
          return {
            lat: sumLat / count,
            lng: sumLng / count
          };
        }
      }

      return null;
    } catch (error) {
      console.error('좌표 검색 중 오류:', error);
      return null;
    }
  }

  /**
   * GeoJSON 피처의 중심점 계산
   * @param feature GeoJSON 피처
   */
  getCentroid(feature: GeoJsonFeature): Coordinates | null {
    try {
      if (!feature.geometry) {
        throw new Error("지오메트리 정보 없음");
      }
      
      if (feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates as number[];
        const [lng, lat] = coordinates;
        return { lat, lng };
      } 
      
      if (feature.geometry.type === 'Polygon') {
        const coordinates = (feature.geometry.coordinates as number[][][])[0];
        const sumLat = coordinates.reduce((sum, coord) => sum + coord[1], 0);
        const sumLng = coordinates.reduce((sum, coord) => sum + coord[0], 0);
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
        
        (feature.geometry.coordinates as number[][][][]).forEach((polygon) => {
          polygon[0].forEach((coord) => {
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

      return null;
    } catch (error) {
      console.error('중심점 계산 중 오류:', error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const geoJsonService = new GeoJsonService();
