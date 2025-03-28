import { ForestFireData } from '../types/forestFire';
import axios from 'axios';

// 산불 데이터를 위한 인터페이스
export interface ForestFireService {
  getForestFires(): Promise<ForestFireData[]>;
  getFiresByProvince(province: string): Promise<ForestFireData[]>;
  getFiresByStatus(status: ForestFireData['status']): Promise<ForestFireData[]>;
  getFireById(id: string): Promise<ForestFireData | undefined>;
}

// API 기반 구현
export class ForestFireServiceImpl implements ForestFireService {
  private readonly API_URL = 'http://localhost:4000/api/fireList';

  // 모든 산불 데이터 가져오기
  async getForestFires(): Promise<ForestFireData[]> {
    try {
      // 백엔드 API 호출
      const response = await axios.get<any[]>(this.API_URL);
      
      // API 응답 데이터를 ForestFireData 형식으로 변환
      return this.convertToForestFireData(response.data);
    } catch (error) {
      console.error('산불 데이터를 가져오는 중 오류 발생:', error);
      // 오류 발생 시 테스트 데이터 반환
      return this.getTestData();
    }
  }

  // 특정 지역(시도)의 산불 데이터 가져오기
  async getFiresByProvince(province: string): Promise<ForestFireData[]> {
    try {
      const fires = await this.getForestFires();
      return fires.filter(fire => fire.province === province);
    } catch (error) {
      console.error(`${province} 지역의 산불 데이터를 가져오는 중 오류 발생:`, error);
      return [];
    }
  }

  // 특정 상태(active, contained, extinguished)의 산불 데이터 가져오기
  async getFiresByStatus(status: ForestFireData['status']): Promise<ForestFireData[]> {
    try {
      const fires = await this.getForestFires();
      return fires.filter(fire => fire.status === status);
    } catch (error) {
      console.error(`상태가 ${status}인 산불 데이터를 가져오는 중 오류 발생:`, error);
      return [];
    }
  }

  // 특정 ID의 산불 데이터 가져오기
  async getFireById(id: string): Promise<ForestFireData | undefined> {
    try {
      const fires = await this.getForestFires();
      return fires.find(fire => fire.id === id);
    } catch (error) {
      console.error(`ID가 ${id}인 산불 데이터를 가져오는 중 오류 발생:`, error);
      return undefined;
    }
  }

  // 전송된 백엔드 API 데이터를 ForestFireData 형식으로 변환
  private convertToForestFireData(apiData: any[]): ForestFireData[] {
    console.log('변환할 데이터:', apiData);
    
    return apiData.map((item, index) => {
      // 첫 데이터 콘솔로그 출력
      if (index === 0) {
        console.log('첫 번째 산불 데이터 항목:', item);
      }
      
      // 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
      const dateStr = item.date || '';
      const formattedDate = dateStr.length === 8 ?
        `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}` :
        dateStr;
      
      // 진화율 계산 (백엔드에서 제공하는 percentage 사용)
      const extinguishPercentage = item.percentage ? item.percentage : '0';
      
      // 상태 변환 (진화율을 기준으로 상태 결정)
      const status = this.convertStatus(item.status || '', extinguishPercentage);
      
      // 대응단계 계산 (추후 UI에서 표시)
      const responseLevelName = item.issueName || '1단계';
      const responseLevel = this.getResponseLevel(responseLevelName);
      
      // 위치 정보 추출
      const { province, district } = this.extractLocation(item.location, item.sigungu);
      
      // 콘솔에 시군구 정보 출력
      console.log(`ID: ${item.index || index + 1}, 위치: ${item.location}, 추출된 시군구: ${district}`);
      
      // 임의의 좌표(실제 좌표는 API에서 제공되지 않음)
      const coordinates = this.getRandomCoordinatesFor(province, district);
      
      return {
        id: `ff-${item.index || index + 1}`,
        location: item.location || '',
        date: formattedDate,
        severity: responseLevel, // 대응단계를 표시
        status,
        coordinates,
        affectedArea: parseFloat((Math.random() * 50).toFixed(1)), // 임의 영향 면적
        description: this.getDescriptionByStatus(status),
        province,
        district,
        extinguishPercentage, // 진화율 추가
        responseLevelName // 대응단계 이름 추가
      };
    });
  }
  
  // 상태 정보 전환 - 진화율 정보 추가
  private convertStatus(status: string, percentage: string): ForestFireData['status'] {
    // 진화율이 100%면 진화 완료
    if (percentage === '100') return 'extinguished';
    
    if (!status) return 'active';
    
    if (status.includes('진화완료')) return 'extinguished';
    if (status.includes('진화중') || status.includes('진행')) return 'active';
    
    // 그 외의 경우 통제중으로 간주
    return 'contained';
  }
  
  // 대응단계를 severity로 변환 - 심각도대신 대응단계로 사용
  private getResponseLevel(issueName: string): ForestFireData['severity'] {
    // 3단계가 가장 심각
    if (issueName.includes('3단계')) return 'critical';
    if (issueName.includes('2단계')) return 'high';
    if (issueName.includes('1단계')) return 'medium';
    
    // 임의 기본값
    return 'low';
  }
  
  // 주소에서 시도 및 시군구 추출 - 시군구 정보 개선
  private extractLocation(location: string, sigungu?: string): { province: string; district: string } {
    if (!location) return { province: '기타', district: '' };
    
    const parts = location.split(' ');
    let province = '기타';
    let district = '';
    
    // 대략적인 시도 이름 추출
    if (parts.length > 0) {
      if (parts[0].includes('도') || parts[0].includes('시') ||
          parts[0].includes('특별') || parts[0].includes('광역')) {
        province = parts[0];
      }
    }
    
    // 백엔드에서 시군구 정보를 제공할 경우 사용
    if (sigungu) {
      district = sigungu;
      console.log(`백엔드에서 제공된 시군구: ${sigungu}`);
    } 
    // 그렇지 않으면 주소에서 시군구 추출 시도
    else if (parts.length > 1) {
      // 두 번째 부분이 시군구이면 추출
      if (parts[1].endsWith('시') || parts[1].endsWith('군') || parts[1].endsWith('구')) {
        district = parts[1];
      }
      // 시군구 추출 실패시, 추가 계산 시도
      else {
        // 재시도: 전체 주소에서 시군구 검색
        for (let i = 1; i < parts.length; i++) {
          if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
            district = parts[i];
            break;
          }
        }
        
        // 여전히 못 찾았다면, 개선된 방법 사용
        if (!district) {
          // 특정 시군구 이름 직접 찾기
          const locationStr = location.toLowerCase();
          const locationsToCheck = [
            '고성군', '북구', '서구', '영천시', '동구', '남구', '중구', 
            '양산구', '양천군', '작천군', '서해군', '양구군',
            '김해시', '경산시', '마산시'
          ];
          
          for (const loc of locationsToCheck) {
            if (locationStr.includes(loc.toLowerCase())) {
              district = loc;
              console.log(`위치 문자열에서 찾은 시군구: ${loc}`);
              break;
            }
          }
        }
      }
    }
    
    return { province, district };
  }
  
  // 정해진 시도에 대한 대략적인 좌표
  private getRandomCoordinatesFor(province: string, district: string): { lat: number; lng: number } {
    const baseCoordinates: Record<string, { lat: number; lng: number }> = {
      '강원도': { lat: 37.8254, lng: 128.2255 },
      '경기도': { lat: 37.4363, lng: 127.5000 },
      '경상남도': { lat: 35.4606, lng: 128.2132 },
      '경상북도': { lat: 36.0190, lng: 128.9444 },
      '광주광역시': { lat: 35.1595, lng: 126.8526 },
      '대구광역시': { lat: 35.8714, lng: 128.6014 },
      '대전광역시': { lat: 36.3504, lng: 127.3845 },
      '부산광역시': { lat: 35.1796, lng: 129.0756 },
      '서울특별시': { lat: 37.5665, lng: 126.9780 },
      '세종특별자치시': { lat: 36.4800, lng: 127.2890 },
      '울산광역시': { lat: 35.5383, lng: 129.3114 },
      '인천광역시': { lat: 37.4563, lng: 126.7052 },
      '전라남도': { lat: 34.8679, lng: 126.9910 },
      '전라북도': { lat: 35.7175, lng: 127.1530 },
      '제주특별자치도': { lat: 33.4996, lng: 126.5312 },
      '충청남도': { lat: 36.6589, lng: 126.6733 },
      '충청북도': { lat: 36.8003, lng: 127.7004 },
      '기타': { lat: 36.5, lng: 127.5 }
    };
    
    const base = baseCoordinates[province] || baseCoordinates['기타'];
    
    // 임의성 추가 (같은 시도에서도 약간 다른 위치로 표시)
    return {
      lat: base.lat + (Math.random() - 0.5) * 0.5,
      lng: base.lng + (Math.random() - 0.5) * 0.5
    };
  }
  
  // 상태에 따른 임의 설명 생성
  private getDescriptionByStatus(status: ForestFireData['status']): string | undefined {
    if (Math.random() < 0.5) return undefined; // 50% 확률로 설명 없음
    
    const descriptions = {
      active: [
        '강풍으로 인한 빠른 확산, 산림청 헬기 투입',
        '등산객의 취사 과정에서 발생한 것으로 추정',
        '야간에 발생한 산불로 진화에 어려움',
        '산림 밀집 지역으로 확산 속도가 빠름',
        '건조한 날씨로 인해 발생, 진화 중'
      ],
      contained: [
        '해당 지역 통제 중, 추가 확산 없음',
        '인력과 장비 추가 투입으로 통제 중',
        '해당 지역 분무수가 분사되어 통제 중',
        '주변 마을 대피 완료, 현재 통제 중',
        '산불 진화선 구축으로 통제 중'
      ],
      extinguished: [
        '완전히 진화 완료, 재발화 방지 조치 중',
        '진화 완료, 피해 조사 진행 중',
        '비로 인한 도움으로 진화 완료',
        '중앙 및 지자체 협력으로 지고',
        '산불 진화 완료, 현장 정리 중'
      ]
    };
    
    const list = descriptions[status] || descriptions.active;
    return list[Math.floor(Math.random() * list.length)];
  }
  
  // 테스트용 데이터
  private getTestData(): ForestFireData[] {
    // 현재 날짜를 기준으로 최근 날짜로 설정
    const currentDate = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // 3일 전
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    
    // 2일 전
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    
    // 1일 전
    const oneDayAgo = new Date(currentDate);
    oneDayAgo.setDate(currentDate.getDate() - 1);
    
    // 오늘
    const today = new Date(currentDate);
    
    return [
      {
        id: "ff-001",
        location: "강원도 춘천시 남산면",
        date: formatDate(threeDaysAgo),
        severity: "high",
        status: "contained",
        coordinates: {
          lat: 37.8813, 
          lng: 127.7300
        },
        affectedArea: 23.5,
        description: "건조한 날씨로 인해 발생, 주변 마을 대피 완료",
        province: "강원도",
        district: "춘천시",
        extinguishPercentage: "65",
        responseLevelName: "2단계"
      },
      {
        id: "ff-002",
        location: "경상북도 안동시 도산면",
        date: formatDate(twoDaysAgo),
        severity: "medium",
        status: "active",
        coordinates: {
          lat: 36.5760, 
          lng: 128.7402
        },
        affectedArea: 15.2,
        province: "경상북도",
        district: "안동시",
        extinguishPercentage: "35",
        responseLevelName: "1단계"
      },
      {
        id: "ff-003",
        location: "전라남도 해남군 삼산면",
        date: formatDate(oneDayAgo),
        severity: "low",
        status: "extinguished",
        coordinates: {
          lat: 34.5415, 
          lng: 126.5958
        },
        affectedArea: 5.7,
        province: "전라남도",
        district: "해남군",
        extinguishPercentage: "100",
        responseLevelName: "1단계"
      },
      {
        id: "ff-004",
        location: "경기도 가평군 상면",
        date: formatDate(today),
        severity: "critical",
        status: "active",
        coordinates: {
          lat: 37.8318, 
          lng: 127.5128
        },
        affectedArea: 42.1,
        description: "강풍으로 인한 빠른 확산, 산림청 헬기 5대 투입",
        province: "경기도",
        district: "가평군",
        extinguishPercentage: "25",
        responseLevelName: "3단계"
      },
      {
        id: "ff-005",
        location: "충청북도 제천시 백운면",
        date: formatDate(twoDaysAgo),
        severity: "high",
        status: "contained",
        coordinates: {
          lat: 37.0965, 
          lng: 128.1707
        },
        affectedArea: 31.8,
        province: "충청북도",
        district: "제천시",
        extinguishPercentage: "78",
        responseLevelName: "2단계"
      }
    ] as ForestFireData[];
  }
}

// 산불 데이터 서비스 인스턴스 생성 (싱글톤)
export const forestFireService = new ForestFireServiceImpl();

// 산불 통계를 위한 유틸리티 함수
export const getForestFireStatistics = (fires: ForestFireData[]) => {
  const provinceStats = {} as Record<string, { count: number, active: number, contained: number, extinguished: number, totalArea: number }>;
  
  // 시도별 통계 계산
  fires.forEach(fire => {
    const province = fire.province || '기타';
    if (!provinceStats[province]) {
      provinceStats[province] = { count: 0, active: 0, contained: 0, extinguished: 0, totalArea: 0 };
    }
    
    const stats = provinceStats[province];
    stats.count += 1;
    stats.totalArea += fire.affectedArea;
    
    if (fire.status === 'active') stats.active += 1;
    else if (fire.status === 'contained') stats.contained += 1;
    else if (fire.status === 'extinguished') stats.extinguished += 1;
  });
  
  // 심각도별 통계
  const severityStats = {
    critical: fires.filter(f => f.severity === 'critical').length,
    high: fires.filter(f => f.severity === 'high').length,
    medium: fires.filter(f => f.severity === 'medium').length,
    low: fires.filter(f => f.severity === 'low').length
  };
  
  // 상태별 통계
  const statusStats = {
    total: fires.length,
    active: fires.filter(f => f.status === 'active').length,
    contained: fires.filter(f => f.status === 'contained').length,
    extinguished: fires.filter(f => f.status === 'extinguished').length
  };
  
  // 영향 면적 계산
  const totalArea = fires.reduce((sum, fire) => sum + fire.affectedArea, 0);
  
  return {
    provinceStats,
    severityStats,
    statusStats,
    totalArea
  };
};