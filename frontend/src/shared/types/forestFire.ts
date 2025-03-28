export interface ForestFireData {
  id: string;
  location: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'extinguished';
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedArea: number; // 면적 (헥타르)
  description?: string;
}

// 샘플 데이터 (실제로는 API 호출로 대체)
export const SAMPLE_FOREST_FIRE_DATA: ForestFireData[] = [
  {
    id: "ff-001",
    location: "강원도 춘천시 남산면",
    date: "2025-03-15",
    severity: "high",
    status: "contained",
    coordinates: {
      lat: 37.8813, 
      lng: 127.7300
    },
    affectedArea: 23.5,
    description: "건조한 날씨로 인해 발생, 주변 마을 대피 완료"
  },
  {
    id: "ff-002",
    location: "경상북도 안동시 도산면",
    date: "2025-03-20",
    severity: "medium",
    status: "active",
    coordinates: {
      lat: 36.5760, 
      lng: 128.7402
    },
    affectedArea: 15.2
  },
  {
    id: "ff-003",
    location: "전라남도 해남군 삼산면",
    date: "2025-03-22",
    severity: "low",
    status: "extinguished",
    coordinates: {
      lat: 34.5415, 
      lng: 126.5958
    },
    affectedArea: 5.7
  },
  {
    id: "ff-004",
    location: "경기도 가평군 상면",
    date: "2025-03-25",
    severity: "critical",
    status: "active",
    coordinates: {
      lat: 37.8318, 
      lng: 127.5128
    },
    affectedArea: 42.1,
    description: "강풍으로 인한 빠른 확산, 산림청 헬기 5대 투입"
  },
  {
    id: "ff-005",
    location: "충청북도 제천시 백운면",
    date: "2025-03-26",
    severity: "high",
    status: "contained",
    coordinates: {
      lat: 37.0965, 
      lng: 128.1707
    },
    affectedArea: 31.8
  },
  {
    id: "ff-006",
    location: "전라북도 남원시 산내면",
    date: "2025-03-27",
    severity: "medium",
    status: "active",
    coordinates: {
      lat: 35.4167, 
      lng: 127.3833
    },
    affectedArea: 12.3,
    description: "등산객의 취사 과정에서 발생한 것으로 추정"
  },
  {
    id: "ff-007",
    location: "제주도 서귀포시 표선면",
    date: "2025-03-26",
    severity: "low",
    status: "extinguished",
    coordinates: {
      lat: 33.3425, 
      lng: 126.8304
    },
    affectedArea: 3.2
  },
  {
    id: "ff-008",
    location: "경상남도 진주시 금산면",
    date: "2025-03-28",
    severity: "critical",
    status: "active",
    coordinates: {
      lat: 35.1795, 
      lng: 128.0399
    },
    affectedArea: 38.6,
    description: "야간에 발생한 산불로 진화에 어려움 겪고 있음, 인근 주민 대피 진행 중"
  },
  {
    id: "ff-009",
    location: "충청남도 보령시 미산면",
    date: "2025-03-26",
    severity: "high",
    status: "contained",
    coordinates: {
      lat: 36.3056, 
      lng: 126.5528
    },
    affectedArea: 19.5
  },
  {
    id: "ff-010",
    location: "강원도 정선군 임계면",
    date: "2025-03-28",
    severity: "critical",
    status: "active",
    coordinates: {
      lat: 37.4903, 
      lng: 128.8561
    },
    affectedArea: 47.8,
    description: "산림 밀집 지역 화재로 확산 속도가 빠름, 인접 지역 주의보 발령"
  }
];