import axios from 'axios';

// 단일 책임 원칙(SRP): 이 서비스는 산불 알림 데이터 처리에만 책임을 가짐
class AlertsService {
  private apiUrl: string;

  constructor(baseUrl: string = 'http://localhost:4000/api') {
    this.apiUrl = baseUrl;
  }

  // 모든 산불 목록 조회
  async getFireList() {
    try {
      const response = await axios.get(`${this.apiUrl}/fireList`);
      return response.data;
    } catch (error) {
      console.error('산불 목록 조회 오류:', error);
      throw error;
    }
  }

  // 특정 ID의 산불 상세 정보 조회
  async getFireDetail(id: string) {
    try {
      const response = await axios.get(`${this.apiUrl}/fireDetail/${id}`);
      return response.data;
    } catch (error) {
      console.error('산불 상세 정보 조회 오류:', error);
      throw error;
    }
  }
}

// 개방-폐쇄 원칙(OCP): 아래 인스턴스를 사용하되, 필요시 확장 가능
export const alertsService = new AlertsService();

export default alertsService;
