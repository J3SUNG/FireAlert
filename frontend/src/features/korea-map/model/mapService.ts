import L from 'leaflet';
import { ForestFireData } from '../../../shared/types/forestFire';
import { GeoJSONData } from '../lib/types';
import { 
  createFireMarkerHtml, 
  createFirePopupHtml, 
  createFireTooltipHtml,
  getSeveritySize
} from '../lib/mapUtils';
import { 
  districtLayerStyle, 
  districtHoverStyle,
  createDistrictLabelIcon,
  createProvinceLabelIcon,
  districtTooltipOptions,
  fireTooltipOptions,
  firePopupOptions
} from '../lib/mapStyles';

// 지도 서비스 - 지도 관련 로직을 캡슐화
export class MapService {
  private map: L.Map | null = null;
  private districtLayer: L.GeoJSON | null = null;
  private markers: Record<string, L.Marker> = {};
  private geoJsonData: GeoJSONData | null = null;

  // 지도 초기화
  initMap(container: HTMLElement): L.Map {
    // 지도 객체 생성
    this.map = L.map(container, {
      center: [36.0, 127.7], // 한국 중심점
      zoom: 7,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
      // 부드러운 확대/축소를 위한 설정
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 120
    });

    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // 줌 컨트롤 위치 설정
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    return this.map;
  }

  // GeoJSON 데이터 로드
  async loadGeoJsonData(): Promise<GeoJSONData | null> {
    try {
      // 여러 가능한 경로 시도
      const possiblePaths = [
        '/korea_sigungu_simplified.geojson',
        '/assets/map/gadm41_KOR_2.json',
        '/assets/map/korea_sigungu_simplified.geojson'
      ];

      let response: Response | null = null;
      let successPath = '';

      // 가능한 모든 경로 시도
      for (const path of possiblePaths) {
        try {
          console.log(`GeoJSON 파일 로드 시도: ${path}`);
          const tempResponse = await fetch(path);
          if (tempResponse.ok) {
            response = tempResponse;
            successPath = path;
            console.log(`GeoJSON 파일 로드 성공: ${path}`);
            break;
          }
        } catch (e) {
          console.log(`${path} 경로 실패, 다음 경로 시도`);
        }
      }

      if (!response) {
        // 모든 경로가 실패한 경우 대체 데이터 사용
        console.log("모든 GeoJSON 로드 시도 실패. 기본 마커만 표시합니다.");
        return null;
      }

      this.geoJsonData = await response.json();
      console.log(`${successPath}에서 GeoJSON 데이터 로드 성공`);
      return this.geoJsonData;
    } catch (error) {
      console.error("한국 GeoJSON 로드 실패:", error);
      return null;
    }
  }

  // 시군구 레이어 추가
  addDistrictLayer(geoJsonData: GeoJSONData): void {
    if (!this.map) return;

    // 시군구 이름과 중심점 저장용 맵
    const districtLabels = new Map<string, L.LatLng>();
    
    // 시군구 레이어 추가
    this.districtLayer = L.geoJSON(geoJsonData, {
      style: districtLayerStyle,
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          // 시도명과 시군구명 (프로퍼티명이 다를 수 있으므로 여러 가능성 확인)
          const provinceName = 
            feature.properties.NAME_1 || 
            feature.properties.CTP_KOR_NM || 
            '';
          const districtName = 
            feature.properties.NAME_2 || 
            feature.properties.SIG_KOR_NM || 
            '';
          const latLng = layer.getBounds().getCenter();
          
          // 광역시/특별시 여부 확인
          const isMetropolitan = 
            provinceName.includes('광역시') || 
            provinceName.includes('특별시') || 
            provinceName.includes('특별자치시');
          
          // 일반 시도의 경우 시군구명 라벨 보여주기 위해 저장
          if (!isMetropolitan && districtName) {
            districtLabels.set(districtName, latLng);
          }
          
          // 광역시/특별시인 경우 해당 이름 표시
          if (isMetropolitan) {
            // 광역시 라벨 생성
            const icon = createProvinceLabelIcon(provinceName);
            
            L.marker(latLng, { 
              icon: icon, 
              interactive: false, 
              keyboard: false 
            }).addTo(this.map!);
          }
          
          // 툴팁 설정
          const tooltipText = isMetropolitan 
            ? provinceName 
            : `${districtName} (${provinceName})`;
              
          layer.bindTooltip(tooltipText, districtTooltipOptions);
          
          // 마우스 오버 효과
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle(districtHoverStyle);
            },
            mouseout: (e) => {
              this.districtLayer?.resetStyle(e.target);
            }
          });
        }
      }
    }).addTo(this.map);
    
    // 시군구 이름 라벨 추가 (광역시가 아닌 지역만)
    districtLabels.forEach((latLng, name) => {
      const icon = createDistrictLabelIcon(name);
      
      L.marker(latLng, { 
        icon: icon, 
        interactive: false,
        keyboard: false 
      }).addTo(this.map!);
    });
  }

  // 산불 마커 추가
  addFireMarkers(fires: ForestFireData[]): void {
    if (!this.map) return;

    // 기존 마커 정리
    Object.values(this.markers).forEach(marker => {
      marker.remove();
    });
    this.markers = {};

    // 한국 전체 범위 설정 (지도가 비어있을 때 보여줄 기본 영역)
    const koreanBounds = L.latLngBounds(
      L.latLng(33.0, 125.0),  // 남서
      L.latLng(38.0, 131.0)   // 북동
    );
    this.map.fitBounds(koreanBounds);

    // 새 마커 추가
    fires.forEach(fire => {
      const { lat, lng } = fire.coordinates;
      const markerHtml = createFireMarkerHtml(fire.severity, fire.status);
      const severitySize = getSeveritySize(fire.severity);
      
      // 마커 아이콘 설정
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [severitySize, severitySize],
        iconAnchor: [severitySize/2, severitySize/2]
      });
      
      // 마커 생성 및 추가
      const marker = L.marker([lat, lng], { icon }).addTo(this.map!);
      
      // 툴팁 설정
      marker.bindTooltip(createFireTooltipHtml(fire), fireTooltipOptions);
      
      // 팝업 설정
      marker.bindPopup(createFirePopupHtml(fire), firePopupOptions);
      
      // 마커 레퍼런스 저장
      this.markers[fire.id] = marker;
    });
  }

  // 마커 선택
  selectFire(fireId: string): void {
    if (!this.map || !this.markers[fireId]) return;
    
    const marker = this.markers[fireId];
    marker.openPopup();
  }

  // 지도 정리
  cleanup(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

// 싱글톤으로 내보내기
export const mapService = new MapService();
