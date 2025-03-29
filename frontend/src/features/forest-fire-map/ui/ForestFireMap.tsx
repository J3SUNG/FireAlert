import { FC, useEffect, useRef, useState } from "react";
import { MapLoadingIndicator } from "../components/MapLoadingIndicator";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ForestFireData } from "../../../shared/types/forestFire";
import { formatLocationName } from "../../../shared/utils/locationFormat";
import "./map.css";

interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  legendPosition?: L.ControlPosition;
}

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

export const ForestFireMap: FC<ForestFireMapProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
  legendPosition = "bottomleft",
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState<boolean>(false);
  
  // 지도 클릭이 마커 클릭을 통해 발생한 것인지 확인하기 위한 플래그
  const isMarkerClickRef = useRef(false);

  useEffect(() => {
    if (mapRef.current) {
      return; // 이미 맵이 있으면 다시 초기화하지 않음
    }

    if (!mapContainerRef.current) return;

    try {
      // Leaflet 맵 초기화 시 배경색 직접 설정
      mapContainerRef.current.style.backgroundColor = "#bae6fd";

      // 지도 초기화 - zoomControl을 false로 설정하여 기본 줌 컨트롤 비활성화
      const map = L.map(mapContainerRef.current, {
        center: [36.0, 127.7], // 한국 중심점
        zoom: 7,
        zoomControl: false, // 기본 줌 컨트롤 비활성화
        dragging: true,
        scrollWheelZoom: true,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        minZoom: 6.5, // 최소 줌 레벨 설정
        maxZoom: 12, // 최대 줌 레벨 설정
      });

      // 한국의 경계 설정 - 남서쪽(제주도 포함)과 북동쪽(독도 포함) 좌표
      const southWest = L.latLng(33.0, 124.5);
      const northEast = L.latLng(38.7, 131.0);
      const bounds = L.latLngBounds(southWest, northEast);

      // 경계 제한 설정
      map.setMaxBounds(bounds);
      map.options.maxBoundsViscosity = 0.8; // 경계를 넘어갈 때 저항감 (0-1)

      // 오른쪽 위에만 줌 컨트롤 추가
      L.control
        .zoom({
          position: "topright",
        })
        .addTo(map);

      L.control
        .scale({
          imperial: false,
          position: "bottomright",
        })
        .addTo(map);

      mapRef.current = map;

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

      legendControl.addTo(map);

      // 배경색 설정 - 하늘색 바다
      map.getContainer().style.background = "#bae6fd";
      setIsMapLoaded(true);

      const loadProvinces = async (): Promise<void> => {
        try {
          const response = await fetch("/assets/map/gadm41_KOR_1.json");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          if (!mapRef.current) return;

          const provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => ({
              color: "#ffffff", // 흰색 경계선
              weight: 3, // 시도 경계선 두께 증가
              opacity: 0.9,
              fillColor: "#e0f2fe",
              fillOpacity: 0.95,
            }),
            onEachFeature: (feature, layer) => {
              const properties = feature.properties as GeoJsonProperties;
              const provinceName = properties.NL_NAME_1 ?? "알 수 없음";

              layer.bindTooltip(provinceName, {
                permanent: true,
                direction: "center",
                className: "province-label",
              });
            },
          }).addTo(mapRef.current);

          geoJsonLayersRef.current.provinces = provincesLayer;

          await loadDistricts();
        } catch (error) {
          console.error("시도 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true);
        }
      };

      const loadDistricts = async (): Promise<void> => {
        try {
          const response = await fetch("/assets/map/gadm41_KOR_2.json");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${String(response.status)}`);
          }
          const data = (await response.json()) as GeoJsonData;

          const mapInstance = mapRef.current;
          if (!mapInstance) return;

          const districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
            style: () => ({
              color: "#ffffff", // 흰색 경계선
              weight: 1.2,
              opacity: 0.9,
              fillColor: "transparent",
              fillOpacity: 0,
            }),
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

              mapInstance.on("zoomend", () => {
                const currentZoom = mapInstance.getZoom();
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

          mapInstance.on("zoomend", () => {
            const currentZoom = mapInstance.getZoom();
            if (currentZoom >= 8) {
              if (!mapInstance.hasLayer(districtsLayer)) {
                districtsLayer.addTo(mapInstance);
              }
            } else if (mapInstance.hasLayer(districtsLayer)) {
              mapInstance.removeLayer(districtsLayer);
            }
          });

          geoJsonLayersRef.current.districts = districtsLayer;

          setIsGeoJsonLoaded(true);
        } catch (error) {
          console.error("시군구 GeoJSON 로드 오류:", error);
          setIsGeoJsonLoaded(true);
        }
      };

      void loadProvinces();
    } catch (error) {
      console.error("지도 초기화 중 오류 발생:", error);
      setIsMapLoaded(true);
      setIsGeoJsonLoaded(true);
    }

    return () => {
      // cleanup 함수: 컴포넌트가 언마운트될 때만 지도를 제거
    };
  }, [legendPosition]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || !isGeoJsonLoaded) {
      return;
    }

    try {
      // 기존 마커 제거
      Object.values(markersRef.current).forEach((marker) => {
        marker.remove();
      });
      markersRef.current = {};

      // 지도 인스턴스 가져오기
      const mapInstance = mapRef.current;
      if (!mapInstance) return;
      
      // 기존 클릭 이벤트 제거
      mapInstance.off('click');
      
      // 지도 빈 영역 클릭 이벤트 추가 - 산불 선택 해제 기능
      mapInstance.on('click', () => {
        // 약간의 지연을 두어 마커 클릭이 먼저 처리되도록 함
        setTimeout(() => {
          // 마커 클릭이 아닌 경우에만 선택 해제 처리
          if (onFireSelect && selectedFireId && !isMarkerClickRef.current) {
            // 산불 선택 해제
            const currentFire = fires.find(f => f.id === selectedFireId);
            if (currentFire) {
              onFireSelect(currentFire); // 동일한 산불을 다시 클릭하는 경우 해제됨
            }
          }
          
          // 플래그 초기화
          isMarkerClickRef.current = false;
        }, 10); // 짧은 지연 추가
      });

      fires.forEach((fire) => {
        const { lat, lng } = fire.coordinates;

        const markerClassName = `fire-marker__container fire-marker__container--${fire.severity}`;
        const activeClass = fire.status === "active" ? " fire-marker__container--active" : "";

        // 심각도에 따라 마커 크기 조정 (이름 표시할 공간 필요)
        const markerSize =
          fire.severity === "critical"
            ? 28
            : fire.severity === "high"
            ? 25
            : fire.severity === "medium"
            ? 22
            : 20;

        // 지역 이름을 시도 시군구 형식으로 포맷팅
        const formattedLocation = formatLocationName(fire.location);

        // 마커 아이콘에 포맷팅된 지역 이름 추가
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div class="${markerClassName}${activeClass}"></div>
            <div class="fire-marker__location">${formattedLocation}</div>
          `,
          iconSize: [markerSize, markerSize + 20], // 높이를 증가시켜 텍스트 공간 확보
          iconAnchor: [markerSize / 2, markerSize / 2 + 10], // 앵커 포인트 조정
        });

        const mapInstance = mapRef.current;
        if (!mapInstance) return;

        const marker = L.marker([lat, lng], { icon }).addTo(mapInstance);

        const severityText =
          fire.severity === "low"
            ? "낮음"
            : fire.severity === "medium"
            ? "중간"
            : fire.severity === "high"
            ? "높음"
            : "심각";

        const statusText =
          fire.status === "active" ? "진행중" : fire.status === "contained" ? "통제중" : "진화완료";

        const statusClass = `fire-popup__status--${fire.status}`;
        const severityClass = `fire-popup__severity--${fire.severity}`;

        let descriptionContent = "";
        if (typeof fire.description === "string" && fire.description.length > 0) {
          descriptionContent = `<p class="fire-popup__description">${fire.description}</p>`;
        }

        // 진화율 색상 계산
        const getExtinguishPercentageColor = (percentage: string) => {
          const percentageNum = parseInt(percentage, 10);
          if (percentageNum < 50) return "#ef4444"; // 빨간색 (50% 미만)
          if (percentageNum < 100) return "#f97316"; // 주황색 (50% 이상, 100% 미만)
          return "#22c55e"; // 초록색 (100%)
        };

        const extinguishContent =
          fire.status !== "extinguished"
            ? `<p class="fire-popup__info"><span class="fire-popup__label">진화율:</span> <span style="color: ${getExtinguishPercentageColor(
                fire.extinguishPercentage || "0"
              )}">${fire.extinguishPercentage || "0"}%</span></p>`
            : "";

        // 마커에 호버 시 나타내는 툴팁 내용 추가
        marker.bindTooltip(`
          <div class="fire-popup">
            <h3 class="fire-popup__title">${formattedLocation}</h3>
            <p class="fire-popup__info"><span class="fire-popup__label">위치:</span> ${fire.location}</p>
            <p class="fire-popup__info"><span class="fire-popup__label">발생일:</span> ${fire.date}</p>
            <p class="fire-popup__info"><span class="fire-popup__label">상태:</span> <span class="${statusClass}">${statusText}</span></p>
            ${extinguishContent}
            <p class="fire-popup__info"><span class="fire-popup__label">심각도:</span> <span class="${severityClass}">${severityText}</span></p>
            <p class="fire-popup__info"><span class="fire-popup__label">영향 면적:</span> ${String(fire.affectedArea)}ha</p>
            ${descriptionContent}
          </div>
        `, {
          permanent: false,
          direction: "top",
          offset: [0, -25],
          className: "fire-tooltip-hover",
          opacity: 0.98
        });

        marker.on("click", (e) => {
          // 마커 클릭 시 이벤트가 지도까지 전파되지 않도록 설정
          L.DomEvent.stopPropagation(e);
        
          // 마커 클릭 플래그 설정
          isMarkerClickRef.current = true;
        
          if (onFireSelect) {
            onFireSelect(fire); // 이미 useFireFilterAndSelection 훅에서 동일한 산불 클릭 시 선택 해제 기능 있음
          }
        });

        markersRef.current[fire.id] = marker;
      });
    } catch (error) {
      console.error("마커 업데이트 중 오류 발생:", error);
    }
  }, [fires, onFireSelect, isMapLoaded, isGeoJsonLoaded, selectedFireId]);

  useEffect(() => {
    if (typeof selectedFireId !== "string" || !mapRef.current || !isGeoJsonLoaded) return;

    try {
      if (!Object.prototype.hasOwnProperty.call(markersRef.current, selectedFireId)) {
        return;
      }

      const marker = markersRef.current[selectedFireId];

      const fire = fires.find((f) => f.id === selectedFireId);
      if (fire) {
        mapRef.current.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
      }
    } catch (error) {
      console.error("선택된 마커 처리 중 오류 발생:", error);
    }
  }, [selectedFireId, fires, isGeoJsonLoaded]);

  return (
    <div className="forest-fire-map">
      <div ref={mapContainerRef} className="forest-fire-map__container"></div>
      <MapLoadingIndicator isLoading={!isMapLoaded || !isGeoJsonLoaded} />
    </div>
  );
};