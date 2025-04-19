import { useRef, useState, useEffect, useCallback } from "react";
import L from "leaflet";
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

interface MapPosition {
  lat: number;
  lng: number;
  zoom?: number;
}

interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}

interface MarkerOptions {
  isSelected?: boolean;
  opacity?: number;
  onClick?: (data: any) => void;
}

interface UseLeafletMapOptions {
  initialOptions?: Partial<MapOptions>;
  onMapReady?: (map: L.Map) => void;
}

/**
 * Leaflet 맵을 사용하기 위한 훅
 */
export function useLeafletMap({ initialOptions = {}, onMapReady }: UseLeafletMapOptions = {}) {
  const mapRef = useRef<L.Map | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markersRef = useRef<Record<string, L.LayerGroup>>({});
  const geoJsonLayersRef = useRef<Record<string, L.GeoJSON>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  const initializeMap = useCallback(
    (container: HTMLElement) => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
        }

        const defaultOptions: MapOptions = {
          center: { lat: 36.0, lng: 127.7 },
          zoom: 7,
          minZoom: 6,
          maxZoom: 12,
          zoomControl: true,
          attributionControl: true,
          ...initialOptions,
        };

        const map = L.map(container, {
          center: [defaultOptions.center.lat, defaultOptions.center.lng],
          zoom: defaultOptions.zoom,
          minZoom: defaultOptions.minZoom,
          maxZoom: defaultOptions.maxZoom,
          zoomControl: defaultOptions.zoomControl,
          attributionControl: defaultOptions.attributionControl,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapRef.current = map;

        setIsInitialized(true);

        if (onMapReady) {
          onMapReady(map);
        }

        return map;
      } catch (err) {
        console.error("맵 초기화 오류:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return null;
      }
    },
    [initialOptions, onMapReady]
  );

  const destroyMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.off();

      Object.values(markersRef.current).forEach((marker) => {
        if (mapRef.current) marker.removeFrom(mapRef.current);
      });

      Object.values(geoJsonLayersRef.current).forEach((layer) => {
        if (mapRef.current) layer.removeFrom(mapRef.current);
      });

      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current = {};
      geoJsonLayersRef.current = {};
      setIsInitialized(false);
    }
  }, []);

  const addEventListener = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (mapRef.current) {
      mapRef.current.on(event, handler);
    }
  }, []);

  const removeEventListener = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (mapRef.current) {
      if (handler) {
        mapRef.current.off(event, handler);
      } else {
        mapRef.current.off(event);
      }
    }
  }, []);

  const setMapView = useCallback((position: MapPosition) => {
    if (mapRef.current) {
      const zoom = position.zoom !== undefined ? position.zoom : mapRef.current.getZoom();
      mapRef.current.setView([position.lat, position.lng], zoom);
    }
  }, []);

  const addMarker = useCallback(
    (position: { lat: number; lng: number }, data: any, options: MarkerOptions = {}) => {
      if (!mapRef.current) return null;

      const marker = L.marker([position.lat, position.lng], {
        zIndexOffset: options.isSelected ? 1000 : 0,
        opacity: options.opacity || 1,
      });

      if (options.onClick) {
        marker.on("click", () => {
          if (options.onClick) {
            options.onClick(data);
          }
        });
      }

      const layerGroup = L.layerGroup([marker]);
      layerGroup.addTo(mapRef.current);

      const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      markersRef.current[id] = layerGroup;

      return id;
    },
    []
  );

  const removeMarker = useCallback((id: string) => {
    if (!mapRef.current) return;

    const marker = markersRef.current[id];
    if (marker) {
      if ("off" in marker) marker.off();
      marker.removeFrom(mapRef.current);
      delete markersRef.current[id];
    }
  }, []);

  const addFireMarker = useCallback((fire: ForestFireData, options: MarkerOptions = {}) => {
    if (!mapRef.current) return null;

    const id = fire.id;

    const marker = createFireMarker(fire, {
      isSelected: options.isSelected || false,
      onClick: (selectedFire) => {
        if (options.onClick) {
          options.onClick(selectedFire);
        }
      },
      map: mapRef.current,
    });

    marker.addTo(mapRef.current);
    markersRef.current[id] = marker;

    return id;
  }, []);

  const updateFireMarker = useCallback((id: string, _isSelected: boolean) => {
    if (!mapRef.current) return;

    const marker = markersRef.current[id];
    if (marker) {
      marker.removeFrom(mapRef.current);
      delete markersRef.current[id];
    }
  }, []);

  const loadGeoJson = useCallback(async (url: string, options: any = {}) => {
    if (!mapRef.current) throw new Error("Map is not initialized");

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
      }

      const data = await response.json();
      const layer = L.geoJSON(data, {
        style: options.style || {},
        onEachFeature: options.onEachFeature,
      });

      if (options.addToMap !== false) {
        layer.addTo(mapRef.current);
      }

      const id = `geojson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      geoJsonLayersRef.current[id] = layer;

      return id;
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      throw error;
    }
  }, []);

  const removeGeoJson = useCallback((id: string) => {
    if (!mapRef.current) return;

    const layer = geoJsonLayersRef.current[id];
    if (layer) {
      layer.removeFrom(mapRef.current);
      delete geoJsonLayersRef.current[id];
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && !isInitialized && !mapRef.current) {
      initializeMap(containerRef.current);
    }

    return () => {
      destroyMap();
    };
  }, [initializeMap, destroyMap, isInitialized]);

  return {
    map: mapRef.current,
    isInitialized,
    error,
    containerRef,
    initializeMap,
    destroyMap,
    addEventListener,
    removeEventListener,
    setMapView,
    addMarker,
    removeMarker,
    addFireMarker,
    updateFireMarker,
    loadGeoJson,
    removeGeoJson,
    getZoom: () => mapRef.current?.getZoom() || 0,
    panTo: (position: MapPosition) => mapRef.current?.panTo([position.lat, position.lng]),
  };
}
