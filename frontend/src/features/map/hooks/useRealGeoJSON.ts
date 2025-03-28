import L from "leaflet";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

// 지역 데이터 인터페이스 정의
interface RegionData {
  percentage: number;
  issueName: string;
  status: string;
  location: string;
}

// 바이너리 문자열인 경우 한글로 디코딩 (예: b'\xc7\xd5\xc3\xb5\xb1\xba')
const decodeIfByteStr = (value: string | unknown): string | unknown => {
  if (typeof value === "string" && value.startsWith("b'")) {
    try {
      const byteStr = value
        .slice(2, -1)
        .split("\\x")
        .filter(Boolean)
        .map((hex) => parseInt(hex, 16));
      return new TextDecoder("euc-kr").decode(new Uint8Array(byteStr));
    } catch {
      return value;
    }
  }
  return value;
};

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

// 한국 전체 지도 여백 설정
const koreaExtent = {
  minLng: 125.0,
  maxLng: 131.0,
  minLat: 33.0,
  maxLat: 38.5
};

// 산불 아이템 인터페이스 정의
interface FireItem {
  location?: string;
  sigungu?: string;
  percentage?: string | number;
  issueName?: string;
  status?: string;
  [key: string]: unknown;
}

// 지도 그리기 함수
export async function useRealGeoJSON(containerId: string, items: FireItem[]) {
  console.log("korea_sigungu_utf8.geojson 파일을 사용한 지도 그리기 시작");
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
    // 데이터 매핑을 위한 객체 생성
    const regionDataMap = new Map<string, RegionData>();
    
    // 지역명 기반으로 데이터 매핑
    items.forEach(item => {
      if (!item.location) return;
      
      const locationParts = item.location.split(' ');
      // const mainLocation = locationParts[0]; // 시/도 - 사용하지 않는 변수 제거
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
        regionDataMap.set(sigName, {
          percentage: parseInt(String(item.percentage)) || 0,
          issueName: item.issueName || "",
          status: item.status || "",
          location: item.location || ""
        });
        
        console.log("매핑 상세:", sigName, "=>", JSON.stringify({
          percentage: parseInt(String(item.percentage)) || 0,
          issueName: item.issueName || "",
          status: item.status || "",
          location: item.location || ""
        }));
      }
    });
    
    // 지도 인스턴스 생성
    mapInstance = L.map(containerId, {
      center: [36.5, 127.5], // 한국 중앙
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
      minZoom: 6,
      maxZoom: 10
    });
    
    // 지도 컨트롤 위치 조정
    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);
    
    // 흰색 배경 설정
    mapInstance.whenReady(() => {
      const container = mapInstance!.getContainer();
      container.style.backgroundColor = "#ffffff";
    });
    
    // korea_sigungu_utf8.geojson 파일 로드
    console.log("korea_sigungu_utf8.geojson 파일 로드 시도...");
    
    const geoJsonResponse = await fetch('/korea_sigungu_utf8.geojson');
    
    if (!geoJsonResponse.ok) {
      throw new Error(`GeoJSON 파일을 로드할 수 없습니다: ${geoJsonResponse.status} ${geoJsonResponse.statusText}`);
    }
    
    const geoJsonText = await geoJsonResponse.text();
    console.log(`GeoJSON 파일 로드 성공: ${geoJsonText.length} 바이트`);
    
    let geoJsonData;
    try {
      geoJsonData = JSON.parse(geoJsonText);
      console.log("GeoJSON 파싱 성공");
    } catch (error) {
      console.error("GeoJSON 파싱 오류:", error);
      throw new Error("GeoJSON 파일을 파싱할 수 없습니다");
    }
    
    if (!geoJsonData || !geoJsonData.features || !Array.isArray(geoJsonData.features)) {
      throw new Error("GeoJSON 데이터 형식이 잘못되었습니다");
    }
    
    console.log(`GeoJSON 피처 수: ${geoJsonData.features.length}`);
    
    // GeoJSON 레이어 생성
    const geoLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        let name = '';
        
        // SIG_KOR_NM 속성 확인
        if (feature?.properties?.SIG_KOR_NM) {
          const propValue = feature.properties.SIG_KOR_NM;
          name = decodeIfByteStr(propValue) as string;
        }
        
        const data = regionDataMap.get(name);
        
        let fillColor = "#f0f0f0"; // 기본 배경색
        let fillOpacity = 0.2; // 기본 투명도
        
        if (data) {
          // 산불 단계에 따른 색상 적용
          fillColor = getDangerColor(data.issueName);
          fillOpacity = 0.7; // 데이터가 있는 지역은 더 진하게
          console.log(`지역 [${name}] 색상 계산: ${data.issueName} => ${fillColor}`);
        }

        return {
          color: "#000000", // 경계선 색상
          weight: 0.8, // 경계선 두께
          fillColor, // 채우기 색상
          fillOpacity, // 채우기 투명도
          opacity: 0.8 // 경계선 투명도
        };
      },
      onEachFeature: (feature, layer) => {
        let name = '';
        
        // SIG_KOR_NM 속성 확인
        if (feature?.properties?.SIG_KOR_NM) {
          const propValue = feature.properties.SIG_KOR_NM;
          name = decodeIfByteStr(propValue) as string;
        }
        
        const data = regionDataMap.get(name);
        
        // 기본 툴팁 내용
        const tooltipContent = `<div style="text-align:center;font-weight:bold">${name}</div>`;
        
        if (data) {
          // 산불 데이터가 있는 경우 상세 정보 표시
          const completed = data.status && (data.status.includes("완료") || parseInt(String(data.percentage)) === 100);
          const statusText = completed ? "진화완료" : (data.status || "진행 중");
          
          // 툴팁 내용 업데이트
          const detailedTooltipContent = `
            <div style="text-align:center;font-weight:bold;margin-bottom:4px">${name}</div>
            <div>단계: ${data.issueName || '정보 없음'}</div>
            <div>진행률: ${data.percentage || 0}%</div>
            <div>상태: ${statusText}</div>
          `;
          
          // 팝업 내용
          const popupContent = `
            <div style="min-width:200px">
              <h3 style="text-align:center;margin:4px 0;border-bottom:1px solid #eee;padding-bottom:4px">${data.location}</h3>
              <div style="margin:4px 0">단계: <b>${data.issueName || '정보 없음'}</b></div>
              <div style="margin:4px 0">진행률: <b>${data.percentage || 0}%</b></div>
              <div style="margin:4px 0">상태: <b>${statusText}</b></div>
            </div>
          `;
          
          // 팝업 설정
          layer.bindPopup(popupContent);
          
          // 툴팁 설정
          layer.bindTooltip(detailedTooltipContent, {
            permanent: false,
            direction: "center",
            className: "region-tooltip"
          });
        } else {
          // 데이터가 없는 지역은 기본 툴팁만 추가
          layer.bindTooltip(tooltipContent, {
            permanent: false,
            direction: "center",
            className: "region-tooltip"
          });
        }
        
        // 마우스 이벤트
        layer.on('mouseover', function() {
          this.setStyle({ weight: 1.8, fillOpacity: 0.9 });
          this.bringToFront();
        });
        
        layer.on('mouseout', function() {
          geoLayer.resetStyle(this);
        });
      }
    });

    // GeoJSON 레이어를 지도에 추가
    geoLayer.addTo(mapInstance);
    
    // 지도 영역을 한국 전체로 설정
    mapInstance.fitBounds([
      [koreaExtent.minLat, koreaExtent.minLng],
      [koreaExtent.maxLat, koreaExtent.maxLng]
    ]);
    
    console.log("지도 그리기 완료!");
    
  } catch (error) {
    console.error("지도 초기화 오류:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    alert(`지도를 초기화하는 중 오류가 발생했습니다: ${errorMessage}`);
  }
}