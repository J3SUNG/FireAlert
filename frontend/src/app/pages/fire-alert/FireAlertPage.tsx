import React, { useState } from 'react';
import { ForestFireList } from '../../../features/forest-fire-list/ui/ForestFireList';
import { SAMPLE_FOREST_FIRE_DATA } from '../../../shared/types/forestFire';
import KoreaGeoJsonMap from '../../../features/map/ui/KoreaGeoJsonMap';

// 인라인 스타일 정의
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: 0
  },
  header: {
    padding: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    minHeight: '64px',
    zIndex: 10
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logoIcon: {
    fontSize: '24px',
    marginRight: '8px',
    color: '#dc2626'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  fireText: {
    color: '#dc2626'
  },
  filterContainer: {
    display: 'flex',
    gap: '8px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
    backgroundColor: '#e5e7eb',
    color: '#4b5563'
  },
  buttonActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  buttonActiveRed: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  buttonActiveOrange: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  buttonActiveGreen: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  timestamp: {
    fontSize: '14px',
    color: '#6b7280'
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: 'calc(100vh - 64px)', // 상단바 높이 64px 제외
    position: 'relative',
    margin: 0,
    padding: 0,
    minHeight: 0,
    maxHeight: 'calc(100vh - 64px)'
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    margin: 0,
    padding: 0
  },
  sidebar: {
    width: '384px',
    backgroundColor: '#ffffff',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.05)',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10
  },
  sidebarHeader: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  sidebarSubtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  sidebarContent: {
    overflowY: 'auto' as const,
    flex: 1
  },
  footer: {
    display: 'none' // 푸터 숨김
  },
};

const FireAlertPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'contained' | 'extinguished'>('all');
  
  // 필터링된 데이터
  const filteredData = SAMPLE_FOREST_FIRE_DATA.filter(fire => {
    if (selectedFilter === 'all') return true;
    return fire.status === selectedFilter;
  });
  
  // 버튼 스타일 계산 함수
  const getButtonStyle = (filter: 'all' | 'active' | 'contained' | 'extinguished') => {
    if (filter === selectedFilter) {
      if (filter === 'all') return { ...styles.button, ...styles.buttonActive };
      if (filter === 'active') return { ...styles.button, ...styles.buttonActiveRed };
      if (filter === 'contained') return { ...styles.button, ...styles.buttonActiveOrange };
      if (filter === 'extinguished') return { ...styles.button, ...styles.buttonActiveGreen };
    }
    return styles.button;
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 - 로고와 필터 */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>🔥</div>
          <h1 style={styles.logoText}>
            <span style={styles.fireText}>Fire</span>Alert
          </h1>
        </div>
        
        <div style={styles.filterContainer}>
          <button 
            style={getButtonStyle('all')}
            onClick={() => setSelectedFilter('all')}
          >
            전체
          </button>
          <button 
            style={getButtonStyle('active')}
            onClick={() => setSelectedFilter('active')}
          >
            진행중
          </button>
          <button 
            style={getButtonStyle('contained')}
            onClick={() => setSelectedFilter('contained')}
          >
            통제중
          </button>
          <button 
            style={getButtonStyle('extinguished')}
            onClick={() => setSelectedFilter('extinguished')}
          >
            진화완료
          </button>
        </div>
        
        <div style={styles.timestamp}>
          최종 업데이트: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </header>
      
      {/* 메인 컨텐츠 영역 - 지도와 사이드바 */}
      <div style={styles.content}>
        {/* 지도 영역 */}
        <div style={styles.mapContainer}>
          <KoreaGeoJsonMap 
            items={filteredData.map(fire => ({
              location: fire.location,
              coordinates: fire.coordinates,
              issueName: fire.severity === 'low' ? '1단계' : 
                        fire.severity === 'medium' ? '2단계' : 
                        fire.severity === 'high' ? '3단계' : '3단계',
              percentage: fire.status === 'extinguished' ? 100 : 
                        fire.status === 'contained' ? 60 : 30,
              status: fire.status === 'extinguished' ? '진화완료' : 
                    fire.status === 'contained' ? '통제중' : '진행중'
            }))} 
          />
        </div>
        
        {/* 우측 사이드바 - 산불 현황 */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>산불 데이터 현황</h2>
            <p style={styles.sidebarSubtitle}>
              현재 {filteredData.length}건의 산불 정보가 표시되고 있습니다.
            </p>
          </div>
          
          <div style={styles.sidebarContent}>
            <ForestFireList 
              fires={filteredData} 
              showFilter={false} 
            />
          </div>
          
          <div style={styles.footer}>
            © 2025 <span style={styles.fireText}>Fire</span>Alert - 한국 산불 정보 시스템
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireAlertPage;