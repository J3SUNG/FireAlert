/**
 * 지도 서비스 추상화를 위한 인터페이스 정의
 * Leaflet 같은 특정 라이브러리 의존성을 추상화
 */

import { ForestFireData } from "../../../shared/types/forestFire";

export interface MapPosition {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface MapBounds {
  southWest: { lat: number; lng: number };
  northEast: { lat: number; lng: number };
}

export interface MarkerOptions {
  isSelected?: boolean;
  zIndex?: number;
  opacity?: number;
  onClick?: (data: any) => void;
}

export interface LayerStyle {
  color: string;
  weight: number;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
  className?: string;
}

export interface MapOptions {
  center: { lat: number; lng: number };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  attributionControl?: boolean;
}

export interface MapService {
  // 초기화 및 기본 작업
  initialize(container: HTMLElement, options: MapOptions): void;
  destroy(): void;
  setView(position: MapPosition): void;
  setBounds(bounds: MapBounds): void;
  
  // 이벤트 관리
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  
  // 레이어 관리
  addMarker(position: MapPosition, data: any, options?: MarkerOptions): string;
  removeMarker(id: string): void;
  updateMarker(id: string, options: MarkerOptions): void;
  
  // GeoJSON 관리
  loadGeoJson(url: string, options?: any): Promise<string>;
  removeGeoJson(id: string): void;
  
  // 유틸리티
  getZoom(): number;
  panTo(position: MapPosition): void;
  
  // 산불 데이터 전용 메서드
  addFireMarker(fire: ForestFireData, options?: MarkerOptions): string;
  updateFireMarker(id: string, isSelected: boolean): void;
}

export interface MapPosition {
  lat: number;
  lng: number;
  zoom?: number;
}

export enum MapEventType {
  CLICK = 'click',
  ZOOM_CHANGE = 'zoomchange',
  DRAG_END = 'dragend',
  LAYER_ADD = 'layeradd',
  LAYER_REMOVE = 'layerremove',
}

// 맵 상태 인터페이스
export interface MapState {
  isLoaded: boolean;
  bounds?: MapBounds;
  center?: MapPosition;
  zoom?: number;
}

// 마커 상태 인터페이스
export interface MarkersState {
  [id: string]: {
    isSelected: boolean;
    data: any;
  };
}