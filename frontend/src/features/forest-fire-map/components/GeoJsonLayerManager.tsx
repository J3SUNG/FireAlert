import { FC, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  GEOJSON_PATHS,
  PROVINCES_STYLE,
  DISTRICTS_STYLE 
} from '../constants/mapSettings';
import { GeoJsonProperties } from '../../../shared/types/geoJson';

interface GeoJsonLayerManagerProps {
  map: L.Map | null;
  onLayersLoaded: () => void;
}

/**
 * GeoJSON 레이어 관리 컴포넌트
 */
export const GeoJsonLayerManager: FC<GeoJsonLayerManagerProps> = ({ map, onLayersLoaded }) => {
  // 참조를 위한 ref
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!map) return;
    
    // 시도 GeoJSON 로드
    const loadProvinces = async (): Promise<void> => {
      try {
        const response = await fetch(GEOJSON_PATHS.provinces);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json();
        
        const provincesLayer = L.geoJSON(data, {
          style: () => PROVINCES_STYLE,
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? "알 수 없음";
            
            layer.bindTooltip(provinceName, {
              permanent: true,
              direction: "center",
              className: "province-label",
            });
          },
        }).addTo(map);
        
        geoJsonLayersRef.current.provinces = provincesLayer;
        
        // 시도 로드 후 시군구 로드
        await loadDistricts();
      } catch (error) {
        console.error("시도 GeoJSON 로드 오류:", error);
        onLayersLoaded(); // 오류가 있어도 로드 완료 처리
      }
    };
    
    // 시군구 GeoJSON 로드
    const loadDistricts = async (): Promise<void> => {
      try {
        const response = await fetch(GEOJSON_PATHS.districts);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json();
        
        const districtsLayer = L.geoJSON(data, {
          style: () => DISTRICTS_STYLE,
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const districtName = properties.NL_NAME_2 ?? "알 수 없음";
            
            const tooltip = L.tooltip({
              permanent: true,
              direction: "center",
              className: "district-label",
              opacity: 0,
            });
            
            tooltip.setContent(districtName);
            layer.bindTooltip(tooltip);
            
            map.on("zoomend", () => {
              const currentZoom = map.getZoom();
              if (currentZoom >= 9) {
                const toolTip = layer.getTooltip();
                if (toolTip) toolTip.setOpacity(1);
              } else {
                const toolTip = layer.getTooltip();
                if (toolTip) toolTip.setOpacity(0);
              }
            });
          },
        });
        
        // 줌 레벨에 따라 시군구 레이어 토글
        map.on("zoomend", () => {
          const currentZoom = map.getZoom();
          if (currentZoom >= 8) {
            if (!map.hasLayer(districtsLayer)) {
              districtsLayer.addTo(map);
            }
          } else if (map.hasLayer(districtsLayer)) {
            map.removeLayer(districtsLayer);
          }
        });
        
        geoJsonLayersRef.current.districts = districtsLayer;
        
        // 모든 레이어 로드 완료
        onLayersLoaded();
      } catch (error) {
        console.error("시군구 GeoJSON 로드 오류:", error);
        onLayersLoaded(); // 오류가 있어도 로드 완료 처리
      }
    };
    
    // 시도 GeoJSON 로드 시작
    loadProvinces().catch(() => onLayersLoaded());
    
    // 컴포넌트 언마운트 시 레이어 제거
    return () => {
      const { provinces, districts } = geoJsonLayersRef.current;
      
      if (provinces && map.hasLayer(provinces)) {
        map.removeLayer(provinces);
      }
      
      if (districts && map.hasLayer(districts)) {
        map.removeLayer(districts);
      }
    };
  }, [map, onLayersLoaded]);
  
  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};
