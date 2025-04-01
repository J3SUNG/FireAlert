import L from "leaflet";
import { ForestFireData } from "../../../shared/types/forestFire";

// 시도명 축약 맵핑
const PROVINCE_ABBR: Record<string, string> = {
  "서울특별시": "서울",
  "부산특별시": "부산",
  "대구특별시": "대구",
  "인천특별시": "인천",
  "광주특별시": "광주",
  "대전특별시": "대전",
  "울산특별시": "울산",
  "세종특별자치시": "세종",
  "경기도": "경기",
  "강원도": "강원",
  "충청북도": "충북",
  "충청남도": "충남",
  "전라북도": "전북",
  "전라남도": "전남",
  "경상북도": "경북",
  "경상남도": "경남",
  "제주특별자치도": "제주"
};

// CSS 변수에 매핑되는 마커 색상 설정
const FIRE_MARKER_COLORS: Record<string, string> = {
  critical: "#ef4444", // 빨강색 (CSS 변수: --color-level3)
  high: "#f97316", // 주황색 (CSS 변수: --color-level2)
  medium: "#eab308", // 노랑색 (CSS 변수: --color-level1)
  low: "#0080ff", // 파란색 (CSS 변수: --color-initial)
  initial: "#6b7280", // 회색
};

// 대응단계별 색상 설정 - CSS 변수 값과 동일하게 유지
const RESPONSE_LEVEL_COLORS: Record<string, string> = {
  "초기대응": "#0080ff", // 파란색 (CSS 변수: --color-initial)
  "초기진화단계": "#0080ff", // 파란색
  "1단계": "#eab308", // 노랑색 (CSS 변수: --color-level1)
  "2단계": "#f97316", // 주황색 (CSS 변수: --color-level2)
  "3단계": "#ef4444", // 빨강색 (CSS 변수: --color-level3)
  "default": "#6b7280" // 기본 회색
};

const SELECTED_MARKER_SCALE = 1.4;

// 마커 이름 포맷팅 함수
function formatLocationName(fire: ForestFireData): string {
  if (!fire.location) return '알 수 없는 위치';
  
  // 시도와 시군구 정보가 있는 경우
  if (fire.province && fire.district) {
    const provinceName = PROVINCE_ABBR[fire.province] || fire.province;
    // 시군구에서 '시' 또는 '군' 부분만 추출
    const districtMatch = fire.district.match(/([^\s]+\s?(?:\uad70|\uc2dc|\uad6c))/i);
    const districtName = districtMatch ? districtMatch[0] : fire.district;
    return `${provinceName} ${districtName}`;
  }
  
  // fire.location에서 파싱 시도
  const locationParts = fire.location.split(' ');
  if (locationParts.length >= 2) {
    // 처음 두 부분이 시도와 시군구인 경우가 많음
    const province = locationParts[0];
    const district = locationParts[1];
    
    const provinceName = PROVINCE_ABBR[province] || province;
    return `${provinceName} ${district}`;
  }
  
  // 파싱할 수 없는 경우 원래 위치 반환
  return fire.location;
}

// 툴팁 내용 생성 함수
function createTooltipContent(fire: ForestFireData): string {
  const status = fire.status === 'active' ? '진행중' : 
                fire.status === 'contained' ? '통제중' : '진화완료';
  
  return `
    <div class="fire-popup">
      <div class="fire-popup__title">${fire.location || '알 수 없는 위치'}</div>
      <div class="fire-popup__info">
        <span class="fire-popup__label">상태:</span>
        <span class="fire-popup__status--${fire.status}">${status}</span>
      </div>
      ${fire.responseLevelName ? `
      <div class="fire-popup__info">
        <span class="fire-popup__label">대응:</span>
        <span>${fire.responseLevelName}</span>
      </div>` : ''}
      <div class="fire-popup__info">
        <span class="fire-popup__label">발생일:</span> ${fire.date || '정보 없음'}
      </div>
      <div class="fire-popup__info">
        <span class="fire-popup__label">면적:</span> ${fire.affectedArea ? `${fire.affectedArea}ha` : '정보 없음'}
      </div>
      ${fire.extinguishPercentage ? `
      <div class="fire-popup__info">
        <span class="fire-popup__label">진화율:</span> ${fire.extinguishPercentage}%
      </div>` : ''}
      ${fire.description ? `
      <div class="fire-popup__description">${fire.description}</div>` : ''}
    </div>
  `;
}

interface FireMarkerOptions {
  onClick?: (selectedFire: ForestFireData) => void;
  isSelected?: boolean;
  map?: L.Map;
}

export function createFireMarker(
  fire: ForestFireData,
  options?: boolean | FireMarkerOptions
): L.LayerGroup {
  // 대응단계에 따른 색상 설정
  let color = FIRE_MARKER_COLORS[fire.severity] || FIRE_MARKER_COLORS.initial;
  
  // 대응단계가 있으면 그에 따른 색상 우선 적용
  if (fire.responseLevelName) {
    // 해당 대응단계에 맞는 색상처리
    if (fire.responseLevelName.includes('초기') || fire.responseLevelName.includes('초기진화')) {
      color = "#0080ff"; // 초기대응/초기진화단계는 파란색으로 고정
    } else {
      color = RESPONSE_LEVEL_COLORS[fire.responseLevelName] || color;
    }
  }
  
  // 옵션 처리
  let isSelected = false;
  if (typeof options === 'boolean') {
    isSelected = options;
  } else if (options && 'isSelected' in options) {
    isSelected = !!options.isSelected;
  }
  
  const radius = isSelected ? 10 * SELECTED_MARKER_SCALE : 10;
  const weight = isSelected ? 3 : 2;
  
  const opacity = fire.status === "extinguished" ? 0.7 : 1;
  // fillOpacity - 사용되지 않는 변수이지만 추후 사용을 위해 남겨둡
  const _fillOpacity = fire.status === "extinguished" ? 0.4 : 0.6;
  
  // LayerGroup 생성
  const layerGroup = L.layerGroup();
  
  // 활성 화재 여부 확인 (active 상태면 펄스 애니메이션 적용)
  const isActive = fire.status === 'active';
  
  // 마커 이름 표시
  const locationName = formatLocationName(fire);
  const nameHtml = `<div class="marker-name">${locationName}</div>`;
  
  // 마커 아이콘 생성 (circleMarker 대신 divIcon 사용)
  const iconHtml = `
    <div class="marker-wrapper">
      <div class="custom-marker-container ${isActive ? 'active' : ''}" style="
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        background-color: ${color};
        border-width: ${weight}px;
        opacity: ${opacity};
      "></div>
      ${nameHtml}
    </div>
  `;
  
  const icon = L.divIcon({
    html: iconHtml,
    className: 'custom-fire-marker',
    iconSize: [radius * 2 + 4, radius * 2 + 20], // 높이를 늘려 이름 텍스트를 포함
    iconAnchor: [radius + 2, radius + 2]
  });
  
  // 마커 생성
  const marker = L.marker([fire.coordinates.lat, fire.coordinates.lng], {
    icon: icon,
    interactive: true,
    bubblingMouseEvents: false,
    zIndexOffset: isSelected ? 2000 : 1000
  });
  
  // 호버 시 상세 팝업 표시 - 이전 코드에서 사용하던 툴팁
  const popupContent = createTooltipContent(fire);
  const popup = L.popup({
    closeButton: false,
    className: 'fire-tooltip-hover',
    offset: [0, -5],
    autoPan: false,
    maxWidth: 220,
    minWidth: 200
  }).setContent(popupContent);
  
  // 마커 호버 이벤트 처리
  marker.on('mouseover', function(e) {
    // 팝업을 마커에 바인딩하지 않고 직접 특정 위치에 열기
    popup.setLatLng(e.latlng).openOn(e.target._map);
  });
  
  marker.on('mouseout', function(e) {
    e.target._map.closePopup(popup);
  });
  
  // 클릭 이벤트 처리
  if (options && typeof options === 'object' && options.onClick) {
    marker.on('click', () => {
      if (options.onClick) {
        options.onClick(fire);
      }
    });
  }
  
  // 레이어 그룹에 추가
  layerGroup.addLayer(marker);
  
  return layerGroup;
}