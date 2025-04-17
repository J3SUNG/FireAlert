import { ForestFireData } from "../../../shared/model/forestFire";
import { FireFilterType, FilterType } from "../../../shared/model";

/**
 * 대응 단계별 개수 타입
 */
export interface ResponseLevelCounts {
  level3: number; // 3단계 대응 산불 개수
  level2: number; // 2단계 대응 산불 개수
  level1: number; // 1단계 대응 산불 개수
  initial: number; // 초기 대응 산불 개수
}

/**
 * 필터 관련 공통 속성 인터페이스
 */
export interface FireAlertFilterProps {
  selectedFilter: FireFilterType; // 현재 선택된 필터
  setSelectedFilter: (filter: FireFilterType) => void; // 필터 변경 핸들러
  buttonLabels: FilterType; // 필터 버튼 레이블
  getButtonClass: (filter: FireFilterType) => string; // 필터별 버튼 클래스 계산 함수
}

/**
 * 헤더 컴포넌트 속성 인터페이스
 */
export interface FireAlertHeaderProps extends FireAlertFilterProps {
  currentTime: Date; // 현재 시간
  formatDate: (date: Date) => string; // 날짜 포맷팅 함수
}

/**
 * 컨텐츠 컴포넌트 속성 인터페이스
 */
export interface FireAlertContentProps {
  isLoading: boolean; // 로딩 상태
  hasError: string | null; // 오류 메시지
  handleReload: () => void; // 데이터 재로드 핸들러
  filteredData: ForestFireData[]; // 필터링된 산불 데이터
  selectedFireId: string | undefined; // 선택된 산불 ID
  selectedFilter: FireFilterType; // 현재 선택된 필터
  handleFireSelect: (fire: ForestFireData) => void; // 산불 선택 핸들러
  responseLevelCounts: ResponseLevelCounts; // 대응 단계별 개수
  setSelectedFilter: (filter: FireFilterType) => void; // 필터 변경 핸들러
}

/**
 * 사이드바 컴포넌트 속성 인터페이스
 */
export interface FireAlertSidebarProps {
  filteredData: ForestFireData[]; // 필터링된 산불 데이터
  selectedFilter: FireFilterType; // 현재 선택된 필터
  selectedFireId: string | undefined; // 선택된 산불 ID
  handleFireSelect: (fire: ForestFireData) => void; // 산불 선택 핸들러
  setSelectedFilter: (filter: FireFilterType) => void; // 필터 변경 핸들러
}
