import { useState, useEffect } from 'react';

/**
 * 현재 시간을 관리하는 커스텀 훅
 * 단일 책임 원칙(SRP)을 적용하여 시간 정보만 관리합니다.
 * 1분마다 시간을 업데이트하고 포맷팅 기능을 제공합니다.
 * 
 * @returns {{ currentTime: Date, formatDate: (date: Date) => string }} 현재 시간과 포맷팅 함수
 */
export function useCurrentTime() {
  /**
   * 현재 시간 상태
   * @type {Date} 현재 시간 데이터
   */
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  /**
   * 시간 업데이트를 위한 효과
   * 1분마다 현재 시간을 업데이트합니다.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => {
      clearInterval(timer);
    };
  }, []);

  /**
   * 날짜 포맷팅 함수
   * 날짜 객체를 한글 포맷의 문자열로 변환합니다.
   * 
   * @param {Date} date 포맷팅할 날짜 객체
   * @returns {string} 한글 포맷의 날짜 문자열 (YYYY-MM-DD HH:MM)
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
