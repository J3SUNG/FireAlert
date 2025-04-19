import { ForestFireData } from "../../../shared/model/forestFire";
import { FireFilterType, FilterType } from "../../../shared/model";

/**
 * 대응 단계별 개수 타입
 */
export interface ResponseLevelCounts {
  level3: number;
  level2: number;
  level1: number;
  initial: number;
}

/**
 * 필터 관련 공통 속성 인터페이스
 */
export interface FireAlertFilterProps {
  selectedFilter: FireFilterType;
  setSelectedFilter: (filter: FireFilterType) => void;
  buttonLabels: FilterType;
}

/**
 * 헤더 컴포넌트 속성 인터페이스
 */
export interface FireAlertHeaderProps extends FireAlertFilterProps {
  currentTime: Date;
  formatDate: (date: Date) => string;
}

/**
 * 컨텐츠 컴포넌트 속성 인터페이스
 */
export interface FireAlertContentProps {
  isLoading: boolean;
  hasError: string | null;
  handleReload: () => void;
  filteredData: ForestFireData[];
  selectedFireId: string | undefined;
  selectedFilter: FireFilterType;
  handleFireSelect: (fire: ForestFireData) => void;
  responseLevelCounts: ResponseLevelCounts;
  setSelectedFilter: (filter: FireFilterType) => void;
}

/**
 * 사이드바 컴포넌트 속성 인터페이스
 */
export interface FireAlertSidebarProps {
  filteredData: ForestFireData[];
  selectedFilter: FireFilterType;
  selectedFireId: string | undefined;
  handleFireSelect: (fire: ForestFireData) => void;
  setSelectedFilter: (filter: FireFilterType) => void;
}
