import { useState, useEffect } from 'react';

/**
 * 현재 시간을 관리하는 커스텀 훅
 * 
 * 시간 정보 관리 및 포맷팅 기능 제공
 */
export function useCurrentTime() {
  // 현재 시간 상태
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // 1분마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /**
   * 날짜 포맷팅 함수
   * 
   * 날짜를 한국어 형식으로 변환 (YYYY-MM-DD HH:MM)
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    currentTime,
    formatDate
  };
}
