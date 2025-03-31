import axios from "axios";
import { ForestFireData } from "../types/forestFire";
import { convertStatus, extractLocation, getResponseLevel } from "../utils/forestFireUtils";
import { geoJsonService } from "./geoJsonService";

let cachedFireData: ForestFireData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

const isCacheValid = (): boolean => {
  if (!cachedFireData || !cacheTimestamp) return false;

  const now = Date.now();
  return now - cacheTimestamp < CACHE_DURATION;
};

const saveToCache = (data: ForestFireData[]): void => {
  cachedFireData = data;
  cacheTimestamp = Date.now();
};

const formatDateString = (dateStr: string): string => {
  if (!dateStr) return "";

  return dateStr.length === 8
    ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
    : dateStr;
};

const extractItemData = (
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

const processForestFireData = async (
  apiData: Record<string, unknown>[]
): Promise<ForestFireData[]> => {
  const processedData: ForestFireData[] = [];

  const geoJsonData = await geoJsonService.loadGeoJsonData("/assets/map/gadm41_KOR_2.json");
  if (!geoJsonData) {
    return [];
  }

  for (let i = 0; i < apiData.length; i++) {
    const item = apiData[i];

    const {
      date,
      extinguishPercentage,
      status,
      severity,
      location,
      sigungu,
      affectedArea,
      itemId,
      responseLevelName,
      description,
    } = extractItemData(item, i);

    const { province, district } = extractLocation(location, sigungu);

    const coordinates = geoJsonService.getCoordinatesByName(geoJsonData, province, district);

    if (!coordinates) {
      continue;
    }

    processedData.push({
      id: itemId,
      location,
      date,
      severity,
      status,
      coordinates,
      affectedArea,
      province,
      district,
      extinguishPercentage,
      responseLevelName,
      description,
    });
  }

  return processedData;
};

export const forestFireService = {
  async getForestFires(forceRefresh = false): Promise<ForestFireData[]> {
    if (!forceRefresh && isCacheValid()) {
      return cachedFireData!;
    }

    try {
      const data = await fetchData<Record<string, unknown>[]>("http://localhost:4000/api/fireList");
      const processedData = await processForestFireData(data);

      console.log(data, processedData);

      saveToCache(processedData);
      return processedData;
    } catch (_error) {
      return [];
    }
  },

  clearCache(): void {
    cachedFireData = null;
    cacheTimestamp = null;
  },
};
