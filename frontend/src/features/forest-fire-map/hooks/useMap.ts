import { useState, useCallback, useEffect, RefObject, useRef } from "react";
import L from "leaflet";
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../constants/mapSettings";
import { createLegendControl } from "../utils/legendUtils";

interface UseMapOptions {
  containerRef: RefObject<HTMLDivElement>;
  legendPosition?: L.ControlPosition;
  options?: Partial<typeof MAP_INIT_OPTIONS>;
}

/**
 * Leaflet 맵을 관리하는 커스텀 훅
 * StrictMode와 렌더링 사이클을 고려한 구현
 */
export function useMap({
  containerRef,
  legendPosition = "bottomleft",
  options = {},
}: UseMapOptions) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  // 맵 ID와 초기화 완료 여부를 추적
  const instanceIdRef = useRef<string>(`map-${Date.now()}`);
  const isInitializedRef = useRef<boolean>(false);

  // 맵 초기화 함수 - 클린업 로직 포함
  const initializeMap = useCallback(() => {
    // 이미 초기화된 경우 중복 초기화 방지
    if (isInitializedRef.current && mapRef.current) {
      console.log("[useMap] 이미 초기화된 맵 인스턴스 재사용");
      return mapRef.current;
    }

    const container = containerRef.current;
    if (!container) {
      console.warn("[useMap] 컨테이너 요소가 없음");
      return null;
    }

    // 컨테이너가 DOM에 존재하는지 확인
    if (!document.body.contains(container)) {
      console.warn("[useMap] 컨테이너가 DOM에 연결되지 않음");
      return null;
    }

    // 기존 맵 인스턴스 정리 - 강제 정리
    if (mapRef.current) {
      try {
        // 이벤트 리스너 제거
        mapRef.current.off();
        
        // 모든 레이어 제거
        mapRef.current.eachLayer(layer => {
          try {
            mapRef.current?.removeLayer(layer);
          } catch (e) {
            // 무시
          }
        });
        
        // 맵 제거
        mapRef.current.remove();
        
        // 참조 초기화
        mapRef.current = null;
      } catch (e) {
        console.warn("[useMap] 기존 맵 정리 중 오류:", e);
        mapRef.current = null;
      }
    }

    // 컨테이너 강제 초기화
    try {
      // 모든 내용 제거
      container.innerHTML = '';
      
      // Leaflet 내부 ID 제거
      if ('_leaflet_id' in container) {
        delete (container as any)._leaflet_id;
      }
      
      // Leaflet 관련 모든 클래스 제거
      const leafletClasses = Array.from(container.classList)
        .filter(cls => cls.startsWith('leaflet'));
      
      leafletClasses.forEach(cls => {
        container.classList.remove(cls);
      });
      
      // 이벤트 리스너 제거
      L.DomEvent.off(container);
    } catch (e) {
      console.warn("[useMap] 컨테이너 초기화 중 오류:", e);
    }

    // 고유 ID 속성 추가
    container.setAttribute('data-map-id', instanceIdRef.current);

    // 새 맵 인스턴스 생성 시도
    try {
      // 배경색 설정
      container.style.backgroundColor = MAP_BACKGROUND_COLOR;
      
      // 맵 옵션 병합
      const mergedOptions = {
        ...MAP_INIT_OPTIONS,
        ...options,
        // 명시적으로 컨트롤 비활성화 (직접 추가할 예정)
        zoomControl: false,
        attributionControl: false
      };
      
      // 새 맵 인스턴스 생성
      const newMap = L.map(container, mergedOptions);
      mapRef.current = newMap;

      // 지도 경계 설정
      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8;

      // 컨트롤 추가
      L.control.zoom({ position: "topright" }).addTo(newMap);
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(newMap);
      
      // 지연 후 레전드 추가 (DOM 렌더링 확인)
      setTimeout(() => {
        try {
          if (mapRef.current === newMap && document.body.contains(container)) {
            createLegendControl(legendPosition).addTo(newMap);
          }
        } catch (e) {
          console.warn("[useMap] 레전드 추가 중 오류:", e);
        }
      }, 100);

      // 배경색 설정
      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;

      // 이벤트 핸들러 설정
      // 지도 로드 이벤트
      const handleLoad = () => {
        if (mapRef.current === newMap) {
          console.log("[useMap] 맵 로드 완료");
          setIsMapLoaded(true);
        }
      };
      
      newMap.once('load', handleLoad);
      
      // 안전을 위해 타임아웃으로도 로드 상태 설정
      setTimeout(() => {
        if (mapRef.current === newMap && !isMapLoaded) {
          console.log("[useMap] 타임아웃으로 맵 로드 완료 처리");
          setIsMapLoaded(true);
        }
      }, 500);

      // 초기화 완료 표시
      isInitializedRef.current = true;
      console.log("[useMap] 새 맵 인스턴스 생성 완료");
      
      return newMap;
    } catch (error) {
      console.error("[useMap] 맵 초기화 중 오류:", error);
      isInitializedRef.current = false;
      mapRef.current = null;
      setIsMapLoaded(true); // 오류가 발생해도 로딩 상태는 완료로 처리
      return null;
    }
  }, [containerRef, legendPosition, options, isMapLoaded]);

  // 맵 제거 함수
  const destroyMap = useCallback(() => {
    if (!mapRef.current) return;
    
    try {
      const mapInstance = mapRef.current;
      console.log("[useMap] 맵 인스턴스 정리 시작");
      
      // 모든 이벤트 제거
      mapInstance.off();
      
      // 모든 레이어 제거
      mapInstance.eachLayer(layer => {
        try {
          mapInstance.removeLayer(layer);
        } catch (e) {
          // 무시
        }
      });
      
      // 맵 제거
      mapInstance.remove();
      
      // 참조 초기화
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
      
      console.log("[useMap] 맵 인스턴스 정리 완료");
    } catch (e) {
      console.warn("[useMap] 맵 정리 중 오류:", e);
      // 강제로 참조 초기화
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    }
  }, []);

  // 컴포넌트 마운트 시 맵 초기화
  useEffect(() => {
    console.log("[useMap] 맵 초기화 시작");
    const mapInstance = initializeMap();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log("[useMap] 컴포넌트 언마운트 - 맵 정리");
      destroyMap();
    };
  }, []); // 의존성 배열 비우기
  
  // 컨테이너 변경 감지
  useEffect(() => {
    // 컨테이너가 변경되었지만, 맵이 이미 존재하는 경우 재초기화
    if (containerRef.current && 
        mapRef.current && 
        mapRef.current.getContainer() !== containerRef.current) {
      console.log("[useMap] 컨테이너 변경 감지 - 맵 재초기화");
      destroyMap();
      initializeMap();
    }
  }, [containerRef, destroyMap, initializeMap]);

  return {
    map: mapRef.current,
    isMapLoaded,
    initializeMap,
    destroyMap,
  };
}