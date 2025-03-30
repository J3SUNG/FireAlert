import { FC, useRef, useState, useEffect } from 'react';
import L from 'leaflet';
import { 
  MAP_INIT_OPTIONS,
  KOREA_BOUNDS,
  MAP_BACKGROUND_COLOR 
} from '../constants/mapSettings';

interface MapInitializerProps {
  legendPosition?: L.ControlPosition;
  onMapReady: (map: L.Map) => void;
}

/**
 * Leaflet 지도 초기화 컴포넌트
 */
export const MapInitializer: FC<MapInitializerProps> = ({ 
  legendPosition = 'bottomleft',
  onMapReady
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (map) return; // 이미 맵이 있으면 초기화하지 않음

    try {
      // 배경색 설정
      mapContainerRef.current.style.backgroundColor = MAP_BACKGROUND_COLOR;
      
      // 지도 초기화
      const newMap = L.map(mapContainerRef.current, MAP_INIT_OPTIONS);
      
      // 지도 경계 설정
      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8; // 경계를 넘어갈 때 저항감 (0-1)
      
      // 오른쪽 위에 줌 컨트롤 추가
      L.control
        .zoom({
          position: "topright",
        })
        .addTo(newMap);
      
      // 스케일 컨트롤 추가
      L.control
        .scale({
          imperial: false,
          position: "bottomright",
        })
        .addTo(newMap);
      
      // 범례 추가
      const legendControl = new L.Control({ position: legendPosition });
      
      legendControl.onAdd = function (): HTMLElement {
        const div = L.DomUtil.create("div", "map-legend");
        
        div.innerHTML = `
          <h4 class="map-legend__title">산불 심각도</h4>
          <div class="map-legend__item">
            <div class="map-legend__icon map-legend__icon--critical"></div>
            <span>심각</span>
          </div>
          <div class="map-legend__item">
            <div class="map-legend__icon map-legend__icon--high"></div>
            <span>높음</span>
          </div>
          <div class="map-legend__item">
            <div class="map-legend__icon map-legend__icon--medium"></div>
            <span>중간</span>
          </div>
          <div class="map-legend__item">
            <div class="map-legend__icon map-legend__icon--low"></div>
            <span>낮음</span>
          </div>
        `;
        
        return div;
      };
      
      legendControl.addTo(newMap);
      
      // 배경색 설정
      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;
      
      // 상태 업데이트
      setMap(newMap);
      onMapReady(newMap);
    } catch (error) {
      console.error("지도 초기화 중 오류 발생:", error);
    }
    
    return () => {
      // cleanup: 컴포넌트 언마운트 시 지도 삭제 (선택적)
      // if (map) map.remove();
    };
  }, [legendPosition, onMapReady]);
  
  return <div ref={mapContainerRef} className="forest-fire-map__container" />;
};
