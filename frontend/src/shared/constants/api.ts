/**
 * API 관련 상수
 */

/** API 기본 URL */
export const API_BASE_URL = 'http://localhost:4000';

/** 산불 목록 API 엔드포인트 */
export const FIRE_LIST_ENDPOINT = `${API_BASE_URL}/api/fireList`;

/** 캐시 관련 상수 */
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5분

/** 지도 관련 상수 */
export const GEO_JSON_PATH = '/assets/map/gadm41_KOR_2.json';
