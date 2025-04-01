import { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { useGeoJsonState } from './useGeoJsonState';
import { 
  PROVINCES_STYLE, 
  DISTRICTS_STYLE,
  geoJsonStyles
} from '../model/mapSettings';
import { GeoJsonProperties, GeoJsonData } from '../../../shared/types/geoJson';
import { findProvinceLocation } from '../model/provinceLocations';

interface GeoJsonUrls {
  provincesUrl: string;
  districtsUrl: string;
}

/**
 * GeoJSON 레이어 관리 훅
 */
export function useGeoJsonManager(map: L.Map | null, { provincesUrl, districtsUrl }: GeoJsonUrls) {
  // GeoJSON 로드 상태
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);
  
  // GeoJSON 상태 관리 
  const {
    setProvinceLayer,
    setDistrictLayer,
    getProvinceLayer,
    getDistrictLayer,
    addProvinceMarker,
    addDistrictMarker,
    cleanupLayers
  } = useGeoJsonState();
  
  // 시도 GeoJSON 로드 함수
  const loadProvinces = useCallback(async (): Promise<void> => {
    if (!map) {
      throw new Error("Map is not initialized");
    }
    
    try {
      const response = await fetch(provincesUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
      }
      const data = await response.json() as GeoJsonData;
      
      // 시도 레이어 생성
      const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
        style: () => PROVINCES_STYLE,
        className: 'province-boundary',
        interactive: true,
        onEachFeature: (feature, layer) => {
          // 툴팁 레이블 제거 - 마커 기반 레이블만 사용
        },
      }).addTo(map);
      
      // SVG 스타일 적용
      setTimeout(() => {
        try {
          const mapSvg = map.getContainer().querySelector("svg");
          if (mapSvg) {
            const provincePaths = mapSvg.querySelectorAll("path");
            // 시도 경계선에 스타일 적용
            provincePaths.forEach((path) => {
              geoJsonStyles.applyProvinceSvgStyle(path as SVGPathElement);
            });
          }
        } catch (error) {
          console.error("시도 스타일 적용 오류:", error);
        }
      }, 100);
      
      // 상태에 레이어 저장
      setProvinceLayer(provincesLayer);
      
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
              iconSize: [100, 20],
              iconAnchor: [50, 10],
            });
            
            const marker = L.marker([provinceLocation.lat, provinceLocation.lng], {
              icon: divIcon,
              interactive: false,
            }).addTo(map);
            
            // 마커 참조 저장
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
  
  // 시군구 GeoJSON 로드 함수
  const loadDistricts = useCallback(async (): Promise<void> => {
    if (!map) {
      throw new Error("Map is not initialized");
    }
    
    try {
      const response = await fetch(districtsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
      }
      const data = await response.json() as GeoJsonData;
      
      // 시군구 레이어 생성
      const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
        style: () => DISTRICTS_STYLE,
        interactive: true,
        renderer: L.svg({ padding: 0 }),
        pane: 'overlayPane',
        bubblingMouseEvents: false,
        onEachFeature: (feature, layer) => {
          // 툴팁 레이블 제거 - 마커 기반 레이블만 사용
        },
      });
      
      // 상태에 레이어 저장
      setDistrictLayer(districtsLayer);
      
      // 초기 확대 수준에 따라 시군구 레이어 추가
      const initialZoom = map.getZoom();
      if (initialZoom >= 8) { // 줌 레벨 8 이상일 때만 시군구 경계선 표시
        districtsLayer.addTo(map);
      }
      
      // 줌 레벨에 따라 시군구 레이어 토글
      const toggleDistrictLayer = () => {
        const currentZoom = map.getZoom();
        const districts = getDistrictLayer();
        
        if (!districts) return;
        
        if (currentZoom >= 8) { // 줌 레벨 8 이상일 때만 시군구 경계선 표시
          if (!map.hasLayer(districts)) {
            districts.addTo(map);
          }
        } else if (map.hasLayer(districts)) {
          map.removeLayer(districts);
        }
      };
      
      // 이벤트 리스너 등록
      map.on("zoomend", toggleDistrictLayer);
      
      // 시군구 레이블 추가 - 데이터 처리
      data.features.forEach((feature) => {
        try {
          const properties = feature.properties as GeoJsonProperties;
          const districtName = properties.NL_NAME_2 ?? "알 수 없음";
          const provinceName = properties.NL_NAME_1 ?? "알 수 없음";
          
          // 광역시 필터링
          const isBigCity = [
            "서울특별시", "부산광역시", "대구광역시", "인천광역시",
            "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
          ].includes(provinceName);
          
          if (!isBigCity) {
            // 중심점 계산
            const coordsList = feature.geometry.coordinates as any[];
            if (!coordsList || !coordsList.length) return;
            
            let latSum = 0, lngSum = 0, count = 0;
            
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
              
              // 마커 생성
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
              
              // 마커 참조 저장
              addDistrictMarker(marker);
              
              // 줌 레벨에 따라 마커 가시성 조정
              map.on("zoomend", () => {
                const currentZoom = map.getZoom();
                if (currentZoom >= 8) { // 줌 레벨 8 이상일 때만 시군구 이름 표시
                  marker.setOpacity(1);
                } else {
                  marker.setOpacity(0);
                }
              });
              
              // 초기 줌 레벨에 따라 가시성 설정
              if (map.getZoom() >= 8) {
                marker.setOpacity(1);
              }
            }
          }
        } catch (error) {
          console.error("시군구 마커 생성 오류:", error);
        }
      });
      
      // 레이어 순서 유지 함수
      const maintainLayerOrder = () => {
        const provinces = getProvinceLayer();
        const districts = getDistrictLayer();
        
        if (provinces && map.hasLayer(provinces)) {
          provinces.bringToFront();
          
          if (districts && map.hasLayer(districts)) {
            districts.bringToFront();
          }
        }
      };
      
      // 이벤트 리스너 등록
      map.on("moveend", maintainLayerOrder);
      
    } catch (error) {
      console.error("시군구 GeoJSON 로드 오류:", error);
      throw error;
    }
  }, [map, districtsUrl, setDistrictLayer, getDistrictLayer, getProvinceLayer, addDistrictMarker]);
  
  // GeoJSON 레이어 로드 효과
  useEffect(() => {
    if (!map) return;
    
    // 지도가 DOM에 렌더링되는 시간 확보
    const timer = setTimeout(async () => {
      try {
        // 시도 GeoJSON 로드
        await loadProvinces();
        
        // 시군구 GeoJSON 로드
        await loadDistricts();
        
        // 로드 완료 상태 설정
        setIsGeoJsonLoaded(true);
      } catch (error) {
        console.error("GeoJSON 로드 오류:", error);
        setIsGeoJsonLoaded(true); // 오류가 있어도 로드 완료 처리
      }
    }, 500);
    
    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      clearTimeout(timer);
      cleanupLayers(map);
      
      map.off("zoomend");
      map.off("moveend");
    };
  }, [map, loadProvinces, loadDistricts, cleanupLayers]);
  
  return {
    isGeoJsonLoaded,
    reloadGeoJson: useCallback(async () => {
      if (!map) return;
      
      // 기존 레이어 정리
      cleanupLayers(map);
      
      // 로드 중 상태로 변경
      setIsGeoJsonLoaded(false);
      
      try {
        // 레이어 다시 로드
        await loadProvinces();
        await loadDistricts();
        setIsGeoJsonLoaded(true);
      } catch (error) {
        console.error("GeoJSON 다시 로드 오류:", error);
        setIsGeoJsonLoaded(true);
      }
    }, [map, loadProvinces, loadDistricts, cleanupLayers])
  };
}