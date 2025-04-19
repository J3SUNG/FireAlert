import {
  AppError,
  ErrorType,
  ErrorCategory,
  ErrorSeverity,
  ErrorContext,
  ErrorHandler,
} from "./types";

import { GeneralErrorCode, DataErrorCode, MapErrorCode, getErrorMessage } from "./errorCodes";

import {
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  createFireDataParseError,
  createFireDataLoadError,
  createForestFireDataError,
} from "./dataErrorTypes";

import {
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError,
} from "./mapErrorTypes";

import { getErrorService, resetErrorService } from "./ErrorHandlingService";

import { useErrorHandling, useAsyncOperation } from "./useErrorHandling";

import ErrorBoundary, { ErrorFallbackUI } from "./boundary";

export type { AppError, ErrorContext, ErrorHandler };

export { ErrorType, ErrorCategory, ErrorSeverity, GeneralErrorCode, DataErrorCode, MapErrorCode };

export { getErrorMessage, getErrorService, resetErrorService };

export {
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  createFireDataParseError,
  createFireDataLoadError,
  createForestFireDataError,
};

export {
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError,
};

export { useErrorHandling, useAsyncOperation };

export { ErrorBoundary, ErrorFallbackUI };
