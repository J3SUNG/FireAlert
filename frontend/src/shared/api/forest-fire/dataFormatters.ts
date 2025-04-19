import { ForestFireData } from "../../model/forestFire";
import { extractLocation } from "../../lib/formatting/locationFormat";
import { convertStatus, getResponseLevel } from "../../lib/data/forestFireUtils";
import { Coordinates } from "../../model/geoJson";

/**
 * 날짜 문자열 포맷팅
 */
export const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";

  return dateStr.length === 8
    ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    : dateStr;
};

/**
 * API에서 가져온 산불 데이터 항목을 추출하고 포맷팅하는 함수
 */
export const extractItemData = (
  item: Record<string, unknown>,
  index: number
): {
  date: string;
  extinguishPercentage: string;
  status: ForestFireData["status"];
  severity: ForestFireData["severity"];
  location: string;
  sigungu?: string;
  affectedArea: number;
  itemId: string;
  responseLevelName: string;
  description?: string;
} => {
  const dateStr = typeof item.date === "string" ? item.date : "";
  const formattedDate = formatDateString(dateStr);

  const extinguishPercentage =
    typeof item.percentage === "string" || typeof item.percentage === "number"
      ? String(item.percentage)
      : "0";

  const statusText = typeof item.status === "string" ? item.status : "";
  const status = convertStatus(statusText, extinguishPercentage);

  const responseLevelName = typeof item.issueName === "string" ? item.issueName : "1단계";
  const severity = getResponseLevel(responseLevelName);

  const location = typeof item.location === "string" ? item.location : "";
  const sigungu = typeof item.sigungu === "string" ? item.sigungu : undefined;

  const affectedArea = typeof item.area === "number" ? item.area : 0;

  const itemIndex =
    typeof item.index === "string" || typeof item.index === "number" ? item.index : index + 1;

  const description = typeof item.description === "string" ? item.description : undefined;

  return {
    date: formattedDate,
    extinguishPercentage,
    status,
    severity,
    location,
    sigungu,
    affectedArea,
    itemId: `ff-${String(itemIndex)}`,
    responseLevelName,
    description,
  };
};

/**
 * 산불 데이터 항목에서 좌표 정보를 추가하는 함수
 */
export const createForestFireDataWithCoordinates = (
  extractedItem: ReturnType<typeof extractItemData>,
  geoJsonData: any,
  getCoordinatesByName: (geoJson: any, province: string, district: string) => Coordinates | null
): ForestFireData | null => {
  const { province, district } = extractLocation(extractedItem.location, extractedItem.sigungu);
  const coordinates = getCoordinatesByName(geoJsonData, province, district);

  if (!coordinates) {
    return null;
  }

  return {
    id: extractedItem.itemId,
    location: extractedItem.location,
    date: extractedItem.date,
    severity: extractedItem.severity,
    status: extractedItem.status,
    coordinates,
    affectedArea: extractedItem.affectedArea,
    province,
    district,
    extinguishPercentage: extractedItem.extinguishPercentage,
    responseLevelName: extractedItem.responseLevelName,
    description: extractedItem.description,
  };
};
