/**
 * 산불 데이터 인터페이스
 */
export interface ForestFireData {
  id: string;                  // 산불 고유 식별자
  location: string;            // 산불 발생 위치
  date: string;                // 산불 발생 일자
  severity: 'low' | 'medium' | 'high' | 'critical';  // 산불 위험도
  status: 'active' | 'contained' | 'extinguished';   // 산불 상태
  coordinates: {               // 산불 위치 좌표
    lat: number;               // 위도
    lng: number;               // 경도
  };
  affectedArea: number;        // 영향 면적 (헥타르)
  description?: string;        // 산불 상세 설명 (선택사항)
  province?: string;           // 시도 정보
  district?: string;           // 시군구 정보
  extinguishPercentage?: string; // 진화율 (선택사항)
  responseLevelName?: string;  // 대응단계 이름 (선택사항)
}
