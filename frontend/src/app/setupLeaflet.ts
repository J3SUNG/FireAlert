import { setupDefaultLeafletIcons } from "../shared/lib/leaflet/iconSetup";

/**
 * Leaflet 지도 라이브러리 초기 설정
 * 
 * Leaflet 기본 아이콘 경로 문제를 해결합니다.
 */
export const setupLeaflet = (): void => {
  setupDefaultLeafletIcons();
};