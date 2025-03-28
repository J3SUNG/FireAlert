import axios from 'axios';

// 단일 책임 원칙(SRP): API 설정만 담당하는 모듈
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 요청 전에 처리할 작업 (예: 토큰 추가)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 응답 데이터 가공
    return response;
  },
  (error) => {
    // 응답 에러 처리
    // 예: 401 에러 시 로그인 페이지로 리다이렉트
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트 로직이 필요한 경우 여기에 추가
    }
    return Promise.reject(error);
  }
);

export default api;
