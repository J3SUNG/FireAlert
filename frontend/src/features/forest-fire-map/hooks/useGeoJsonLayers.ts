import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface GeoJsonProperties {
  NL_NAME_1?: string;
  NL_NAME_2?: string;
  TYPE_2?: string;
  [key: string]: unknown;
}

interface GeoJsonFeature {
  type: string;
  properties: GeoJsonProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

interface UseGeoJsonLayersOptions {
  provincesUrl: string;
  districtsUrl: string;
}

/**
 * GeoJSON 레이어를 로드하고 관리하기 위한 커스텀 훅
 */
export function useGeoJsonLayers(map: L.Map | null, options: UseGeoJsonLayersOptions) {
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);

  useEffect(() => {
    // 지도가 없으면 아무것도 하지 않음
    if (!map) {
      console.log('지도가 아직 로드되지 않아 GeoJSON을 로드하지 않습니다.');
      return;
    }

    const loadProvinces = async (): Promise<void> => {
      try {
        console.log('시도 GeoJSON 로드 시작');
        const response = await fetch(options.provincesUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json() as GeoJsonData;

        // 시도 경계 GeoJSON 레이어 생성
        const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
          style: () => ({
            color: '#3388ff',
            weight: 2,
            opacity: 0.8,
            fillColor: '#f0f9ff',
            fillOpacity: 0.6
          }),
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? '알 수 없음';
            
            layer.bindTooltip(provinceName, {
              permanent: true,
              direction: 'center',
              className: 'province-label'
            });
          }
        });

        // 레이어가 생성된 후 지도에 추가
        provincesLayer.addTo(map);
        geoJsonLayersRef.current.provinces = provincesLayer;
        
        console.log('시도 GeoJSON 데이터 로드 완료');
        
        // 시도 로드 후 시군구 로드
        await loadDistricts();
      } catch (error) {
        console.error("시도 GeoJSON 로드 오류:", error);
        setIsGeoJsonLoaded(true);
      }
    };

    const loadDistricts = async (): Promise<void> => {
      try {
        console.log('시군구 GeoJSON 로드 시작');
        const response = await fetch(options.districtsUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json() as GeoJsonData;
        
        // 시군구 경계 GeoJSON 레이어 생성
        const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
          style: () => ({
            color: '#666',
            weight: 1,
            opacity: 0.5,
            fillColor: 'transparent',
            fillOpacity: 0
          }),
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const districtName = properties.NL_NAME_2 ?? '알 수 없음';
            
            const tooltip = L.tooltip({
              permanent: true,
              direction: 'center',
              className: 'district-label',
              opacity: 0
            });
            
            tooltip.setContent(districtName);
            layer.bindTooltip(tooltip);
            
            // 줌 레벨에 따라 표시 여부 설정
            map.on('zoomend', () => {
              const currentZoom = map.getZoom();
              if (currentZoom >= 9) {
                const toolTip = layer.getTooltip();
                if (toolTip) toolTip.setOpacity(1);
              } else {
                const toolTip = layer.getTooltip();
                if (toolTip) toolTip.setOpacity(0);
              }
            });
          }
        });

        // 레이어는 생성하지만 바로 추가하지 않음
        geoJsonLayersRef.current.districts = districtsLayer;

        // 줌 레벨에 따라 표시 여부 결정
        map.on('zoomend', () => {
          try {
            const currentZoom = map.getZoom();
            if (currentZoom >= 8 && geoJsonLayersRef.current.districts) {
              if (!map.hasLayer(geoJsonLayersRef.current.districts)) {
                geoJsonLayersRef.current.districts.addTo(map);
              }
            } else if (geoJsonLayersRef.current.districts && map.hasLayer(geoJsonLayersRef.current.districts)) {
              map.removeLayer(geoJsonLayersRef.current.districts);
            }
          } catch (error) {
            console.error('줌 이벤트 처리 중 오류:', error);
          }
        });
        
        console.log('시군구 GeoJSON 데이터 로드 완료');
        setIsGeoJsonLoaded(true);
      } catch (error) {
        console.error("시군구 GeoJSON 로드 오류:", error);
        setIsGeoJsonLoaded(true);
      }
    };

    // GeoJSON 로드 시작
    loadProvinces().catch(error => {
      console.error('GeoJSON 로드 중 예외 발생:', error);
      setIsGeoJsonLoaded(true);
    });

    // 클린업 함수
    return () => {
      try {
        if (geoJsonLayersRef.current.provinces && map.hasLayer(geoJsonLayersRef.current.provinces)) {
          map.removeLayer(geoJsonLayersRef.current.provinces);
        }
        
        if (geoJsonLayersRef.current.districts && map.hasLayer(geoJsonLayersRef.current.districts)) {
          map.removeLayer(geoJsonLayersRef.current.districts);
        }
      } catch (error) {
        console.error('GeoJSON 레이어 제거 중 오류:', error);
      }
    };
  }, [map, options]);

  return {
    geoJsonLayers: geoJsonLayersRef.current,
    isGeoJsonLoaded
  };
}