import L from 'leaflet';

/**
 * 산불 심각도 범례 컨트롤을 생성하는 유틸리티 함수
 */
export function createLegendControl(position: L.ControlPosition = 'bottomleft'): L.Control {
  const legendControl = new L.Control({ position });
  
  legendControl.onAdd = function(): HTMLElement {
    const div = L.DomUtil.create("div", "map-legend");
    
    div.innerHTML = `
      <h4 class="map-legend__title">산불 심각도</h4>
      <div class="map-legend__item">
        <div class="map-legend__icon map-legend__icon--critical"></div>
        <span>심각</span>
      </div>
      <div class="map-legend__item">
        <div class="map-legend__icon map-legend__icon--high"></div>
        <span>높음</span>
      </div>
      <div class="map-legend__item">
        <div class="map-legend__icon map-legend__icon--medium"></div>
        <span>중간</span>
      </div>
      <div class="map-legend__item">
        <div class="map-legend__icon map-legend__icon--low"></div>
        <span>낮음</span>
      </div>
    `;
    
    return div;
  };
  
  return legendControl;
}
