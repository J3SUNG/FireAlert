import { FC } from 'react';
import L from 'leaflet';
import { FireMarkerManagerProps } from '../model/types';
import { useMarkerManager } from '../lib/useMarkerManager';

/**
 * 산불 마커 관리 컴포넌트
 * 마커의 생성, 업데이트, 이벤트 처리를 담당
 */
export const FireMarkerManager: FC<FireMarkerManagerProps> = ({
  map,
  fires,
  selectedFireId,
  onFireSelect,
  isGeoJsonLoaded
}) => {
  // 마커 관리 로직을 훅으로 분리하여 주입
  useMarkerManager({
    map,
    fires,
    selectedFireId,
    onFireSelect,
    isGeoJsonLoaded
  });
  
  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};