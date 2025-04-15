import { useState, useCallback, useEffect, useRef } from "react";
import type { Map, LatLngBounds, Control } from "leaflet";

// 타입 별칭 정의
type LeafletModule = typeof import("leaflet");

// 비동기 함수에서 Leaflet API에 접근하기 위한 헬퍼 함수
async function getLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}

// 리플렛 인스턴스 저장
let leafletInstance: LeafletModule | null = null;
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../model/mapSettings";
import { UseMapOptions } from "../model/common-types";

/**
 * Leaflet 맵을 관리하는 커스텀 훅
 * 
 * StrictMode 환경에서 중복 렌더링 문제를 해결하고 성능 최적화
 */
export function useMap({
  containerRef,
  legendPosition = "bottomleft",
  options = {},
  fires = [],
}: UseMapOptions) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<Map | null>(null);
  const instanceIdRef = useRef<string>(`map-${Date.now()}`);
  const isInitializedRef = useRef<boolean>(false);

  // 맵 초기화 함수
  const initializeMap = useCallback(async () => {
    // 동적으로 Leaflet 로드
    if (!leafletInstance) {
      leafletInstance = await getLeaflet();
    }
    const L = leafletInstance;
    // 이미 초기화된 경우, 불필요한 재생성 방지
    if (isInitializedRef.current && mapRef.current) {
      // fires 데이터가 변경되면 범례만 업데이트
      if (window && (window as any).updateFireLegend) {
        (window as any).updateFireLegend();
      }
      return mapRef.current;
    }

    const container = containerRef.current;
    if (!container || !document.body.contains(container)) {
      return null;
    }

    // 기존 맵 인스턴스 정리
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.eachLayer((layer) => {
          try {
            mapRef.current?.removeLayer(layer);
          } catch (_) {
            // 무시
          }
        });
        mapRef.current.remove();
        mapRef.current = null;
      } catch (_) {
        mapRef.current = null;
      }
    }

    // 컨테이너 초기화 - Leaflet 잔여물 제거
    try {
      container.innerHTML = "";

      if ("_leaflet_id" in container) {
        delete (container as any)._leaflet_id;
      }

      const leafletClasses = Array.from(container.classList).filter((cls: string) =>
        cls.startsWith("leaflet")
      );

      leafletClasses.forEach((cls) => {
        container.classList.remove(cls);
      });

      L.DomEvent.off(container);
    } catch (_) {
      // 오류 무시
    }

    // 고유 ID 속성 추가
    container.setAttribute("data-map-id", instanceIdRef.current);

    // 새 맵 인스턴스 생성
    try {
      container.style.backgroundColor = MAP_BACKGROUND_COLOR;

      const mergedOptions = {
        ...MAP_INIT_OPTIONS,
        ...options,
        zoomControl: false,
        attributionControl: false,
      };

      const newMap = L.map(container, mergedOptions);
      mapRef.current = newMap;

      // 한국 영역으로 지도 범위 제한
      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8;

      // 컨트롤 추가
      L.control.zoom({ position: "topright" }).addTo(newMap);
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(newMap);

      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;

      // 지도 로드 이벤트
      newMap.once("load", () => {
        if (mapRef.current === newMap) {
          setIsMapLoaded(true);
        }
      });

      // 안전장치: 일정 시간 후에도 로드 이벤트가 발생하지 않으면 강제로 로드 상태 설정
      setTimeout(() => {
        if (mapRef.current === newMap && !isMapLoaded) {
          setIsMapLoaded(true);
        }
      }, 500);

      isInitializedRef.current = true;
      return newMap;
    } catch (_) {
      isInitializedRef.current = false;
      mapRef.current = null;
      setIsMapLoaded(true); // 오류가 발생해도 로딩 상태는 완료로 처리
      return null;
    }
  }, [containerRef, legendPosition, options, isMapLoaded, fires]);

  // 맵 제거 함수
  const destroyMap = useCallback(() => {
    if (!mapRef.current) return;

    try {
      const mapInstance = mapRef.current;

      mapInstance.off();
      mapInstance.eachLayer((layer) => {
        try {
          mapInstance.removeLayer(layer);
        } catch (_) {
          // 무시
        }
      });

      mapInstance.remove();

      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    } catch (_) {
      // 실패해도 참조 초기화
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    }
  }, []);

  // 컴포넌트 마운트 시 맵 초기화
  useEffect(() => {
    // 비동기 함수 호출
    const setupMap = async () => {
      await initializeMap();
    };
    
    void setupMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      destroyMap();
    };
  }, []); // 의존성 배열 비우기
  
  // 산불 데이터가 변경될 때만 범례 업데이트
  useEffect(() => {
    if (isMapLoaded && mapRef.current && fires.length > 0) {
      if (window && (window as any).updateFireLegend) {
        (window as any).updateFireLegend();
      }
    }
  }, [isMapLoaded, fires]);

  // 컨테이너 변경 시 지도 재초기화
  useEffect(() => {
    if (containerRef.current &&
        mapRef.current &&
        mapRef.current.getContainer() !== containerRef.current) {
      destroyMap();
      
      // 비동기 함수 호출
      const reinitMap = async () => {
        await initializeMap();
      };
      
      void reinitMap();
    }
  }, [containerRef, destroyMap, initializeMap]);

  return {
    map: mapRef.current,
    isMapLoaded,
    initializeMap,
    destroyMap,
  };
}