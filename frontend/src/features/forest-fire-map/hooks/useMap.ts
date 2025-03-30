import { useState, useCallback, useEffect, RefObject, useRef } from "react";
import L from "leaflet";
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../constants/mapSettings";
import { createLegendControl } from "../utils/legendUtils";

interface UseMapOptions {
  containerRef: RefObject<HTMLDivElement>;
  legendPosition?: L.ControlPosition;
  options?: Partial<typeof MAP_INIT_OPTIONS>;
}

export function useMap({
  containerRef,
  legendPosition = "bottomleft",
  options = {},
}: UseMapOptions) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const initializeMap = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    // DOM이 연결되지 않은 경우 early return
    if (!document.body.contains(container)) return null;

    // 이미 초기화된 map이 존재하면 제거
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch (e) {
        console.warn("mapRef.current.remove 중 오류:", e);
      }
      mapRef.current = null;
    }

    // container가 leaflet에 의해 사용 중이면 내부 정리
    if ((container as any)._leaflet_id != null) {
      try {
        // Leaflet의 모든 이벤트 핸들러 제거 시도
        L.DomEvent.off(container);
        // 컨테이너 내용 비우기
        container.innerHTML = "";
        // _leaflet_id 속성 제거 시도
        delete (container as any)._leaflet_id;
      } catch (e) {
        console.warn("container 초기화 실패:", e);
      }
    }

    try {
      container.style.backgroundColor = MAP_BACKGROUND_COLOR;
      const mergedOptions = { ...MAP_INIT_OPTIONS, ...options };
      const newMap = L.map(container, mergedOptions);

      mapRef.current = newMap;

      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8;

      L.control.zoom({ position: "topright" }).addTo(newMap);
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(newMap);
      createLegendControl(legendPosition).addTo(newMap);

      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;

      requestAnimationFrame(() => {
        setIsMapLoaded(true);
      });

      return newMap;
    } catch (error) {
      console.error("지도 초기화 중 오류 발생:", error);
      setIsMapLoaded(true);
      return null;
    }
  }, [containerRef, legendPosition, options]);

  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch (e) {
        console.warn("mapRef.current.remove 중 오류:", e);
      }
      mapRef.current = null;
      setIsMapLoaded(false);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트 마운트 시에만 초기화하고 의존성 배열에서 initializeMap 제거
    const mapInstance = initializeMap();

    return () => {
      // 클린업 함수에서 맵 인스턴스 정리
      if (mapInstance) {
        try {
          mapInstance.off();
          mapInstance.remove();
        } catch (e) {
          console.warn("mapInstance.remove 중 오류:", e);
        }
      }

      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.warn("mapRef.current.remove 중 오류:", e);
        }
        mapRef.current = null;
      }
    };
  }, []); // 빈 의존성 배열로 변경

  return {
    map: mapRef.current,
    isMapLoaded,
    initializeMap,
    destroyMap,
  };
}
