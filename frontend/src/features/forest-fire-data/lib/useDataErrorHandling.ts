import {
  useErrorHandling,
  DataErrorCode,
  createForestFireDataError,
  createFireDataLoadError,
  createFireDataParseError,
} from "../../../shared/lib/errors";

/**
 * 데이터 특화 에러 처리 훅
 */
export function useDataErrorHandling(component: string) {
  const [errorState, errorActions] = useErrorHandling(component, "forest-fire-data");

  const createFetchError = (originalError?: Error, additionalInfo?: string) => {
    return createFireDataLoadError(originalError, additionalInfo);
  };

  const createParsingError = (originalError?: Error, additionalInfo?: string) => {
    return createFireDataParseError(originalError, additionalInfo);
  };

  const createDataError = (
    errorCode: DataErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireDataError(errorCode, originalError, additionalInfo);
  };

  return {
    ...errorState,
    ...errorActions,

    createFetchError,
    createParsingError,
    createDataError,
  };
}
