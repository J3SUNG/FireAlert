import axios from "axios";

/**
 * 데이터 가져오기 유틸리티 함수
 * 지정된 URL에서 데이터를 가져옵니다.
 * 
 * @param {string} url 데이터를 가져올 URL
 * @returns {Promise<T>} 가져온 데이터
 */
export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

/**
 * API 요청 오류를 처리하는 유틸리티 함수
 * 
 * @param {unknown} error 발생한 오류
 * @param {string} defaultMessage 기본 오류 메시지
 * @returns {Error} 표준화된 오류 객체
 */
export const handleApiError = (error: unknown, defaultMessage: string): Error => {
  return new Error(
    error instanceof Error
      ? `API 요청 오류: ${error.message}`
      : defaultMessage
  );
};
