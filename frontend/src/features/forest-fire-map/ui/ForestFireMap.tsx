import React, { FC, useRef, useState, useEffect, useMemo } from "react";
import { LoadingIndicator } from "../../../shared/ui";
import { useMap, useGeoJsonManager } from "../lib";
import { GEOJSON_PATHS } from "../model/mapSettings";
import { FireMarkerManager } from "./FireMarkerManager";
import { ForestFireMapProps } from "../model/common-types";
import { combineClasses } from "../../../shared/ui/utils";
import "./MapInitializer.css";
import "./ForestFireMap.css";

/**
 * 산불 지도 컴포넌트
 * 지도에 산불 데이터를 마커로 표시하고 지역 경계를 표시합니다.
 */
export const ForestFireMap: FC<ForestFireMapProps> = React.memo(
  ({ fires, selectedFireId, onFireSelect, legendPosition = "bottomleft" }) => {
    const instanceId = useMemo(() => `map-${Date.now()}`, []);

    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [mapReady, setMapReady] = useState(false);
    const [geoJsonReady, setGeoJsonReady] = useState(false);

    const mountedRef = useRef(true);

    useEffect(() => {
      const loadLeafletCss = async () => {
        await import("leaflet/dist/leaflet.css");
      };

      void loadLeafletCss();
    }, []);

    const { map, isMapLoaded } = useMap({
      containerRef: mapContainerRef,
      legendPosition,
      fires,
    });

    useEffect(() => {
      if (!mountedRef.current) return;

      if (isMapLoaded && map && mapContainerRef.current) {
        const timer = setTimeout(() => {
          if (mountedRef.current) {
            setMapReady(true);
          }
        }, 300);

        return () => clearTimeout(timer);
      }

      return undefined;
    }, [isMapLoaded, map]);

    const { isGeoJsonLoaded } = useGeoJsonManager(mapReady && map ? map : null, {
      provincesUrl: GEOJSON_PATHS.provinces,
      districtsUrl: GEOJSON_PATHS.districts,
    });

    useEffect(() => {
      if (!mountedRef.current) return;

      if (isGeoJsonLoaded) {
        setGeoJsonReady(true);
      }
    }, [isGeoJsonLoaded]);

    useEffect(() => {
      mountedRef.current = true;

      return () => {
        mountedRef.current = false;
      };
    }, []);

    const markerManagerKey = useMemo(() => `markers-${instanceId}`, [instanceId]);

    const isLoading = useMemo(() => !mapReady || !geoJsonReady, [mapReady, geoJsonReady]);

    const containerClassName = useMemo(() => {
      return combineClasses("forest-fire-map", isLoading && "forest-fire-map--loading");
    }, [isLoading]);

    const getAccessibleMapDescription = () => {
      if (fires.length === 0) {
        return "현재 표시할 산불 데이터가 없습니다.";
      }

      return `지도에 총 ${fires.length}개의 산불이 표시되어 있습니다. ${
        selectedFireId
          ? "특정 산불이 선택되었습니다."
          : "산불을 선택하면 상세 정보를 볼 수 있습니다."
      }`;
    };

    return (
      <div
        className={containerClassName}
        data-instance-id={instanceId}
        role="region"
        aria-label="산불 위치 지도"
      >
        <div
          ref={mapContainerRef}
          className="forest-fire-map__container"
          data-map-instance={instanceId}
          aria-hidden={isLoading}
          tabIndex={isLoading ? -1 : 0}
        ></div>

        {mapReady && geoJsonReady && map && (
          <FireMarkerManager
            key={markerManagerKey}
            map={map}
            fires={fires}
            selectedFireId={selectedFireId}
            onFireSelect={onFireSelect}
            isGeoJsonLoaded={true}
          />
        )}

        {isLoading && (
          <div className="forest-fire-map__loading-overlay" aria-live="polite">
            <LoadingIndicator message="지도를 불러오는 중입니다..." size="large" />
          </div>
        )}

        <div className="sr-only" aria-live="polite">
          {getAccessibleMapDescription()}
        </div>
      </div>
    );
  }
);
