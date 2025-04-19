import axios from "axios";

/**
 * 데이터 가져오기 유틸리티 함수
 */
export const fetchData = async <T>(url: string): Promise<T> => {
  const response = await axios.get<T>(url);
  return response.data;
};

/**
 * API 요청 오류를 처리하는 유틸리티 함수
 */
export const handleApiError = (error: unknown, defaultMessage: string): Error => {
  return new Error(error instanceof Error ? `API 요청 오류: ${error.message}` : defaultMessage);
};
