import { useState, useEffect, useCallback } from 'react';
import alertsService from '../../../shared/api/alertsService';
import { FireItem } from '../../../shared/types/fire-data.types';

// 공용 더미 데이터 추가
const DUMMY_DATA: FireItem[] = [
  {
    index: "1",
    location: "경상북도 안동시 와룡면",
    sigungu: "안동시",
    percentage: "65",
    date: "20250315",
    issueName: "1단계",
    status: "진화중"
  },
  {
    index: "2",
    location: "강원도 평창군 대관령면",
    sigungu: "평창군",
    percentage: "82",
    date: "20250320",
    issueName: "2단계",
    status: "진화중"
  },
  {
    index: "3",
    location: "충청북도 제천시 백운면",
    sigungu: "제천시",
    percentage: "100",
    date: "20250312",
    issueName: "3단계",
    status: "진화완료"
  },
  {
    index: "4",
    location: "경기도 가평군 설악면",
    sigungu: "가평군",
    percentage: "45",
    date: "20250322",
    issueName: "2단계",
    status: "진화중"
  },
  {
    index: "5",
    location: "전라남도 구례군 토지면",
    sigungu: "구례군",
    percentage: "90",
    date: "20250319",
    issueName: "1단계",
    status: "진화중"
  }
];

// 단일 책임 원칙(SRP): 이 훅은 산불 알림 상태 관리에만 책임을 가짐
export const useAlerts = () => {
  const [items, setItems] = useState<FireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 산불 목록 데이터 로드
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      
      // 백엔드 API 호출 시도
      try {
        const data = await alertsService.getFireList();
        if (data && data.length > 0) {
          console.log('백엔드 API에서 데이터 가져오기 성공');
          setItems(data);
          setError('');
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('백엔드 API 오류:', e);
        // API 오류 발생, 더미 데이터 사용
      }
      
      // 백엔드 API 오류 또는 데이터 부재 시 더미 데이터 사용
      console.log('더미 데이터 사용 중...');
      setItems(DUMMY_DATA);
      setError('');
    } catch (e) {
      console.error('데이터 가져오기 오류:', e);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
      setItems(DUMMY_DATA); // 오류 발생해도 더미 데이터 사용
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // 활성화된 산불 (진행 중인 산불)만 필터링
  const activeAlerts = items.filter(item => 
    item.status && (
      item.status.includes('진화중') || 
      item.status.includes('진행') || 
      item.status.includes('대응')
    )
  );

  // 완료된 산불만 필터링
  const completedAlerts = items.filter(item => 
    item.status && item.status.includes('완료')
  );

  // 심각도별 산불 필터링
  const getAlertsByLevel = (level: number) => {
    const levelMap: Record<number, (name: string) => boolean> = {
      1: (name) => name.includes('1') || name.includes('일'),
      2: (name) => name.includes('2') || name.includes('이'),
      3: (name) => name.includes('3') || name.includes('세'),
    };

    return items.filter(item => 
      item.issueName && levelMap[level](item.issueName)
    );
  };

  return {
    alerts: items,
    activeAlerts,
    completedAlerts, 
    level1Alerts: getAlertsByLevel(1),
    level2Alerts: getAlertsByLevel(2),
    level3Alerts: getAlertsByLevel(3),
    loading,
    error,
    fetchAlerts,
  };
};

export default useAlerts;
