import L from 'leaflet';

/**
 * 맵 생성 및 초기화를 위한 유틸리티 클래스
 */
export class MapCreator {
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;
  private markersLayer: L.LayerGroup | null = null;

  /**
   * 지정된 HTML 요소에 맵을 초기화합니다.
   * @param element 맵을 그릴 HTML 요소
   * @param center 초기 중심 좌표 [위도, 경도]
   * @param zoom 초기 줌 레벨
   * @returns 생성된 Leaflet 맵 인스턴스
   */
  public initializeMap(
    element: HTMLElement, 
    center: [number, number] = [36.5, 127.8],
    zoom: number = 7
  ): L.Map {
    // 이미 맵이 초기화된 경우, 기존 맵을 제거
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.geoJsonLayer = null;
      this.markersLayer = null;
    }
    
    try {
      // 맵 생성
      const map = L.map(element, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true  // 퍼포먼스 향상을 위해 Canvas 렌더러 사용
      });
      
      // 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        opacity: 0.6
      }).addTo(map);
      
      // 마커 레이어 그룹 생성
      this.markersLayer = L.layerGroup().addTo(map);
      
      // 맵 인스턴스 저장
      this.map = map;
      
      return map;
    } catch (error) {
      console.error('맵 초기화 오류:', error);
      throw error;
    }
  }

  /**
   * GeoJSON 데이터를 불러와 맵에 표시합니다.
   * @param mapInstance Leaflet 맵 인스턴스
   * @param geoJsonPath GeoJSON 파일 경로
   * @returns Promise<L.GeoJSON> 로드된 GeoJSON 레이어
   */
  public async loadGeoJSON(mapInstance: L.Map, geoJsonPath: string): Promise<L.GeoJSON> {
    try {
      // 기존 GeoJSON 레이어가 있으면 제거
      if (this.geoJsonLayer) {
        mapInstance.removeLayer(this.geoJsonLayer);
        this.geoJsonLayer = null;
      }
      
      // GeoJSON 데이터 가져오기
      const response = await fetch(geoJsonPath);
      if (!response.ok) {
        throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`);
      }
      
      const geoData = await response.json();
      
      // 유효한 GeoJSON 데이터인지 확인
      if (!geoData || !geoData.type || !geoData.features) {
        throw new Error('Invalid GeoJSON format');
      }
      
      // 새 GeoJSON 레이어 생성 시도
      return new Promise((resolve, reject) => {
        try {
          // 지연을 주어 DOM 렌더링 완료 후 처리
          setTimeout(() => {
            try {
              // 새 GeoJSON 레이어 생성
              const geoJsonLayer = L.geoJSON(geoData, {
                style: {
                  color: "#222",
                  weight: 1,
                  fillColor: "#e5e7eb",
                  fillOpacity: 0.5
                },
                onEachFeature: (feature, layer) => {
                  // 툴팁 추가
                  const name = feature.properties?.SIG_KOR_NM || 
                              feature.properties?.name || 
                              feature.properties?.CTP_KOR_NM ||
                              '';
                  if (name) {
                    layer.bindTooltip(name, { permanent: false });
                  }
                }
              }).addTo(mapInstance);
              
              // GeoJSON 레이어 참조 저장
              this.geoJsonLayer = geoJsonLayer;
              resolve(geoJsonLayer);
            } catch (error) {
              reject(error);
            }
          }, 100);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
      throw error;
    }
  }

  /**
   * 맵 인스턴스를 반환합니다.
   * @returns 현재 맵 인스턴스
   */
  public getMap(): L.Map | null {
    return this.map;
  }

  /**
   * GeoJSON 레이어를 반환합니다.
   * @returns 현재 GeoJSON 레이어
   */
  public getGeoJsonLayer(): L.GeoJSON | null {
    return this.geoJsonLayer;
  }

  /**
   * 마커 레이어를 반환합니다.
   * @returns 현재 마커 레이어 그룹
   */
  public getMarkersLayer(): L.LayerGroup | null {
    return this.markersLayer;
  }

  /**
   * 모든 리소스를 정리합니다.
   */
  public cleanup(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.geoJsonLayer = null;
    this.markersLayer = null;
  }
}

// 싱글톤 인스턴스 생성
export const mapCreator = new MapCreator();
