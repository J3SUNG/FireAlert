import { ForestFireData } from "../../../shared/model/forestFire";
import { FireFilterType, FilterType } from "../../../shared/model/common/filterTypes";


/**
 * 대응 단계별 개수 타입
 */
export interface ResponseLevelCounts {
  /** 3단계 대응 산불 개수 */
  level3: number;
  /** 2단계 대응 산불 개수 */
  level2: number;
  /** 1단계 대응 산불 개수 */
  level1: number;
  /** 초기 대응 산불 개수 */
  initial: number;
}

/**
 * 필터 관련 공통 속성 인터페이스
 */
export interface FireAlertFilterProps {
  /** 현재 선택된 필터 */
  selectedFilter: FireFilterType;
  /** 필터 변경 핸들러 */
  setSelectedFilter: (filter: FireFilterType) => void;
  /** 필터 버튼 레이블 */
  buttonLabels: FilterType;
  /** 필터별 버튼 클래스 계산 함수 */
  getButtonClass: (filter: FireFilterType) => string;
}

/**
 * 헤더 컴포넌트 속성 인터페이스
 */
export interface FireAlertHeaderProps extends FireAlertFilterProps {
  /** 현재 시간 */
  currentTime: Date;
  /** 날짜 포맷팅 함수 */
  formatDate: (date: Date) => string;
}

/**
 * 컨텐츠 컴포넌트 속성 인터페이스
 */
export interface FireAlertContentProps {
  /** 로딩 상태 */
  loading: boolean;
  /** 오류 메시지 */
  error: string | null;
  /** 데이터 재로드 핸들러 */
  handleReload: () => void;
  /** 필터링된 산불 데이터 */
  filteredData: ForestFireData[];
  /** 선택된 산불 ID */
  selectedFireId: string | undefined;
  /** 현재 선택된 필터 */
  selectedFilter: FireFilterType;
  /** 산불 선택 핸들러 */
  handleFireSelect: (fire: ForestFireData) => void;
  /** 대응 단계별 개수 */
  responseLevelCounts: ResponseLevelCounts;
  /** 필터 변경 핸들러 */
  setSelectedFilter: (filter: FireFilterType) => void;
}

/**
 * 사이드바 컴포넌트 속성 인터페이스
 */
export interface FireAlertSidebarProps {
  /** 필터링된 산불 데이터 */
  filteredData: ForestFireData[];
  /** 현재 선택된 필터 */
  selectedFilter: FireFilterType;
  /** 선택된 산불 ID */
  selectedFireId: string | undefined;
  /** 산불 선택 핸들러 */
  handleFireSelect: (fire: ForestFireData) => void;
  /** 필터 변경 핸들러 */
  setSelectedFilter: (filter: FireFilterType) => void;
}