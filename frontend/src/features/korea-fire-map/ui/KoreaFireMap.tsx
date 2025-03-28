import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ForestFireData } from '../../../shared/types/forestFire';

interface KoreaFireMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
  onFireSelect?: (fire: ForestFireData) => void;
}

// GeoJSON 타입 정의
interface GeoJSONFeatureProperties {
  CTP_KOR_NM?: string;
  SIG_KOR_NM?: string;
  [key: string]: unknown;
}

interface GeoJSONGeometry {
  type: string;
  coordinates: number[][][] | number[][][][] | number[][][][][];
}

interface GeoJSONFeature {
  type: string;
  properties: GeoJSONFeatureProperties;
  geometry: GeoJSONGeometry;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export const KoreaFireMap: React.FC<KoreaFireMapProps> = ({ fires, selectedFireId, onFireSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapHeight, setMapHeight] = useState('calc(100vh - 96px)'); // 헤더, 푸터 높이 제외

  // Leaflet CSS를 직접 추가
  useEffect(() => {
    // Leaflet CSS를 정상적으로 로드하기 위한 핸들러
    const ensureLeafletStyles = () => {
      // 이미 존재하는 Leaflet CSS 태그 확인
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      
      if (!existingLink) {
        // Leaflet CSS가 로드되지 않은 경우 직접 추가
        console.log('Leaflet CSS 직접 추가함');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
      
      // 추가 필수 CSS 정의
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-container { 
          width: 100%; 
          height: 100%; 
          z-index: 1;
          background-color: #f0f0f0 !important;
        }
        .leaflet-control-container { display: block !important; }
        .leaflet-control-zoom { display: block !important; }
        .leaflet-control-attribution { display: block !important; }
      `;
      document.head.appendChild(style);
    };
    
    ensureLeafletStyles();
  }, []);

  // 화면 크기에 맞게 지도 높이 계산
  useEffect(() => {
    const updateMapHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 48; // 헤더 높이
      const footerHeight = 28; // 푸터 높이
      const availableHeight = windowHeight - headerHeight - footerHeight;
      setMapHeight(`${Math.max(400, availableHeight)}px`);
    };
    
    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    
    return () => {
      window.removeEventListener('resize', updateMapHeight);
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (mapRef.current) {
      return; // 이미 맵이 초기화되었으면 다시 하지 않음
    }

    console.log("지도 초기화 시작");

    if (!mapContainerRef.current) return;

    // 초기 로딩 상태 표시
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          background-color: #f5f5f5;
        ">
          <div style="font-weight: bold; margin-bottom: 10px;">지도를 불러오는 중...</div>
          <div style="
            width: 60px;
            height: 60px;
            border: 6px solid #f3f3f3;
            border-top: 6px solid #ff4d4d;
            border-radius: 50%;
            margin: 0 auto;
            animation: spin 1.5s linear infinite;
          "></div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;
    }

    // 지도 생성
    setTimeout(() => {
      try {
        // 지도 요소 초기화
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }

        // 지도 객체 생성
        const map = L.map(mapContainerRef.current!, {
          center: [36.0, 127.5], // 한국 중심
          zoom: 7,
          zoomControl: true,
          minZoom: 6,
          maxZoom: 10
        });
        
        mapRef.current = map;

        // 타일 레이어 추가
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19
        });

        tileLayer.addTo(map);
        
        // GeoJSON 데이터 로드 및 표시
        const loadGeoJsonData = async () => {
          try {
            const response = await fetch('/korea_sigungu_simplified.geojson');
            if (!response.ok) {
              throw new Error('GeoJSON 데이터를 불러오는데 실패했습니다.');
            }
            
            const geoJsonData: GeoJSONData = await response.json();
            
            // GeoJSON 레이어 추가
            const geoJsonLayer = L.geoJSON(geoJsonData, {
              style: () => ({
                color: '#666',
                weight: 1,
                fillColor: '#f0f0f0',
                fillOpacity: 0.3
              }),
              onEachFeature: (feature, layer) => {
                if (feature.properties) {
                  const sigungu = feature.properties.SIG_KOR_NM || '';
                  const sido = feature.properties.CTP_KOR_NM || '';
                  
                  // 광역시, 특별시 여부 확인
                  const isMetropolitan = 
                    sido.includes('광역시') || 
                    sido.includes('특별시') || 
                    sido.includes('특별자치시');
                  
                  // 광역시/특별시인 경우 시도 이름을 지도에 표시
                  if (isMetropolitan) {
                    const latLng = layer.getBounds().getCenter();
                    const icon = L.divIcon({
                      className: 'sido-label',
                      html: `<div style="
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
                      ">${sido}</div>`,
                      iconSize: [100, 20],
                      iconAnchor: [50, 10]
                    });
                    
                    L.marker(latLng, { 
                      icon: icon, 
                      interactive: false, 
                      keyboard: false 
                    }).addTo(map);
                  }
                  // 일반 시도의 경우 시군구 이름을 지도에 표시
                  else if (sigungu) {
                    const latLng = layer.getBounds().getCenter();
                    const icon = L.divIcon({
                      className: 'sigungu-label',
                      html: `<div style="
                        color: #4b5563;
                        font-size: 10px;
                        text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white;
                        background-color: rgba(255, 255, 255, 0.4);
                        padding: 1px 3px;
                        border-radius: 2px;
                        white-space: nowrap;
                        pointer-events: none;
                        text-align: center;
                      ">${sigungu}</div>`,
                      iconSize: [80, 20],
                      iconAnchor: [40, 10]
                    });
                    
                    L.marker(latLng, { 
                      icon: icon, 
                      interactive: false, 
                      keyboard: false 
                    }).addTo(map);
                  }
                  
                  // 툴팁 설정
                  layer.bindTooltip(`${sido} ${sigungu}`, {
                    direction: 'center',
                    permanent: false,
                    className: 'region-tooltip'
                  });
                  
                  // 마우스 오버 효과
                  layer.on({
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        fillOpacity: 0.5,
                        fillColor: '#e6f2ff'
                      });
                    },
                    mouseout: (e) => {
                      geoJsonLayer.resetStyle(e.target);
                    }
                  });
                }
              }
            }).addTo(map);
            
            // GeoJSON 레이어를 지도 맨 아래에 배치
            geoJsonLayer.bringToBack();
            
            // 마커 추가
            addFireMarkers();
            
            // 지도 로드 완료
            setIsMapLoaded(true);
          } catch (error) {
            console.error('GeoJSON 데이터 로드 오류:', error);
            
            // GeoJSON이 없어도 마커는 추가
            addFireMarkers();
            
            // GeoJSON이 없어도 지도 로드 완료로 표시
            setIsMapLoaded(true);
          }
        };
        
        // 산불 마커 추가 함수
        const addFireMarkers = () => {
          fires.forEach(fire => {
            const { lat, lng } = fire.coordinates;
            
            // 심각도에 따른 색상
            const getColor = (severity: ForestFireData['severity']) => {
              switch (severity) {
                case 'critical': return '#ff0000'; // 빨강
                case 'high': return '#ff8000';     // 주황
                case 'medium': return '#ffff00';   // 노랑
                case 'low': return '#0080ff';      // 파랑
                default: return '#808080';         // 회색
              }
            };
            
            // 심각도에 따른 크기
            const getSize = (severity: ForestFireData['severity']) => {
              switch (severity) {
                case 'critical': return 24;
                case 'high': return 22;
                case 'medium': return 20;
                case 'low': return 18;
                default: return 16;
              }
            };

            // 상태에 따른 색상 (진화완료 시 녹색)
            const color = fire.status === 'extinguished' ? '#4CAF50' : getColor(fire.severity);
            const size = getSize(fire.severity);
            
            // 애니메이션 효과 (진행 중인 산불만)
            const animation = fire.status === 'active' ? 'pulse 1.5s infinite' : '';

            // 마커 HTML
            const markerHtml = `
              <div style="position:relative;">
                <div style="
                  background-color: ${color};
                  width: ${size}px;
                  height: ${size}px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  color: white;
                  font-size: 10px;
                  box-shadow: 0 0 0 2px white, 0 0 5px rgba(0,0,0,0.3);
                  animation: ${animation};
                  z-index: 2;
                ">
                  ${fire.status === 'extinguished' ? '완료' : 
                   fire.status === 'contained' ? '통제' : '진행'}
                </div>
                ${fire.status === 'active' ? `
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: ${size}px;
                  height: ${size}px;
                  border-radius: 50%;
                  background-color: ${color};
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
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                html: markerHtml,
                className: 'custom-fire-marker',
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
              })
            }).addTo(map);

            // 툴팁 추가
            marker.bindTooltip(`
              <div style="min-width:180px;padding:5px;">
                <div style="text-align:center;font-weight:bold;margin-bottom:4px;border-bottom:1px solid #eee;padding-bottom:4px">
                  ${fire.location}
                </div>
                <div style="margin:4px 0">심각도: <b>${
                  fire.severity === 'low' ? '낮음' : 
                  fire.severity === 'medium' ? '중간' : 
                  fire.severity === 'high' ? '높음' : '심각'
                }</b></div>
                <div style="margin:4px 0">상태: <b>${
                  fire.status === 'active' ? '진행중' : 
                  fire.status === 'contained' ? '통제중' : '진화완료'
                }</b></div>
                <div style="margin:4px 0">영향 면적: <b>${fire.affectedArea}ha</b></div>
              </div>
            `, {
              direction: 'top',
              className: 'fire-tooltip'
            });
            
            // 마커 클릭 이벤트
            marker.on('click', () => {
              if (onFireSelect) {
                onFireSelect(fire);
              }
            });
            
            // 마커 레퍼런스 저장
            markersRef.current[fire.id] = marker;
          });
        };

        // GeoJSON 데이터 로드 호출
        loadGeoJsonData();

        // 한국 전체 범위 설정
        const koreanBounds = L.latLngBounds(
          L.latLng(33.0, 125.0),  // 남서
          L.latLng(38.0, 131.0)   // 북동
        );
        map.fitBounds(koreanBounds);

        // 지도 범례 추가
        const legendControl = L.control({ position: 'bottomright' });
        legendControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'info legend');
          div.style.backgroundColor = 'white';
          div.style.padding = '6px 8px';
          div.style.border = '1px solid #ccc';
          div.style.borderRadius = '4px';
          div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
          div.innerHTML = `
            <div style="font-weight:bold;margin-bottom:5px">산불 심각도</div>
            <div style="display:flex;flex-direction:column;gap:5px">
              <div style="display:flex;align-items:center">
                <div style="width:15px;height:15px;background:#ff0000;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
                <span>심각</span>
              </div>
              <div style="display:flex;align-items:center">
                <div style="width:15px;height:15px;background:#ff8000;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
                <span>높음</span>
              </div>
              <div style="display:flex;align-items:center">
                <div style="width:15px;height:15px;background:#ffff00;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
                <span>중간</span>
              </div>
              <div style="display:flex;align-items:center">
                <div style="width:15px;height:15px;background:#0080ff;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
                <span>낮음</span>
              </div>
              <div style="display:flex;align-items:center">
                <div style="width:15px;height:15px;background:#4CAF50;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
                <span>진화완료</span>
              </div>
            </div>
          `;
          return div;
        };
        legendControl.addTo(map);

        console.log("지도 생성 완료");
      } catch (error) {
        console.error("지도 그리기 오류:", error);
        
        // 오류 발생 시 오류 UI 표시
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              width: 100%;
              background-color: rgba(255,248,248,0.95);
              padding: 20px;
            ">
              <div style="color: #d32f2f; font-size: 24px; margin-bottom: 10px;">
                ⚠️
              </div>
              <div style="font-weight: bold; margin-bottom: 10px; color: #d32f2f;">지도 로드 오류</div>
              <div style="margin-bottom: 15px; text-align: center;">지도를 불러오는 중 문제가 발생했습니다.</div>
              <button id="retryMapButton" style="
                background-color: #ff4d4d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">
                다시 시도
              </button>
            </div>
          `;
          
          // 다시 시도 버튼에 이벤트 리스너 추가
          document.getElementById('retryMapButton')?.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }
    }, 500);

    // 컴포넌트 언마운트 시 클린업
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [fires, onFireSelect]);

  // 선택된 산불 처리
  useEffect(() => {
    if (!selectedFireId || !markersRef.current[selectedFireId] || !mapRef.current || !isMapLoaded) return;
    
    const marker = markersRef.current[selectedFireId];
    
    // 해당 마커의 팝업 열기
    marker.openTooltip();
    
    // 선택된 마커의 위치로 지도 중심 이동
    const fire = fires.find(f => f.id === selectedFireId);
    if (fire) {
      mapRef.current.setView([fire.coordinates.lat, fire.coordinates.lng], 9);
    }
  }, [selectedFireId, fires, isMapLoaded]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        className="w-full border rounded-lg shadow-md"
        style={{
          height: mapHeight
        }}
      />
      {/* 로딩 표시기는 mapContainerRef 내부에서 처리됨 */}
    </div>
  );
};
