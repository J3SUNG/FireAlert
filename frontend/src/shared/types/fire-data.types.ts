/**
 * 산불 데이터 아이템 인터페이스
 */
export interface FireItem {
  index: string;                 // 순번
  location: string;              // 위치 (시도 + 시군구)
  sigungu?: string;              // 시군구
  percentage: string;            // 진행률 (%)
  date: string;                  // 발생 날짜 (YYYYMMDD)
  issueName: string;             // 산불레벨/단계
  status: string;                // 상태 (진행중, 진화완료 등)
}

/**
 * 산불 데이터 API 응답 인터페이스
 */
export interface FireApiResponse {
  items: FireItem[];
  timestamp: number;
  count: number;
}

/**
 * 산불 단계 레벨 타입
 */
export type FireLevel = 'level1' | 'level2' | 'level3' | 'initial' | 'unknown';

/**
 * 산불 상태 타입
 */
export type FireStatus = 'active' | 'completed' | 'unknown';
