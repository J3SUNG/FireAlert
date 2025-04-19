import { useState, useCallback, useEffect, useRef } from "react";
import type { Map } from "leaflet";

type LeafletModule = typeof import("leaflet");

async function getLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}

let leafletInstance: LeafletModule | null = null;
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../model/mapSettings";
import { UseMapOptions } from "../model/common-types";

/**
 * Leaflet 맵을 관리하는 커스텀 훅
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

  const initializeMap = useCallback(async () => {
    if (!leafletInstance) {
      leafletInstance = await getLeaflet();
    }
    const L = leafletInstance;

    if (isInitializedRef.current && mapRef.current) {
      if (window && (window as any).updateFireLegend) {
        (window as any).updateFireLegend();
      }
      return mapRef.current;
    }

    const container = containerRef.current;
    if (!container || !document.body.contains(container)) {
      return null;
    }

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

    container.setAttribute("data-map-id", instanceIdRef.current);

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

      newMap.once("load", () => {
        if (mapRef.current === newMap) {
          setIsMapLoaded(true);
        }
      });

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
      setIsMapLoaded(true);
      return null;
    }
  }, [containerRef, legendPosition, options, isMapLoaded, fires]);

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
      mapRef.current = null;
      isInitializedRef.current = false;
      setIsMapLoaded(false);
    }
  }, []);

  useEffect(() => {
    const setupMap = async () => {
      await initializeMap();
    };

    void setupMap();

    return () => {
      destroyMap();
    };
  }, []);

  useEffect(() => {
    if (isMapLoaded && mapRef.current && fires.length > 0) {
      if (window && (window as any).updateFireLegend) {
        (window as any).updateFireLegend();
      }
    }
  }, [isMapLoaded, fires]);

  useEffect(() => {
    if (
      containerRef.current &&
      mapRef.current &&
      mapRef.current.getContainer() !== containerRef.current
    ) {
      destroyMap();

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
