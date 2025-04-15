/**
 * 산불 데이터 API 관련 모듈
 * 
 * 산불 데이터를 가져오고 관리하는 서비스와 관련 유틸리티를 제공합니다.
 * 각 모듈은 특정 관심사에 집중합니다:
 * - apiClient: 기본 API 통신 처리
 * - cacheService: 데이터 캐싱 관리
 * - dataFormatters: 데이터 변환 및 포맷팅
 * - dataProcessor: 원시 데이터 처리 및 변환
 * - forestFireService: 메인 서비스 API
 */

// 외부에 공개할 메인 서비스
export { forestFireService } from './forestFireService';

// 필요한 경우 유틸리티 함수도 내보내기
export { formatDateString } from './dataFormatters';
export { processForestFireData } from './dataProcessor';

// 필요에 따라 타입도 내보낼 수 있음
// export type { ... };
