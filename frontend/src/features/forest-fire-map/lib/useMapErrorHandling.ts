import { useErrorHandling } from "../../../shared/lib/errors";
import {
  MapErrorCode,
  createForestFireMapError,
  createMapInitializationError,
  createMarkerCreationError,
} from "../model/mapErrorTypes";

/**
 * 지도 특화 에러 처리 훅
 */
export function useMapErrorHandling(component: string) {
  const [errorState, errorActions] = useErrorHandling(component, "forest-fire-map");

  const createGeoJsonError = (
    code: MapErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireMapError(code, originalError, additionalInfo);
  };

  const createMapInitError = (originalError?: Error, additionalInfo?: string) => {
    return createMapInitializationError(originalError, additionalInfo);
  };

  const createMarkerError = (originalError?: Error, additionalInfo?: string) => {
    return createMarkerCreationError(originalError, additionalInfo);
  };

  const createMapError = (
    errorCode: MapErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireMapError(errorCode, originalError, additionalInfo);
  };

  return {
    ...errorState,
    ...errorActions,

    createGeoJsonError,
    createMapInitError,
    createMarkerError,
    createMapError,
  };
}
