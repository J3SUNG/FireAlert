import { Button, LoadingIndicator, ErrorDisplay } from "./ui/components";
import { FireStatusSummary } from "./ui";
import { combineClasses } from "./ui/utils/classNameUtils";
import { forestFireService } from "./api/forest-fire";
import { geoJsonService } from "./api/geoJsonService";
import {
  APP_TITLE,
  FIRE_STATUS_TEXT,
  LOADING_MESSAGE,
  ERROR_MESSAGES,
  BUTTON_TEXT,
  FIRE_STATUS_CLASSES,
} from "./constants";
import {
  useCurrentTime,
  useFireFilterAndSelection,
  formatLocation,
  extractLocation,
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  convertStatus,
  getResponseLevel,
  createCache,
  setupDefaultLeafletIcons,
  calculateStatusCounts,
  calculateResponseLevelCounts,
} from "./lib";
import {
  ErrorBoundary,
  ErrorFallbackUI,
  useErrorHandling,
  useAsyncOperation,
  createDataFetchError,
  createMapInitError,
} from "./lib/errors";
import type { ForestFireData, GeoJsonData } from "./model";
import { FireFilterType } from "./model/filterTypes";
export { Button, LoadingIndicator, ErrorDisplay, FireStatusSummary, combineClasses };
export { forestFireService, geoJsonService };
export {
  useCurrentTime,
  useFireFilterAndSelection,
  formatLocation,
  extractLocation,
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  convertStatus,
  getResponseLevel,
  createCache,
  setupDefaultLeafletIcons,
  calculateStatusCounts,
  calculateResponseLevelCounts,
};
export {
  ErrorBoundary,
  ErrorFallbackUI,
  useErrorHandling,
  useAsyncOperation,
  createDataFetchError,
  createMapInitError,
};
export type { ForestFireData, GeoJsonData };
export { FireFilterType };
export {
  APP_TITLE,
  FIRE_STATUS_TEXT,
  LOADING_MESSAGE,
  ERROR_MESSAGES,
  BUTTON_TEXT,
  FIRE_STATUS_CLASSES,
};
