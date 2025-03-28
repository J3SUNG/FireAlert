import React, { useState, useEffect } from 'react';
import { ForestFireList } from '../../../features/forest-fire-list/ui/ForestFireList';
import { ForestFireData } from '../../../shared/types/forestFire';
import { ModifiedForestFireMap } from '../../../features/forest-fire-map';
import { forestFireService, getForestFireStatistics } from '../../../shared/services/forestFireService';

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
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: '#f8fafc'
  },
  header: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    minHeight: '64px',
    zIndex: 10,
    borderBottom: '1px solid #e5e7eb'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoIcon: {
    fontSize: '28px',
    marginRight: '8px',
    color: '#dc2626'
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  fireText: {
    color: '#dc2626'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginLeft: '12px',
    letterSpacing: '-0.3px',
    fontWeight: '500'
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    background: '#f3f4f6',
    padding: '4px',
    borderRadius: '24px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    color: '#4b5563'
  },
  buttonActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.4)'
  },
  buttonActiveRed: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
  },
  buttonActiveOrange: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.4)'
  },
  buttonActiveGreen: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(34, 197, 94, 0.4)'
  },
  timestamp: {
    fontSize: '14px',
    color: '#64748b',
    background: '#f8fafc',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: '500'
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
    position: 'relative',
    overflow: 'hidden'
  },
  sidebar: {
    width: '350px',
    backgroundColor: '#ffffff',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.05)',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 5
  },
  sidebarHeader: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#111827',
    letterSpacing: '-0.5px'
  },
  sidebarSubtitle: {
    fontSize: '14px',
    color: '#6b7280'
  },
  sidebarContent: {
    overflowY: 'auto' as const,
    flex: 1
  },
  statusSummary: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    padding: '16px',
    width: '240px',
    zIndex: 5,
    border: '1px solid #e5e7eb'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#111827'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '2px'
  },
  summaryValue: {
    fontSize: '18px',
    fontWeight: '600'
  },
  totalValue: {
    color: '#111827'
  },
  activeValue: {
    color: '#dc2626'
  },
  containedValue: {
    color: '#ea580c'
  },
  extinguishedValue: {
    color: '#16a34a'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#4b5563'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    height: '100%',
    width: '100%'
  },
  errorText: {
    fontSize: '16px',
    color: '#ef4444',
    marginBottom: '16px',
    textAlign: 'center' as const
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

// SOLID 원칙을 적용한 컴포넌트 설계
const FireAlertPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'contained' | 'extinguished'>('all');
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [fires, setFires] = useState<ForestFireData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await forestFireService.getForestFires();
        setFires(data);
        setError(null);
      } catch (err) {
        console.error('산불 데이터를 가져오는 중 오류 발생:', err);
        setError('산불 데이터를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 시간 업데이트를 위한 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(timer);
  }, []);
  
  // 필터링된 데이터
  const filteredData = fires.filter(fire => {
    if (selectedFilter === 'all') return true;
    return fire.status === selectedFilter;
  });
  
  // 버튼 스타일 계산 함수 (개방-폐쇄 원칙(OCP)을 고려한 설계)
  const getButtonStyle = (filter: 'all' | 'active' | 'contained' | 'extinguished') => {
    if (filter === selectedFilter) {
      if (filter === 'all') return { ...styles.button, ...styles.buttonActive };
      if (filter === 'active') return { ...styles.button, ...styles.buttonActiveRed };
      if (filter === 'contained') return { ...styles.button, ...styles.buttonActiveOrange };
      if (filter === 'extinguished') return { ...styles.button, ...styles.buttonActiveGreen };
    }
    return styles.button;
  };

  // 산불 상태별 카운트 계산
  const statusCounts = {
    total: fires.length,
    active: fires.filter(fire => fire.status === 'active').length,
    contained: fires.filter(fire => fire.status === 'contained').length,
    extinguished: fires.filter(fire => fire.status === 'extinguished').length
  };
  
  // 대응단계별 카운트
  const responseLevelCounts = {
    level3: fires.filter(f => f.severity === 'critical').length,
    level2: fires.filter(f => f.severity === 'high').length,
    level1: fires.filter(f => f.severity === 'medium' || f.severity === 'low').length
  };
  
  // 필터 버튼 레이블
  const getFilterButtonLabels = () => {
    return {
      all: `전체 (${statusCounts.total})`,
      active: `진화중 (${statusCounts.active})`,
      contained: `통제중 (${statusCounts.contained})`,
      extinguished: `진화완료 (${statusCounts.extinguished})`
    };
  };

  // 산불 선택 핸들러
  const handleFireSelect = (fire: ForestFireData) => {
    setSelectedFireId(prevId => prevId === fire.id ? undefined : fire.id);
  };

  // 날짜 포맷팅 함수
  const formatDate = (date: Date): string => {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <span style={styles.subtitle}>전국 산불 모니터링 시스템</span>
        </div>
        
        <div style={styles.filterContainer}>
          <button 
            style={getButtonStyle('all')}
            onClick={() => setSelectedFilter('all')}
          >
            {getFilterButtonLabels().all}
          </button>
          <button 
            style={getButtonStyle('active')}
            onClick={() => setSelectedFilter('active')}
          >
            {getFilterButtonLabels().active}
          </button>
          <button 
            style={getButtonStyle('contained')}
            onClick={() => setSelectedFilter('contained')}
          >
            {getFilterButtonLabels().contained}
          </button>
          <button 
            style={getButtonStyle('extinguished')}
            onClick={() => setSelectedFilter('extinguished')}
          >
            {getFilterButtonLabels().extinguished}
          </button>
        </div>
        
        <div style={styles.timestamp}>
          최종 업데이트: {formatDate(currentTime)}
        </div>
      </header>
      
      {/* 메인 컨텐츠 영역 - 지도와 사이드바 */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>산불 데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button 
              style={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            {/* 지도 영역 */}
            <div style={styles.mapContainer}>
              <ModifiedForestFireMap 
                fires={filteredData}
                selectedFireId={selectedFireId}
                onFireSelect={handleFireSelect}
                legendPosition="bottomleft"
              />
              
              {/* 상태 요약 정보 */}
              <div style={styles.statusSummary}>
                <h3 style={styles.summaryTitle}>산불 대응단계 현황</h3>
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>총 발생</span>
                    <span style={{...styles.summaryValue, ...styles.totalValue}}>{statusCounts.total}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>대응단계 3단계</span>
                    <span style={{...styles.summaryValue, ...styles.activeValue}}>{responseLevelCounts.level3}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>대응단계 2단계</span>
                    <span style={{...styles.summaryValue, ...styles.containedValue}}>{responseLevelCounts.level2}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>대응단계 1단계</span>
                    <span style={{...styles.summaryValue, ...styles.extinguishedValue}}>{responseLevelCounts.level1}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 우측 사이드바 - 산불 현황 */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <h2 style={styles.sidebarTitle}>산불 데이터 현황</h2>
                <p style={styles.sidebarSubtitle}>
                  {selectedFilter === 'all' 
                    ? `현재 ${filteredData.length}건의 산불 정보가 표시되고 있습니다.`
                    : `현재 ${selectedFilter === 'active' ? '진화중인' : selectedFilter === 'contained' ? '통제중인' : '진화완료된'} 산불 ${filteredData.length}건이 표시되고 있습니다.`
                  }
                </p>
              </div>
              
              <div style={styles.sidebarContent}>
                <ForestFireList 
                  fires={filteredData} 
                  showFilter={false}
                  selectedFireId={selectedFireId}
                  onFireSelect={handleFireSelect}
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FireAlertPage;