import { FC, useRef, useState, useEffect } from "react";
import L from "leaflet";
import "./MapInitializer.css";
import { MAP_INIT_OPTIONS, KOREA_BOUNDS, MAP_BACKGROUND_COLOR } from "../model/mapSettings";
import { ForestFireData } from "../../../shared/model/forestFire";
import { useErrorHandling } from "../../../shared/lib/errors";

interface MapInitializerProps {
  legendPosition?: L.ControlPosition;
  onMapReady: (map: L.Map) => void;
  fires?: ForestFireData[];
}

/**
 * Leaflet 지도 초기화 컴포넌트
 * 
 * 지도 생성, 설정 및 이벤트 바인딩 처리
 */
export const MapInitializer: FC<MapInitializerProps> = ({
  legendPosition = "bottomleft",
  onMapReady,
  fires = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [_isLoading, setIsLoading] = useState<boolean>(true); // 사용하지 않는 변수 앞에 밑줄 추가
  
  // 에러 처리
  const [errorState, { setError, clearError }] = useErrorHandling("MapInitializer", "forest-fire-map");

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (map) return; // 이미 초기화된 경우 중복 방지

    setIsLoading(true);
    clearError();

    try {
      // 배경색 설정
      mapContainerRef.current.style.backgroundColor = MAP_BACKGROUND_COLOR;

      // 지도 인스턴스 생성
      const newMap = L.map(mapContainerRef.current, MAP_INIT_OPTIONS);

      // 한국 영역으로 제한
      const bounds = L.latLngBounds(KOREA_BOUNDS.southWest, KOREA_BOUNDS.northEast);
      newMap.setMaxBounds(bounds);
      newMap.options.maxBoundsViscosity = 0.8;

      // 컨트롤 추가
      L.control.zoom({ position: "topright" }).addTo(newMap);
      L.control.scale({ imperial: false, position: "bottomright" }).addTo(newMap);

      // 범례 컨트롤 추가
      const legendControl = new L.Control({ position: legendPosition });

      legendControl.onAdd = function (): HTMLElement {
        const div = L.DomUtil.create("div", "map-legend");

        // 범례 업데이트 함수
        const updateLegend = () => {
          try {
            const newInitialCount = fires.filter(
              fire => fire.responseLevelName === "초기대응" || fire.responseLevelName === "초기진화단계"
            ).length;

            const newLevel1Count = fires.filter(fire => fire.responseLevelName === "1단계").length;
            const newLevel2Count = fires.filter(fire => fire.responseLevelName === "2단계").length;
            const newLevel3Count = fires.filter(fire => fire.responseLevelName === "3단계").length;

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
          } catch (error) {
            // 범례 업데이트 오류
            setError(error, { 
              functionName: 'updateLegend',
              action: '지도 범례 업데이트'
            });
            
            div.innerHTML = '<h4 class="map-legend__title">산불 대응단계 현황</h4><div class="map-legend__error">범례 정보를 불러올 수 없습니다.</div>';
          }
        };

        // 외부에서 범례 업데이트 가능하도록 전역 함수 설정
        if (window) {
          (window as any).updateFireLegend = updateLegend;
        }

        // 초기 업데이트
        updateLegend();
        
        return div;
      };

      legendControl.addTo(newMap);

      // 배경색 설정
      newMap.getContainer().style.background = MAP_BACKGROUND_COLOR;

      // 상태 업데이트 및 콜백
      setMap(newMap);
      onMapReady(newMap);
      setIsLoading(false);
    } catch (error) {
      // 초기화 오류 처리
      setError(error, {
        functionName: 'mapInitialization',
        action: '지도 초기화'
      });
      setIsLoading(false);
    }

    return () => {
      // 메모리 누수 방지
      if (map) map.remove();
    };
  }, [legendPosition, onMapReady, fires, clearError, setError]);

  // 산불 데이터 변경 시 범례 업데이트
  useEffect(() => {
    if (window && (window as any).updateFireLegend) {
      (window as any).updateFireLegend();
    }
  }, [fires]);

  return (
    <>
      <div ref={mapContainerRef} className="forest-fire-map__container" />
      
      {/* 에러 발생 시 오버레이 표시 */}
      {errorState.hasError && (
        <div className="map-error-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="map-error-message" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '80%',
            textAlign: 'center'
          }}>
            <h3>지도 로딩 오류</h3>
            <p>{errorState.userMessage}</p>
            <button 
              onClick={() => {
                clearError();
                if (map) map.remove();
                setMap(null);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </>
  );
};