import { useState, useEffect } from 'react';

/**
 * 현재 시간을 관리하는 커스텀 훅 (SRP)
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // 시간 업데이트를 위한 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 날짜 포맷팅 함수
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