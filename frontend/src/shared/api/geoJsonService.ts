import { GeoJsonData, GeoJsonFeature, Coordinates } from '../model/geoJson';

/** 캐시된 GeoJSON 데이터 */
let geoJsonData: GeoJsonData | null = null;
/** 데이터 로딩 상태 */
let isLoading = false;
/** 로딩 Promise 객체 */
let loadPromise: Promise<void> | null = null;
/** 로딩 오류 발생 여부 */
let loadError = false;

/**
 * GeoJSON 피처의 중심점 계산
 * 
 * 다양한 지오메트리 형태에 대한 중심점을 계산
 */
const getCentroid = (feature: GeoJsonFeature): Coordinates | null => {
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
  } catch (_) {
    return null;
  }
};

// GeoJSON 서비스 객체
export const geoJsonService = {
  /**
   * GeoJSON 데이터 로드
   * 
   * 지정된 URL에서 GeoJSON 데이터를 가져와 캐싱
   */
  async loadGeoJsonData(url: string): Promise<GeoJsonData | null> {
    if (geoJsonData) return geoJsonData;
    if (loadError) return null;
    if (isLoading) {
      await loadPromise;
      return geoJsonData;
    }

    isLoading = true;
    loadPromise = new Promise<void>((resolve) => {
      const loadData = async () => {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
          
          geoJsonData = await response.json() as GeoJsonData;

          isLoading = false;
          resolve();
        } catch (_) {
          loadError = true;
          isLoading = false;
          resolve();
        }
      };

      loadData().catch((_) => {
        loadError = true;
        isLoading = false;
        resolve();
      });
    });

    await loadPromise;
    return geoJsonData;
  },

  /**
   * 지역 이름으로 좌표 찾기
   * 
   * 시도 및 시군구 이름으로 좌표 검색
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
        // 시군구 정보가 있으면 해당 지역 검색
        const districtFeatures = geoJsonData.features.filter((feature) => {
          const props = feature.properties;
          if (!props.NL_NAME_1 || !props.NL_NAME_2) return false;
          
          const matchProvince = props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1);
          const matchDistrict = props.NL_NAME_2.includes(district) || district.includes(props.NL_NAME_2);
          
          return matchProvince && matchDistrict;
        });
        
        if (districtFeatures.length > 0) {
          const coords = getCentroid(districtFeatures[0]);
          return coords;
        }
      }

      // 시도 단위 검색
      const provinceFeatures = geoJsonData.features.filter((feature) => {
        const props = feature.properties;
        return props.NL_NAME_1 && (props.NL_NAME_1.includes(province) || province.includes(props.NL_NAME_1));
      });
      
      if (provinceFeatures.length > 0) {
        let sumLat = 0;
        let sumLng = 0;
        let count = 0;
        
        provinceFeatures.forEach((feature) => {
          const centroid = getCentroid(feature);
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
    } catch (_) {
      return null;
    }
  }
};
