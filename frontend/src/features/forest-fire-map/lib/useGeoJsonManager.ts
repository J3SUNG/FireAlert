import { useState, useEffect, useCallback } from "react";
import L from "leaflet";
import { useGeoJsonState } from "./useGeoJsonState";
import { PROVINCES_STYLE, DISTRICTS_STYLE, geoJsonStyles } from "../model/mapSettings";
import { GeoJsonProperties, GeoJsonData } from "../../../shared/model/geoJson";
import { findProvinceLocation } from "../model/provinceLocations";

interface GeoJsonUrls {
  provincesUrl: string;
  districtsUrl: string;
}

/**
 * GeoJSON 레이어 관리 훅
 */
export function useGeoJsonManager(map: L.Map | null, { provincesUrl, districtsUrl }: GeoJsonUrls) {
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);

  const {
    setProvinceLayer,
    setDistrictLayer,
    getProvinceLayer,
    getDistrictLayer,
    addProvinceMarker,
    addDistrictMarker,
    cleanupLayers,
  } = useGeoJsonState();

  const markerHandlerMap = new Map<L.Marker, () => void>();

  const loadProvinces = useCallback(async (): Promise<void> => {
    if (!map) {
      throw new Error("Map is not initialized");
    }

    try {
      const response = await fetch(provincesUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
      }
      const data = (await response.json()) as GeoJsonData;

      const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
        style: () => PROVINCES_STYLE,
        interactive: true,
        onEachFeature: (_feature, _layer) => {
          // 툴팁 레이블 제거
        },
      }).addTo(map);

      const provincePaths = provincesLayer.getPane()?.querySelectorAll("path");
      if (provincePaths) {
        provincePaths.forEach((path) => {
          path.classList.add("province-boundary");
        });
      }

      setTimeout(() => {
        try {
          const mapSvg = map.getContainer().querySelector("svg");
          if (mapSvg) {
            const provincePaths = mapSvg.querySelectorAll("path");
            provincePaths.forEach((path) => {
              geoJsonStyles.applyProvinceSvgStyle(path as SVGPathElement);
            });
          }
        } catch (error) {
          console.error("시도 스타일 적용 오류:", error);
        }
      }, 100);

      setProvinceLayer(provincesLayer);

      data.features.forEach((feature) => {
        const properties = feature.properties as GeoJsonProperties;
        const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

        const provinceLocation = findProvinceLocation(provinceName);

        if (provinceLocation) {
          try {
            const divIcon = L.divIcon({
              className: "province-label-container",
              html: `<div class="province-label">${provinceName}</div>`,
              iconSize: [100, 20],
              iconAnchor: [50, 10],
            });

            const marker = L.marker([provinceLocation.lat, provinceLocation.lng], {
              icon: divIcon,
              interactive: false,
            }).addTo(map);

            addProvinceMarker(marker);
          } catch (error) {
            console.error("시도 마커 생성 오류:", error);
          }
        }
      });
    } catch (error) {
      console.error("시도 GeoJSON 로드 오류:", error);
      throw error;
    }
  }, [map, provincesUrl, setProvinceLayer, addProvinceMarker]);

  const loadDistricts = useCallback(async (): Promise<void> => {
    if (!map) {
      throw new Error("Map is not initialized");
    }

    try {
      const response = await fetch(districtsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
      }
      const data = (await response.json()) as GeoJsonData;

      const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
        style: () => DISTRICTS_STYLE,
        interactive: true,
        pane: "overlayPane",
        bubblingMouseEvents: false,
        onEachFeature: (_feature, _layer) => {
          // 툴팁 레이블 제거
        },
      });

      const svg = L.svg({ padding: 0 });
      svg.addTo(map);

      setDistrictLayer(districtsLayer);

      const initialZoom = map.getZoom();
      if (initialZoom >= 8) {
        districtsLayer.addTo(map);
      }

      const toggleDistrictLayer = () => {
        const currentZoom = map.getZoom();
        const districts = getDistrictLayer();

        if (!districts) return;

        if (currentZoom >= 8) {
          if (!map.hasLayer(districts)) {
            districts.addTo(map);
          }
        } else if (map.hasLayer(districts)) {
          map.removeLayer(districts);
        }
      };

      map.toggleDistrictLayerHandler = toggleDistrictLayer;
      map.on("zoomend", map.toggleDistrictLayerHandler);

      data.features.forEach((feature) => {
        try {
          const properties = feature.properties as GeoJsonProperties;
          const districtName = properties.NL_NAME_2 ?? "알 수 없음";
          const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

          const isBigCity = [
            "서울특별시",
            "부산광역시",
            "대구광역시",
            "인천광역시",
            "광주광역시",
            "대전광역시",
            "울산광역시",
            "세종특별자치시",
          ].includes(provinceName);

          if (!isBigCity) {
            const coordsList = feature.geometry.coordinates as any[];
            if (!coordsList || !coordsList.length) return;

            let latSum = 0,
              lngSum = 0,
              count = 0;

            if (feature.geometry.type === "MultiPolygon") {
              (coordsList as any[][][]).forEach((polygon: any[][]) => {
                if (polygon && polygon.length && polygon[0]) {
                  polygon[0].forEach((coord: number[]) => {
                    if (coord && coord.length >= 2) {
                      lngSum += coord[0];
                      latSum += coord[1];
                      count++;
                    }
                  });
                }
              });
            } else if (feature.geometry.type === "Polygon") {
              if (coordsList[0]) {
                (coordsList[0] as any[]).forEach((coord: number[]) => {
                  if (coord && coord.length >= 2) {
                    lngSum += coord[0];
                    latSum += coord[1];
                    count++;
                  }
                });
              }
            }

            if (count > 0) {
              const centerLat = latSum / count;
              const centerLng = lngSum / count;

              const divIcon = L.divIcon({
                className: "district-label-container",
                html: `<div class="district-label">${districtName}</div>`,
                iconSize: [80, 15],
                iconAnchor: [40, 7.5],
              });

              const marker = L.marker([centerLat, centerLng], {
                icon: divIcon,
                interactive: false,
                opacity: 0,
              }).addTo(map);

              addDistrictMarker(marker);

              const updateMarkerVisibility = () => {
                const currentZoom = map.getZoom();
                if (currentZoom >= 8) {
                  marker.setOpacity(1);
                } else {
                  marker.setOpacity(0);
                }
              };

              markerHandlerMap.set(marker, updateMarkerVisibility);
              map.on("zoomend", updateMarkerVisibility);

              if (map.getZoom() >= 8) {
                marker.setOpacity(1);
              }
            }
          }
        } catch (error) {
          console.error("시군구 마커 생성 오류:", error);
        }
      });

      const maintainLayerOrder = () => {
        const provinces = getProvinceLayer();
        const districts = getDistrictLayer();

        if (districts && map.hasLayer(districts)) {
          districts.bringToBack();
        }

        if (provinces && map.hasLayer(provinces)) {
          provinces.bringToFront();
        }
      };

      map.maintainLayerOrderHandler = maintainLayerOrder;
      map.on("moveend", map.maintainLayerOrderHandler);

      maintainLayerOrder();
    } catch (error) {
      console.error("시군구 GeoJSON 로드 오류:", error);
      throw error;
    }
  }, [map, districtsUrl, setDistrictLayer, getDistrictLayer, getProvinceLayer, addDistrictMarker]);

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(async () => {
      try {
        await loadProvinces();

        await loadDistricts();

        const provinces = getProvinceLayer();
        const districts = getDistrictLayer();

        if (districts && map.hasLayer(districts)) {
          districts.bringToBack();
        }

        if (provinces && map.hasLayer(provinces)) {
          provinces.bringToFront();
        }

        setIsGeoJsonLoaded(true);
      } catch (error) {
        console.error("GeoJSON 로드 오류:", error);
        setIsGeoJsonLoaded(true);
      }
    }, 500);

    return () => {
      clearTimeout(timer);

      if (map) {
        map.off("zoomend");
        map.off("moveend");

        if (map.toggleDistrictLayerHandler) {
          map.off("zoomend", map.toggleDistrictLayerHandler);
          delete map.toggleDistrictLayerHandler;
        }

        if (map.maintainLayerOrderHandler) {
          map.off("moveend", map.maintainLayerOrderHandler);
          delete map.maintainLayerOrderHandler;
        }
      }

      cleanupLayers(map);
    };
  }, [
    map,
    loadProvinces,
    loadDistricts,
    cleanupLayers,
    getProvinceLayer,
    getDistrictLayer,
    setIsGeoJsonLoaded,
  ]);

  return {
    isGeoJsonLoaded,
    reloadGeoJson: useCallback(async () => {
      if (!map) return;

      cleanupLayers(map);

      setIsGeoJsonLoaded(false);

      try {
        await loadProvinces();
        await loadDistricts();
        setIsGeoJsonLoaded(true);
      } catch (error) {
        console.error("GeoJSON 다시 로드 오류:", error);
        setIsGeoJsonLoaded(true);
      }
    }, [map, loadProvinces, loadDistricts, cleanupLayers]),
  };
}
