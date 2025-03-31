import { useState, useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../constants/mapSettings";
import { UseMapOptions } from "../model/types";

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
  const instanceIdRef = useRef<string>(`map-${Date.now()}`);
  const isInitializedRef = useRef<boolean>(false);

  // 맵 초기화 함수 - 클린업 로직 포함
  const initializeMap = useCallback(() => {
    // 이미 초기화된 경우 중복 초기화 방지
    if (isInitializedRef.current && mapRef.current) {
      return mapRef.current;
    }

    const container = containerRef.current;
    if (!container) {
      return null;
    }

    // 컨테이너가 DOM에 존재하는지 확인
    if (!document.body.contains(container)) {
      return null;
    }

    // 기존 맵 인스턴스 정리 - 강제 정리
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.eachLayer((layer) => {
          try {
            mapRef.current?.removeLayer(layer);
          } catch (_error) {
            // 무시
          }
        });
        mapRef.current.remove();
        mapRef.current = null;
      } catch (_error) {
        mapRef.current = null;
      }
    }

    // 컨테이너 강제 초기화
    try {
      container.innerHTML = "";

      if ("_leaflet_id" in container) {
        delete (container as any)._leaflet_id;
      }

      const leafletClasses = Array.from(container.classList).filter((cls) =>
        cls.startsWith("leaflet")
      );

      leafletClasses.forEach((cls) => {
        container.classList.remove(cls);
      });

      L.DomEvent.off(container);
    } catch (_error) {
      // 오류 무시
    }

    // 고유 ID 속성 추가
    container.setAttribute("data-map-id", instanceIdRef.current);

    // 새 맵 인스턴스 생성 시도
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

      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8;

      L.control.zoom({ position: "topright" }).addTo(newMap);
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(newMap);

      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;

      // 지도 로드 이벤트
      newMap.once("load", () => {
        if (mapRef.current === newMap) {
          setIsMapLoaded(true);
        }
      });

      // 안전을 위해 타임아웃으로도 로드 상태 설정
      setTimeout(() => {
        if (mapRef.current === newMap && !isMapLoaded) {
          setIsMapLoaded(true);
        }
      }, 500);

      isInitializedRef.current = true;
      return newMap;
    } catch (_error) {
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

      mapInstance.off();
      mapInstance.eachLayer((layer) => {
        try {
          mapInstance.removeLayer(layer);
        } catch (_error) {
          // 무시
        }
      });

      mapInstance.remove();

      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    } catch (_error) {
      // 강제로 참조 초기화
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    }
  }, []);

  // 컴포넌트 마운트 시 맵 초기화
  useEffect(() => {
    initializeMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      destroyMap();
    };
  }, []); // 의존성 배열 비우기

  // 컨테이너 변경 감지
  useEffect(() => {
    // 컨테이너가 변경되었지만, 맵이 이미 존재하는 경우 재초기화
    if (
      containerRef.current &&
      mapRef.current &&
      mapRef.current.getContainer() !== containerRef.current
    ) {
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
