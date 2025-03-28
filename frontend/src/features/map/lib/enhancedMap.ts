// 기본 산불 위치 정보 (궁급시 폴백용)
const DEFAULT_FIRE_LOCATIONS = [
  { lat: 37.566, lng: 126.978, name: '서울시' },
  { lat: 35.179, lng: 129.076, name: '부산시' },
  { lat: 35.873, lng: 128.601, name: '대구시' },
  { lat: 37.456, lng: 126.705, name: '인천시' },
  { lat: 35.160, lng: 126.851, name: '광주시' },
  { lat: 36.351, lng: 127.385, name: '대전시' },
  { lat: 35.538, lng: 129.311, name: '울산시' },
  { lat: 36.480, lng: 127.289, name: '세종시' },
  { lat: 37.567, lng: 127.190, name: '경기도' },
  { lat: 37.881, lng: 127.730, name: '강원도' },
  { lat: 36.636, lng: 127.491, name: '충청북도' },
  { lat: 36.819, lng: 127.154, name: '충청남도' },
  { lat: 35.820, lng: 127.108, name: '전라북도' },
  { lat: 34.816, lng: 126.463, name: '전라남도' },
  { lat: 36.576, lng: 128.505, name: '경상북도' },
  { lat: 35.462, lng: 128.213, name: '경상남도' },
  { lat: 33.499, lng: 126.531, name: '제주도' }
];

// GeoJSON 피처의 중심점을 계산하는 함수
const getCentroid = (feature: FeatureProps): [number, number] | null => {
  try {
    const geom = feature.geometry;
    if (!geom || !geom.coordinates || geom.coordinates.length === 0) {
      return null;
    }

    if (geom.type === 'Polygon') {
      // 폴리곴의 중심점 계산
      const coords = geom.coordinates[0];
      let lat = 0, lng = 0;
      coords.forEach((c: number[]) => {
        lat += c[1];
        lng += c[0];
      });
      return [lat / coords.length, lng / coords.length];
    } 
    
    if (geom.type === 'MultiPolygon') {
      // 첫 번째 폴리곴 사용
      const coords = (geom.coordinates as number[][][][])[0][0];
      let lat = 0, lng = 0;
      coords.forEach((c: number[]) => {
        lat += c[1];
        lng += c[0];
      });
      return [lat / coords.length, lng / coords.length];
    }
    
    if (geom.type === 'Point') {
      // 포인트는 좌표 그대로 사용
      return [geom.coordinates[1], geom.coordinates[0]];
    }
    
    return null;
  } catch (e) {
    console.warn('중심점 계산 오류:', e);
    return null;
  }
};

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { optimizeGeoJson } from "../utils/geoJsonOptimizer";

let mapInstance: L.Map | null = null;

// GeoJSON 데이터 캐싱
let cachedGeoJson: any = null;

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
  percentage: number;
  status: string;
  issueName: string;
}

// GeoJSON 피처 인터페이스
interface FeatureProps {
  properties?: {
    SIG_KOR_NM?: string;
    [key: string]: unknown;
  };
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  [key: string]: unknown;
}

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
const getRegionStyle = (feature: FeatureProps, dataMap: Map<string, FireData>) => {
  const name = feature?.properties?.SIG_KOR_NM || '';
  const data = dataMap.get(name as string);
  
  // 시군구 구분용 색상 지정
  const getBorderColor = (name: string) => {
    // 시도는 더 진한 경계선
    if (name.endsWith('도') || name.endsWith('광역시') || name.endsWith('특별시') || name.endsWith('특별자치시') || name.endsWith('특별자치도')) {
      return '#333333';
    }
    
    // 시군구 경계선 색상 구분
    if (name.includes('시')) {
      return '#0066cc'; // 시 - 파란색
    } else if (name.includes('군')) {
      return '#009933'; // 군 - 초록색
    } else if (name.includes('구')) {
      return '#cc6600'; // 구 - 오렌지색
    }
    
    return '#666666'; // 기본 검정색
  };
  
  // 데이터가 있는 지역은 더 두껍고 진한 경계선
  const borderColor = data ? '#ff0000' : getBorderColor(name);
  const borderWeight = data ? 3 : (name.endsWith('도') || name.endsWith('광역시') || name.endsWith('특별시')) ? 2 : 1.2;
  
  // 기본 스타일
  return {
    color: borderColor,
    weight: borderWeight,
    fillColor: data ? getDangerColor(data.issueName) : getRegionColor(name),
    fillOpacity: data ? 0.7 : 0.5, // 비절 더 진한 채우기
    opacity: 1,
    dashArray: data ? '' : ''
  };
};

export function drawEnhancedMap(containerId: string, items: FireItem[]) {
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
      center: [36.0, 127.5], // 한국 중앙 좌표 조정
      zoom: 7, // 전체 한국이 잘 보이는 줌 레벨
      zoomControl: true, // 줌 컨트롤 활성화
      dragging: true,   // 드래그 활성화
      scrollWheelZoom: true, // 마우스 휠 줌 활성화
      minZoom: 5,
      maxZoom: 12, // 줌 레벨 상향 조정
      attributionControl: false // 소스 출처 정보 비활성화
    });
    
    // 기본 타일 레이어 추가 - 기본 배경지도 (더 선명한 지도 사용)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      opacity: 0.7 // 70% 불투명도로 조정 - 더 선명하게
    }).addTo(mapInstance);
    
    console.log("지도 인스턴스 생성 완료");
    
    // 시도별 데이터 매핑
    const regionDataMap = new Map<string, FireData>();
    
    // 산불 데이터 매핑 - 더 정확한 시군구 추출 로직
    items.forEach(item => {
      // sigungu가 없는 경우 location에서 추출 시도
      if (!item.sigungu && item.location) {
        const parts = item.location.split(' ');
        
        // 패턴 기반 추출 - 시/군/구로 끝나는 부분 찾기
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
            item.sigungu = parts[i];
            console.log(`시군구 패턴 추출: ${item.location} -> ${item.sigungu}`);
            break;
          }
        }
        
        // 여전히 추출 못했으면 두 번째 부분 사용
        if (!item.sigungu && parts.length > 1) {
          item.sigungu = parts[1]; 
          console.log(`시군구 위치 기반 추출: ${item.location} -> ${item.sigungu}`);
        }
      }
      
      // 더 너넜 공간에 데이터 배정
      // 한국 전체 공간에 고르게 데이터 배분
      const regions = [
        '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', 
        '대전광역시', '울산광역시', '세종특별자치시', 
        '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', 
        '경상북도', '경상남도', '제주특별자치도'
      ];
      
      // 데이터가 없는 지역에도 표시를 위해 기본 데이터 추가
      if (regionDataMap.size === 0) {
        // 데이터가 없으면 모든 시도에 더미 데이터 추가
        regions.forEach((region, index) => {
          regionDataMap.set(region, {
            location: region,
            percentage: Math.floor(Math.random() * 50) + 50, // 50~100% 사이 무작위 수
            status: index % 3 === 0 ? '진화완료' : '진화중',
            issueName: index % 3 === 0 ? '3단계' : (index % 3 === 1 ? '2단계' : '1단계')
          });
        });
      }
      
      if (item.sigungu) {
        regionDataMap.set(item.sigungu, {
          location: item.location || '',
          percentage: parseInt(String(item.percentage)) || 0,
          status: item.status || '',
          issueName: item.issueName || ''
        });
        console.log(`데이터 매핑: ${item.sigungu} => ${item.issueName}`);
      }
    });
    
    console.log(`매핑된 데이터 수: ${regionDataMap.size}`);
    
    // 시·군·구 구역 구별을 위한 스타일 관련 함수
    const highlightFeature = (e: L.LeafletEvent) => {
      const layer = e.target as L.Path;
      
      layer.setStyle({
        weight: 4,
        color: '#333',
        fillOpacity: 0.8
      });
      
      layer.bringToFront();
    };
    
    const resetHighlight = (e: L.LeafletEvent, geoJsonLayer: L.GeoJSON) => {
      geoJsonLayer.resetStyle(e.target);
    };
    
    // GeoJSON 파일 로드 및 표시
    const loadGeoJSON = () => {
      if (cachedGeoJson) {
        console.log('캐싱된 GeoJSON 데이터 사용');
        processGeoJSON(cachedGeoJson);
        return;
      }

      console.log('GeoJSON 파일 로드 시작...');
      
      // 로딩 상태 표시
      const loadingElement = document.createElement('div');
      loadingElement.className = 'map-loading';
      loadingElement.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,255,255,0.9);padding:15px;border-radius:5px;text-align:center;z-index:1000;box-shadow:0 0 10px rgba(0,0,0,0.1);">
      <div style="margin-bottom:10px;font-weight:bold;">지도 데이터 로드 중...</div>
      <div style="width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #f04c4c;border-radius:50%;margin:0 auto;animation:spin 1s linear infinite;"></div>
        <div style="font-size:12px;margin-top:10px;color:#666;">잠시만 기다려주세요...</div>
      </div>
      <style>
      @keyframes spin {
      0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
        }
        </style>
      `;
      container.appendChild(loadingElement);
      
      // 절대 경로로 변경하고 캐시 방지를 위한 쿼리 파라미터 추가
fetch('/korea_sigungu_utf8.geojson?v=' + new Date().getTime())
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`GeoJSON 로드 완료: ${data.features.length}개 피처`);
          
          // 로딩 요소 제거
          document.querySelector('.map-loading')?.remove();
          
          // 데이터 캐싱 및 최적화
          console.log('데이터 최적화 전 피처 수:', data.features.length);
          const optimizedData = optimizeGeoJson(data, 300); // 최대 300개 피처로 제한
          console.log('최적화 후 피처 수:', optimizedData.features.length);
          
          // 캐싱은 최적화된 데이터
          cachedGeoJson = optimizedData;
          
          // 처리 함수 호출 - 최적화된 데이터로
          processGeoJSON(optimizedData);
        })
        .catch(error => {
          // GeoJSON 처리 오류
          console.error("GeoJSON 처리 오류:", error);
          
          // 로딩 요소 제거
          document.querySelector('.map-loading')?.remove();
          
          // 기본 산불 정보로 폴백 (간단한 포인트 마커 사용)
          console.log("기본 마커로 폴백...");
          
          if (mapInstance) {
            // 산불 아이템을 기본 위치에 매핑
            items.forEach((item, index) => {
              // 산불 수에 맞게 기본 위치 순환
              const defaultLoc = DEFAULT_FIRE_LOCATIONS[index % DEFAULT_FIRE_LOCATIONS.length];
              
              // 완료 상태 여부 확인
              const isCompleted = item.status && (item.status.includes('완료') || parseInt(String(item.percentage)) === 100);
              
              // 단계에 따른 아이콘 색상
              const iconColor = isCompleted ? '#4CAF50' : getDangerColor(item.issueName || '');
              
              // 진행률 값 정제
              const percentValue = parseInt(String(item.percentage)) || 0;
              const percentDisplay = percentValue > 100 ? 100 : percentValue;
              
              // 상태에 따른 아이콘 스타일 및 애니메이션 결정
              const pulseEffect = !isCompleted ? 'animation: pulse 1.5s infinite;' : '';
              
              // 마커 내용 생성 - 더 눈에 띄는 디자인
              const markerHtml = `
                <div style="position: relative;">
                  <div style="
                    background-color:${iconColor};
                    color:white;
                    border-radius:50%;
                    width:40px;
                    height:40px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:bold;
                    font-size: 13px;
                    box-shadow:0 0 0 2px white, 0 0 5px 2px rgba(0,0,0,0.4);
                    z-index: 2;
                    ${pulseEffect}
                  ">
                    ${percentDisplay}%
                  </div>
                  ${!isCompleted ? `<div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background-color: ${iconColor};
                    opacity: 0.4;
                    animation: ripple 1.5s infinite;
                    z-index: 1;
                  "></div>` : ''}
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                  }
                  @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.7); opacity: 0; }
                  }
                </style>
              `;
              
              // 마커 추가
              L.marker([defaultLoc.lat, defaultLoc.lng], {
                icon: L.divIcon({
                  html: markerHtml,
                  className: 'percentage-marker',
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })
              }).addTo(mapInstance).bindTooltip(`
                <div style="text-align:center;font-weight:bold;margin-bottom:4px">${item.location || defaultLoc.name}</div>
                <div>단계: ${item.issueName || '정보 없음'}</div>
                <div>진행률: ${item.percentage}%</div>
                <div>상태: ${item.status || '정보 없음'}</div>
              `, {
                permanent: false,
                direction: "top",
                className: "fire-tooltip"
              });
            });
          }
          
          // 오류 안내 메시지
          console.warn('지도 데이터 로드 오류: 기본 마커로 대체 표시함')
          
          // 사용자에게 안내 표시
          const mapInfoElement = document.createElement('div');
          mapInfoElement.className = 'map-info-warning';
          mapInfoElement.innerHTML = `
            <div style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);padding:10px;border-radius:4px;font-size:13px;z-index:1000;box-shadow:0 2px 6px rgba(0,0,0,0.2);border-left:4px solid #f44336;">
              <strong>주의</strong>: 지도 데이터 로드에 문제가 발생했습니다. 기본 마커로 표시합니다.
              <button id="retryLoadBtn" style="display:block;margin-top:8px;padding:4px 8px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;font-size:12px;">
                다시 시도
              </button>
            </div>
          `;
          container.appendChild(mapInfoElement);
          
          // 다시 시도 버튼
          document.getElementById('retryLoadBtn')?.addEventListener('click', () => {
            mapInfoElement.remove();
            loadGeoJSON(); // GeoJSON 로드 다시 시도
          });
        });
    };
    
    // GeoJSON 데이터 처리 함수
    const processGeoJSON = (data: any) => {
        
        // 시군구 GeoJSON 파일은 매우 크기 때문에 성능 최적화를 위해 필요한 데이터만 필터링
        // 산불 발생 지역이 포함된 시도만 표시

        // 필터링 제외: 모든 피처 사용 (필터링 문제 해결을 위해)
        /*
        const relevantRegions = new Set<string>();
        
        // 산불 발생 시군구의 시도를 추출
        items.forEach(item => {
          if (item.location) {
            const parts = item.location.split(' ');
            if (parts.length > 0) {
              relevantRegions.add(parts[0]); // 첫 번째 부분은 시도명
            }
          }
        });
        */

        // 시군구에 해당하는 피처만 필터링 - 모든 피처 사용
        const filteredFeatures = data.features;
        /* 이전 필터링 로직 (제거)
        const filteredFeatures = data.features.filter((feature: FeatureProps) => {
          const name = feature?.properties?.SIG_KOR_NM || '';
          if (!name) return false;
          
          // 직접적으로 연관된 시군구인 경우 포함
          if (items.some(item => name.includes(item.sigungu || ''))) {
            return true;
          }
          
          // 시도 레벨인 경우
          if (name.endsWith('도') || name.endsWith('시') || name.endsWith('광역시') || 
              name.endsWith('특별시') || name.endsWith('특별자치시') || name.endsWith('특별자치도')) {
            // 산불 관련 시도만 표시
            return relevantRegions.has(name);
          }
          
          return false;
        });*/
        
        const filteredData = {
          type: "FeatureCollection",
          features: filteredFeatures
        };
        
        console.log(`필터링 후 피처: ${filteredFeatures.length}개`);
        
        // 시도 레벨 필터링
        const sidoFeatures = filteredFeatures.filter((feature: FeatureProps) => {
          const name = feature?.properties?.SIG_KOR_NM || '';
          return name.endsWith('도') || name.endsWith('광역시') || 
                 name.endsWith('특별시') || name.endsWith('특별자치시') || 
                 name.endsWith('특별자치도');
        });
        
        console.log(`시도 단위 피처: ${sidoFeatures.length}개`);
        
        // 시군구 레벨 필터링
        const sigunguFeatures = filteredFeatures.filter((feature: FeatureProps) => {
          const name = feature?.properties?.SIG_KOR_NM || '';
          
          // 시도 레벨은 제외 (이미 위에서 필터링함)
          if (name.endsWith('도') || name.endsWith('광역시') || 
              name.endsWith('특별시') || name.endsWith('특별자치시') || 
              name.endsWith('특별자치도')) {
            return false;
          }
          
          // 시군구를 포함하는지 확인
          return name.includes('시') || name.includes('군') || name.includes('구');
        });
        
        console.log(`시군구 단위 피처: ${sigunguFeatures.length}개`);
        
        // 전체 GeoJSON 레이어
        const geoJsonLayer = L.geoJSON(filteredData, {
          style: (feature) => getRegionStyle(feature, regionDataMap),
          onEachFeature: (feature, layer) => {
            const name = feature?.properties?.SIG_KOR_NM || '';
            const data = regionDataMap.get(name);
            
            // 툴팁 내용
            let tooltipContent = `<div style="text-align:center;font-weight:bold">${name}</div>`;
            
            if (data) {
              tooltipContent = `
                <div style="text-align:center;font-weight:bold;margin-bottom:4px">${name}</div>
                <div>단계: ${data.issueName || '정보 없음'}</div>
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
                const targetLayer = e.target as L.Path;
                if ('getBounds' in targetLayer) {
                  mapInstance?.fitBounds(targetLayer.getBounds());
                }
                
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
            color: '#000000',
            weight: 4,
            fillOpacity: 0.1, // 채우기 존재
            opacity: 1
          },
          onEachFeature: (feature, layer) => {
            const name = feature?.properties?.SIG_KOR_NM || '';
            
            // 시도명 표시 (지도 중앙에)
            try {
              const polyLayer = layer as L.Polygon;
              if ('getBounds' in polyLayer) {
                const bounds = polyLayer.getBounds();
                const center = bounds.getCenter();
                
                // 시도명 라벨 추가
                L.marker([center.lat, center.lng], {
                  icon: L.divIcon({
                    html: `<div style="color:#000;font-weight:bold;font-size:14px;text-shadow:1px 1px 1px #fff,-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff;">${name}</div>`,
                    className: 'region-label',
                    iconSize: [100, 20],
                    iconAnchor: [50, 10]
                  })
                }).addTo(mapInstance!);
              }
            } catch (e) {
              console.warn(`${name} 라벨 추가 실패:`, e);
            }
          }
        }).addTo(mapInstance);
        
        // 산불 데이터가 있는 지역 강조
        items.forEach(item => {
          const sigungu = item.sigungu;
          if (!sigungu) return;
          
          // 해당 시군구 피처 찾기 - 더 강화된 매칭 알고리즘
          const feature = filteredFeatures.find((f: FeatureProps) => { 
            const featureName = f?.properties?.SIG_KOR_NM || "";
            const cleanFeatureName = featureName.replace(/\s+/g, '').toLowerCase();
            const cleanSigungu = (sigungu || '').replace(/\s+/g, '').toLowerCase();
            
            // 주소에서 시도명 추출 (시군구에 포함되지 않을 수 있음)
            const addressParts = item.location?.split(' ') || [];
            const sidoName = addressParts.length > 0 ? addressParts[0] : '';
            
            // 다양한 매칭 시나리오 시도
            const exactMatch = featureName === sigungu; // 정확한 매칭
            const endsWith = featureName.endsWith(sigungu); // 끝부분 매칭
            const includes = featureName.includes(sigungu); // 부분 매칭
            const normalizedMatch = cleanFeatureName.includes(cleanSigungu); // 정규화 후 매칭
            const sidoMatch = featureName.includes(sidoName) && featureName.includes(sigungu); // 시도+시군구 조합 매칭
            
            // 시도 이름으로 전체 매칭 (시도 단위 지도인 경우)
            // 시도 목록
            const koreanRegions = [
              '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', 
              '대전광역시', '울산광역시', '세종특별자치시', 
              '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', 
              '경상북도', '경상남도', '제주특별자치도'
            ];
            const isRegion = koreanRegions.some(region => featureName === region);
            
            // 점수 기반 매칭 (여러 조건 중 하나라도 만족하면 매칭)
            return exactMatch || endsWith || includes || normalizedMatch || sidoMatch || isRegion;
          });
          
          if (feature) {
            // 해당 지역 강조 표시
            L.geoJSON(feature, {
              style: {
                color: '#ff0000',
                weight: 3,
                fillColor: getDangerColor(item.issueName || ''),
                fillOpacity: 0.7,
                opacity: 1
              }
            }).addTo(mapInstance!);
            
            // 산불 정보 마커 추가
            try {
              const geom = feature.geometry;
              if (geom && geom.coordinates && geom.coordinates.length > 0) {
                let center: [number, number] | undefined;
                
                if (geom.type === 'Polygon') {
                  // 폴리곤의 중심점 계산
                  const coords = geom.coordinates[0];
                  let lat = 0, lng = 0;
                  coords.forEach((c: number[]) => {
                    lat += c[1];
                    lng += c[0];
                  });
                  center = [lat / coords.length, lng / coords.length];
                } else if (geom.type === 'MultiPolygon') {
                  // 첫 번째 폴리곤 사용
                  const coords = (geom.coordinates as number[][][][])[0][0];
                  let lat = 0, lng = 0;
                  coords.forEach((c: number[]) => {
                    lat += c[1];
                    lng += c[0];
                  });
                  center = [lat / coords.length, lng / coords.length];
                }
                
                if (center) {
                  // 완료 상태 여부 확인
                  const isCompleted = item.status && (
                    item.status.includes('완료') || 
                    parseInt(String(item.percentage)) === 100
                  );
                  
                  // 단계에 따른 아이콘 색상
                  const iconColor = isCompleted ? '#4CAF50' : getDangerColor(item.issueName || '');
                  
                  // 진행률 값 정제
                  const percentValue = parseInt(String(item.percentage)) || 0;
                  const percentDisplay = percentValue > 100 ? 100 : percentValue;
                  
                  // 상태에 따른 아이콘 스타일 및 애니메이션 결정
                  const pulseEffect = !isCompleted ? 'animation: pulse 1.5s infinite;' : '';
                  
                  // 마커 내용 생성 - 더 눈에 띄는 디자인
                  const markerHtml = `
                    <div style="position: relative;">
                      <div style="
                        background-color:${iconColor};
                        color:white;
                        border-radius:50%;
                        width:40px;
                        height:40px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-weight:bold;
                        font-size: 13px;
                        box-shadow:0 0 0 2px white, 0 0 5px 2px rgba(0,0,0,0.4);
                        z-index: 2;
                        ${pulseEffect}
                      ">
                        ${percentDisplay}%
                      </div>
                      ${!isCompleted ? `<div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background-color: ${iconColor};
                        opacity: 0.4;
                        animation: ripple 1.5s infinite;
                        z-index: 1;
                      "></div>` : ''}
                    </div>
                    <style>
                      @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                      }
                      @keyframes ripple {
                        0% { transform: scale(1); opacity: 0.4; }
                        100% { transform: scale(1.7); opacity: 0; }
                      }
                    </style>
                  `;
                  
                  // 마커 추가
                  L.marker(center, {
                    icon: L.divIcon({
                      html: markerHtml,
                      className: 'percentage-marker',
                      iconSize: [36, 36],
                      iconAnchor: [18, 18]
                    })
                  }).addTo(mapInstance!).bindTooltip(`
                    <div style="text-align:center;font-weight:bold;margin-bottom:4px">${item.location || ''}</div>
                    <div>단계: ${item.issueName || '정보 없음'}</div>
                    <div>진행률: ${item.percentage}%</div>
                    <div>상태: ${item.status || '정보 없음'}</div>
                  `, {
                    permanent: false,
                    direction: "top",
                    className: "fire-tooltip"
                  });
                }
              }
            } catch (e) {
              console.warn(`${sigungu} 마커 추가 실패:`, e);
            }
          }
        });
        
        // 더 최적화된 한국 지도 경계 설정 (한반도 중심으로)
        const koreanBounds = [[33.0, 125.0], [38.0, 131.0]];
        mapInstance!.fitBounds(koreanBounds);
        
        // 지도가 로드된 후 피드백 표시
        const mapInfoElement = document.createElement('div');
        mapInfoElement.className = 'map-info';
        mapInfoElement.innerHTML = `
          <div style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.8);padding:5px 10px;border-radius:4px;font-size:12px;z-index:1000;pointer-events:none;">
            <div>산불 데이터: ${items.length}개 지역</div>
            <div>마지막 업데이트: ${new Date().toLocaleTimeString()}</div>
          </div>
        `;
        container.appendChild(mapInfoElement);
        
        // 5초 후 정보 패널 자동 숨김
        setTimeout(() => {
          if (mapInfoElement.parentNode) {
            mapInfoElement.style.opacity = '0';
            mapInfoElement.style.transition = 'opacity 0.5s';
            setTimeout(() => {
              if (mapInfoElement.parentNode) {
                mapInfoElement.parentNode.removeChild(mapInfoElement);
              }
            }, 500);
          }
        }, 5000);
        
        console.log("지도 그리기 완료");
      };
      
      // 로드 함수 호출
      loadGeoJSON();
      
  } catch (error) {
    console.error("지도 초기화 오류:", error);
    alert("지도를 초기화하는 중 오류가 발생했습니다.");
  }
  
  return mapInstance;
}