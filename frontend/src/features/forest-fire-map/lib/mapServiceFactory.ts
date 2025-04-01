import { MapService } from '../model/mapTypes';
import { LeafletMapService } from './LeafletMapService';

/**
 * 맵 서비스 타입 (추후 확장 가능)
 */
export enum MapServiceType {
  LEAFLET = 'leaflet',
  // GOOGLE = 'google',
  // NAVER = 'naver',
  // KAKAO = 'kakao',
}

/**
 * 맵 서비스 팩토리
 * 필요한 맵 서비스 구현체를 생성하여 반환
 */
export function createMapService(type: MapServiceType = MapServiceType.LEAFLET): MapService {
  switch(type) {
    case MapServiceType.LEAFLET:
      return new LeafletMapService();
    // 추후 다른 맵 서비스 추가 가능
    // case MapServiceType.GOOGLE:
    //   return new GoogleMapService();
    default:
      return new LeafletMapService();
  }
}

// 전역 맵 서비스 인스턴스를 제공하는 싱글톤
let mapServiceInstance: MapService | null = null;

/**
 * 맵 서비스 인스턴스 가져오기
 * 이미 생성된 인스턴스가 있으면 재사용, 없으면 새로 생성
 */
export function getMapService(type: MapServiceType = MapServiceType.LEAFLET): MapService {
  if (!mapServiceInstance) {
    mapServiceInstance = createMapService(type);
  }
  return mapServiceInstance;
}

/**
 * 맵 서비스 인스턴스 재설정
 */
export function resetMapService(): void {
  if (mapServiceInstance) {
    mapServiceInstance = null;
  }
}