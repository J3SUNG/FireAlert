import { useState, useEffect } from "react";

/**
 * 현재 시간을 관리하는 커스텀 후크
 */
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

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
    formatDate,
  };
}
