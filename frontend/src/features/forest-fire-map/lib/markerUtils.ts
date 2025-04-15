import type { Map, LayerGroup, Marker, DivIcon, PopupOptions, Popup } from "leaflet";

// 동적 로드를 위한 타입 정의
type LeafletModule = typeof import("leaflet");

// 캐싱된 리플렛 인스턴스
let LeafletInstance: LeafletModule | null = null;

// 리플렛 동적 로드 함수
async function loadLeaflet(): Promise<LeafletModule> {
  return import("leaflet");
}
import { ForestFireData } from "../../../shared/model/forestFire";

/**
 * 시도명 축약 맵핑
 * 지도에 표시되는 시도명을 간결하게 표시하기 위한 축약명
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
 * 산불 위험도에 따라 표시되는 마커 색상
 */
const FIRE_MARKER_COLORS: Record<string, string> = {
  critical: "#ef4444", // 빨강색 (3단계)
  high: "#f97316", // 주황색 (2단계)
  medium: "#eab308", // 노랑색 (1단계)
  low: "#0080ff", // 파란색 (초기대응)
  initial: "#6b7280", // 회색
};

/**
 * 대응단계별 색상 설정
 * 산불 대응단계에 따른 색상 매핑
 */
const RESPONSE_LEVEL_COLORS: Record<string, string> = {
  초기대응: "#0080ff", // 파란색
  초기진화단계: "#0080ff", // 파란색
  "1단계": "#eab308", // 노랑색
  "2단계": "#f97316", // 주황색
  "3단계": "#ef4444", // 빨강색
  default: "#6b7280", // 기본 회색
};

const SELECTED_MARKER_SCALE = 1.4;

/**
 * 마커 이름 포맷팅
 * 시도명 축약하고 불필요한 정보를 제거하여 간결한 위치 정보 반환
 *
 * @param fire 산불 데이터
 * @returns 포맷팅된 위치 이름
 */
function formatLocationName(fire: ForestFireData): string {
  if (!fire.location) return "알 수 없는 위치";

  // 시도와 시군구 정보가 있는 경우
  if (fire.province && fire.district) {
    const provinceName = PROVINCE_ABBR[fire.province] || fire.province;
    // 시군구에서 '시' 또는 '군' 부분만 추출
    const districtMatch = fire.district.match(/([^\s]+\s?(?:\uad70|\uc2dc|\uad6c))/i);
    const districtName = districtMatch ? districtMatch[0] : fire.district;
    return `${provinceName} ${districtName}`;
  }

  // location에서 파싱 시도
  const locationParts = fire.location.split(" ");
  if (locationParts.length >= 2) {
    const province = locationParts[0];
    const district = locationParts[1];

    const provinceName = PROVINCE_ABBR[province] || province;
    return `${provinceName} ${district}`;
  }

  // 파싱할 수 없는 경우 원래 위치 반환
  return fire.location;
}

/**
 * 툴팁 내용 생성
 * 마커 호버 시 표시되는 산불 상세 정보 툴팁 생성
 *
 * @param fire 산불 데이터
 * @returns HTML 형식의 툴팁 콘텐츠
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
 *
 * 산불 데이터로부터 지도에 표시할 마커를 생성합니다.
 * 위험도에 따른 색상 및 상태 정보를 적용합니다.
 *
 * @param fire 산불 데이터
 * @param options 마커 옵션 객체 또는 선택 상태 불리언
 * @returns 산불 마커 레이어 그룹
 */
export async function createFireMarker(
  fire: ForestFireData,
  options?: boolean | FireMarkerOptions
): Promise<LayerGroup> {
  // 동적으로 Leaflet 로드
  if (!LeafletInstance) {
    LeafletInstance = await loadLeaflet();
  }
  const L = LeafletInstance;
  // 대응단계에 따른 색상 설정
  let color = FIRE_MARKER_COLORS[fire.severity] || FIRE_MARKER_COLORS.initial;

  // 대응단계명이 있으면 해당 색상 적용
  // 대응단계명이 있으면 해당 색상 적용
  if (fire.responseLevelName) {
    if (fire.responseLevelName.includes("초기") || fire.responseLevelName.includes("초기진화")) {
      color = "#0080ff"; // 초기대응은 파란색
    } else {
      color = RESPONSE_LEVEL_COLORS[fire.responseLevelName] || color;
    }
  }

  // 옵션 처리
  let isSelected = false;
  if (typeof options === "boolean") {
    isSelected = options;
  } else if (options && "isSelected" in options) {
    isSelected = !!options.isSelected;
  }

  // 마커 크기와 스타일 계산
  const radius = isSelected ? 10 * SELECTED_MARKER_SCALE : 10;

  // LayerGroup 생성
  const layerGroup = L.layerGroup();

  // 활성 화재 여부 확인 (진행중이면 펄스 애니메이션 적용)
  const isActive = fire.status === "active";

  // 마커 이름 표시
  const locationName = formatLocationName(fire);

  // 마커 아이콘 생성
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
    iconSize: [radius * 2 + 4, radius * 2 + 20], // 높이를 늘려 이름 텍스트 포함
    iconAnchor: [radius + 2, radius + 2],
  });

  // 마커 생성
  const marker = L.marker([fire.coordinates.lat, fire.coordinates.lng], {
    icon: icon,
    interactive: true,
    bubblingMouseEvents: false,
    zIndexOffset: isSelected ? 2000 : 1000,
  });

  // 호버 시 툴팁 표시
  const tooltipContent = createTooltipContent(fire);
  const tooltip = L.popup({
    closeButton: false,
    className: "forest-fire-map__tooltip-container",
    offset: [0, -5],
    autoPan: false,
    maxWidth: 280,
    minWidth: 200,
  }).setContent(tooltipContent);

  // 마커 호버 이벤트 처리
  marker.on("mouseover", function (e) {
    tooltip.setLatLng(e.latlng).openOn(e.target._map);
  });

  marker.on("mouseout", function (e) {
    e.target._map.closePopup(tooltip);
  });

  // 클릭 이벤트 처리
  if (options && typeof options === "object" && options.onClick) {
    marker.on("click", () => {
      if (options.onClick) {
        options.onClick(fire);
      }
    });
  }

  // 레이어 그룹에 마커 추가
  layerGroup.addLayer(marker);

  return layerGroup;
}
