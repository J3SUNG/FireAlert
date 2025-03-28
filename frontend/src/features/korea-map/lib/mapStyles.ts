// 지도 스타일 정의
import L from 'leaflet';

// GeoJSON 스타일 (시군구 레이어)
export const districtLayerStyle: L.PathOptions = {
  color: '#666',
  weight: 0.8,
  opacity: 0.6,
  fillColor: '#f5f5f5',
  fillOpacity: 0.1
};

// GeoJSON 마우스오버 스타일
export const districtHoverStyle: L.PathOptions = {
  fillOpacity: 0.3,
  fillColor: '#ffe6b3'
};

// 시군구 라벨 스타일
export const createDistrictLabelIcon = (name: string): L.DivIcon => {
  return L.divIcon({
    className: 'district-label',
    html: `<div class="district-label-text">${name}</div>`,
    iconSize: [80, 20],
    iconAnchor: [40, 10]
  });
};

// 광역시/도 라벨 스타일
export const createProvinceLabelIcon = (name: string): L.DivIcon => {
  return L.divIcon({
    className: 'province-label',
    html: `<div class="province-label-text">${name}</div>`,
    iconSize: [100, 20],
    iconAnchor: [50, 10]
  });
};

// 툴팁 옵션
export const districtTooltipOptions: L.TooltipOptions = {
  permanent: false,
  direction: 'center',
  className: 'district-tooltip',
  opacity: 0.9
};

// 산불 툴팁 옵션
export const fireTooltipOptions: L.TooltipOptions = {
  permanent: false,
  direction: 'top',
  className: 'fire-tooltip',
  opacity: 0.9
};

// 산불 팝업 옵션
export const firePopupOptions: L.PopupOptions = {
  maxWidth: 300
};

// CSS 스타일
export const mapStyles = `
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

  .leaflet-container {
    background-color: #f5f5f5 !important;
    height: 100%;
    width: 100%;
  }
`;
