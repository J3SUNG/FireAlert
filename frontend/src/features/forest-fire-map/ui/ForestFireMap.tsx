import { FC, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ForestFireData } from '../../../shared/types/forestFire';

interface ForestFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
}

export const ForestFireMap: FC<ForestFireMapProps> = ({
  fires,
  selectedFireId,
  onFireSelect,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const provinceLayerRef = useRef<L.GeoJSON | null>(null);
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  // 초기 지도 설정
  useEffect(() => {
    if (mapRef.current) {
      return; // 이미 맵이 있으면 다시 초기화하지 않음
    }

    // 지도 컨테이너가 존재하는지 확인
    if (!mapContainerRef.current) return;

    console.log("지도 초기화 시작");

    // 지도 초기화
    const map = L.map(mapContainerRef.current, {
      center: [36.0, 127.7], // 한국 중심점
      zoom: 7,
      zoomControl: true, // 줌 컨트롤 활성화
      dragging: true,    // 드래그 활성화
      scrollWheelZoom: true, // 마우스 휠로 줌 활성화
      // 아날로그 확대/축소 효과를 위한 설정 추가
      zoomSnap: 0.1,  // 줌 단계를 0.1 단위로 세분화
      zoomDelta: 0.5, // 줌 버튼 클릭 시 0.5 단위로 확대/축소
      wheelPxPerZoomLevel: 120 // 휠 스크롤 당 확대/축소 정도 조정 (값이 클수록 느리게)
    });

    // 타일 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19 // 최대 줌 레벨 설정
    }).addTo(map);

    // 줌 컨트롤 위치 설정
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // 스케일 컨트롤 추가
    L.control.scale({
      imperial: false, // 미터법만 사용
      position: 'bottomright'
    }).addTo(map);

    // 맵 레퍼런스 저장
    mapRef.current = map;
    
    // 범례 추가
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '8px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
      div.style.fontSize = '12px';
      
      div.innerHTML = `
        <h4 style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold;">산불 심각도</h4>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ff0000; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>심각</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ff8000; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>높음</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 3px;">
          <div style="background-color: #ffff00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>중간</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="background-color: #0080ff; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; margin-right: 6px;"></div>
          <span>낮음</span>
        </div>
      `;
      
      return div;
    };
    legend.addTo(map);

    // 한국 지도 GeoJSON (시도 레벨) 추가
    const addKoreaProvinces = async () => {
      try {
        console.log("한국 시도 GeoJSON 로드 시도");
        const response = await fetch('/assets/map/gadm41_KOR_1.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
        }
        const geoJsonData = await response.json();
        console.log("시도 GeoJSON 데이터 로드 성공");
        
        // GeoJSON 스타일 설정
        const provinceLayer = L.geoJSON(geoJsonData, {
          style: {
            color: '#3388ff',
            weight: 2,
            opacity: 0.7,
            fillColor: '#e6f2ff',
            fillOpacity: 0.1
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const provinceName = feature.properties.NAME_1 || feature.properties.name || '지역 정보 없음';
              
              // 광역시/도 이름 직접 표시 (고정 라벨)
              // 광역시 또는 특별시인 경우만 표시
              if (provinceName.includes('광역시') || 
                  provinceName.includes('특별시') || 
                  provinceName.includes('특별자치시')) {
                const latLng = layer.getBounds().getCenter();
                
                // 광역시 라벨 생성
                const icon = L.divIcon({
                  className: 'province-label',
                  html: `<div class="province-label-text">${provinceName}</div>`,
                  iconSize: [100, 20],
                  iconAnchor: [50, 10]
                });
                
                L.marker(latLng, { 
                  icon: icon, 
                  interactive: false, 
                  keyboard: false 
                }).addTo(map);
              }
              
              // 마우스 오버 툴팁
              layer.bindTooltip(provinceName, {
                permanent: false,
                direction: 'center',
                className: 'province-tooltip',
                opacity: 0.9
              });
            }
            
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillOpacity: 0.3,
                  fillColor: '#b3d9ff'
                });
              },
              mouseout: (e) => {
                provinceLayer.resetStyle(e.target);
              }
            });
          }
        }).addTo(map);
        
        // 시도 레이어 참조 저장
        provinceLayerRef.current = provinceLayer;
        console.log("한국 시도 지도 GeoJSON 로드 완료");
        
        // 시군구 데이터도 로드
        await addKoreaDistricts();
      } catch (error) {
        console.error("한국 시도 지도 GeoJSON 로드 실패:", error);
      } finally {
        setIsMapLoaded(true);
      }
    };
    
    // 한국 지도 GeoJSON (시군구 레벨) 추가
    const addKoreaDistricts = async () => {
      try {
        console.log("한국 시군구 GeoJSON 로드 시도");
        const response = await fetch('/assets/map/gadm41_KOR_2.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status} ${response.statusText}`);
        }
        const geoJsonData = await response.json();
        console.log("시군구 GeoJSON 데이터 로드 성공");
        
        // 시군구 이름과 중심점 저장용 맵
        const districtLabels = new Map();
        
        // GeoJSON 스타일 설정
        const districtLayer = L.geoJSON(geoJsonData, {
          style: {
            color: '#666',
            weight: 0.8,
            opacity: 0.6,
            fillColor: '#f5f5f5',
            fillOpacity: 0.1
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              // 시군구명
              const districtName = feature.properties.NAME_2 || '';
              const provinceName = feature.properties.NAME_1 || '';
              const latLng = layer.getBounds().getCenter();
              
              // 시군구 중심점 저장 (나중에 라벨 표시용)
              if (districtName && !provinceName.includes('광역시') && 
                  !provinceName.includes('특별시') && 
                  !provinceName.includes('특별자치시')) {
                districtLabels.set(districtName, latLng);
              }
              
              // 마우스 오버 툴팁
              const fullName = districtName + (provinceName ? ` (${provinceName})` : '');
              layer.bindTooltip(fullName, {
                permanent: false,
                direction: 'center',
                className: 'district-tooltip',
                opacity: 0.9
              });
            }
            
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillOpacity: 0.3,
                  fillColor: '#ffe6b3'
                });
              },
              mouseout: (e) => {
                districtLayer.resetStyle(e.target);
              }
            });
          }
        }).addTo(map);
        
        // 시군구 이름 라벨 추가 (광역시가 아닌 지역)
        districtLabels.forEach((latLng, name) => {
          const icon = L.divIcon({
            className: 'district-label',
            html: `<div class="district-label-text">${name}</div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 10]
          });
          
          L.marker(latLng, { 
            icon: icon, 
            interactive: false,
            keyboard: false 
          }).addTo(map);
        });
        
        // 시군구 레이어 참조 저장
        districtLayerRef.current = districtLayer;
        console.log("한국 시군구 지도 GeoJSON 로드 완료");
      } catch (error) {
        console.error("한국 시군구 지도 GeoJSON 로드 실패:", error);
      }
    };

    // 지도 로드 초기화
    addKoreaProvinces();
    console.log("지도 초기화 완료");

    return () => {
      // cleanup 함수에서는 지도를 제거하지 않음
      // 컴포넌트가 언마운트될 때만 지도를 제거
      // 이렇게 하면 리렌더링 시 지도가 계속 유지됨
    };
  }, []);

  // 마커 추가 및 업데이트
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) {
      return;
    }

    console.log("마커 추가 시작", fires.length);

    // 기존 마커 정리
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};

    // 산불 심각도에 따른 마커 색상
    const getSeverityColor = (severity: ForestFireData['severity']) => {
      switch (severity) {
        case 'critical': return '#ff0000'; // 빨강
        case 'high': return '#ff8000';     // 주황
        case 'medium': return '#ffff00';   // 노랑
        case 'low': return '#0080ff';      // 파랑
        default: return '#808080';         // 회색
      }
    };

    // 산불 심각도에 따른 마커 크기 (크기 증가)
    const getSeveritySize = (severity: ForestFireData['severity']) => {
      switch (severity) {
        case 'critical': return 28; // 기존 18에서 28로 증가
        case 'high': return 25;     // 기존 16에서 25로 증가
        case 'medium': return 22;   // 기존 14에서 22로 증가
        case 'low': return 20;      // 기존 12에서 20으로 증가
        default: return 15;         // 기존 10에서 15로 증가
      }
    };

    // 새 마커 추가
    fires.forEach(fire => {
      const { lat, lng } = fire.coordinates;
      const severityColor = getSeverityColor(fire.severity);
      const severitySize = getSeveritySize(fire.severity);
      
      // 마커 아이콘 설정
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background-color: ${severityColor}; 
          width: ${severitySize}px; 
          height: ${severitySize}px; 
          border-radius: 50%; 
          border: 3px solid white;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
          ${fire.status === 'active' ? 'animation: pulse 1.5s infinite;' : ''}
        "></div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>`,
        iconSize: [severitySize, severitySize],
        iconAnchor: [severitySize/2, severitySize/2]
      });
      
      // 마커 생성 및 추가
      const marker = L.marker([lat, lng], { icon }).addTo(mapRef.current!);
      
      // 툴팁 설정 (hover에서 표시)
      marker.bindTooltip(`
        <div style="font-weight: bold;">${fire.location}</div>
        <div>${fire.severity === 'low' ? '낮음' : 
              fire.severity === 'medium' ? '중간' : 
              fire.severity === 'high' ? '높음' : '심각'} - ${
              fire.status === 'active' ? '진행중' : 
              fire.status === 'contained' ? '통제중' : '진화완료'}</div>
      `, {
        permanent: false,
        direction: 'top',
        className: 'fire-tooltip',
        opacity: 0.9
      });
      
      // 팝업 설정 (클릭 시 표시)
      marker.bindPopup(`
        <div style="width: 220px; padding: 5px;">
          <h3 style="font-weight: bold; margin-bottom: 5px; color: #333;">${fire.location}</h3>
          <p style="margin: 4px 0; color: #555;"><strong>발생일:</strong> ${fire.date}</p>
          <p style="margin: 4px 0; color: #555;"><strong>상태:</strong> ${
            fire.status === 'active' ? '<span style="color: red;">진행중</span>' : 
            fire.status === 'contained' ? '<span style="color: orange;">통제중</span>' : 
            '<span style="color: green;">진화완료</span>'
          }</p>
          <p style="margin: 4px 0; color: #555;"><strong>심각도:</strong> ${
            fire.severity === 'low' ? '<span style="color: blue;">낮음</span>' : 
            fire.severity === 'medium' ? '<span style="color: #cc0;">중간</span>' : 
            fire.severity === 'high' ? '<span style="color: orange;">높음</span>' : 
            '<span style="color: red;">심각</span>'
          }</p>
          <p style="margin: 4px 0; color: #555;"><strong>영향 면적:</strong> ${fire.affectedArea}ha</p>
          ${fire.description ? `<p style="margin: 8px 0 0; font-style: italic; color: #666; font-size: 0.9em;">${fire.description}</p>` : ''}
        </div>
      `, {
        maxWidth: 300
      });
      
      // 클릭 이벤트 처리
      marker.on('click', () => {
        if (onFireSelect) {
          onFireSelect(fire);
        }
      });
      
      // 마커 레퍼런스 저장
      markersRef.current[fire.id] = marker;
    });

    console.log("마커 추가 완료");
  }, [fires, onFireSelect, isMapLoaded]);

  // 선택된 산불 처리
  useEffect(() => {
    if (!selectedFireId || !markersRef.current[selectedFireId] || !mapRef.current) return;
    
    const marker = markersRef.current[selectedFireId];
    marker.openPopup();
    
    // 선택된 마커의 위치로 지도 중심 이동
    const fire = fires.find(f => f.id === selectedFireId);
    if (fire && mapRef.current) {
      mapRef.current.setView([fire.coordinates.lat, fire.coordinates.lng], 10);
    }
  }, [selectedFireId, fires]);
  
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%'
  };

  const mapContainerStyle: React.CSSProperties = {
    width: '100%',
    height: 'calc(100vh - 70px)'
  };

  const loadingStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10
  };

  const loadingContentStyle: React.CSSProperties = {
    textAlign: 'center'
  };

  const spinnerStyle: React.CSSProperties = {
    display: 'inline-block',
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    border: '4px solid #e5e7eb',
    borderTopColor: '#ef4444',
    animation: 'spin 1s linear infinite'
  };

  const loadingTextStyle: React.CSSProperties = {
    marginTop: '8px',
    color: '#4b5563'
  };

  return (
    <div style={containerStyle}>
      <div 
        ref={mapContainerRef}
        style={mapContainerStyle}
      ></div>
      {!isMapLoaded && (
        <div style={loadingStyle}>
          <div style={loadingContentStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .leaflet-tooltip {
            background-color: white;
            border: 1px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 5px 8px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.2);
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
          }
          
          .province-tooltip {
            background-color: rgba(255, 255, 255, 0.8);
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 10px;
            padding: 3px 6px;
            pointer-events: none;
          }
          
          .district-tooltip {
            background-color: rgba(255, 255, 255, 0.9);
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 9px;
            padding: 2px 5px;
            pointer-events: none;
          }
          
          .fire-tooltip {
            background-color: white;
            border: none;
            box-shadow: 0 1px 5px rgba(0,0,0,0.3);
            padding: 5px 8px;
            font-size: 11px;
            pointer-events: none;
          }
          
          .province-label {
            background: transparent;
            border: none;
          }
          
          .province-label-text {
            color: #1e40af;
            font-size: 12px;
            font-weight: bold;
            text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white;
            background-color: rgba(255, 255, 255, 0.5);
            padding: 2px 4px;
            border-radius: 2px;
            white-space: nowrap;
            pointer-events: none;
            text-align: center;
          }
          
          .district-label {
            background: transparent;
            border: none;
          }
          
          .district-label-text {
            color: #4b5563;
            font-size: 10px;
            text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white;
            background-color: rgba(255, 255, 255, 0.4);
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
            pointer-events: none;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};
