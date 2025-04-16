import { useState, useEffect } from 'react';

/**
 * 현재 시간을 관리하는 커스텀 후크
 * 
 * 현재 시간을 갱신하고 포맷팅하는 기능을 제공합니다.
 * 1분마다 자동으로 시간이 갱신됩니다.
 * 
 * @returns {
 *   currentTime: 현재 시간 Date 객체
 *   formatDate: 날짜 포맷팅 함수
 * }
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
   * 날짜를 한국어 형식으로 변환합니다. (YYYY-MM-DD HH:MM)
   * 로케일 설정을 활용하여 현지화된 형식으로 표시합니다.
   * 
   * @param date 포맷팅할 Date 객체
   * @returns 포맷팅된 시간 문자열
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
