import React, { useEffect, useRef, useState } from 'react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface FireItem {
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  percentage?: string | number;
  issueName?: string;
  status?: string;
  [key: string]: unknown;
}

interface KoreaGeoJsonMapProps {
  items: FireItem[];
}

const KoreaGeoJsonMap: React.FC<KoreaGeoJsonMapProps> = ({ items }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Leaflet CSS 로드 확인
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    // 스타일 추가
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes ripple {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(1.7); opacity: 0; }
      }
      .leaflet-container {
        width: 100% !important;
        height: 100% !important;
        z-index: 1;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
      }
      body, html {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleEl);
    
    // 컴포넌트 마운트 후 지연을 주어 DOM이 완전히 로드되도록 함
    const initMapTimer = setTimeout(() => {
      initMap();
    }, 500);  // 500ms 지연으로 증가
    
    return () => {
      clearTimeout(initMapTimer);
    };
  }, []);
  
  // 지도 초기화 함수를 별도로 분리
  const initMap = () => {
    
    // 지도 초기화 및 GeoJSON 로드
    if (mapRef.current && !leafletMapRef.current) {
      // DOM 요소가 완전히 로드되었는지 한 번 더 확인
      if (!mapRef.current) {
        console.error('지도 컨테이너 참조가 없습니다.');
        return; // 빠른 반환
      }
      
      // 지도 컨테이너에 명시적인 크기 지정
      mapRef.current.style.width = '100%';
      mapRef.current.style.height = '100%';

      let map;
      try {
        map = L.map(mapRef.current, {
          center: [36.0, 127.5],
          zoom: 7,
          minZoom: 6,
          maxZoom: 10
        });
      } catch (error) {
        console.error('지도 초기화 오류:', error);
        return; // 오류 발생 시 반환
      }
      
      // 기본 타일 레이어 (선택 사항 - 배경지도로 사용)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        opacity: 0.5  // 반투명하게 설정하여 GeoJSON이 더 잘 보이게 함
      }).addTo(map);
      
      // 한국 전체 경계 설정
      map.fitBounds([
        [33.0, 125.0],  // 남서쪽 경계
        [38.5, 132.0]   // 북동쪽 경계
      ]);
      
      leafletMapRef.current = map;
      
      // GeoJSON 로드
      Promise.all([
        fetch('/assets/map/gadm41_KOR_1.json').then(res => res.json()),
        fetch('/assets/map/gadm41_KOR_2.json').then(res => res.json())
      ])
      .then(([provinces, districts]) => {
        console.log('GeoJSON 데이터 로드 성공:', 
          provinces.features.length, '개 도/시, ',
          districts.features.length, '개 구/군');
        
        // 도/시 경계 표시
        L.geoJSON(provinces, {
          style: {
            color: '#555',
            weight: 2,
            fillColor: '#f8f8f8',
            fillOpacity: 0.1
          },
          onEachFeature: (feature, layer) => {
            // 지역 이름 툴팁 추가
            const name = feature.properties.NAME_1 || '';
            layer.bindTooltip(name, { permanent: false });
          }
        }).addTo(map);
        
        // 구/군 경계 표시
        L.geoJSON(districts, {
          style: {
            color: '#999',
            weight: 1,
            fillColor: '#f8f8f8',
            fillOpacity: 0.05
          }
        }).addTo(map);
        
        // 모든 GeoJSON이 로드된 후 마커 추가
        setTimeout(() => {
        if (map) {
          addMarkers(map, items);
            setIsLoading(false);
        }
      }, 500); // 약간의 지연 추가로 DOM 로딩 시간 확보
      })
      .catch(error => {
        console.error('GeoJSON 로드 오류:', error);
        setError('지도 데이터를 불러오는데 실패했습니다.');
        
        // GeoJSON 로드 실패해도 기본 지도와 마커는 표시
        setTimeout(() => {
          if (map) {
            addMarkers(map, items);
            setIsLoading(false);
          }
        }, 500); // 약간의 지연 추가로 DOM 로딩 시간 확보
      });
    } else if (leafletMapRef.current) {
      // 지도가 이미 초기화된 경우 마커만 업데이트
      setTimeout(() => {
        if (leafletMapRef.current) {
          addMarkers(leafletMapRef.current, items);
        }
      }, 500); // 약간의 지연 추가로 DOM 로딩 시간 확보
    }
  };
    
  // items가 변경되면 마커만 업데이트
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        if (leafletMapRef.current) {
          addMarkers(leafletMapRef.current, items);
        }
      }, 500);
    }
  }, [items]);
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      try {
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(element => {
          if (element.textContent && element.textContent.includes('@keyframes pulse') && document.head.contains(element)) {
            document.head.removeChild(element);
          }
        });
      } catch (error) {
        console.error('스타일 요소 제거 중 오류:', error);
      }
      
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);
  
  // 마커 추가 함수
  const addMarkers = (map: L.Map, fireItems: FireItem[]) => {
    // 맵 객체가 없으면 빠른 반환
    if (!map) {
      console.error("마커 추가 실패: 맵 객체가 없습니다.");
      return;
    }
    
    // 기존 마커 제거
    try {
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
    } catch (error) {
      console.error("기존 마커 제거 오류:", error);
    }
    
    // 기본 위치 (좌표가 없는 경우 사용)
    const defaultLocations = [
      { lat: 37.55, lng: 126.97 }, // 서울
      { lat: 37.45, lng: 126.70 }, // 인천
      { lat: 35.17, lng: 129.07 }, // 부산
      { lat: 35.87, lng: 128.60 }, // 대구
      { lat: 35.16, lng: 126.85 }, // 광주
      { lat: 36.35, lng: 127.38 }, // 대전
      { lat: 35.54, lng: 129.31 }, // 울산
      { lat: 37.75, lng: 128.88 }, // 강릉
      { lat: 36.80, lng: 127.15 }, // 천안
      { lat: 36.57, lng: 128.73 }, // 안동
      { lat: 35.82, lng: 127.15 }, // 전주
      { lat: 33.50, lng: 126.53 }  // 제주
    ];
    
    // 마커 추가
    fireItems.forEach((item, index) => {
      // 좌표가 없으면 기본 위치 사용
      const position = item.coordinates || defaultLocations[index % defaultLocations.length];
      const location = position ? [position.lat, position.lng] : defaultLocations[0];
      
      // 색상 결정
      let color = '#cccccc';
      if (item.issueName) {
        if (item.issueName.includes('3')) color = '#ef4444';
        else if (item.issueName.includes('2')) color = '#f97316';
        else if (item.issueName.includes('1')) color = '#fcd34d';
      }
      
      // 완료 여부 확인
      const isCompleted = item.status === '진화완료' || parseInt(String(item.percentage || '0')) === 100;
      if (isCompleted) color = '#22c55e';
      
      // 마커 HTML 생성
      const markerHtml = `
        <div style="position:relative;">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${color};
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 2px white, 0 0 5px rgba(0,0,0,0.3);
            ${!isCompleted ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            ${item.percentage || 0}%
          </div>
          ${!isCompleted ? `
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${color};
            opacity: 0.4;
            animation: ripple 1.5s infinite;
            z-index: -1;
          "></div>` : ''}
        </div>
      `;
      
      // 마커 추가
      try {
        const marker = L.marker(location as [number, number], {
          icon: L.divIcon({
            html: markerHtml,
            className: 'custom-fire-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }).addTo(map);
        
        // 팝업 추가
        marker.bindPopup(`
          <div style="min-width:200px; padding:5px;">
            <div style="text-align:center; font-weight:bold; margin-bottom:4px; border-bottom:1px solid #eee; padding-bottom:4px">
              ${item.location || '위치 정보 없음'}
            </div>
            <div style="margin:4px 0">단계: <b>${item.issueName || '정보 없음'}</b></div>
            <div style="margin:4px 0">진행률: <b>${item.percentage || 0}%</b></div>
            <div style="margin:4px 0">상태: <b>${item.status || '정보 없음'}</b></div>
          </div>
        `);
      } catch (e) {
        console.error('마커 추가 오류:', e);
      }
    });
    
    try {
      // 기존 범례 제거
      document.querySelectorAll('.legend').forEach(element => {
        element.remove();
      });
      
      // 범례 추가
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '6px 8px';
      div.style.border = '1px solid #ccc';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
      div.innerHTML = `
        <div style="font-weight:bold;margin-bottom:5px">산불 단계</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;align-items:center">
            <div style="width:15px;height:15px;background:#ef4444;margin-right:5px;border:1px solid rgba(0,0,0,0.2)"></div>
            <span>3단계</span>
          </div>
          <div style="display:flex;align-items:center">
            <div style="width:15px;height:15px;background:#f97316;margin-right:5px;border:1px solid rgba(0,0,0,0.2)"></div>
            <span>2단계</span>
          </div>
          <div style="display:flex;align-items:center">
            <div style="width:15px;height:15px;background:#fcd34d;margin-right:5px;border:1px solid rgba(0,0,0,0.2)"></div>
            <span>1단계</span>
          </div>
          <div style="display:flex;align-items:center">
            <div style="width:15px;height:15px;background:#22c55e;margin-right:5px;border:1px solid rgba(0,0,0,0.2)"></div>
            <span>진화완료</span>
          </div>
        </div>
      `;
      return div;
    };
      // 지도가 유효한지 검사
      if (map && map.getContainer && typeof map.getContainer === 'function' && map.getContainer()) {
        legend.addTo(map);
      }
    } catch (error) {
      console.error("범례 추가 오류:", error);
    }
  };
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0 
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ef4444',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1.5s linear infinite'
            }}></div>
            <p style={{ marginTop: '10px', color: '#333' }}>지도를 불러오는 중...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '4px',
          padding: '8px 16px',
          zIndex: 1000,
          color: '#b91c1c',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'block',
          backgroundColor: '#f5f5f5',
          margin: 0,
          padding: 0,
          border: 0
        }}
        id="korea-geojson-map-container"
      ></div>
    </div>
  );
};

export default KoreaGeoJsonMap;