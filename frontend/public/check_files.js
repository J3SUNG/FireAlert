// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async function() {
  // 로그 출력을 위한 요소 생성
  const logElem = document.createElement('div');
  logElem.style.position = 'fixed';
  logElem.style.bottom = '10px';
  logElem.style.right = '10px';
  logElem.style.backgroundColor = 'rgba(0,0,0,0.7)';
  logElem.style.color = 'white';
  logElem.style.padding = '10px';
  logElem.style.borderRadius = '5px';
  logElem.style.maxHeight = '200px';
  logElem.style.overflow = 'auto';
  logElem.style.zIndex = '9999';
  logElem.style.fontSize = '12px';
  logElem.style.fontFamily = 'monospace';
  document.body.appendChild(logElem);
  
  function log(msg) {
    const line = document.createElement('div');
    line.textContent = msg;
    line.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
    line.style.padding = '2px 0';
    logElem.appendChild(line);
    
    // 스크롤을 최하단으로
    logElem.scrollTop = logElem.scrollHeight;
    
    // 콘솔에도 출력
    console.log(msg);
  }
  
  // 초기 정보
  log(`페이지 URL: ${window.location.href}`);
  log(`기본 경로: ${window.location.origin}`);
  
  // GeoJSON 파일 검사
  const filesToCheck = [
    '/korea_sigungu_utf8.geojson',
    './korea_sigungu_utf8.geojson',
    '/korea_sigungu.geojson',
    './korea_sigungu.geojson',
    '/public/korea_sigungu_utf8.geojson',
    '../public/korea_sigungu_utf8.geojson'
  ];
  
  for (const path of filesToCheck) {
    try {
      log(`검사 중: ${path}`);
      const response = await fetch(path);
      
      if (response.ok) {
        const size = response.headers.get('content-length') || 'unknown size';
        log(`✅ ${path} 파일 있음 (${size} bytes)`);
        
        // 간단한 내용 샘플링
        const text = await response.text();
        log(`   - 크기: ${text.length} 바이트, 샘플: ${text.substring(0, 50)}...`);
      } else {
        log(`❌ ${path} 파일 없음 (${response.status}: ${response.statusText})`);
      }
    } catch (error) {
      log(`❌ ${path} 파일 검사 실패: ${error.message}`);
    }
  }
  
  // 5초 후 로그창 닫기 버튼 추가
  setTimeout(() => {
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '닫기';
    closeBtn.style.marginTop = '10px';
    closeBtn.style.padding = '5px';
    closeBtn.onclick = () => logElem.remove();
    logElem.appendChild(closeBtn);
  }, 5000);
});
