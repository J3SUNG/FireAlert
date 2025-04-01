/**
 * 산불 데이터 인터페이스
 * 산불 정보를 나타내는 타입 정의입니다.
 */
export interface ForestFireData {
  /** 산불 고유 식별자 */
  id: string;
  /** 산불 발생 위치 */
  location: string;
  /** 산불 발생 일자 */
  date: string;
  /** 산불 위험도 (낮음, 중간, 높음, 매우 높음) */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 산불 상태 (진행중, 통제중, 진화완료) */
  status: 'active' | 'contained' | 'extinguished';
  /** 산불 위치 좌표 */
  coordinates: {
    lat: number; // 위도
    lng: number; // 경도
  };
  /** 영향 면적 (헥타르) */
  affectedArea: number;
  /** 산불 상세 설명 (선택사항) */
  description?: string;
  /** 시도 정보 (NL_NAME_1) */
  province?: string;
  /** 시군구 정보 (NL_NAME_2) */
  district?: string;
  /** 진화율 (선택사항) */
  extinguishPercentage?: string;
  /** 대응단계 이름 (선택사항) */
  responseLevelName?: string;
}
