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
 * 다양한 지오메트리 형태(Point, Polygon, MultiPolygon)에 대한 중심점을 계산합니다.
 * 
 * @param {GeoJsonFeature} feature 중심점을 계산할 GeoJSON 피처
 * @returns {Coordinates | null} 계산된 중심점 좌표 또는 계산 실패 시 null
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
    // 중심점 계산 중 오류 처리
    return null;
  }
};

// GeoJSON 서비스 객체
export const geoJsonService = {
  /**
   * GeoJSON 데이터 로드
   * 지정된 URL에서 GeoJSON 데이터를 가져오고 캐싱합니다.
   * 
   * @param {string} url GeoJSON 파일의 URL
   * @returns {Promise<GeoJsonData | null>} 로드된 GeoJSON 데이터 또는 오류 시 null
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
          // GeoJSON 데이터 로드 중 오류 처리
          loadError = true;
          isLoading = false;
          resolve();
        }
      };

      loadData().catch((_) => {
        // GeoJSON 데이터 로드 중 오류 처리
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
   * 시도 및 시군구 이름을 기반으로 GeoJSON 데이터에서 좌표를 검색합니다.
   * 
   * @param {GeoJsonData} geoJsonData GeoJSON 데이터
   * @param {string} province 시도 이름
   * @param {string} [district] 시군구 이름 (선택적)
   * @returns {Coordinates | null} 찾은 좌표 또는 좌표를 찾지 못한 경우 null
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
          const coords = getCentroid(districtFeatures[0]);
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
      // 좌표 검색 중 오류 처리
      return null;
    }
  }
};
