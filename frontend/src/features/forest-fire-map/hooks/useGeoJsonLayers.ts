import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PROVINCES_STYLE, DISTRICTS_STYLE } from '../constants/mapSettings';
import { GeoJsonData, GeoJsonProperties } from '../../../shared/types/geoJson';
import { findProvinceLocation } from '../constants/provinceLocations';

interface UseGeoJsonLayersOptions {
  provincesUrl: string;
  districtsUrl: string;
}

/**
 * GeoJSON 레이어를 관리하는 커스텀 훅
 * 지도에 시도 및 시군구 경계를 표시하는 레이어를 관리합니다.
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const data = await response.json() as GeoJsonData;

          // 시도 레이어 생성
          const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => PROVINCES_STYLE,
            className: 'province-boundary' // 시도 경계선 클래스 적용
          }).addTo(map);

          geoJsonLayersRef.current.provinces = provincesLayer;
          
          // 시도 레이블을 별도로 추가 (마커 사용)
          data.features.forEach(feature => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? '알 수 없음';
            
            // 사용자 정의 좌표를 사용하도록 변경
            const provinceLocation = findProvinceLocation(provinceName);
            
            if (provinceLocation) {
              try {
                // 마커 대신 divIcon을 사용하여 레이블 직접 생성
                const divIcon = L.divIcon({
                  className: 'province-label-container',
                  html: `<div class="province-label">${provinceName}</div>`,
                  iconSize: [100, 20], // 충분히 넓게 설정
                  iconAnchor: [50, 10]  // 정중앙 위치에 배치
                });
                
                const marker = L.marker([provinceLocation.lat, provinceLocation.lng], {
                  icon: divIcon,
                  interactive: false // 클릭 불가
                }).addTo(map);
                
                // 마커 참조 저장
                provinceMarkersRef.current.push(marker);
              } catch (error) {
                console.error('시도 마커 생성 오류:', error);
              }
            }
          });
          
          // 시군구 로드
          await loadDistricts();
        } catch (error) {
          console.error('시도 GeoJSON 로드 오류:', error);
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
          const data = await response.json() as GeoJsonData;
          
          // 시군구 레이어 생성 (초기에는 추가하지 않음)
          const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => DISTRICTS_STYLE,
            className: 'district-boundary', // 시군구 경계선 클래스 적용
            smoothFactor: 0, // 경계선 시각화를 위한 값 (더 선명하게 보임)
            interactive: false, // 마우스 이벤트 처리 안함
            renderer: L.svg({ padding: 0 }) // 렌더링 패딩 최소화
          });

          geoJsonLayersRef.current.districts = districtsLayer;

          // 시군구 레이블을 마커로 별도 관리
          data.features.forEach(feature => {
            try {
              const properties = feature.properties as GeoJsonProperties;
              const districtName = properties.NL_NAME_2 ?? '알 수 없음';
              const provinceName = properties.NL_NAME_1 ?? '알 수 없음';
              
              // 광역시와 특별시 검사
              const isBigCity = [
                '서울특별시', '부산광역시', '대구광역시', '인천광역시', 
                '광주광역시', '대전광역시', '울산광역시', '세종특별자치시'
              ].includes(provinceName);
              
              // 광역시/특별시의 경우 시군구 레이블을 표시하지 않음
              if (!isBigCity) {
                // 시군구 중심 좌표 계산 - GeoJSON feature로부터 직접 계산
                // 타입 단언을 추가하여 TypeScript 오류 해결
                const coordsList = feature.geometry.coordinates as any[];
                if (!coordsList || !coordsList.length) return;
                
                // 중심점 대략적 계산
                let latSum = 0, lngSum = 0, count = 0;
                
                // 다중 폴리곤 처리
                if (feature.geometry.type === 'MultiPolygon') {
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
                else if (feature.geometry.type === 'Polygon') {
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
                    className: 'district-label-container',
                    html: `<div class="district-label">${districtName}</div>`,
                    iconSize: [80, 15], // 충분히 넓게 설정
                    iconAnchor: [40, 7.5] // 정중앙 위치에 배치
                  });
                  
                  // 마커 생성 (초기에는 투명하게)
                  const marker = L.marker([centerLat, centerLng], {
                    icon: divIcon,
                    interactive: false,
                    opacity: 0 // 초기 투명도 설정
                  }).addTo(map);
                  
                  // 마커 참조 저장
                  districtMarkersRef.current.push(marker);
                }
              }
            } catch (error) {
              console.error('시군구 마커 생성 오류:', error);
            }
          });

          // 줌 레벨에 따라 시군구 레이어와 레이블 토글
          const updateDistrictVisibility = () => {
            try {
              const currentZoom = map.getZoom();
              
              // 시군구 레이어 확대레벨에 따라 표시
              if (districtsLayer) {
                if (currentZoom >= 8) {
                  // 확대 레벨 8 이상일 때만 시군구 경계선 표시
                  if (!map.hasLayer(districtsLayer)) {
                    districtsLayer.addTo(map);
                  }
                  
                  // 확대 레벨에 따라 경계선 스타일 조정
                  if (currentZoom >= 9) {
                    districtsLayer.setStyle({
                      ...DISTRICTS_STYLE,
                      weight: 0.8,
                      opacity: 1.0,
                      color: "#ffffff" // 하양색으로 경계선 가시성 높이기
                    });
                  } else {
                    districtsLayer.setStyle(DISTRICTS_STYLE);
                  }
                } else {
                  // 확대레벨이 낮으면 시군구 경계선 제거
                  if (map.hasLayer(districtsLayer)) {
                    map.removeLayer(districtsLayer);
                  }
                }
                
                // 시도 레이어를 항상 위로 가져옴 (z순서 조정)
                const { provinces } = geoJsonLayersRef.current;
                if (provinces && map.hasLayer(provinces)) {
                  provinces.bringToFront();
                }
              }
              
              // 시군구 레이블 마커 토글
              districtMarkersRef.current.forEach(marker => {
                if (currentZoom >= 8) {
                  marker.setOpacity(1);
                } else {
                  marker.setOpacity(0);
                }
              });
            } catch (error) {
              console.error('시군구 가시성 업데이트 오류:', error);
            }
          };
          
          // 시도 레이어를 항상 위에 유지하는 함수 
          const ensureProvinceOnTop = () => {
            const { provinces } = geoJsonLayersRef.current;
            if (provinces && map.hasLayer(provinces)) {
              provinces.bringToFront();
            }
          };
          
          // 초기 가시성 설정
          updateDistrictVisibility();
          
          // 줌 이벤트에 대한 단일 핸들러
          map.off('zoomend', updateDistrictVisibility); // 기존 핸들러 제거 (중복 방지)
          map.on('zoomend', updateDistrictVisibility);
          
          // 맵 이동 완료 후 시도 레이어를 항상 위에 유지
          map.off('moveend', ensureProvinceOnTop);
          map.on('moveend', ensureProvinceOnTop);
          
          // 로드 완료 처리
          setIsGeoJsonLoaded(true);
          
          // 시군구가 로드된 후 시도가 항상 위에 오도록 추가 보장
          const { provinces } = geoJsonLayersRef.current;
          if (provinces && map.hasLayer(provinces)) {
            provinces.bringToFront();
          }
        } catch (error) {
          console.error('시군구 GeoJSON 로드 오류:', error);
          setIsGeoJsonLoaded(true); // 오류가 있어도 로드 완료 처리
        }
      };

      // 시도 GeoJSON 로드 시작
      loadProvinces().catch(() => setIsGeoJsonLoaded(true));
    }, 500); // 지도 DOM 렌더링 후 로드

    // 컴포넌트 언마운트 시 레이어 제거
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
        
        // 시도 레이블 마커 제거
        provinceMarkersRef.current.forEach(marker => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        provinceMarkersRef.current = [];
        
        // 시군구 레이블 마커 제거
        districtMarkersRef.current.forEach(marker => {
          if (map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        });
        districtMarkersRef.current = [];
        
        // 이벤트 핸들러 제거
        map.off('zoomend');
        map.off('moveend');
      } catch (error) {
        console.error('레이어 제거 중 오류:', error);
      }
    };
  }, [map, options.provincesUrl, options.districtsUrl]);

  // 참조와 상태 반환
  return {
    geoJsonLayers: geoJsonLayersRef.current,
    isGeoJsonLoaded
  };
}