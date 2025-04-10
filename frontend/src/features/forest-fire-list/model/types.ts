import { ForestFireData } from "../../../shared/model/forestFire";
import { FireFilterType } from "../../../shared/model/common/filterTypes";

/**
 * 산불 목록 컴포넌트 Props
 */
export interface ForestFireListProps {
  fires: ForestFireData[];               // 표시할 산불 데이터 목록
  onFireSelect?: (fire: ForestFireData) => void;  // 산불 선택 핸들러
  selectedFireId?: string;               // 현재 선택된 산불 ID
  showFilter?: boolean;                  // 필터 표시 여부
  filter?: FireFilterType;               // 현재 적용된 필터
  onFilterChange?: (filter: FireFilterType) => void;  // 필터 변경 핸들러
}

/**
 * 산불 아이템 컴포넌트 Props
 */
export interface ForestFireItemProps {
  fire: ForestFireData;                  // 표시할 산불 데이터
  onSelect?: (fire: ForestFireData) => void;  // 선택 핸들러
  isSelected?: boolean;                  // 선택 상태 여부
}
