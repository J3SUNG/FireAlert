import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map: L.Map | null = null;

// 산불 아이템 인터페이스
interface FireItem {
  location?: string;
  sigungu?: string;
  percentage?: string | number;
  issueName?: string;
  status?: string;
  [key: string]: unknown;
}

// 산불 정보 인터페이스
interface FireData {
  location: string;
  percentage: string | number;
  status: string;
  issueName: string;
}

export async function drawSimplestMap(containerId: string, items: FireItem[]) {
  // 이전 지도 제거
  if (map) {
    map.remove();
    map = null;
  }

  // 컨테이너 확인
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`지도 컨테이너(${containerId})가 없습니다.`);
    return;
  }

  try {
    console.log("지도 초기화 시작");
    
    // 지도 초기화
    map = L.map(containerId, {
      center: [36.5, 127.5], // 한국 중앙
      zoom: 7,
      zoomControl: true
    });
    
    // 배경 타일 추가 - OpenStreetMap (지도가 보이는지 확인하기 위해)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      opacity: 0.3 // 배경을 흐리게
    }).addTo(map);
    
    // 산불 데이터 매핑
    const dataMap = new Map<string, FireData>();
    
    // 산불 데이터 처리
    items.forEach(item => {
      if (item.sigungu) {
        dataMap.set(item.sigungu, {
          location: item.location || '',
          percentage: item.percentage || 0,
          status: item.status || '',
          issueName: item.issueName || ''
        });
        console.log(`데이터 매핑: ${item.sigungu} => ${item.issueName}`);
      }
    });
    
    // 데이터 개수 로깅
    console.log(`매핑된 데이터 수: ${dataMap.size}`);
    
    // 예시 위치에 마커 추가 (지도가 작동하는지 확인용)
    const testMarker = L.marker([36.5, 127.5]).addTo(map);
    testMarker.bindPopup("지도 테스트 마커").openPopup();
    
    console.log("기본 지도 초기화 완료");
    
    try {
      // GeoJSON 파일 로드 (간단한 방법으로)
      fetch('/korea_sigungu_utf8.geojson')
        .then(response => {
          console.log(`GeoJSON 응답: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            throw new Error(`GeoJSON 로드 실패: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("GeoJSON 로드 성공");
          console.log(`피처 수: ${data.features?.length || 0}`);
          
          // GeoJSON 레이어 추가
          L.geoJSON(data, {
            style: function() {
              // 기본 스타일
              return {
                color: '#000',
                weight: 1,
                fillColor: '#f8f8f8',
                fillOpacity: 0.4
              };
            }
          }).addTo(map!);
          
          console.log("GeoJSON 레이어 추가 완료");
        })
        .catch(error => {
          console.error("GeoJSON 로드 오류:", error);
          alert("지도 데이터를 불러오는 중 오류가 발생했습니다.");
        });
    } catch (geoError) {
      console.error("GeoJSON 처리 오류:", geoError);
    }
    
  } catch (error) {
    console.error("지도 초기화 오류:", error);
    alert("지도를 초기화하는 중 오류가 발생했습니다.");
  }
  
  return map;
}