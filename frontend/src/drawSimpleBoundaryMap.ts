import L from "leaflet";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

// 산불 단계에 따른 위험도 색상 결정
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

// 간단한 행정구역 지도 그리기 함수
export async function drawSimpleBoundaryMap(containerId: string, items: any[]) {
  console.log("행정구역 지도 그리기 시작:", containerId);
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

  try {
    // 지도 인스턴스 생성
    mapInstance = L.map(containerId, {
      center: [36.5, 127.5], // 한국 중앙
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true // 캔버스 렌더링 사용 (성능 향상)
    });
    
    // 지도 컨트롤 위치 조정
    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);
    
    // 흰색 배경 추가
    mapInstance.whenReady(() => {
      const container = mapInstance!.getContainer();
      container.style.backgroundColor = "#ffffff";
    });
    
    // 데이터 매핑을 위한 객체 생성
    const dataByRegion = new Map<string, any>();
    
    // 지역명 기반으로 데이터 매핑
    items.forEach(item => {
      if (!item.location) return;
      
      const locationParts = item.location.split(' ');
      const mainLocation = locationParts[0]; // 시/도
      let sigName = item.sigungu || '';
      
      if (!sigName) {
        // 시/군/구 찾기
        for (let i = 1; i < locationParts.length; i++) {
          if (locationParts[i].endsWith('시') || 
              locationParts[i].endsWith('군') || 
              locationParts[i].endsWith('구')) {
            sigName = locationParts[i];
            break;
          }
        }
      }
      
      // 시군구 데이터 저장
      if (sigName) {
        dataByRegion.set(sigName, {
          percentage: parseInt(item.percentage) || 0,
          issueName: item.issueName || "",
          status: item.status || "",
          location: item.location || ""
        });
      }
      
      // 시도 데이터도 저장 (만약 시군구 데이터가 없을 경우를 대비)
      if (mainLocation) {
        if (!dataByRegion.has(mainLocation)) {
          dataByRegion.set(mainLocation, {
            percentage: parseInt(item.percentage) || 0,
            issueName: item.issueName || "",
            status: item.status || "",
            location: item.location || ""
          });
        }
      }
    });
    
    console.log("지역별 데이터 매핑:", Array.from(dataByRegion.entries()).map(([key, val]) => [key, val.issueName]));
    
    // 간소화된 GeoJSON 파일 로드
    try {
      const response = await fetch('/korea_simple.json');
      
      if (!response.ok) {
        throw new Error(`GeoJSON 로드 실패: ${response.status} ${response.statusText}`);
      }
      
      const geoJsonData = await response.json();
      console.log("간소화된 GeoJSON 로드 성공! 피처 개수:", geoJsonData.features?.length);
      
      // GeoJSON 레이어 추가
      const geoLayer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const name = feature?.properties?.name || '';
          const data = dataByRegion.get(name);
          
          let fillColor = "#eeeeee"; // 기본 색상
          let fillOpacity = 0.4; // 기본 투명도
          
          if (data) {
            // 산불 단계에 따른 색상 적용
            fillColor = getDangerColor(data.issueName);
            fillOpacity = 0.7; // 데이터가 있는 지역은 더 진하게
            console.log(`지역 [${name}] 색상 계산: ${data.issueName} => ${fillColor}`);
          }

          return {
            color: "#000000",
            weight: 1.5,
            fillColor,
            fillOpacity,
            opacity: 1
          };
        },
        onEachFeature: (feature, layer) => {
          const name = feature?.properties?.name || '';
          const data = dataByRegion.get(name);
          
          // 툴팁 컨텐츠 구성
          let tooltipContent = name || "지역";
          
          if (data) {
            // 진행 상태에 따른 스타일 설정
            const completed = isCompletedStatus(data.status, parseInt(data.percentage) || 0);
            const percentWording = completed ? "진행률: 100% (완료)" : `진행률: ${data.percentage || 0}%`;
            
            // 툴팁 내용
            tooltipContent = `
              <div style="text-align:center;font-weight:bold;margin-bottom:4px">${name}</div>
              <div>단계: ${data.issueName || '정보 없음'}</div>
              <div>${percentWording}</div>
              <div>상태: ${data.status || '정보 없음'}</div>
            `;
            
            // 팝업 내용
            const popupContent = `
              <div style="min-width:200px">
                <h3 style="text-align:center;margin:4px 0;border-bottom:1px solid #eee;padding-bottom:4px">${data.location}</h3>
                <div style="margin:4px 0">단계: <b>${data.issueName || '정보 없음'}</b></div>
                <div style="margin:4px 0">진행률: <b>${data.percentage || 0}%</b></div>
                <div style="margin:4px 0">상태: <b>${data.status || '정보 없음'}</b></div>
              </div>
            `;
            
            // 팝업 설정
            layer.bindPopup(popupContent);
          }
          
          // 모든 지역에 툴팁 추가
          layer.bindTooltip(tooltipContent, {
            permanent: false,
            direction: "center",
            className: "region-tooltip"
          });
          
          // 마우스 이벤트
          layer.on('mouseover', function() {
            this.setStyle({
              weight: 3,
              fillOpacity: 0.8
            });
          });
          
          layer.on('mouseout', function() {
            geoLayer.resetStyle(this);
          });
        }
      });

      // GeoJSON 레이어를 지도에 추가
      geoLayer.addTo(mapInstance);
      
      // 지도 영역을 데이터에 맞게 설정
      mapInstance.fitBounds([[33, 125], [38.6, 130]]);
      
      console.log("지도 그리기 완료!");
      
    } catch (geoJsonError) {
      console.error("GeoJSON 처리 오류:", geoJsonError);
      alert("지도 데이터를 처리하는 중 오류가 발생했습니다.");
    }
  } catch (mapError) {
    console.error("지도 초기화 오류:", mapError);
    alert("지도를 초기화하는 중 오류가 발생했습니다.");
  }
}
