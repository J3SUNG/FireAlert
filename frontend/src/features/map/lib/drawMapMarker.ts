import type { Map, Layer } from "leaflet";

// 지역 데이터 인터페이스
interface RegionData {
  issueName?: string;
  percentage?: number;
  status?: string;
  location?: string;
}

// 지도 피처 인터페이스
interface MapFeature extends Layer {
  getBounds?: () => { getCenter: () => { lat: number; lng: number } };
  geometry?: {
    coordinates?: number[][][];
  };
}

// 마커 생성 함수 - 큰 텍스트 버전
export function createMarker(
  L: typeof import("leaflet"), 
  mapInstance: Map, 
  feature: MapFeature, 
  data: RegionData, 
  formattedName: string, 
  levelClass: string, 
  percentClass: string
) {
  // HTML 컨테이너 생성
  const divElement = document.createElement('div');
  divElement.className = 'region-marker';
  divElement.innerHTML = `
    <div class="region-name">${formattedName}</div>
    <div class="region-status ${levelClass}">${data.issueName || '미정보'}</div>
    <div class="region-status ${percentClass}">복구율: ${data.percentage || 0}%</div>
  `;
  
  // 커스텀 마커 생성 - 크기 증가
  const customIcon = L.divIcon({
    html: divElement,
    className: 'region-label',
    iconSize: [180, 90],  // 크기 증가
    iconAnchor: [90, 45]  // 앵커 포인트 조정
  });
  
  // 지역 중심 좌표 계산
  let lat, lng;
  
  if (feature.getBounds) {
    // 실제 GeoJSON에서는 layer에 getBounds가 있음
    const bounds = feature.getBounds();
    const center = bounds.getCenter();
    lat = center.lat;
    lng = center.lng;
  } else if (feature.geometry && feature.geometry.coordinates) {
    // 간소화된 GeoJSON에서는 좌표를 직접 사용
    lat = feature.geometry.coordinates[0][0][1];
    lng = feature.geometry.coordinates[0][0][0];
  } else {
    // 기본값
    lat = 36.5;
    lng = 127.5;
  }
  
  // 마커 추가
  const marker = L.marker([lat, lng], {
    icon: customIcon,
    interactive: true,
    bubblingMouseEvents: false
  }).addTo(mapInstance);
  
  // 툴팁 추가 - 클릭시에만 표시되도록 설정
  const tooltipContent = `
    <b>${formattedName}</b><br/>
    단계: ${data.issueName || '정보 없음'}<br/>
    복구율: ${data.percentage || 0}%<br/>
    상태: ${data.status || '정보 없음'}<br/>
    <small>클릭하면 자세한 정보가 표시됩니다.</small>
  `;
  
  // 툴팁은 클릭시에만 표시
  marker.bindTooltip(tooltipContent, {
    permanent: false,
    direction: "top",
    className: "region-tooltip"
  });
  
  // 클릭 이벤트 추가
  marker.on('click', () => {
    if (data) {
      const message = `
        <h3>${formattedName} 산불 정보</h3>
        <p>위치: ${data.location || "정보 없음"}</p>
        <p>복구율: ${data.percentage || 0}%</p>
        <p>초기대응단계: ${data.issueName || "정보 없음"}</p>
        <p>현재상태: ${data.status || "정보 없음"}</p>
      `;
      alert(message);
    }
  });
  
  return marker;
}