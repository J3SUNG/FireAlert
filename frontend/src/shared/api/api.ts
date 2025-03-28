import axios from 'axios';

// API 추상화 레이어 (의존성 역전 원칙)
// 구체적인 axios 구현보다 추상화된 인터페이스에 의존
const api = axios.create({
  baseURL: 'http://localhost:4000',
});

export default api;
