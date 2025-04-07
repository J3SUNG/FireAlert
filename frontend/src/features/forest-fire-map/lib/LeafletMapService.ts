import L from "leaflet";
import {
  MapService,
  MapOptions,
  MapPosition,
  MapBounds,
  MarkerOptions,
  // LayerStyle - 사용되지 않음
  MapEventType,
} from "../model/mapTypes";
import { ForestFireData } from "../../../shared/model/forestFire";
import { createFireMarker } from "./markerUtils";

/**
 * Leaflet 구현체 - MapService 인터페이스 구현
 */
export class LeafletMapService implements MapService {
  private map: L.Map | null = null;
  private markers: Record<string, L.LayerGroup> = {};
  private geoJsonLayers: Record<string, L.GeoJSON> = {};
  private eventHandlers: Record<string, Set<(...args: any[]) => void>> = {};
  private nextMarkerId = 1;
  private nextLayerId = 1;

  initialize(container: HTMLElement, options: MapOptions): void {
    if (this.map) {
      this.destroy();
    }

    try {
      // Leaflet 맵 인스턴스 생성
      this.map = L.map(container, {
        center: [options.center.lat, options.center.lng],
        zoom: options.zoom,
        minZoom: options.minZoom,
        maxZoom: options.maxZoom,
        zoomControl: options.zoomControl !== false,
        attributionControl: options.attributionControl !== false,
      });

      // 이벤트 핸들러 설정
      this.setupEventHandlers();
    } catch (error) {
      console.error("Leaflet map initialization error:", error);
      throw new Error("Failed to initialize map");
    }
  }

  destroy(): void {
    // 이벤트 핸들러 제거
    this.removeAllEventHandlers();

    // 맵 인스턴스 제거
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // 상태 초기화
    this.markers = {};
    this.geoJsonLayers = {};
    this.nextMarkerId = 1;
    this.nextLayerId = 1;
  }

  setView({ lat, lng, zoom }: MapPosition): void {
    if (!this.map) return;

    const currentZoom = this.map.getZoom();
    this.map.setView([lat, lng], zoom || currentZoom);
  }

  setBounds(bounds: MapBounds): void {
    if (!this.map) return;

    const latLngBounds = L.latLngBounds(
      [bounds.southWest.lat, bounds.southWest.lng],
      [bounds.northEast.lat, bounds.northEast.lng]
    );

    this.map.setMaxBounds(latLngBounds);
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.map) return;

    // 이벤트 핸들러 매핑
    const leafletEvent = this.mapToLeafletEvent(event);

    // 핸들러 래핑 (Leaflet 이벤트 구조에 맞게)
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
    };

    // 이벤트 등록
    this.map.on(leafletEvent, wrappedHandler);

    // 핸들러 저장 (나중에 제거하기 위해)
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = new Set();
    }
    this.eventHandlers[event].add(wrappedHandler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (!this.map) return;

    const leafletEvent = this.mapToLeafletEvent(event);

    if (handler && this.eventHandlers[event]) {
      // 특정 핸들러 제거
      this.map.off(leafletEvent, handler);
      this.eventHandlers[event].delete(handler);
    } else if (this.eventHandlers[event]) {
      // 해당 이벤트의 모든 핸들러 제거
      this.eventHandlers[event].forEach((h) => {
        this.map?.off(leafletEvent, h);
      });
      delete this.eventHandlers[event];
    }
  }

  addMarker(position: MapPosition, data: any, options: MarkerOptions = {}): string {
    if (!this.map) throw new Error("Map is not initialized");

    // 마커 ID 생성
    const id = `marker-${this.nextMarkerId++}`;

    // 기본 마커 생성
    const marker = L.marker([position.lat, position.lng], {
      zIndexOffset: options.isSelected ? 1000 : 0,
      opacity: options.opacity || 1,
    });

    // 클릭 이벤트 등록
    if (options.onClick) {
      marker.on("click", () => {
        if (options.onClick) {
          options.onClick(data);
        }
      });
    }

    // 레이어 그룹 생성 후 맵에 추가
    const layerGroup = L.layerGroup([marker]);
    layerGroup.addTo(this.map);

    // 마커 저장
    this.markers[id] = layerGroup;

    return id;
  }

  removeMarker(id: string): void {
    if (!this.map) return;

    const marker = this.markers[id];
    if (marker) {
      marker.removeFrom(this.map);
      delete this.markers[id];
    }
  }

  updateMarker(id: string, _options: MarkerOptions): void {
    if (!this.map) return;

    // 기존 마커 제거 후 새로 생성 (Leaflet은 직접적인 마커 업데이트가 제한적)
    const marker = this.markers[id];
    if (marker) {
      marker.removeFrom(this.map);

      // 새 마커 생성 로직이 필요하지만 데이터가 없어 구현 제한적
    }
  }

  async loadGeoJson(url: string, _options: any = {}): Promise<string> {
    if (!this.map) throw new Error("Map is not initialized");

    try {
      // GeoJSON 데이터 가져오기
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
      }

      const data = await response.json();

      // GeoJSON 레이어 생성
      const layer = L.geoJSON(data, {
        style: _options.style || {},
        onEachFeature: _options.onEachFeature,
      });

      // 맵에 추가
      if (_options.addToMap !== false) {
        layer.addTo(this.map);
      }

      // ID 생성 및 저장
      const id = `geojson-${this.nextLayerId++}`;
      this.geoJsonLayers[id] = layer;

      return id;
    } catch (error) {
      console.error("Error loading GeoJSON:", error);
      throw error;
    }
  }

  removeGeoJson(id: string): void {
    if (!this.map) return;

    const layer = this.geoJsonLayers[id];
    if (layer) {
      layer.removeFrom(this.map);
      delete this.geoJsonLayers[id];
    }
  }

  getZoom(): number {
    if (!this.map) return 0;
    return this.map.getZoom();
  }

  panTo(position: MapPosition): void {
    if (!this.map) return;
    this.map.panTo([position.lat, position.lng]);
  }

  addFireMarker(fire: ForestFireData, options: MarkerOptions = {}): string {
    if (!this.map) throw new Error("Map is not initialized");

    // 마커 ID 사용 (산불 ID 사용)
    const id = fire.id;

    // createFireMarker 유틸리티 사용
    const marker = createFireMarker(fire, {
      isSelected: options.isSelected || false,
      onClick: (selectedFire) => {
        if (options.onClick) {
          options.onClick(selectedFire);
        }
      },
      map: this.map,
    });

    // 맵에 추가
    marker.addTo(this.map);

    // 마커 저장
    this.markers[id] = marker;

    return id;
  }

  updateFireMarker(id: string, _isSelected: boolean): void {
    if (!this.map) return;

    // 기존 마커 찾기
    const marker = this.markers[id];
    if (marker && this.map) {
      // 기존 마커 제거
      marker.removeFrom(this.map);

      // 새로운 마커는 해당 함수를 호출한 곳에서 addFireMarker로 추가해야 함
    }
  }

  private mapToLeafletEvent(event: string): string {
    // 이벤트 매핑
    const eventMap: Record<string, string> = {
      [MapEventType.CLICK]: "click",
      [MapEventType.ZOOM_CHANGE]: "zoomend",
      [MapEventType.DRAG_END]: "dragend",
      [MapEventType.LAYER_ADD]: "layeradd",
      [MapEventType.LAYER_REMOVE]: "layerremove",
    };

    return eventMap[event] || event;
  }

  private setupEventHandlers(): void {
    // 기본 이벤트 핸들러 설정
  }

  private removeAllEventHandlers(): void {
    if (!this.map) return;

    // 모든 이벤트 핸들러 제거
    Object.entries(this.eventHandlers).forEach(([event, handlers]) => {
      const leafletEvent = this.mapToLeafletEvent(event);
      handlers.forEach((handler) => {
        this.map?.off(leafletEvent, handler);
      });
    });

    this.eventHandlers = {};
  }
}
