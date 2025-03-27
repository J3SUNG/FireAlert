import L from "leaflet";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

// 산불 단계에 따른 색상 결정
const getDangerColor = (issueName: string) => {
  if (!issueName) return "#eeeeee";
  
  if (issueName.includes("3") || issueName.includes("세")) {
    return "#ff4d4d"; // 3단계 - 적색(고위험)
  } else if (issueName.includes("2") || issueName.includes("이")) {
    return "#ffa500"; // 2단계 - 주황색(중위험)
  } else if (issueName.includes("1") || issueName.includes("일")) {
    return "#ffff66"; // 1단계 - 황색(주의)
  } else if (issueName.includes("초기") || issueName.includes("대응")) {
    return "#cce5ff"; // 초기대응 - 하늘색
  } else {
    return "#eeeeee"; // 기본 - 회색
  }
};

// 완료 상태인지 확인
const isCompletedStatus = (status: string, percentage: number): boolean => {
  if (!status) return false;
  return status.includes("진화완료") || percentage === 100;
};

// 지도 그리기 함수
export function drawSimpleMap(containerId: string, items: any[]) {
  console.log("간단한 지도 그리기 시작:", containerId);
  console.log("전달받은 데이터 개수:", items.length);
  
  // 이전 지도 인스턴스 제거
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // 컨테이너 확인 및 스타일 설정
  const mapEl = document.getElementById(containerId);
  if (!mapEl) {
    console.error("지도 컨테이너를 찾을 수 없습니다:", containerId);
    return;
  }

  // 지도 인스턴스 생성
  mapInstance = L.map(containerId, {
    center: [36.5, 127.5], // 한국 중앙
    zoom: 7,
    zoomControl: true,
    attributionControl: false
  });
  
  // 지도 컨트롤 위치 조정
  L.control.zoom({
    position: 'topright'
  }).addTo(mapInstance);
  
  // 흰색 배경 추가
  L.rectangle([[30, 120], [45, 135]], {
    color: "#fff",
    weight: 0,
    fillColor: "#fff",
    fillOpacity: 1
  }).addTo(mapInstance);
  
  // 한국 외곽선 추가
  L.rectangle([[33, 125], [38.5, 131]], {
    color: "#000",
    weight: 2,
    fillColor: "#f8f8f8",
    fillOpacity: 0.1
  }).addTo(mapInstance);
  
  // 주요 지역 표시 (배경 맥락)
  const majorRegions = [
    { name: "서울/경기", coords: [37.5, 127.0], radius: 0.8 },
    { name: "강원도", coords: [37.8, 128.2], radius: 0.9 },
    { name: "충청도", coords: [36.6, 127.2], radius: 0.8 },
    { name: "전라도", coords: [35.3, 127.0], radius: 0.8 },
    { name: "경상도", coords: [35.8, 128.6], radius: 0.9 },
    { name: "제주도", coords: [33.4, 126.5], radius: 0.4 }
  ];
  
  majorRegions.forEach(region => {
    // 각 지역을 원으로 표시
    L.circle(region.coords, {
      color: "#aaa",
      weight: 1,
      fillColor: "#f8f8f8",
      fillOpacity: 0.2,
      radius: region.radius * 100000 // 반경(km)
    }).bindTooltip(region.name, {
      permanent: false,
      direction: "center"
    }).addTo(mapInstance);
    
    // 지역 이름 텍스트
    L.marker(region.coords, {
      icon: L.divIcon({
        className: 'region-name-label',
        html: `<div style="color:#777;font-size:12px;font-weight:bold;text-shadow:1px 1px 1px #fff">${region.name}</div>`,
        iconSize: [100, 20],
        iconAnchor: [50, 10]
      })
    }).addTo(mapInstance);
  });
  
  // 산불 발생 지역 데이터 처리
  items.forEach(item => {
    if (!item.location) return;
    
    // 위치 문자열 분석
    const locationParts = item.location.split(' ');
    const mainLocation = locationParts[0]; // 첫 번째 부분 (시/도)
    let subLocation = '';
    
    // 시/군/구 찾기
    for (let i = 1; i < locationParts.length; i++) {
      if (locationParts[i].endsWith('시') || 
          locationParts[i].endsWith('군') || 
          locationParts[i].endsWith('구')) {
        subLocation = locationParts[i];
        break;
      }
    }
    
    if (!subLocation && locationParts.length > 1) {
      subLocation = locationParts[1];
    }
    
    // 위치 좌표 지정 (실제로는 지오코딩이나 좌표 DB가 필요하지만 여기서는 간단한 매핑 사용)
    let coords = getApproximateCoords(mainLocation, subLocation);
    
    if (!coords) {
      console.warn(`좌표를 찾을 수 없음: ${item.location}`);
      return;
    }
    
    // 산불 정보 박스 스타일 설정
    const isCompleted = isCompletedStatus(item.status, parseInt(item.percentage) || 0);
    const fillColor = isCompleted ? "#4CAF50" : getDangerColor(item.issueName);
    const statusText = isCompleted ? "완료" : (item.status || "진행 중");
    
    // 산불 지역 표시 (원)
    const circle = L.circle(coords, {
      color: "#000",
      weight: 2,
      fillColor: fillColor,
      fillOpacity: 0.7,
      radius: 30000 // 30km
    }).addTo(mapInstance);
    
    // 산불 정보 박스 생성
    const infoBoxContent = `
      <div style="padding:5px;background:white;border-radius:4px;box-shadow:0 2px 5px rgba(0,0,0,0.2);min-width:150px;border:1px solid #ddd">
        <div style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:3px;margin-bottom:3px">${mainLocation} ${subLocation}</div>
        <div>${item.issueName || "정보 없음"}</div>
        <div>진행률: ${item.percentage || 0}%</div>
        <div>상태: ${statusText}</div>
      </div>
    `;
    
    // 팝업 추가
    circle.bindPopup(infoBoxContent);
    
    // 라벨 추가
    const label = L.divIcon({
      className: 'fire-location-label',
      html: `<div style="font-weight:bold;background:rgba(255,255,255,0.8);padding:2px 4px;border-radius:2px;border:1px solid #ccc">${subLocation}</div>`,
      iconSize: [80, 20],
      iconAnchor: [40, 20]
    });
    
    L.marker(coords, { icon: label }).addTo(mapInstance);
  });
  
  // 지도 영역을 한국 전체로 설정
  mapInstance.fitBounds([[33, 125], [38.5, 131]]);
}

// 지역명에 따른 대략적인 좌표 매핑 (실제로는 더 정확한 데이터베이스나 지오코딩 서비스 사용 필요)
function getApproximateCoords(mainLocation: string, subLocation: string): [number, number] | null {
  // 주요 지역별 대략적인 좌표 (실제 프로젝트에서는 더 정확한 데이터 사용)
  const mainLocationCoords: Record<string, [number, number]> = {
    "서울특별시": [37.5665, 126.9780],
    "경기도": [37.4138, 127.5183],
    "강원도": [37.8228, 128.1555],
    "충청북도": [36.8, 127.7],
    "충청남도": [36.5, 126.8],
    "전라북도": [35.8, 127.1],
    "전라남도": [34.9, 126.9],
    "경상북도": [36.4, 128.9],
    "경상남도": [35.4, 128.2],
    "제주특별자치도": [33.4, 126.5],
    "부산광역시": [35.1796, 129.0756],
    "대구광역시": [35.8714, 128.6014],
    "인천광역시": [37.4563, 126.7052],
    "광주광역시": [35.1595, 126.8526],
    "대전광역시": [36.3504, 127.3845],
    "울산광역시": [35.5384, 129.3114],
    "세종특별자치시": [36.5, 127.25]
  };
  
  // 주요 시/군/구에 대한 수동 추가 (산불 데이터에 맞게)
  const specificLocationCoords: Record<string, [number, number]> = {
    "산청군": [35.4, 127.9],
    "의성군": [36.35, 128.7],
    "울주군": [35.6, 129.2],
    "달성군": [35.8, 128.4],
    "무주군": [36.0, 127.7],
    "서산시": [36.8, 126.45],
    "칠곡군": [36.0, 128.4]
  };
  
  // 특정 시/군/구 좌표가 있으면 우선 사용
  if (specificLocationCoords[subLocation]) {
    return specificLocationCoords[subLocation];
  }
  
  // 특정 좌표가 없으면 광역시/도의 좌표에 약간의 오프셋 추가
  if (mainLocationCoords[mainLocation]) {
    const [lat, lng] = mainLocationCoords[mainLocation];
    // 같은 지역 내 서로 다른 위치에 랜덤 오프셋 적용
    const randomOffsetLat = (Math.random() - 0.5) * 0.3; // ±0.15도 (약 16km)
    const randomOffsetLng = (Math.random() - 0.5) * 0.3;
    return [lat + randomOffsetLat, lng + randomOffsetLng];
  }
  
  // 매칭되는 좌표 없음
  return null;
}
