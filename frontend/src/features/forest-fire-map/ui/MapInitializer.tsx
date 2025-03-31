import { FC, useRef, useState, useEffect } from "react";
import L from "leaflet";
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../model/mapSettings";
import { ForestFireData } from "../../../shared/types/forestFire";

interface MapInitializerProps {
  legendPosition?: L.ControlPosition;
  onMapReady: (map: L.Map) => void;
  fires?: ForestFireData[];
}

/**
 * Leaflet 지도 초기화 컴포넌트
 */
export const MapInitializer: FC<MapInitializerProps> = ({
  legendPosition = "bottomleft",
  onMapReady,
  fires = [], // 기본값으로 빈 배열 사용
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  // 지도 초기화 효과
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

        // 범례 업데이트 함수 정의
        const updateLegend = () => {
          const newInitialCount = fires.filter(
            (fire) =>
              fire.responseLevelName === "초기대응" || fire.responseLevelName === "초기진화단계"
          ).length;

          const newLevel1Count = fires.filter((fire) => fire.responseLevelName === "1단계").length;

          const newLevel2Count = fires.filter((fire) => fire.responseLevelName === "2단계").length;

          const newLevel3Count = fires.filter((fire) => fire.responseLevelName === "3단계").length;

          div.innerHTML = `
            <h4 class="map-legend__title">산불 대응단계 현황</h4>
            <div class="map-legend__item map-legend__item--initial">
              <div class="map-legend__icon map-legend__icon--initial"></div>
              <div class="map-legend__content">
                <div class="map-legend__label">초기대응단계</div>
                <div class="map-legend__count">${newInitialCount}</div>
              </div>
            </div>
            <div class="map-legend__item map-legend__item--level1">
              <div class="map-legend__icon map-legend__icon--level1"></div>
              <div class="map-legend__content">
                <div class="map-legend__label">대응단계 1단계</div>
                <div class="map-legend__count">${newLevel1Count}</div>
              </div>
            </div>
            <div class="map-legend__item map-legend__item--level2">
              <div class="map-legend__icon map-legend__icon--level2"></div>
              <div class="map-legend__content">
                <div class="map-legend__label">대응단계 2단계</div>
                <div class="map-legend__count">${newLevel2Count}</div>
              </div>
            </div>
            <div class="map-legend__item map-legend__item--level3">
              <div class="map-legend__icon map-legend__icon--level3"></div>
              <div class="map-legend__content">
                <div class="map-legend__label">대응단계 3단계</div>
                <div class="map-legend__count">${newLevel3Count}</div>
              </div>
            </div>
          `;
        };

        // 산불 데이터가 변경될 때마다 호출할 수 있도록 전역 함수에 저장 (참조용)
        if (window) {
          (window as any).updateFireLegend = updateLegend;
        }

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