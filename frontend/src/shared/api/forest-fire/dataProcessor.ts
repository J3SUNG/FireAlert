import { ForestFireData } from "../../model/forestFire";
import { geoJsonService } from "../geoJsonService";
import { extractItemData, createForestFireDataWithCoordinates } from "./dataFormatters";
import { cacheService } from "./cacheService";
import { GEO_JSON_PATH } from "../../constants/api";

/**
 * 캐시된 GeoJSON 데이터 가져오기
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
 */
export const processForestFireData = async (
  apiData: Record<string, unknown>[]
): Promise<ForestFireData[]> => {
  const processedData: ForestFireData[] = [];

  const geoJsonData = await getGeoJsonData();
  if (!geoJsonData) {
    return [];
  }

  for (let i = 0; i < apiData.length; i++) {
    const item = apiData[i];

    const extractedItem = extractItemData(item, i);

    const forestFireData = createForestFireDataWithCoordinates(
      extractedItem,
      geoJsonData,
      geoJsonService.getCoordinatesByName
    );

    if (forestFireData) {
      processedData.push(forestFireData);
    }
  }

  return processedData;
};
