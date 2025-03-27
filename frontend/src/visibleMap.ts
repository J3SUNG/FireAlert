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

export function drawVisibleMap(containerId: string, items: any[]) {
  console.log("새로운 지도 그리기 시작...");
  
  // 이전 지도 인스턴스 제거
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // 컨테이너 엘리먼트 확인
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`지도 컨테이너(${containerId})를 찾을 수 없습니다.`);
    return;
  }

  // 컨테이너 크기 확인
  console.log(`컨테이너 크기: ${container.clientWidth}x${container.clientHeight}`);
  
  try {
    // 지도 인스턴스 생성
    mapInstance = L.map(containerId, {
      center: [36.5, 127.5], // 한국 중앙
      zoom: 7,
      zoomControl: true
    });
    
    console.log("지도 인스턴스 생성 완료");
    
    // 기본 타일 레이어 추가 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      opacity: 0.2 // 배경 타일 흐리게 설정
    }).addTo(mapInstance);
    
    console.log("배경 타일 레이어 추가 완료");
    
    // 데이터 매핑
    const dataMap = new Map();
    items.forEach(item => {
      if (item.sigungu) {
        dataMap.set(item.sigungu, {
          location: item.location,
          percentage: parseInt(item.percentage) || 0,
          status: item.status,
          issueName: item.issueName
        });
      }
    });
    
    console.log(`매핑된 데이터 수: ${dataMap.size}`);
    
    // 테스트 레이어 추가 (확인용)
    const testLayer = L.layerGroup().addTo(mapInstance);
    
    // 테스트 마커 추가
    L.marker([36.5, 127.5], {
      icon: L.divIcon({
        html: '<div style="background: red; width: 10px; height: 10px; border-radius: 50%;"></div>',
        className: 'test-marker',
        iconSize: [10, 10]
      })
    }).addTo(testLayer).bindPopup("한국 중심점");
    
    // 간단한 행정구역 경계선 (시도 단위) - 지도가 보이는지 확인용
    const testRegions = [
      {name: "서울", coords: [[37.7, 126.9], [37.7, 127.1], [37.4, 127.1], [37.4, 126.9]]},
      {name: "부산", coords: [[35.3, 128.8], [35.3, 129.3], [34.9, 129.3], [34.9, 128.8]]},
      {name: "대구", coords: [[36.0, 128.4], [36.0, 128.8], [35.7, 128.8], [35.7, 128.4]]},
      {name: "경기도", coords: [[38.3, 126.3], [38.3, 127.8], [36.9, 127.8], [36.9, 126.3]]}
    ];
    
    testRegions.forEach(region => {
      L.polygon(region.coords, {
        color: '#3388ff',
        weight: 3,
        fillOpacity: 0.2
      }).addTo(testLayer).bindTooltip(region.name);
    });
    
    console.log("테스트 레이어 추가 완료");
    
    // 진짜 GeoJSON 파일 로드
    console.log("GeoJSON 파일 로드 시도...");
    
    fetch('/korea-simplified.geojson')
      .then(response => {
        console.log(`GeoJSON 파일 응답: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log(`GeoJSON 파싱 완료: ${data.features.length}개 피처`);
        
        // GeoJSON 레이어 생성
        const geoLayer = L.geoJSON(data, {
          style: (feature) => {
            const name = feature?.properties?.SIG_KOR_NM || '';
            const data = dataMap.get(name);
            
            // 기본 스타일
            return {
              color: '#000',
              weight: 2,
              fillColor: data ? getDangerColor(data.issueName) : '#f0f0f0',
              fillOpacity: data ? 0.7 : 0.2,
              opacity: 1
            };
          },
          onEachFeature: (feature, layer) => {
            if (!feature.properties) return;
            
            const name = feature.properties.SIG_KOR_NM || '';
            const data = dataMap.get(name);
            
            // 툴팁 추가
            let tooltipContent = name;
            if (data) {
              tooltipContent = `
                <b>${name}</b><br>
                ${data.issueName || '정보 없음'}<br>
                진행률: ${data.percentage}%<br>
                상태: ${data.status || '정보 없음'}
              `;
            }
            
            layer.bindTooltip(tooltipContent);
            
            // 마우스 이벤트
            layer.on({
              mouseover: function() {
                this.setStyle({
                  weight: 3,
                  fillOpacity: 0.9
                });
                this.bringToFront();
              },
              mouseout: function() {
                geoLayer.resetStyle(this);
              }
            });
          }
        });
        
        // GeoJSON 레이어 추가
        geoLayer.addTo(mapInstance!);
        console.log("GeoJSON 레이어 추가 완료");
        
        // 지도 영역 조정
        try {
          mapInstance!.fitBounds(geoLayer.getBounds());
          console.log("지도 영역 조정 완료");
        } catch (e) {
          console.warn("지도 영역 조정 실패:", e);
        }
      })
      .catch(error => {
        console.error("GeoJSON 처리 오류:", error);
        alert("지도 데이터를 불러오는 중 오류가 발생했습니다.");
      });
      
    // 대체 방법으로 간단한 korea_sigungu_utf8.geojson 로드 시도
    setTimeout(() => {
      try {
        fetch('/korea_sigungu_utf8.geojson')
          .then(response => response.json())
          .then(data => {
            console.log(`실제 시군구 GeoJSON 로드 완료: ${data.features.length}개 피처`);
            
            // 모든 피처를 그리지 않고 매핑된 데이터가 있는 시군구만 표시
            const filteredFeatures = {
              type: "FeatureCollection",
              features: data.features.filter(feature => {
                const name = feature?.properties?.SIG_KOR_NM;
                return dataMap.has(name);
              })
            };
            
            console.log(`필터링된 피처: ${filteredFeatures.features.length}개`);
            
            if (filteredFeatures.features.length > 0) {
              // 매핑된 데이터만 표시
              L.geoJSON(filteredFeatures, {
                style: (feature) => {
                  const name = feature?.properties?.SIG_KOR_NM || '';
                  const data = dataMap.get(name);
                  
                  return {
                    color: '#ff0000', // 빨간색 경계선
                    weight: 3,
                    fillColor: data ? getDangerColor(data.issueName) : '#f0f0f0',
                    fillOpacity: 0.8,
                    opacity: 1
                  };
                },
                onEachFeature: (feature, layer) => {
                  const name = feature?.properties?.SIG_KOR_NM || '';
                  layer.bindTooltip(`<b>${name}</b>`);
                }
              }).addTo(mapInstance!);
              
              console.log("필터링된 GeoJSON 레이어 추가 완료");
            }
          })
          .catch(e => console.warn("실제 시군구 GeoJSON 로드 실패:", e));
      } catch (e) {
        console.warn("실제 시군구 GeoJSON 로드 시도 오류:", e);
      }
    }, 2000);
  } catch (error) {
    console.error("지도 초기화 오류:", error);
    alert("지도를 초기화하는 중 오류가 발생했습니다.");
  }
  
  return mapInstance;
}
