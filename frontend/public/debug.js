// 디버깅 도구
document.addEventListener('DOMContentLoaded', function() {
  console.log('디버깅 도구 초기화 중...');
  
  // 디버깅 컨테이너 추가
  const debugContainer = document.createElement('div');
  debugContainer.style.position = 'fixed';
  debugContainer.style.bottom = '10px';
  debugContainer.style.right = '10px';
  debugContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugContainer.style.color = 'white';
  debugContainer.style.padding = '10px';
  debugContainer.style.fontSize = '12px';
  debugContainer.style.fontFamily = 'monospace';
  debugContainer.style.zIndex = '9999';
  debugContainer.style.maxWidth = '400px';
  debugContainer.style.maxHeight = '300px';
  debugContainer.style.overflow = 'auto';
  debugContainer.style.borderRadius = '5px';
  document.body.appendChild(debugContainer);
  
  // 디버깅 정보 보기/숨기기 토글
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '디버깅 정보 숨기기';
  toggleBtn.style.padding = '5px';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.top = '5px';
  toggleBtn.style.right = '5px';
  toggleBtn.style.zIndex = '9999';
  toggleBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  toggleBtn.style.color = 'white';
  toggleBtn.style.border = 'none';
  toggleBtn.style.borderRadius = '5px';
  toggleBtn.style.cursor = 'pointer';
  
  let isDebugVisible = true;
  toggleBtn.onclick = () => {
    isDebugVisible = !isDebugVisible;
    debugContainer.style.display = isDebugVisible ? 'block' : 'none';
    toggleBtn.textContent = isDebugVisible ? '디버깅 정보 숨기기' : '디버깅 정보 보기';
  };
  
  document.body.appendChild(toggleBtn);
  
  // 로그 함수
  function log(message, type = 'info') {
    const logLine = document.createElement('div');
    logLine.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    logLine.style.paddingBottom = '3px';
    logLine.style.marginBottom = '3px';
    
    switch(type) {
      case 'error':
        logLine.style.color = '#ff5757';
        break;
      case 'success':
        logLine.style.color = '#57ff57';
        break;
      case 'warning':
        logLine.style.color = '#ffff57';
        break;
      default:
        logLine.style.color = 'white';
    }
    
    logLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugContainer.appendChild(logLine);
    debugContainer.scrollTop = debugContainer.scrollHeight;
    console.log(`[DEBUG] ${message}`);
  }
  
  // 페이지 기본 정보 로깅
  log(`페이지 URL: ${window.location.href}`);
  log(`User Agent: ${navigator.userAgent}`);
  
  // 파일 검사
  async function checkFile(path) {
    try {
      log(`파일 검사 중: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length') || 'unknown';
        log(`✅ ${path} (${contentLength} bytes)`, 'success');
        
        // JSON 파일 샘플링
        if (path.endsWith('.json') || path.endsWith('.geojson')) {
          const text = await response.text();
          log(`  - 크기: ${text.length} 바이트`);
          log(`  - 샘플: ${text.slice(0, 50)}...`);
          
          try {
            const json = JSON.parse(text);
            log(`  - 피처 수: ${json.features?.length || 'N/A'}`, 'success');
          } catch (e) {
            log(`  - JSON 파싱 실패: ${e.message}`, 'error');
          }
        }
        
        return true;
      } else {
        log(`❌ ${path} (${response.status}: ${response.statusText})`, 'error');
        return false;
      }
    } catch (e) {
      log(`❌ ${path} 오류: ${e.message}`, 'error');
      return false;
    }
  }
  
  // GeoJSON 파일 검사
  async function checkFiles() {
    log('GeoJSON 파일 검사 중...');
    
    const filesToCheck = [
      '/korea_sigungu_utf8.geojson',
      './korea_sigungu_utf8.geojson',
      '/korea-simplified.geojson'
    ];
    
    for (const path of filesToCheck) {
      await checkFile(path);
    }
    
    log('파일 검사 완료');
  }
  
  // Leaflet 지도 모니터링
  function monitorLeaflet() {
    log('Leaflet 모니터링 시작...');
    
    // 지도 컨테이너 확인
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      log('지도 컨테이너가 없습니다', 'error');
      return;
    }
    
    log(`지도 컨테이너 크기: ${mapContainer.offsetWidth}x${mapContainer.offsetHeight}`);
    
    // Leaflet 로드 확인
    if (typeof L === 'undefined') {
      log('Leaflet이 로드되지 않았습니다', 'error');
      return;
    }
    
    log('Leaflet이 정상적으로 로드되었습니다', 'success');
    
    // 지도 인스턴스 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          const leafletContainer = mapContainer.querySelector('.leaflet-container');
          if (leafletContainer && !monitored) {
            log('Leaflet 지도가 생성되었습니다', 'success');
            monitored = true;
          }
        }
      });
    });
    
    let monitored = false;
    observer.observe(mapContainer, { childList: true, subtree: true });
  }
  
  // 실행
  setTimeout(() => {
    checkFiles();
    monitorLeaflet();
  }, 1000);
  
  // 닫기 버튼
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '디버깅 창 닫기';
  closeBtn.style.marginTop = '10px';
  closeBtn.style.padding = '5px';
  closeBtn.style.width = '100%';
  closeBtn.onclick = () => debugContainer.remove();
  debugContainer.appendChild(closeBtn);
});
