import { FC, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ForestFireData } from "../../../shared/types/forestFire";

interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
}

export const ForestFireMap: FC<ForestFireMapProps> = ({ fires, selectedFireId, onFireSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (mapRef.current) {
      return; // 이미 맵이 있으면 다시 초기화하지 않음
    }

    if (!mapContainerRef.current) return;

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

    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    L.control
      .scale({
        imperial: false, // 미터법만 사용
        position: "bottomright",
      })
      .addTo(map);

    mapRef.current = map;

    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = function (): HTMLElement {
      const div = L.DomUtil.create("div", "info legend");
      div.style.backgroundColor = "white";
      div.style.padding = "8px";
      div.style.borderRadius = "5px";
      div.style.boxShadow = "0 0 5px rgba(0,0,0,0.2)";
      div.style.fontSize = "12px";

      div.innerHTML = `
        <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold;">산불 심각도</h4>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ff0000; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>심각</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ff8000; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>높음</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ffff00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>중간</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="background-color: #0080ff; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>낮음</span>
        </div>
      `;

      return div;
    };

    legend.addTo(map);

    setIsMapLoaded(true);

    return () => {
      // cleanup 함수에서는 지도를 제거하지 않음
      // 컴포넌트가 언마운트될 때만 지도를 제거
      // 이렇게 하면 리렌더링 시 지도가 계속 유지됨
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) {
      return;
    }

    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    const getSeverityColor = (severity: ForestFireData["severity"]): string => {
      switch (severity) {
        case "critical":
          return "#ff0000"; // 빨강
        case "high":
          return "#ff8000"; // 주황
        case "medium":
          return "#ffff00"; // 노랑
        case "low":
          return "#0080ff"; // 파랑
        default:
          return "#808080"; // 회색
      }
    };

    const getSeveritySize = (severity: ForestFireData["severity"]): number => {
      switch (severity) {
        case "critical":
          return 28; // 기존 18에서 28로 증가
        case "high":
          return 25; // 기존 16에서 25로 증가
        case "medium":
          return 22; // 기존 14에서 22로 증가
        case "low":
          return 20; // 기존 12에서 20으로 증가
        default:
          return 15; // 기존 10에서 15로 증가
      }
    };

    fires.forEach((fire) => {
      const { lat, lng } = fire.coordinates;
      const severityColor = getSeverityColor(fire.severity);
      const severitySize = getSeveritySize(fire.severity);

      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="
          background-color: ${severityColor}; 
          width: ${severitySize.toString()}px; 
          height: ${severitySize.toString()}px; 
          border-radius: 50%; 
          border: 3px solid white;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
          ${fire.status === "active" ? "animation: pulse 1.5s infinite;" : ""}
        "></div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>`,
        iconSize: [severitySize, severitySize],
        iconAnchor: [severitySize / 2, severitySize / 2],
      });

      if (!mapRef.current) return;
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current);

      marker.bindTooltip(
        `
        <div style="font-weight: bold;">${fire.location}</div>
        <div>${
          fire.severity === "low"
            ? "낮음"
            : fire.severity === "medium"
            ? "중간"
            : fire.severity === "high"
            ? "높음"
            : "심각"
        } - ${
          fire.status === "active" ? "진행중" : fire.status === "contained" ? "통제중" : "진화완료"
        }</div>
      `,
        {
          permanent: false,
          direction: "top",
          className: "fire-tooltip",
          opacity: 0.9,
        }
      );

      let descriptionContent = "";
      if (typeof fire.description === "string" && fire.description.length > 0) {
        descriptionContent = `<p style="margin: 8px 0 0; font-style: italic; color: #666; font-size: 0.9em;">${fire.description}</p>`;
      }

      marker.bindPopup(
        `
        <div style="width: 220px; padding: 5px;">
          <h3 style="font-weight: bold; margin-bottom: 5px; color: #333;">${fire.location}</h3>
          <p style="margin: 4px 0; color: #555;"><strong>발생일:</strong> ${fire.date}</p>
          <p style="margin: 4px 0; color: #555;"><strong>상태:</strong> ${
            fire.status === "active"
              ? '<span style="color: red;">진행중</span>'
              : fire.status === "contained"
              ? '<span style="color: orange;">통제중</span>'
              : '<span style="color: green;">진화완료</span>'
          }</p>
          <p style="margin: 4px 0; color: #555;"><strong>심각도:</strong> ${
            fire.severity === "low"
              ? '<span style="color: blue;">낮음</span>'
              : fire.severity === "medium"
              ? '<span style="color: #cc0;">중간</span>'
              : fire.severity === "high"
              ? '<span style="color: orange;">높음</span>'
              : '<span style="color: red;">심각</span>'
          }</p>
          <p style="margin: 4px 0; color: #555;"><strong>영향 면적:</strong> ${fire.affectedArea.toString()}ha</p>
          ${descriptionContent}
        </div>
      `,
        {
          maxWidth: 300,
        }
      );

      marker.on("click", () => {
        if (onFireSelect) {
          onFireSelect(fire);
        }
      });

      markersRef.current[fire.id] = marker;
    });
  }, [fires, onFireSelect, isMapLoaded]);

  useEffect(() => {
    if (typeof selectedFireId !== "string" || !mapRef.current) return;

    const marker = markersRef.current[selectedFireId];

    if (!Object.prototype.hasOwnProperty.call(markersRef.current, selectedFireId)) return;

    marker.openPopup();

    const fire = fires.find((f) => f.id === selectedFireId);
    if (fire) {
      mapRef.current.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
    }
  }, [selectedFireId, fires]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
  };

  const mapContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "calc(100vh - 70px)",
  };

  const loadingStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
  };

  const loadingContentStyle: React.CSSProperties = {
    textAlign: "center",
  };

  const spinnerStyle: React.CSSProperties = {
    display: "inline-block",
    height: "32px",
    width: "32px",
    borderRadius: "50%",
    border: "4px solid #e5e7eb",
    borderTopColor: "#ef4444",
    animation: "spin 1s linear infinite",
  };

  const loadingTextStyle: React.CSSProperties = {
    marginTop: "8px",
    color: "#4b5563",
  };

  return (
    <div style={containerStyle}>
      <div ref={mapContainerRef} style={mapContainerStyle}></div>
      {!isMapLoaded && (
        <div style={loadingStyle}>
          <div style={loadingContentStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .leaflet-tooltip {
            background-color: white;
            border: 1px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 5px 8px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.2);
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
          }
          
          .province-tooltip {
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 10px;
            padding: 3px 6px;
            pointer-events: none;
          }
          
          .district-tooltip {
            background-color: rgba(255, 255, 255, 0.9);
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 9px;
            padding: 2px 5px;
            pointer-events: none;
          }
          
          .fire-tooltip {
            background-color: white;
            border: none;
            box-shadow: 0 1px 5px rgba(0,0,0,0.3);
            padding: 5px 8px;
            font-size: 11px;
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
};
