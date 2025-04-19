import { useForestFireData } from "./lib/useForestFireData";
import { useDataErrorHandling } from "./lib/useDataErrorHandling";
import type { ForestFireDataState } from "./model/types";
import { createFireDataLoadError, createFireDataParseError } from "./model/dataErrorTypes";
export { useForestFireData };
export { useDataErrorHandling };
export type { ForestFireDataState };
export { createFireDataLoadError, createFireDataParseError };
