import { ForestFireData } from "../../../shared/model/forestFire";
import { FireFilterType } from "../../../shared/model/filterTypes";

/**
 * 산불 목록 컴포넌트 Props
 */
export interface ForestFireListProps {
  fires: ForestFireData[];
  onFireSelect?: (fire: ForestFireData) => void;
  selectedFireId?: string;
  showFilter?: boolean;
  filter?: FireFilterType;
  onFilterChange?: (filter: FireFilterType) => void;
}

/**
 * 산불 아이템 컴포넌트 Props
 */
export interface ForestFireItemProps {
  fire: ForestFireData;
  onSelect?: (fire: ForestFireData) => void;
  isSelected?: boolean;
}
