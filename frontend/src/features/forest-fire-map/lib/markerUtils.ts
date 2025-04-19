import type { Map, LayerGroup } from "leaflet";

type LeafletModule = typeof import("leaflet");

let LeafletInstance: LeafletModule | null = null;

async function loadLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}
import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 시도명 축약 맵핑
 */
const PROVINCE_ABBR: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

/**
 * 마커 색상 설정
 */
const FIRE_MARKER_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#0080ff",
  initial: "#6b7280",
};

/**
 * 대응단계별 색상 설정
 */
const RESPONSE_LEVEL_COLORS: Record<string, string> = {
  초기대응: "#0080ff",
  초기진화단계: "#0080ff",
  "1단계": "#eab308",
  "2단계": "#f97316",
  "3단계": "#ef4444",
  default: "#6b7280",
};

const SELECTED_MARKER_SCALE = 1.4;

/**
 * 마커 이름 포맷팅
 */
function formatLocationName(fire: ForestFireData): string {
  if (!fire.location) return "알 수 없는 위치";

  if (fire.province && fire.district) {
    const provinceName = PROVINCE_ABBR[fire.province] || fire.province;
    const districtMatch = fire.district.match(/([^\s]+\s?(?:\uad70|\uc2dc|\uad6c))/i);
    const districtName = districtMatch ? districtMatch[0] : fire.district;
    return `${provinceName} ${districtName}`;
  }

  const locationParts = fire.location.split(" ");
  if (locationParts.length >= 2) {
    const province = locationParts[0];
    const district = locationParts[1];

    const provinceName = PROVINCE_ABBR[province] || province;
    return `${provinceName} ${district}`;
  }

  return fire.location;
}

/**
 * 툴팁 내용 생성
 */
function createTooltipContent(fire: ForestFireData): string {
  const status =
    fire.status === "active" ? "진행중" : fire.status === "contained" ? "통제중" : "진화완료";

  return `
    <div class="forest-fire-map__tooltip">
      <div class="forest-fire-map__tooltip-title">${fire.location || "알 수 없는 위치"}</div>
      <div class="forest-fire-map__tooltip-info">
        <span class="forest-fire-map__tooltip-label">상태:</span>
        <span class="forest-fire-map__tooltip-status--${fire.status}">${status}</span>
      </div>
      ${
        fire.responseLevelName
          ? `
      <div class="forest-fire-map__tooltip-info">
        <span class="forest-fire-map__tooltip-label">대응:</span>
        <span>${fire.responseLevelName}</span>
      </div>`
          : ""
      }
      <div class="forest-fire-map__tooltip-info">
        <span class="forest-fire-map__tooltip-label">발생일:</span> ${fire.date || "정보 없음"}
      </div>
      <div class="forest-fire-map__tooltip-info">
        <span class="forest-fire-map__tooltip-label">면적:</span> ${
          fire.affectedArea ? `${fire.affectedArea}ha` : "정보 없음"
        }
      </div>
      ${
        fire.extinguishPercentage
          ? `
      <div class="forest-fire-map__tooltip-info">
        <span class="forest-fire-map__tooltip-label">진화율:</span> ${fire.extinguishPercentage}%
      </div>`
          : ""
      }
      ${
        fire.description
          ? `
      <div class="forest-fire-map__tooltip-description">${fire.description}</div>`
          : ""
      }
    </div>
  `;
}

interface FireMarkerOptions {
  onClick?: (selectedFire: ForestFireData) => void;
  isSelected?: boolean;
  map?: Map;
}

/**
 * 산불 마커 생성 함수
 */
export async function createFireMarker(
  fire: ForestFireData,
  options?: boolean | FireMarkerOptions
): Promise<LayerGroup> {
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;

  let color = FIRE_MARKER_COLORS[fire.severity] || FIRE_MARKER_COLORS.initial;

  if (fire.responseLevelName) {
    if (fire.responseLevelName.includes("초기") || fire.responseLevelName.includes("초기진화")) {
      color = "#0080ff";
    } else {
      color = RESPONSE_LEVEL_COLORS[fire.responseLevelName] || color;
    }
  }

  let isSelected = false;
  if (typeof options === "boolean") {
    isSelected = options;
  } else if (options && "isSelected" in options) {
    isSelected = !!options.isSelected;
  }

  const radius = isSelected ? 10 * SELECTED_MARKER_SCALE : 10;

  const layerGroup = L.layerGroup();

  const isActive = fire.status === "active";

  const locationName = formatLocationName(fire);

  const iconHtml = `
    <div class="forest-fire-map__marker-wrapper">
      <div class="forest-fire-map__marker ${isActive ? "forest-fire-map__marker--active" : ""} ${
    isSelected ? "forest-fire-map__marker--selected" : ""
  } ${fire.status === "extinguished" ? "forest-fire-map__marker--extinguished" : ""}" style="
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background-color: ${color};
      "></div>
      <div class="forest-fire-map__marker-name">${locationName}</div>
    </div>
  `;

  const icon = L.divIcon({
    html: iconHtml,
    className: "forest-fire-map__marker-icon",
    iconSize: [radius * 2 + 4, radius * 2 + 20],
    iconAnchor: [radius + 2, radius + 2],
  });

  const marker = L.marker([fire.coordinates.lat, fire.coordinates.lng], {
    icon: icon,
    interactive: true,
    bubblingMouseEvents: false,
    zIndexOffset: isSelected ? 2000 : 1000,
  });

  const tooltipContent = createTooltipContent(fire);
  const tooltip = L.popup({
    closeButton: false,
    className: "forest-fire-map__tooltip-container",
    offset: [0, -5],
    autoPan: false,
    maxWidth: 280,
    minWidth: 200,
  }).setContent(tooltipContent);

  marker.on("mouseover", function (e) {
    tooltip.setLatLng(e.latlng).openOn(e.target._map);
  });

  marker.on("mouseout", function (e) {
    e.target._map.closePopup(tooltip);
  });

  if (options && typeof options === "object" && options.onClick) {
    marker.on("click", () => {
      if (options.onClick) {
        options.onClick(fire);
      }
    });
  }

  layerGroup.addLayer(marker);

  return layerGroup;
}
