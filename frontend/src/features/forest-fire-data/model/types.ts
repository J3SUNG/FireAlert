import { ForestFireData } from "../../../shared/types/forestFire";

export interface ForestFireDataState {
  fires: ForestFireData[];
  loading: boolean;
  error: string | null;
  statusCounts: {
    active: number;
    contained: number;
    extinguished: number;
    all: number;
  };
  responseLevelCounts: {
    level1: number;
    level2: number;
    level3: number;
    initial: number;
  };
}
