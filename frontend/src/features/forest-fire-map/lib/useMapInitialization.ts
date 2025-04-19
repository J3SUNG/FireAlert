import { useState, useEffect, useRef, RefObject } from "react";
import L from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";

export interface MapInitializationOptions {
  containerRef: RefObject<HTMLDivElement>;
  legendPosition?: L.ControlPosition;
  initialCenter?: [number, number];
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  fires?: ForestFireData[];
  _fires?: ForestFireData[];
}

/**
 * 지도 초기화 및 생명주기 관리 훅
 */
export function useMapInitialization({
  containerRef,
  legendPosition = "bottomleft",
  initialCenter = [36.5, 127.8],
  initialZoom = 7,
  minZoom = 6,
  maxZoom = 18,
}: MapInitializationOptions) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mountedRef = useRef(true);
  const mapInstanceId = useRef(`map-${Date.now()}`);

  useEffect(() => {
    if (!mountedRef.current || !containerRef.current) return;

    const mapInstance = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom,
      maxZoom,
      attributionControl: false,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    L.control.zoom({ position: "topright" }).addTo(mapInstance);

    L.control.attribution({ position: "bottomright" }).addTo(mapInstance);

    setMap(mapInstance);

    setTimeout(() => {
      if (mountedRef.current) {
        setIsMapLoaded(true);
      }
    }, 100);

    return () => {
      if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
      }
      setMap(null);
      setIsMapLoaded(false);
    };
  }, [containerRef, initialCenter, initialZoom, minZoom, maxZoom, legendPosition]);

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
    mountedRef,
  };
}
