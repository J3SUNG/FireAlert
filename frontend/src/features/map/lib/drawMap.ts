import L from "leaflet";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

// 지역 데이터 인터페이스
interface RegionData {
  percentage: number;
  issueName: string;
  status: string;
  location: string;
}

// 산불 아이템 인터페이스
interface FireItem {
  sigungu?: string;
  location?: string;
  percentage?: string | number;
  issueName?: string;
  status?: string;
  [key: string]: unknown;
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

// 한국 전체 지도 여백 설정
const koreaExtent = {
  minLng: 125.0,
  maxLng: 131.0,
  minLat: 33.0,
  maxLat: 38.5
};

// 산불 단계에 따른 CSS 클래스 결정
const getLevelClass = (issueName: string) => {
  if (!issueName) return "";
  
  if (issueName.includes("3") || issueName.includes("세")) {
    return "level-3"; // 3단계
  } else if (issueName.includes("2") || issueName.includes("이")) {
    return "level-2"; // 2단계
  } else if (issueName.includes("1") || issueName.includes("일")) {
    return "level-1"; // 1단계
  } else if (issueName.includes("초기") || issueName.includes("대응")) {
    return "initial-response"; // 초기대응
  }
  return "";
};

// 진행률에 따른 CSS 클래스 결정
const getPercentClass = (percentage: number) => {
  if (percentage >= 70) {
    return "percent-high";
  } else if (percentage >= 40) {
    return "percent-medium";
  }
  return "percent-low";
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

// 완료 상태인지 확인
const isCompletedStatus = (status: string, percentage: number): boolean => {
  if (!status) return false;
  return status.includes("진화완료") || percentage === 100;
};

// 지역명 포맷팅 (시도-시군구)
const formatLocationName = (location: string): string => {
  if (!location) return "";
  
  const parts = location.split(" ");
  if (parts.length < 2) return location;
  
  // 첫 부분은 시도
  const sido = parts[0];
  
  // 두 번째 부분부터 시군구 찾기
  let sigungu = "";
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
      sigungu = parts[i];
      break;
    }
  }
  
  // 찾지 못했으면 두 번째 부분 사용
  if (!sigungu && parts.length > 1) {
    sigungu = parts[1];
  }
  
  return `${sido}-${sigungu}`;
};

// 지도 그리기 함수
export async function drawMap(containerId: string, items: FireItem[]) {
  console.log("지도 그리기 시작:", containerId);
  console.log("전달받은 데이터 개수:", items.length);
  
  // 디버깅용: 데이터 샘플 출력
  if (items.length > 0) {
    console.log("첫 번째 데이터 샘플:", JSON.stringify(items[0]));
    console.log("issueName 값 존재 여부:", items.some(item => item.issueName));
    console.log("status 값 존재 여부:", items.some(item => item.status));
    console.log("진행중 항목 개수:", items.filter(item => item.status && (item.status.includes("진화중") || item.status.includes("진행"))).length);
    
    // issueName 값 확인
    const issueNames = [...new Set(items.map(item => item.issueName))].filter(Boolean);
    console.log("발견된 issueName 값들:", issueNames);
    
    // status 값 확인
    const statuses = [...new Set(items.map(item => item.status))].filter(Boolean);
    console.log("발견된 status 값들:", statuses);
  }

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

  // 컨테이너 스타일 설정 - 부모 요소에서 제공하는 높이 사용
  mapEl.style.width = "100%";
  mapEl.style.backgroundColor = "#f0f0f0";
  mapEl.style.position = "relative";

  try {
    console.log("지도 객체 생성 시도...");
    
    // 지도 배경 설정 
    const baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      opacity: 0.03 // 매우 희미하게 표시
    });
    
    // 지도 인스턴스 생성
    mapInstance = L.map(containerId, {
      center: [36.5, 127.5],  // 한국 중앙
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
      layers: [baseMap],
      minZoom: 6,
      maxZoom: 12
    });
    
    // 지도 컨트롤 위치 조정
    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);

    // 📌 시군 단위 이름 → 데이터 매핑
    const regionDataMap = new Map<string, RegionData>();
    
    // 실제 데이터 매핑
    items.forEach((item) => {
      let sigName = item.sigungu || null;
      
      if (!sigName) {
        const parts = (item.location || "").split(" ");
        
        if (parts.length >= 3) {
          for (let i = 1; i < parts.length; i++) {
            if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
              sigName = parts[i];
              break;
            }
          }
          
          if (!sigName && parts.length > 2) {
            sigName = parts[2];
          }
        }
      }
      
      if (sigName) {
        // 모든 데이터를 저장
        regionDataMap.set(sigName, {
          percentage: parseInt(String(item.percentage)) || 0,
          issueName: item.issueName || "",
          status: item.status || "",
          location: item.location || ""
        });
        
        // 디버깅용 로그
        console.log("매핑 상세:", sigName, "=>", JSON.stringify({
          percentage: parseInt(String(item.percentage)) || 0,
          issueName: item.issueName || "",
          status: item.status || "",
          location: item.location || ""
        }));
      }
    });

    // 실제 GeoJSON 로드 시도
    try {
      console.log("실제 GeoJSON 파일 로드 시도...");
      
      // 전체 한국 시군구 GeoJSON 파일 불러오기 - Vite 프로젝트에서 public 접근시 절대 경로로 접근
      const response = await fetch('/korea_sigungu_utf8.geojson');
      
      if (!response.ok) {
        throw new Error(`GeoJSON 로드 실패: ${response.status} ${response.statusText}`);
      }
      
      // GeoJSON 파싱
      const geoJsonData = await response.json();
      console.log("GeoJSON 로드 성공! 피처 개수:", geoJsonData.features?.length);
      
      // 데이터 정보 로깅
      if (geoJsonData.features && geoJsonData.features.length > 0) {
        const firstFeature = geoJsonData.features[0];
        console.log("첫 번째 피처 샘플:", firstFeature.properties?.SIG_KOR_NM);
        console.log("좌표 샘플:", firstFeature.geometry?.coordinates ? "있음" : "없음");
      }
      
      // GeoJSON 레이어 추가
      const geoLayer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const name = typeof feature?.properties?.SIG_KOR_NM === 'string' 
            ? decodeIfByteStr(feature.properties.SIG_KOR_NM) as string
            : '';
          const data = regionDataMap.get(name);

          let fillColor = "#eeeeee"; // 기본 색상
          if (data) {
            // 산불 단계에 따른 색상 적용
            fillColor = getDangerColor(data.issueName);
            console.log(`지역 [${name}] 색상 계산: ${data.issueName} => ${fillColor}`);
          }

          return {
            color: "#000000",
            weight: 1.0,
            fillColor,
            fillOpacity: 0.7,
            opacity: 1
          };
        },
        onEachFeature: (feature, layer) => {
          const name = typeof feature?.properties?.SIG_KOR_NM === 'string'
            ? decodeIfByteStr(feature.properties.SIG_KOR_NM) as string
            : '';
          const data = regionDataMap.get(name);
          
          // 안전하게 status 확인
          const isInProgress = data && data.status && (
            data.status.includes("진화중") || 
            data.status.includes("진행")
          );
          
          if (isInProgress) {
            // 진화중인 경우에만 포맷팅된 이름 표시
            const formattedName = formatLocationName(data.location);
            
            // 산불 단계와 진행률을 포함한 컨텐츠 준비
            const levelClass = getLevelClass(data.issueName);
            const percentClass = getPercentClass(data.percentage);
            
            // 완료 여부 확인 (진화완료 또는 100%)
            const completed = isCompletedStatus(data.status, data.percentage);
            const completedClass = completed ? "completed" : "";
            const percentWording = completed 
              ? "진행률: 100% (완료)" 
              : `진행률: ${data.percentage || 0}%`;
            
            // HTML 컨테이너 생성
            const divElement = document.createElement('div');
            divElement.className = 'region-marker';
            divElement.innerHTML = `
              <div class="region-name">${formattedName}</div>
              <div class="region-status ${levelClass} ${completedClass}">${data.issueName || '미정보'}</div>
              <div class="region-status ${completed ? 'completed-text' : percentClass}">${percentWording}</div>
            `;
            
            // 지역 중심 좌표 계산 (폴리곤의 바운드 중앙)
            let centerPoint;
            try {
              // 레이어에서 중심 좌표 가져오기
              if ('getBounds' in layer) {
                const bounds = layer.getBounds();
                centerPoint = bounds.getCenter();
              } else {
                // 기본값
                centerPoint = [36.5, 127.5]; 
              }
            } catch (e) {
              console.warn("중심 좌표 계산 오류:", e);
              centerPoint = [36.5, 127.5];
            }
            
            // 커스텀 마커 생성
            const customIcon = L.divIcon({
              html: divElement,
              className: 'region-label',
              iconSize: [180, 90],
              iconAnchor: [90, 45]
            });
            
            // 마커 추가
            const marker = L.marker(centerPoint, {
              icon: customIcon,
              interactive: true,
              bubblingMouseEvents: false
            }).addTo(mapInstance!);
            
            // 툴팁 추가 - 클릭시에만 표시되도록 설정
            const tooltipContent = `
              <b>${formattedName}</b><br/>
              단계: ${data.issueName || '정보 없음'}<br/>
              진행률: ${data.percentage || 0}%<br/>
              상태: ${data.status || '정보 없음'}<br/>
              <small>클릭하면 자세한 정보가 표시됩니다.</small>
            `;
            
            // 툴팁은 클릭시에만 표시
            marker.bindTooltip(tooltipContent, {
              permanent: false,
              direction: "auto",
              className: "region-tooltip",
              offset: [0, -60]
            });
            
            // 클릭 이벤트 추가
            marker.on('click', () => {
              if (data) {
                const message = `
                  <h3>${formattedName} 산불 정보</h3>
                  <p>위치: ${data.location || "정보 없음"}</p>
                  <p>진행률: ${data.percentage || 0}%</p>
                  <p>초기대응단계: ${data.issueName || "정보 없음"}</p>
                  <p>현재상태: ${data.status || "정보 없음"}</p>
                `;
                alert(message);
              }
            });
            
            console.log(`진화중 지역 발견: ${name}, 포맷팅된 이름: ${formattedName}`);
          } else if (name) {
            // 일반 지역은 마우스오버 시에만 툴팁 표시
            layer.bindTooltip(name, {
              permanent: false,
              direction: "center"
            });
          }
        },
      });

      // GeoJSON 레이어를 지도에 추가
      geoLayer.addTo(mapInstance);
      
      // 지도 영역을 한국 전체로 설정
      mapInstance.fitBounds([
        [koreaExtent.minLat, koreaExtent.minLng],
        [koreaExtent.maxLat, koreaExtent.maxLng]
      ]);
      
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