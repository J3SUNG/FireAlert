import React, { FC } from 'react';
import { FireMarkerManagerProps } from '../model/common-types';
import { useMarkerManager } from '../lib/useMarkerManager';

/**
 * 산불 마커 관리 컴포넌트
 * 마커의 생성, 업데이트, 이벤트 처리를 담당합니다.
 * 
 * React.memo를 사용하여 불필요한 렌더링을 방지합니다.
 * Leaflet map과 마커 인스턴스는 React 외부에서 관리되므로,
 * 불필요한 리렌더링이 발생하지 않도록 메모이제이션을 적용합니다.
 * 
 * @param props 마커 관리자 속성
 * @returns null (UI를 렌더링하지 않음)
 */
export const FireMarkerManager: FC<FireMarkerManagerProps> = React.memo(({
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
}, (prevProps, nextProps) => {
  // 마커 메모이제이션 최적화를 위한 비교 함수
  // 기본 props 비교에 더해, 산불 데이터의 변경이 없으면 리렌더링하지 않음
  if (!nextProps.isGeoJsonLoaded || !prevProps.isGeoJsonLoaded) {
    return false;
  }
  
  if (prevProps.selectedFireId !== nextProps.selectedFireId) {
    return false;
  }
  
  if (prevProps.map !== nextProps.map) {
    return false;
  }
  
  if (prevProps.fires.length !== nextProps.fires.length) {
    return false;
  }
  
  // 산불 ID 배열을 비교하여 변경 여부 확인
  const prevIds = prevProps.fires.map((f: any) => f.id).sort().join(',');
  const nextIds = nextProps.fires.map((f: any) => f.id).sort().join(',');
  
  return prevIds === nextIds;
});
