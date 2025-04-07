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
 * GeoJSON 레이어를 관리하는 커스텀 훅
 * 지도에 시도 및 시군구 경계를 표시하는 레이어를 관리합니다.
 * 중앙화된 스타일 시스템을 사용하여 일관된 스타일 적용
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

          // 시도 레이어 생성 - 중앙 스타일 시스템의 스타일 적용
          const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.provinceStyle,
          }).addTo(map);

          // CSS 클래스 추가 및 스타일 적용 - 중앙 스타일 시스템 활용
          setTimeout(() => {
            try {
              const mapSvg = map.getContainer().querySelector("svg");
              if (mapSvg) {
                const provincePaths = mapSvg.querySelectorAll("path");
                // 시도 경계선에 중앙화된 스타일 적용
                provincePaths.forEach((path) => {
                  geoJsonStyles.applyProvinceSvgStyle(path as SVGPathElement);
                });
              }
            } catch (error) {
              console.error("시도 스타일 적용 오류:", error);
            }
          }, 100);

          geoJsonLayersRef.current.provinces = provincesLayer;

          // 시도 레이블을 별도로 추가 (마커 사용)
          data.features.forEach((feature) => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

            // 사용자 정의 좌표를 사용하도록 변경
            const provinceLocation = findProvinceLocation(provinceName);

            if (provinceLocation) {
              try {
                // divIcon을 사용하여 레이블 직접 생성
                const divIcon = L.divIcon({
                  className: "province-label-container",
                  html: `<div class="province-label">${provinceName}</div>`,
                  iconSize: [100, 20], // 충분히 넓게 설정
                  iconAnchor: [50, 10], // 정중앙 위치에 배치
                });

                const marker = L.marker([provinceLocation.lat, provinceLocation.lng], {
                  icon: divIcon,
                  interactive: false, // 클릭 불가
                }).addTo(map);

                // 마커 참조 저장
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

          // 시군구 레이어 생성 - 중앙 스타일 시스템 사용
          const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => geoJsonStyles.districtStyle,
          });

          // 시군구 레이어 초기 설정
          try {
            // 렌더러 설정을 위해 지도에 한번 추가했다가 제거 (SVG 렌더러 초기화)
            districtsLayer.addTo(map).removeFrom(map);
          } catch (error) {
            console.error("시군구 레이어 초기화 오류:", error);
          }

          // 시군구 경계선 스타일 적용 - 중앙 스타일 시스템 활용
          setTimeout(() => {
            try {
              const mapSvg = map.getContainer().querySelector("svg");
              if (mapSvg) {
                const districtPaths = mapSvg.querySelectorAll("path");
                // 시군구 경계선에 중앙화된 스타일 적용
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

          // 시군구 레이블을 마커로 별도 관리
          data.features.forEach((feature) => {
            try {
              const properties = feature.properties as GeoJsonProperties;
              const districtName = properties.NL_NAME_2 ?? "알 수 없음";
              const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

              // 광역시와 특별시 검사
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

              // 광역시/특별시의 경우 시군구 레이블을 표시하지 않음
              if (!isBigCity) {
                // 시군구 중심 좌표 계산 - GeoJSON feature로부터 직접 계산
                // 타입 단언을 추가하여 TypeScript 오류 해결
                const coordsList = feature.geometry.coordinates as any[];
                if (!coordsList || !coordsList.length) return;

                // 중심점 대략적 계산
                let latSum = 0,
                  lngSum = 0,
                  count = 0;

                // 다중 폴리곤 처리
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
                // 단일 폴리곤 처리
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

                  // divIcon을 사용하여 시군구 레이블 생성
                  const divIcon = L.divIcon({
                    className: "district-label-container",
                    html: `<div class="district-label">${districtName}</div>`,
                    iconSize: [80, 15], // 충분히 넓게 설정
                    iconAnchor: [40, 7.5], // 정중앙 위치에 배치
                  });

                  // 마커 생성 (초기에는 투명하게)
                  const marker = L.marker([centerLat, centerLng], {
                    icon: divIcon,
                    interactive: false,
                    opacity: 0, // 초기 투명도 설정
                  }).addTo(map);

                  // 마커 참조 저장
                  districtMarkersRef.current.push(marker);
                }
              }
            } catch (error) {
              console.error("시군구 마커 생성 오류:", error);
            }
          });

          // 줌 레벨에 따라 시군구 레이어와 레이블 토글 - 중앙 스타일 시스템 사용
          const updateDistrictVisibility = () => {
            try {
              const currentZoom = map.getZoom();

              // 시군구 레이어 확대레벨에 따라 표시
              if (districtsLayer) {
                if (currentZoom >= 8) {
                  // 8 이상의 줌 레벨에서 표시
                  if (!map.hasLayer(districtsLayer)) {
                    districtsLayer.addTo(map);
                  }

                  // 확대 레벨에 맞는 스타일 적용 - 중앙 스타일 시스템 활용
                  const zoomStyle = geoJsonStyles.getDistrictStyleByZoom(currentZoom);
                  districtsLayer.setStyle(zoomStyle);
                } else {
                  // 낮은 확대 레벨에서는 시군구 경계선 제거
                  if (map.hasLayer(districtsLayer)) {
                    map.removeLayer(districtsLayer);
                  }
                }

                // 경계선 스타일 일관성 유지를 위한 마지막 처리
                if (map.hasLayer(districtsLayer)) {
                  // 중앙 스타일 시스템의 강제 적용 함수 사용
                  geoJsonStyles.forceApplyDistrictStyle(districtsLayer, map);

                  // 레이어 순서 조정 - 시군구 레이어를 맨 위로
                  districtsLayer.bringToFront();
                }
              }

              // 시군구 레이블 마커 토글
              districtMarkersRef.current.forEach((marker) => {
                if (currentZoom >= 8) {
                  marker.setOpacity(1);
                } else {
                  marker.setOpacity(0);
                }
              });
            } catch (error) {
              console.error("시군구 가시성 업데이트 오류:", error);
            }
          };

          // 레이어 순서를 유지하는 함수 - 시도 레이어를 기본으로 표시하고 그 위에 시군구 레이어 표시
          const ensureLayerOrder = () => {
            const { provinces, districts } = geoJsonLayersRef.current;
            if (provinces && map.hasLayer(provinces)) {
              provinces.bringToFront();

              // 시도 레이어를 위로 가져온 후, 시군구 레이어도 있다면 그것을 더 위로 가져오기
              if (districts && map.hasLayer(districts)) {
                districts.bringToFront();
              }
            }
          };

          // 초기 가시성 설정
          updateDistrictVisibility();

          // 줌 이벤트에 대한 단일 핸들러
          map.off("zoomend", updateDistrictVisibility); // 기존 핸들러 제거 (중복 방지)
          map.on("zoomend", updateDistrictVisibility);

          // 맵 이동 완료 후 레이어 순서 유지
          map.off("moveend", ensureLayerOrder);
          map.on("moveend", ensureLayerOrder);

          // 로드 완료 처리
          setIsGeoJsonLoaded(true);

          // 시군구 경계선 스타일 초기 적용 - 중앙 스타일 시스템 사용
          const applyDistrictStyle = () => {
            geoJsonStyles.forceApplyDistrictStyle(geoJsonLayersRef.current.districts || null, map);
          };

          // 초기 적용
          applyDistrictStyle();

          // 1초 후 한번 더 스타일 적용 (렌더링 안정화 후 강제 적용)
          setTimeout(applyDistrictStyle, 1000);
        } catch (error) {
          console.error("시군구 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true); // 오류가 있어도 로드 완료 처리
        }
      };

      // 시도 GeoJSON 로드 시작
      loadProvinces().catch(() => setIsGeoJsonLoaded(true));
    }, 500); // 지도 DOM 렌더링 후 로드

    // 컴포넌트 언마운트 시 정리 작업
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

        // 시도 레이블 마커 제거
        provinceMarkersRef.current.forEach((marker) => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        provinceMarkersRef.current = [];

        // 시군구 레이블 마커 제거
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
        console.error("레이어 제거 중 오류:", error);
      }
    };
  }, [map, options.provincesUrl, options.districtsUrl]);

  // 참조와 상태 반환
  return {
    geoJsonLayers: geoJsonLayersRef.current,
    isGeoJsonLoaded,
  };
}
