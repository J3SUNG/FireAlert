import { ForestFireData } from '../../../shared/types/forestFire';
import L from 'leaflet';

// 산불 심각도에 따른 마커 색상
export const getSeverityColor = (severity: ForestFireData['severity']): string => {
  switch (severity) {
    case 'critical': return '#ff0000'; // 빨강
    case 'high': return '#ff8000';     // 주황
    case 'medium': return '#ffff00';   // 노랑
    case 'low': return '#0080ff';      // 파랑
    default: return '#808080';         // 회색
  }
};

// 산불 심각도에 따른 마커 크기
export const getSeveritySize = (severity: ForestFireData['severity']): number => {
  switch (severity) {
    case 'critical': return 28;
    case 'high': return 25;
    case 'medium': return 22;
    case 'low': return 20;
    default: return 15;
  }
};

// 심각도 한글 라벨
export const getSeverityLabel = (severity: ForestFireData['severity']): string => {
  switch (severity) {
    case 'low': return '낮음';
    case 'medium': return '중간';
    case 'high': return '높음';
    case 'critical': return '심각';
    default: return '알 수 없음';
  }
};

// 상태 한글 라벨
export const getStatusLabel = (status: ForestFireData['status']): string => {
  switch (status) {
    case 'active': return '진행중';
    case 'contained': return '통제중';
    case 'extinguished': return '진화완료';
    default: return '알 수 없음';
  }
};

// 지도 범례 생성 함수
export const createMapLegend = (): L.Control => {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white';
    div.style.padding = '8px';
    div.style.borderRadius = '5px';
    div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    div.style.fontSize = '12px';
    
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
      </div>
      <div style="margin-top:8px;font-weight:bold;margin-bottom:5px">산불 상태</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center">
          <div style="width:15px;height:15px;position:relative;margin-right:5px">
            <div style="width:12px;height:12px;background:#ff0000;border-radius:50%;position:absolute;top:0;left:0;animation:pulse 1.5s infinite"></div>
          </div>
          <span>진행중</span>
        </div>
        <div style="display:flex;align-items:center">
          <div style="width:15px;height:15px;background:#ff8000;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
          <span>통제중</span>
        </div>
        <div style="display:flex;align-items:center">
          <div style="width:15px;height:15px;background:#4CAF50;margin-right:5px;border-radius:50%;border:1px solid rgba(0,0,0,0.2)"></div>
          <span>진화완료</span>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform:scale(1); opacity:1; }
          50% { transform:scale(1.2); opacity:0.7; }
          100% { transform:scale(1); opacity:1; }
        }
      </style>
    `;
    
    return div;
  };
  
  return legend;
};

// 산불 마커 HTML 생성 함수
export const createFireMarkerHtml = (severity: ForestFireData['severity'], status: ForestFireData['status']): string => {
  const severityColor = getSeverityColor(severity);
  const severitySize = getSeveritySize(severity);
  
  // 상태에 따른 색상 (심각도 색상 우선, 진화완료시에만 녹색)
  const color = status === 'extinguished' ? '#4CAF50' : severityColor;
  
  return `<div style="
    background-color: ${color}; 
    width: ${severitySize}px; 
    height: ${severitySize}px; 
    border-radius: 50%; 
    border: 3px solid white;
    box-shadow: 0 0 6px rgba(0,0,0,0.5);
    ${status === 'active' ? 'animation: pulse 1.5s infinite;' : ''}
  "></div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  </style>`;
};

// 산불 툴팁 HTML 생성 함수
export const createFireTooltipHtml = (fire: ForestFireData): string => {
  return `
    <div style="font-weight: bold;">${fire.location}</div>
    <div>${getSeverityLabel(fire.severity)} - ${getStatusLabel(fire.status)}</div>
  `;
};

// 산불 팝업 HTML 생성 함수
export const createFirePopupHtml = (fire: ForestFireData): string => {
  return `
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
  `;
};
