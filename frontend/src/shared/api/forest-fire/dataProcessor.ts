import { ForestFireData } from "../../model/forestFire";
import { geoJsonService } from "../geoJsonService";
import { extractItemData, createForestFireDataWithCoordinates } from "./dataFormatters";
import { cacheService } from "./cacheService";
import { GEO_JSON_PATH } from '../../constants/api';

/**
 * 캐시된 GeoJSON 데이터 가져오기
 * 캐시에서 GeoJSON 데이터를 가져오거나, 필요한 경우 새로 로드합니다.
 * 
 * @returns {Promise<any>} GeoJSON 데이터
 */
export const getGeoJsonData = async (): Promise<any> => {
  const cachedData = cacheService.getGeoJsonData();
  if (cachedData) {
    return cachedData;
  }
  
  const geoJsonData = await geoJsonService.loadGeoJsonData(GEO_JSON_PATH);
  if (geoJsonData) {
    cacheService.setGeoJsonData(geoJsonData);
  }
  return geoJsonData;
};

/**
 * 산불 데이터 처리 함수
 * API에서 가져온 데이터를 애플리케이션에서 사용할 형식으로 처리합니다.
 * GeoJSON 데이터를 활용하여 좌표를 추출합니다.
 * 
 * @param {Record<string, unknown>[]} apiData API에서 받은 원데이터 배열
 * @returns {Promise<ForestFireData[]>} 처리된 산불 데이터 배열
 */
export const processForestFireData = async (
  apiData: Record<string, unknown>[]
): Promise<ForestFireData[]> => {
  // 결과 저장을 위한 배열
  const processedData: ForestFireData[] = [];

  // 캐시를 활용한 GeoJSON 데이터 로드
  const geoJsonData = await getGeoJsonData();
  if (!geoJsonData) {
    return [];
  }

  // 각 항목 처리
  for (let i = 0; i < apiData.length; i++) {
    const item = apiData[i];
    
    // 데이터 추출
    const extractedItem = extractItemData(item, i);
    
    // 좌표 정보 추가
    const forestFireData = createForestFireDataWithCoordinates(
      extractedItem,
      geoJsonData,
      geoJsonService.getCoordinatesByName
    );

    // 유효한 데이터만 추가
    if (forestFireData) {
      processedData.push(forestFireData);
    }
  }

  return processedData;
};
