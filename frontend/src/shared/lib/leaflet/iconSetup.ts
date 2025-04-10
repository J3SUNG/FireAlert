import L from 'leaflet';

/**
 * Leaflet 아이콘 기본 설정을 초기화하는 함수
 * 
 * CDN 기반 마커 이미지 사용을 위한 설정
 */
export function setupDefaultLeafletIcons(): void {
  interface IconDefault extends L.Icon.Default {
    _getIconUrl?: unknown;
  }

  // 기존 아이콘 URL 가져오기 함수 제거
  delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
  
  // CDN 경로로 기본 아이콘 설정
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}
