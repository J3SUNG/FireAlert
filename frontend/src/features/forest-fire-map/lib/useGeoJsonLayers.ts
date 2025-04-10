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
 * 
 * 시도 및 시군구 경계를 지도에 표시
 */
export function useGeoJsonLayers(map: L.Map | null, options: UseGeoJsonLayersOptions) {
  // GeoJSON 레이어 참조
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});

  // 시도 및 시군구 레이블 마커 참조
  const provinceMarkersRef = useRef<L.Marker[]>([]);
  const districtMarkersRef = useRef<L.Marker[]>([]);

  // GeoJSON 로드 상태
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);

  // GeoJSON 로드 및 레이어 생성
  useEffect(() => {
    if (!map) return;

    // 지도가 DOM에 렌더링되는 시간 확보
    const timer = setTimeout(() => {
      // 시도 GeoJSON 로드
      const loadProvinces = async (): Promise<void> => {
        try {
          // 시도 데이터 가져오기
          const response = await fetch(options.provincesUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          // 시도 레이어 생성
          const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.provinceStyle,
          }).addTo(map);

          // 경계선 스타일 적용
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

          // 시도 레이블 추가
          data.features.forEach((feature) => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

            // 사용자 정의 좌표 사용
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

          // 시군구 로드
          await loadDistricts();
        } catch (error) {
          console.error("시도 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true); // 오류가 있어도 로드 완료 처리
        }
      };

      // 시군구 GeoJSON 로드
      const loadDistricts = async (): Promise<void> => {
        try {
          // 시군구 데이터 가져오기
          const response = await fetch(options.districtsUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          // 시군구 레이어 생성
          const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.districtStyle,
          });

          // 레이어 초기화를 위해 추가했다가 제거
          try {
            districtsLayer.addTo(map).removeFrom(map);
          } catch (error) {
            console.error("시군구 레이어 초기화 오류:", error);
          }

          // 경계선 스타일 적용
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

          // 시군구 레이블 생성
          data.features.forEach((feature) => {
            try {
              const properties = feature.properties as GeoJsonProperties;
              const districtName = properties.NL_NAME_2 ?? "알 수 없음";
              const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

              // 광역시/특별시 확인
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

              // 광역시는 시군구 레이블 생략
              if (!isBigCity) {
                // 중심 좌표 계산
                const coordsList = feature.geometry.coordinates as any[];
                if (!coordsList || !coordsList.length) return;

                let latSum = 0, lngSum = 0, count = 0;

                // 지오메트리 타입에 따른 좌표 처리
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
                }
                else if (feature.geometry.type === "Polygon") {
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

                  // 초기에는 투명하게 설정
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

          // 줌 레벨에 따른 시군구 표시 설정
          const updateDistrictVisibility = () => {
            try {
              const currentZoom = map.getZoom();

              // 시군구 레이어 표시 (줌 8 이상)
              if (districtsLayer) {
                if (currentZoom >= 8) {
                  if (!map.hasLayer(districtsLayer)) {
                    districtsLayer.addTo(map);
                  }

                  // 줌에 맞는 스타일 적용
                  const zoomStyle = geoJsonStyles.getDistrictStyleByZoom(currentZoom);
                  districtsLayer.setStyle(zoomStyle);
                } else {
                  if (map.hasLayer(districtsLayer)) {
                    map.removeLayer(districtsLayer);
                  }
                }

                // 경계선 스타일 일관성 유지
                if (map.hasLayer(districtsLayer)) {
                  geoJsonStyles.forceApplyDistrictStyle(districtsLayer, map);
                  districtsLayer.bringToFront();
                }
              }

              // 시군구 레이블 표시 설정
              districtMarkersRef.current.forEach((marker) => {
                marker.setOpacity(currentZoom >= 8 ? 1 : 0);
              });
            } catch (error) {
              console.error("시군구 가시성 업데이트 오류:", error);
            }
          };

          // 레이어 순서 유지
          const ensureLayerOrder = () => {
            const { provinces, districts } = geoJsonLayersRef.current;
            if (provinces && map.hasLayer(provinces)) {
              provinces.bringToFront();

              if (districts && map.hasLayer(districts)) {
                districts.bringToFront();
              }
            }
          };

          // 초기 가시성 설정
          updateDistrictVisibility();

          // 이벤트 핸들러 등록
          map.off("zoomend", updateDistrictVisibility);
          map.on("zoomend", updateDistrictVisibility);
          map.off("moveend", ensureLayerOrder);
          map.on("moveend", ensureLayerOrder);

          // 로드 완료 처리
          setIsGeoJsonLoaded(true);

          // 시군구 스타일 초기 적용
          const applyDistrictStyle = () => {
            geoJsonStyles.forceApplyDistrictStyle(geoJsonLayersRef.current.districts || null, map);
          };

          applyDistrictStyle();
          // 렌더링 안정화 후 재적용
          setTimeout(applyDistrictStyle, 1000);
        } catch (error) {
          console.error("시군구 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true);
        }
      };

      // 시도 GeoJSON 로드 시작
      loadProvinces().catch(() => setIsGeoJsonLoaded(true));
    }, 500);

    // 정리 작업
    return () => {
      clearTimeout(timer);
      try {
        const { provinces, districts } = geoJsonLayersRef.current;

        // 레이어 제거
        if (provinces && map.hasLayer(provinces)) {
          map.removeLayer(provinces);
        }

        if (districts && map.hasLayer(districts)) {
          map.removeLayer(districts);
        }

        // 마커 제거
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

        // 이벤트 핸들러 제거
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