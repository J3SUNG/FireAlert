import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { geoJsonStyles } from "../model/mapSettings";
import { GeoJsonData, GeoJsonProperties } from "../../../shared/model/geoJson";
import { findProvinceLocation } from "../model/provinceLocations";

interface UseGeoJsonLayersOptions {
  provincesUrl: string;
  districtsUrl: string;
}

/**
 * GeoJSON 레이어 관리 훅
 */
export function useGeoJsonLayers(map: L.Map | null, options: UseGeoJsonLayersOptions) {
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});

  const provinceMarkersRef = useRef<L.Marker[]>([]);
  const districtMarkersRef = useRef<L.Marker[]>([]);

  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);

  useEffect(() => {
    if (!map) return;

    const timer = setTimeout(() => {
      const loadProvinces = async (): Promise<void> => {
        try {
          const response = await fetch(options.provincesUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.provinceStyle,
          }).addTo(map);

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

          geoJsonLayersRef.current.provinces = provincesLayer;

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

                provinceMarkersRef.current.push(marker);
              } catch (error) {
                console.error("시도 마커 생성 오류:", error);
              }
            }
          });

          await loadDistricts();
        } catch (error) {
          console.error("시도 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true);
        }
      };

      const loadDistricts = async (): Promise<void> => {
        try {
          const response = await fetch(options.districtsUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.districtStyle,
          });

          try {
            districtsLayer.addTo(map).removeFrom(map);
          } catch (error) {
            console.error("시군구 레이어 초기화 오류:", error);
          }

          setTimeout(() => {
            try {
              const mapSvg = map.getContainer().querySelector("svg");
              if (mapSvg) {
                const districtPaths = mapSvg.querySelectorAll("path");
                districtPaths.forEach((path) => {
                  if (!path.classList.contains("province-boundary")) {
                    geoJsonStyles.applyDistrictSvgStyle(path as SVGPathElement);
                  }
                });
              }
            } catch (error) {
              console.error("시군구 스타일 적용 오류:", error);
            }
          }, 150);

          geoJsonLayersRef.current.districts = districtsLayer;

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

                  districtMarkersRef.current.push(marker);
                }
              }
            } catch (error) {
              console.error("시군구 마커 생성 오류:", error);
            }
          });

          const updateDistrictVisibility = () => {
            try {
              const currentZoom = map.getZoom();

              if (districtsLayer) {
                if (currentZoom >= 8) {
                  if (!map.hasLayer(districtsLayer)) {
                    districtsLayer.addTo(map);
                  }

                  const zoomStyle = geoJsonStyles.getDistrictStyleByZoom(currentZoom);
                  districtsLayer.setStyle(zoomStyle);
                } else {
                  if (map.hasLayer(districtsLayer)) {
                    map.removeLayer(districtsLayer);
                  }
                }

                if (map.hasLayer(districtsLayer)) {
                  geoJsonStyles.forceApplyDistrictStyle(districtsLayer, map);
                  districtsLayer.bringToFront();
                }
              }

              districtMarkersRef.current.forEach((marker) => {
                marker.setOpacity(currentZoom >= 8 ? 1 : 0);
              });
            } catch (error) {
              console.error("시군구 가시성 업데이트 오류:", error);
            }
          };

          const ensureLayerOrder = () => {
            const { provinces, districts } = geoJsonLayersRef.current;
            if (provinces && map.hasLayer(provinces)) {
              provinces.bringToFront();

              if (districts && map.hasLayer(districts)) {
                districts.bringToFront();
              }
            }
          };

          updateDistrictVisibility();

          map.off("zoomend", updateDistrictVisibility);
          map.on("zoomend", updateDistrictVisibility);
          map.off("moveend", ensureLayerOrder);
          map.on("moveend", ensureLayerOrder);

          setIsGeoJsonLoaded(true);

          const applyDistrictStyle = () => {
            geoJsonStyles.forceApplyDistrictStyle(geoJsonLayersRef.current.districts || null, map);
          };

          applyDistrictStyle();
          setTimeout(applyDistrictStyle, 1000);
        } catch (error) {
          console.error("시군구 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true);
        }
      };

      loadProvinces().catch(() => setIsGeoJsonLoaded(true));
    }, 500);

    return () => {
      clearTimeout(timer);
      try {
        const { provinces, districts } = geoJsonLayersRef.current;

        if (provinces && map.hasLayer(provinces)) {
          map.removeLayer(provinces);
        }

        if (districts && map.hasLayer(districts)) {
          map.removeLayer(districts);
        }

        provinceMarkersRef.current.forEach((marker) => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        provinceMarkersRef.current = [];

        districtMarkersRef.current.forEach((marker) => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        districtMarkersRef.current = [];

        map.off("zoomend");
        map.off("moveend");
      } catch (error) {
        console.error("레이어 제거 오류:", error);
      }
    };
  }, [map, options.provincesUrl, options.districtsUrl]);

  return {
    geoJsonLayers: geoJsonLayersRef.current,
    isGeoJsonLoaded,
  };
}
