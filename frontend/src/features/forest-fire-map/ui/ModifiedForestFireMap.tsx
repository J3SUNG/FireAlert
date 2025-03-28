import { FC, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ForestFireData } from "../../../shared/types/forestFire";
import "./map.css";

interface ModifiedForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
  legendPosition?: L.ControlPosition;
}

export const ModifiedForestFireMap: FC<ModifiedForestFireMapProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
  legendPosition = "bottomleft",
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const provinceLayerRef = useRef<L.GeoJSON | null>(null);
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // 초기 지도 설정
  useEffect(() => {
    if (mapRef.current) {
      return; // 이미 맵이 있으면 다시 초기화하지 않음
    }

    // 지도 컨테이너가 존재하는지 확인
    if (!mapContainerRef.current) return;

    console.log("지도 초기화 시작");

    // 지도 초기화
    const map = L.map(mapContainerRef.current, {
      center: [36.0, 127.7], // 한국 중심점
      zoom: 7,
      zoomControl: true, // 줌 컨트롤 활성화
      dragging: true, // 드래그 활성화
      scrollWheelZoom: true, // 마우스 휠로 줌 활성화
      // 아날로그 확대/축소 효과를 위한 설정 추가
      zoomSnap: 0.1, // 줌 단계를 0.1 단위로 세분화
      zoomDelta: 0.5, // 줌 버튼 클릭 시 0.5 단위로 확대/축소
      wheelPxPerZoomLevel: 120, // 휠 스크롤 당 확대/축소 정도 조정 (값이 클수록 느리게)
    });

    // 타일 레이어 추가 (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19, // 최대 줌 레벨 설정
    }).addTo(map);

    // 줌 컨트롤 위치 설정
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // 스케일 컨트롤 추가
    L.control
      .scale({
        imperial: false, // 미터법만 사용
        position: "bottomright",
      })
      .addTo(map);

    // 맵 레퍼런스 저장
    mapRef.current = map;

    // 범례 추가
    const legend = L.control({ position: legendPosition });
    legend.onAdd = function (map) {
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
    legend.addTo(map);

    // 한국 지도 GeoJSON (시도 레벨) 추가
    const addKoreaProvinces = async () => {
      try {
        console.log("한국 시도 GeoJSON 로드 시도");
        const response = await fetch("/assets/map/gadm41_KOR_1.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
        }
        const geoJsonData = await response.json();
        console.log("시도 GeoJSON 데이터 로드 성공");

        // GeoJSON 스타일 설정
        const provinceLayer = L.geoJSON(geoJsonData, {
          style: {
            color: "#3388ff",
            weight: 2,
            opacity: 0.7,
            fillColor: "#e6f2ff",
            fillOpacity: 0.1,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              // NL_NAME_1을 사용하여 한글 지역명 표시 (파이프 문자로 구분된 경우 첫 번째 부분만 사용)
              const provinceName =
                feature.properties.NL_NAME_1 || feature.properties.NAME_1 || "지역 정보 없음";

              // 모든 시/도 이름 직접 표시 (고정 라벨)
              const latLng = layer.getBounds().getCenter();

              // 지역 라벨 생성
              const icon = L.divIcon({
                className: "province-label",
                html: `<div class="province-label-text">${provinceName}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10],
              });

              L.marker(latLng, {
                icon: icon,
                interactive: false,
                keyboard: false,
              }).addTo(map);

              // 마우스 오버 툴팁
              layer.bindTooltip(provinceName, {
                permanent: false,
                direction: "center",
                className: "province-tooltip",
                opacity: 0.9,
              });
            }

            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillOpacity: 0.3,
                  fillColor: "#b3d9ff",
                });
              },
              mouseout: (e) => {
                provinceLayer.resetStyle(e.target);
              },
            });
          },
        }).addTo(map);

        // 시도 레이어 참조 저장
        provinceLayerRef.current = provinceLayer;
        console.log("한국 시도 지도 GeoJSON 로드 완료");

        // 시군구 데이터도 로드
        await addKoreaDistricts();
      } catch (error) {
        console.error("한국 시도 지도 GeoJSON 로드 실패:", error);
      } finally {
        setIsMapLoaded(true);
      }
    };

    // 한국 지도 GeoJSON (시군구 레벨) 추가
    const addKoreaDistricts = async () => {
      try {
        console.log("한국 시군구 GeoJSON 로드 시도");
        const response = await fetch("/assets/map/gadm41_KOR_2.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
        }
        const geoJsonData = await response.json();
        console.log("시군구 GeoJSON 데이터 로드 성공");

        // 시군구 이름과 중심점 저장용 맵
        const districtLabels = new Map();

        // GeoJSON 스타일 설정
        const districtLayer = L.geoJSON(geoJsonData, {
          style: {
            color: "#666",
            weight: 0.8,
            opacity: 0.6,
            fillColor: "#f5f5f5",
            fillOpacity: 0.1,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              // NL_NAME_2, NL_NAME_1을 사용하여 한글 지역명 표시
              const districtName = feature.properties.NL_NAME_2 || feature.properties.NAME_2 || "";
              const provinceName = feature.properties.NL_NAME_1 || feature.properties.NAME_1 || "";
              const latLng = layer.getBounds().getCenter();

              // 시군구 중심점 저장 (라벨 표시용)
              if (districtName) {
                districtLabels.set(districtName, latLng);
              }

              // 마우스 오버 툴팁
              const fullName = districtName + (provinceName ? ` (${provinceName})` : "");
              layer.bindTooltip(fullName, {
                permanent: false,
                direction: "center",
                className: "district-tooltip",
                opacity: 0.9,
              });
            }

            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillOpacity: 0.3,
                  fillColor: "#ffe6b3",
                });
              },
              mouseout: (e) => {
                districtLayer.resetStyle(e.target);
              },
            });
          },
        }).addTo(map);

        // 시군구 이름 라벨 추가 - 한글로 표시
        districtLabels.forEach((latLng, name) => {
          // 지도 줌 레벨에 따라 표시 여부 결정
          const icon = L.divIcon({
            className: "district-label",
            html: `<div class="district-label-text">${name}</div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 10],
          });

          // 시군구 이름 표시를 위한 마커 추가 - 처음부터 모든 이름 표시
          const marker = L.marker(latLng, {
            icon: icon,
            interactive: false,
            keyboard: false,
            zIndexOffset: 1000, // 다른 마커보다 상위에 표시
          }).addTo(map);

          // 마커를 항상 표시 - 줌 레벨이 낮으면 폰트 크기를 줄임
          const updateMarkerStyle = () => {
            const zoom = map.getZoom();
            const element = marker.getElement();
            if (element) {
              const labelElement = element.querySelector(".district-label-text");
              if (labelElement) {
                if (zoom >= 9) {
                  labelElement.style.display = "block";
                  labelElement.style.fontSize = "11px";
                } else if (zoom >= 8) {
                  labelElement.style.display = "block";
                  labelElement.style.fontSize = "9px";
                } else {
                  labelElement.style.display = "none";
                }
              }
            }
          };

          // 초기 스타일 설정
          updateMarkerStyle();

          // 줌 변경시 스타일 업데이트
          map.on("zoomend", updateMarkerStyle);
        });

        // 시군구 레이어 참조 저장
        districtLayerRef.current = districtLayer;
        console.log("한국 시군구 지도 GeoJSON 로드 완료");
      } catch (error) {
        console.error("한국 시군구 지도 GeoJSON 로드 실패:", error);
      }
    };

    // 지도 로드 초기화
    addKoreaProvinces();
    console.log("지도 초기화 완료");

    return () => {
      // cleanup 함수에서는 지도를 제거하지 않음
      // 컴포넌트가 언마운트될 때만 지도를 제거
      // 이렇게 하면 리렌더링 시 지도가 계속 유지됨
    };
  }, [legendPosition]);

  // 마커 추가 및 업데이트
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) {
      return;
    }

    // 기존 마커 정리
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    // 새 마커 추가
    fires.forEach((fire) => {
      const { lat, lng } = fire.coordinates;
      
      // 마커 아이콘 설정 - CSS 클래스를 활용한 스타일링
      const markerClassName = `fire-marker__container fire-marker__container--${fire.severity}`;
      const activeClass = fire.status === "active" ? " fire-marker__container--active" : "";
      
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="${markerClassName}${activeClass}"></div>`,
        iconSize: [28, 28], // 최대 크기로 설정하고 CSS에서 조절
        iconAnchor: [14, 14],
      });

      // 마커 생성 및 추가
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);

      // 툴팁 설정 (hover에서 표시)
      const severityText = fire.severity === "low" ? "낮음" : 
                         fire.severity === "medium" ? "중간" : 
                         fire.severity === "high" ? "높음" : "심각";
                         
      const statusText = fire.status === "active" ? "진행중" : 
                       fire.status === "contained" ? "통제중" : "진화완료";
                       
      marker.bindTooltip(`
        <div style="font-weight: bold;">${fire.location}</div>
        <div>${severityText} - ${statusText}</div>
      `, {
        permanent: false,
        direction: "top",
        className: "fire-tooltip",
        opacity: 0.9,
      });

      // 팝업 설정 (클릭 시 표시)
      const statusClass = `fire-popup__status--${fire.status}`;
      const severityClass = `fire-popup__severity--${fire.severity}`;
      
      const popupContent = `
        <div class="fire-popup">
          <h3 class="fire-popup__title">${fire.location}</h3>
          <p class="fire-popup__info"><span class="fire-popup__label">발생일:</span> ${fire.date}</p>
          <p class="fire-popup__info"><span class="fire-popup__label">상태:</span> <span class="${statusClass}">${statusText}</span></p>
          <p class="fire-popup__info"><span class="fire-popup__label">심각도:</span> <span class="${severityClass}">${severityText}</span></p>
          <p class="fire-popup__info"><span class="fire-popup__label">영향 면적:</span> ${fire.affectedArea}ha</p>
          ${fire.description ? `<p class="fire-popup__description">${fire.description}</p>` : ""}
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
      });

      // 클릭 이벤트 처리
      marker.on("click", () => {
        if (onFireSelect) {
          onFireSelect(fire);
        }
      });

      // 마커 레퍼런스 저장
      markersRef.current[fire.id] = marker;
    });
  }, [fires, onFireSelect, isMapLoaded]);

  // 선택된 산불 처리
  useEffect(() => {
    if (!selectedFireId || !markersRef.current[selectedFireId] || !mapRef.current) return;

    const marker = markersRef.current[selectedFireId];
    marker.openPopup();

    // 선택된 마커의 위치로 지도 중심 이동
    const fire = fires.find((f) => f.id === selectedFireId);
    if (fire && mapRef.current) {
      mapRef.current.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
    }
  }, [selectedFireId, fires]);

  return (
    <div className="forest-fire-map">
      <div ref={mapContainerRef} className="forest-fire-map__container"></div>
      {!isMapLoaded && (
        <div className="forest-fire-map__loading">
          <div className="forest-fire-map__loading-content">
            <div className="forest-fire-map__spinner"></div>
            <p className="forest-fire-map__loading-text">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};
