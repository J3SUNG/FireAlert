import React, { useState, useEffect, useMemo } from 'react';
import { ForestFireList } from '../../features/forest-fire-list';
import { ForestFireMap } from '../../features/forest-fire-map';
import { ForestFireData, SAMPLE_FOREST_FIRE_DATA } from '../../shared/types/forestFire';

export const HomePage: React.FC = () => {
  const [forestFires, setForestFires] = useState<ForestFireData[]>([]);
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'contained' | 'extinguished'>('all');

  // 산불 데이터 가져오기
  useEffect(() => {
    const fetchForestFires = async () => {
      try {
        setIsLoading(true);
        // 실제 환경에서는 API 호출로 대체
        // const response = await axios.get('/api/forest-fires');
        // setForestFires(response.data);
        
        // 샘플 데이터 사용
        setTimeout(() => {
          setForestFires(SAMPLE_FOREST_FIRE_DATA);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('산불 데이터를 불러오는데 실패했습니다.', error);
        setIsLoading(false);
      }
    };

    fetchForestFires();
  }, []);

  // 필터링된 산불 데이터
  const filteredFires = useMemo(() => {
    if (filterStatus === 'all') return forestFires;
    return forestFires.filter(fire => fire.status === filterStatus);
  }, [forestFires, filterStatus]);

  // 산불 상태별 카운트 계산 (메모이제이션)
  const statusCounts = useMemo(() => {
    return {
      total: forestFires.length,
      active: forestFires.filter(fire => fire.status === 'active').length,
      contained: forestFires.filter(fire => fire.status === 'contained').length,
      extinguished: forestFires.filter(fire => fire.status === 'extinguished').length
    };
  }, [forestFires]);

  // 산불 선택 핸들러
  const handleFireSelect = (fire: ForestFireData) => {
    setSelectedFireId(fire.id === selectedFireId ? undefined : fire.id);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (status: 'all' | 'active' | 'contained' | 'extinguished') => {
    setFilterStatus(status);
  };

  const containerStyle: React.CSSProperties = {
    height: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    zIndex: 10
  };

  const headerContentStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827'
  };

  const redTextStyle: React.CSSProperties = {
    color: '#dc2626'
  };

  const subtitleStyle: React.CSSProperties = {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#6b7280'
  };

  const filterContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    outline: 'none'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex'
  };

  const loadingStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 50
  };

  const loadingContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  const loadingCircleStyle: React.CSSProperties = {
    height: '64px',
    width: '64px',
    backgroundColor: '#ef4444',
    borderRadius: '9999px',
    marginBottom: '16px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  const loadingTextStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#4b5563'
  };

  const mapAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    position: 'relative',
    height: '100%'
  };

  const sidebarStyle: React.CSSProperties = {
    width: '320px',
    height: '100%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const sidebarHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const sidebarTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827'
  };

  const sidebarContentStyle: React.CSSProperties = {
    flexGrow: 1,
    overflow: 'auto'
  };

  const summaryStyle: React.CSSProperties = {
    position: 'absolute',
    left: '16px',
    top: '16px',
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '12px',
    width: '220px'
  };

  const summaryTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px'
  };

  const summaryGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  };

  const summaryItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  };

  const summaryLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6b7280'
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '4px 0',
    textAlign: 'center',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    color: '#6b7280',
    zIndex: 10
  };

  const getButtonStyle = (status: 'all' | 'active' | 'contained' | 'extinguished') => {
    let bgColor, textColor;
    
    if (status === filterStatus) {
      switch (status) {
        case 'all': 
          bgColor = '#3b82f6'; 
          textColor = 'white';
          break;
        case 'active': 
          bgColor = '#ef4444'; 
          textColor = 'white';
          break;
        case 'contained': 
          bgColor = '#f97316'; 
          textColor = 'white';
          break;
        case 'extinguished': 
          bgColor = '#22c55e'; 
          textColor = 'white';
          break;
      }
    } else {
      bgColor = '#e5e7eb';
      textColor = '#4b5563';
    }
    
    return {
      ...buttonBaseStyle,
      backgroundColor: bgColor,
      color: textColor
    };
  };

  return (
    <div style={containerStyle}>
      {/* 최소화된 헤더 */}
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={logoStyle}>
            <h1 style={titleStyle}>
              <span style={redTextStyle}>Fire</span>
              <span>Alert</span>
            </h1>
            <span style={subtitleStyle}>전국 산불 모니터링 시스템</span>
          </div>
          
          {/* 필터링 버튼 그룹 */}
          <div style={filterContainerStyle}>
            <button 
              style={getButtonStyle('all')}
              onClick={() => handleFilterChange('all')}
            >
              전체 ({statusCounts.total})
            </button>
            <button 
              style={getButtonStyle('active')}
              onClick={() => handleFilterChange('active')}
            >
              진행중 ({statusCounts.active})
            </button>
            <button 
              style={getButtonStyle('contained')}
              onClick={() => handleFilterChange('contained')}
            >
              통제중 ({statusCounts.contained})
            </button>
            <button 
              style={getButtonStyle('extinguished')}
              onClick={() => handleFilterChange('extinguished')}
            >
              진화완료 ({statusCounts.extinguished})
            </button>
          </div>
        </div>
      </header>
      
      <main style={mainStyle}>
        {isLoading ? (
          <div style={loadingStyle}>
            <div style={loadingContentStyle}>
              <div style={loadingCircleStyle}></div>
              <div style={loadingTextStyle}>산불 데이터를 불러오는 중...</div>
            </div>
          </div>
        ) : (
          <>
            {/* 지도 영역 */}
            <div style={mapAreaStyle}>
              <ForestFireMap
                fires={filteredFires}
                selectedFireId={selectedFireId}
                onFireSelect={handleFireSelect}
              />
              
              {/* 상태 요약 오버레이 */}
              <div style={summaryStyle}>
                <h3 style={summaryTitleStyle}>산불 발생 현황</h3>
                <div style={summaryGridStyle}>
                  <div style={summaryItemStyle}>
                    <p style={summaryLabelStyle}>총 발생</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{statusCounts.total}</p>
                  </div>
                  <div style={summaryItemStyle}>
                    <p style={summaryLabelStyle}>진행중</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#dc2626' }}>{statusCounts.active}</p>
                  </div>
                  <div style={summaryItemStyle}>
                    <p style={summaryLabelStyle}>통제중</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#f97316' }}>{statusCounts.contained}</p>
                  </div>
                  <div style={summaryItemStyle}>
                    <p style={summaryLabelStyle}>진화완료</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#22c55e' }}>{statusCounts.extinguished}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 산불 목록 사이드바 (항상 표시) */}
            <div style={sidebarStyle}>
              <div style={sidebarHeaderStyle}>
                <h2 style={sidebarTitleStyle}>산불 발생 목록</h2>
              </div>
              <div style={sidebarContentStyle}>
                <ForestFireList 
                  fires={filteredFires}
                  onFireSelect={handleFireSelect}
                  selectedFireId={selectedFireId}
                  showFilter={false}  // 필터버튼은 상단에 있으므로 숨김
                />
              </div>
            </div>
          </>
        )}
      </main>
      
      {/* 간소화된 푸터 */}
      <footer style={footerStyle}>
        &copy; 2025 FireAlert System
      </footer>
      
      {/* 글로벌 스타일 */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};