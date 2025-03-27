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

// 시도별 색상 매핑
const getRegionColor = (name: string) => {
  const regionColors: Record<string, string> = {
    "서울특별시": "#ff9e9e",
    "부산광역시": "#ffbb9e",
    "대구광역시": "#ffe09e",
    "인천광역시": "#fffb9e",
    "광주광역시": "#c6ff9e",
    "대전광역시": "#9effed",
    "울산광역시": "#9eb0ff",
    "세종특별자치시": "#dc9eff",
    "경기도": "#ff9ed4",
    "강원도": "#ffda9e",
    "충청북도": "#cbff9e",
    "충청남도": "#9effcb",
    "전라북도": "#9effe3",
    "전라남도": "#9ed6ff",
    "경상북도": "#c19eff",
    "경상남도": "#ff9ec1",
    "제주특별자치도": "#ffa9a9"
  };
  
  // 시도명 추출 (예: "경기도 수원시" -> "경기도")
  const sido = name.split(" ")[0];
  
  return regionColors[sido] || "#f0f0f0";
};

// 행정구역 경계선 스타일 계산
const getRegionStyle = (feature: any, dataMap: Map<string, any>) => {
  const name = feature?.properties?.SIG_KOR_NM || '';
  const data = dataMap.get(name);
  
  // 시도명 추출 (첫 번째 공백 전까지)
  const sidoName = name.split(' ')[0];
  
  // 기본 스타일
  return {
    color: data ? "#000000" : "#666666", // 데이터가 있는 지역은 더 진한 경계선
    weight: data ? 2.5 : 1.2, // 데이터가 있는 지역은 더 두꺼운 경계선
    fillColor: data ? getDangerColor(data.issueName) : getRegionColor(name),
    fillOpacity: data ? 0.7 : 0.2, // 데이터가 있는 지역은 더 진한 채우기
    opacity: 1,
    dashArray: data ? '' : '3' // 데이터가 없는 지역은 점선 경계
  };
};

export function drawEnhancedMap(containerId: string, items: any[]) {
  console.log("향상된 지도 그리기 시작...");
  
  // 이전 지도 인스턴스 제거
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // 컨테이너 확인
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`지도 컨테이너(${containerId})를 찾을 수 없습니다.`);
    return;
  }
  
  // 지도 크기 조정 (전체 화면에 맞게)
  const mapHeight = window.innerHeight - 250; // 헤더와 요약 정보 영역 높이 고려
  container.style.height = `${Math.max(mapHeight, 500)}px`;
  container.style.width = "100%";
  
  console.log(`지도 컨테이너 크기 설정: ${container.style.width}x${container.style.height}`);
  
  try {
    // 지도 인스턴스 생성
    mapInstance = L.map(containerId, {
      center: [36.5, 127.5], // 한국 중앙
      zoom: 7,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 10
    });
    
    console.log("지도 인스턴스 생성 완료");
    
    // 시도별 데이터 매핑
    const regionDataMap = new Map<string, any>();
    
    // 산불 데이터 매핑
    items.forEach(item => {
      if (item.sigungu) {
        regionDataMap.set(item.sigungu, {
          location: item.location,
          percentage: parseInt(item.percentage) || 0,
          status: item.status,
          issueName: item.issueName
        });
        console.log(`데이터 매핑: ${item.sigungu} => ${item.issueName}`);
      }
    });
    
    console.log(`매핑된 데이터 수: ${regionDataMap.size}`);
    
    // 시·군·구 구역 구별을 위한 스타일 관련 함수
    const highlightFeature = (e: any) => {
      const layer = e.target;
      
      layer.setStyle({
        weight: 4,
        color: '#333',
        fillOpacity: 0.8
      });
      
      layer.bringToFront();
    };
    
    const resetHighlight = (e: any, geoJsonLayer: L.GeoJSON) => {
      geoJsonLayer.resetStyle(e.target);
    };
    
    // GeoJSON 파일 로드 및 표시
    fetch('/korea-simplified.geojson')
      .then(response => response.json())
      .then(data => {
        console.log(`GeoJSON 로드 완료: ${data.features.length}개 피처`);
        
        // 시도 레벨 필터링
        const sidoFeatures = data.features.filter((feature: any) => {
          const name = feature?.properties?.SIG_KOR_NM || '';
          return name.endsWith('도') || name.endsWith('시') || name.endsWith('광역시') || name.endsWith('특별시') || name.endsWith('특별자치시') || name.endsWith('특별자치도');
        });
        
        console.log(`시도 단위 피처: ${sidoFeatures.length}개`);
        
        // 시군구 레벨 필터링
        const sigunguFeatures = data.features.filter((feature: any) => {
          const name = feature?.properties?.SIG_KOR_NM || '';
          const parts = name.split(' ');
          return parts.length > 1 && (parts[1].endsWith('시') || parts[1].endsWith('군') || parts[1].endsWith('구'));
        });
        
        console.log(`시군구 단위 피처: ${sigunguFeatures.length}개`);
        
        // 전체 GeoJSON 레이어
        const geoJsonLayer = L.geoJSON(data, {
          style: (feature) => getRegionStyle(feature, regionDataMap),
          onEachFeature: (feature, layer) => {
            const name = feature?.properties?.SIG_KOR_NM || '';
            const data = regionDataMap.get(name);
            
            // 툴팁 내용
            let tooltipContent = name;
            
            if (data) {
              tooltipContent = `
                <div style="text-align:center;font-weight:bold;margin-bottom:4px">${name}</div>
                <div>${data.issueName || '정보 없음'}</div>
                <div>진행률: ${data.percentage}%</div>
                <div>상태: ${data.status || '정보 없음'}</div>
              `;
            }
            
            // 툴팁 추가
            layer.bindTooltip(tooltipContent, {
              permanent: false,
              direction: "center",
              className: "region-tooltip"
            });
            
            // 마우스 이벤트
            layer.on({
              mouseover: highlightFeature,
              mouseout: (e) => resetHighlight(e, geoJsonLayer),
              click: (e) => {
                // 클릭 시 확대 및 경계선 강조
                mapInstance?.fitBounds(e.target.getBounds());
                
                if (data) {
                  // 상세 정보 팝업
                  const popupContent = `
                    <div style="min-width:200px;padding:5px;">
                      <h3 style="text-align:center;margin:4px 0;border-bottom:1px solid #eee;padding-bottom:4px">${data.location}</h3>
                      <div style="margin:4px 0">단계: <b>${data.issueName || '정보 없음'}</b></div>
                      <div style="margin:4px 0">진행률: <b>${data.percentage}%</b></div>
                      <div style="margin:4px 0">상태: <b>${data.status || '정보 없음'}</b></div>
                    </div>
                  `;
                  
                  layer.bindPopup(popupContent).openPopup();
                }
              }
            });
          }
        }).addTo(mapInstance);
        
        // 시도 경계 강조 레이어 추가 (위에 덮어씌움)
        L.geoJSON({
          type: "FeatureCollection",
          features: sidoFeatures
        }, {
          style: {
            color: '#000',
            weight: 2.5,
            fillOpacity: 0, // 채우기 없음
            opacity: 1
          },
          onEachFeature: (feature, layer) => {
            const name = feature?.properties?.SIG_KOR_NM || '';
            
            // 시도명 표시 (지도 중앙에)
            try {
              const bounds = layer.getBounds();
              const center = bounds.getCenter();
              
              // 시도명 라벨 추가
              L.marker(center, {
                icon: L.divIcon({
                  html: `<div style="color:#000;font-weight:bold;font-size:14px;text-shadow:1px 1px 1px #fff,-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff;">${name}</div>`,
                  className: 'region-label',
                  iconSize: [100, 20],
                  iconAnchor: [50, 10]
                })
              }).addTo(mapInstance!);
            } catch (e) {
              console.warn(`${name} 라벨 추가 실패:`, e);
            }
          }
        }).addTo(mapInstance);
        
        // 산불 데이터가 있는 지역 강조
        items.forEach(item => {
          const sigungu = item.sigungu;
          if (!sigungu) return;
          
          // 해당 시군구 피처 찾기
          const feature = data.features.find((f: any) => 
            f?.properties?.SIG_KOR_NM === sigungu || 
            (f?.properties?.SIG_KOR_NM || "").endsWith(sigungu)
          );
          
          if (feature) {
            // 해당 지역 강조 표시
            L.geoJSON(feature, {
              style: {
                color: '#ff0000',
                weight: 3,
                fillColor: getDangerColor(item.issueName),
                fillOpacity: 0.7,
                opacity: 1
              }
            }).addTo(mapInstance!);
            
            // 산불 정보 마커 추가
            try {
              const geom = feature.geometry;
              if (geom && geom.coordinates && geom.coordinates.length > 0) {
                let center;
                
                if (geom.type === 'Polygon') {
                  // 폴리곤의 중심점 계산
                  const coords = geom.coordinates[0];
                  let lat = 0, lng = 0;
                  coords.forEach((c: any) => {
                    lat += c[1];
                    lng += c[0];
                  });
                  center = [lat / coords.length, lng / coords.length];
                } else if (geom.type === 'MultiPolygon') {
                  // 첫 번째 폴리곤 사용
                  const coords = geom.coordinates[0][0];
                  let lat = 0, lng = 0;
                  coords.forEach((c: any) => {
                    lat += c[1];
                    lng += c[0];
                  });
                  center = [lat / coords.length, lng / coords.length];
                }
                
                if (center) {
                  // 완료 상태 여부 확인
                  const isCompleted = item.status && (item.status.includes('완료') || parseInt(item.percentage) === 100);
                  
                  // 단계에 따른 아이콘 색상
                  const iconColor = isCompleted ? '#4CAF50' : getDangerColor(item.issueName);
                  
                  // 마커 내용 생성
                  const markerHtml = `
                    <div style="background-color:${iconColor};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 0 0 2px white, 0 0 3px 2px rgba(0,0,0,0.3);">
                      ${parseInt(item.percentage)}%
                    </div>
                  `;
                  
                  // 마커 추가
                  L.marker(center, {
                    icon: L.divIcon({
                      html: markerHtml,
                      className: 'percentage-marker',
                      iconSize: [36, 36],
                      iconAnchor: [18, 18]
                    })
                  }).addTo(mapInstance!).bindTooltip(item.location);
                }
              }
            } catch (e) {
              console.warn(`${sigungu} 마커 추가 실패:`, e);
            }
          }
        });
        
        // 지도 영역 조정
        mapInstance!.fitBounds([[33, 124.5], [38.5, 131.5]]);
        
        console.log("지도 그리기 완료");
      })
      .catch(error => {
        console.error("GeoJSON 처리 오류:", error);
        
        // 오류 시 기본 지도 표시
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          opacity: 0.3
        }).addTo(mapInstance!);
        
        // 오류 메시지 표시
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.8);padding:20px;border-radius:5px;text-align:center;z-index:1000;">
            <h3 style="color:red;">지도 데이터 로드 실패</h3>
            <p>GeoJSON 파일을 불러오는 중 오류가 발생했습니다.</p>
            <button id="retryBtn" style="padding:5px 10px;margin-top:10px;">다시 시도</button>
          </div>
        `;
        container.appendChild(errorMsg);
        
        // 다시 시도 버튼
        document.getElementById('retryBtn')?.addEventListener('click', () => {
          errorMsg.remove();
          drawEnhancedMap(containerId, items);
        });
      });
      
  } catch (error) {
    console.error("지도 초기화 오류:", error);
    alert("지도를 초기화하는 중 오류가 발생했습니다.");
  }
  
  return mapInstance;
}
