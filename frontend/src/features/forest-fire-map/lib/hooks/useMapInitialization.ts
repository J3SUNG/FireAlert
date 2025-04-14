import { useState, useEffect, useRef, RefObject } from 'react';
import L from 'leaflet';
import { ForestFireData } from '../../../../shared/model/forestFire';

interface MapInitializationOptions {
  containerRef: RefObject<HTMLDivElement>;
  legendPosition?: L.ControlPosition;
  initialCenter?: [number, number];
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  fires?: ForestFireData[];
}

/**
 * 지도 초기화 및 생명주기 관리 훅
 * 
 * 지도 인스턴스 생성, 상태 관리, 메모리 정리 담당
 */
export function useMapInitialization({
  containerRef,
  legendPosition = 'bottomleft',
  initialCenter = [36.5, 127.8], // 한국 중앙
  initialZoom = 7,
  minZoom = 6,
  maxZoom = 18,
  _fires = [] // 사용하지 않는 매개변수 앞에 밑줄 추가
}: MapInitializationOptions) {
  // 지도 인스턴스 상태
  const [map, setMap] = useState<L.Map | null>(null);
  // 지도 로드 상태
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // 컴포넌트 마운트 상태 추적
  const mountedRef = useRef(true);
  // 지도 인스턴스 ID (메모리 관리용)
  const mapInstanceId = useRef(`map-${Date.now()}`);

  // 지도 초기화 및 정리
  useEffect(() => {
    // 컴포넌트가 마운트된 경우에만 실행
    if (!mountedRef.current || !containerRef.current) return;

    // 지도 인스턴스 생성
    const mapInstance = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom,
      maxZoom,
      attributionControl: false,
      zoomControl: false,
    });

    // 타일 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    // 줌 컨트롤 추가
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // 속성 컨트롤 추가 
    L.control.attribution({ position: 'bottomright' }).addTo(mapInstance);

    // 지도 인스턴스 상태 업데이트
    setMap(mapInstance);

    // 약간의 지연 후 로드 완료 처리
    setTimeout(() => {
      if (mountedRef.current) {
        setIsMapLoaded(true);
      }
    }, 100);

    // 컴포넌트 언마운트 시 지도 정리
    return () => {
      if (mapInstance) {
        // 이벤트 리스너 제거
        mapInstance.off();
        mapInstance.remove();
      }
      // 지도 인스턴스 상태 초기화
      setMap(null);
      setIsMapLoaded(false);
    };
  }, [
    containerRef, 
    initialCenter, 
    initialZoom, 
    minZoom, 
    maxZoom, 
    legendPosition
  ]);

  // 컴포넌트 마운트/언마운트 감지
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    map,
    isMapLoaded,
    mapInstanceId: mapInstanceId.current,
    mountedRef
  };
}
