import L from 'leaflet';
import { ForestFireData } from '../../../shared/types/forestFire';
import { MARKER_SIZES, SEVERITY_TEXT, STATUS_TEXT } from '../constants/mapSettings';
import { formatLocationName } from '../../../shared/utils/locationFormat';
import { getExtinguishPercentageColor } from '../../../shared/utils/forestFireUtils';

interface CreateFireMarkerOptions {
  onClick?: (fire: ForestFireData) => void;
  isMarkerClickRef?: React.MutableRefObject<boolean>;
}

/**
 * 산불 마커를 생성하는 유틸리티 함수
 */
export function createFireMarker(
  fire: ForestFireData,
  options: CreateFireMarkerOptions = {}
): L.Marker {
  const { lat, lng } = fire.coordinates;
  
  // 마커 크기 설정
  const markerSize = MARKER_SIZES[fire.severity] || MARKER_SIZES.low;
  
  // 위치명 포맷팅
  const formattedLocation = formatLocationName(fire.location);
  
  // 마커 클래스명 설정
  const markerClassName = `fire-marker__container fire-marker__container--${fire.severity}`;
  const activeClass = fire.status === "active" ? " fire-marker__container--active" : "";
  
  // 마커 아이콘 생성
  const icon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="${markerClassName}${activeClass}"></div>
      <div class="fire-marker__location">${formattedLocation}</div>
    `,
    iconSize: [markerSize, markerSize + 20],
    iconAnchor: [markerSize / 2, markerSize / 2 + 10]
  });
  
  // 마커 생성
  const marker = L.marker([lat, lng], { icon });
  
  // 상태 및 심각도 텍스트
  const severityText = SEVERITY_TEXT[fire.severity] || "낮음";
  const statusText = STATUS_TEXT[fire.status] || "진행중";
  
  // CSS 클래스
  const statusClass = `fire-popup__status--${fire.status}`;
  const severityClass = `fire-popup__severity--${fire.severity}`;
  
  // 설명 내용
  let descriptionContent = "";
  if (typeof fire.description === "string" && fire.description.length > 0) {
    descriptionContent = `<p class="fire-popup__description">${fire.description}</p>`;
  }
  
  // 진화율 내용
  const extinguishContent =
    fire.status !== "extinguished"
      ? `<p class="fire-popup__info"><span class="fire-popup__label">진화율:</span> <span style="color: ${getExtinguishPercentageColor(
          fire.extinguishPercentage || "0"
        )}">${fire.extinguishPercentage || "0"}%</span></p>`
      : "";
  
  // 툴팁 내용
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
  
  // 클릭 이벤트 핸들러 등록
  if (options.onClick) {
    marker.on("click", (e) => {
      L.DomEvent.stopPropagation(e);
      options.onClick(fire);
    });
  }
  
  return marker;
}
