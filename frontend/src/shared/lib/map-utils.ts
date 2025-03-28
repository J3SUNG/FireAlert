import { FireLevel } from '../types/fire-data.types';

/**
 * 산불 단계에 따른 색상 결정
 */
export const getDangerColor = (issueName: string): string => {
  if (!issueName) return "#eeeeee";
  
  if (issueName.includes("3") || issueName.includes("세")) {
    return "#ff4d4d"; // 3단계 - 적색(고위험)
  } else if (issueName.includes("2") || issueName.includes("이")) {
    return "#ffa500"; // 2단계 - 주황색(중위험)
  } else if (issueName.includes("1") || issueName.includes("일")) {
    return "#ffff66"; // 1단계 - 황색(주의)
  } else if (issueName.includes("초기") || issueName.includes("대응")) {
    return "#cce5ff"; // 초기대응 - 하늘색
  } else {
    return "#eeeeee"; // 기본 - 회색
  }
};

/**
 * 산불 단계 식별
 */
export const getFireLevel = (issueName: string): FireLevel => {
  if (!issueName) return 'unknown';
  
  if (issueName.includes("3") || issueName.includes("세")) {
    return 'level3'; // 3단계
  } else if (issueName.includes("2") || issueName.includes("이")) {
    return 'level2'; // 2단계
  } else if (issueName.includes("1") || issueName.includes("일")) {
    return 'level1'; // 1단계
  } else if (issueName.includes("초기") || issueName.includes("대응")) {
    return 'initial'; // 초기대응
  }
  
  return 'unknown';
};

/**
 * 완료 상태인지 확인
 */
export const isCompletedStatus = (status: string, percentage: number): boolean => {
  if (!status) return false;
  return status.includes("진화완료") || percentage === 100;
};

/**
 * 진행률에 따른 CSS 클래스 결정
 */
export const getPercentClass = (percentage: number): string => {
  if (percentage >= 70) {
    return "percent-high";
  } else if (percentage >= 40) {
    return "percent-medium";
  }
  return "percent-low";
};

/**
 * 지역명 포맷팅 (시도-시군구)
 */
export const formatLocationName = (location: string): string => {
  if (!location) return "";
  
  const parts = location.split(" ");
  if (parts.length < 2) return location;
  
  // 첫 부분은 시도
  const sido = parts[0];
  
  // 두 번째 부분부터 시군구 찾기
  let sigungu = "";
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
      sigungu = parts[i];
      break;
    }
  }
  
  // 찾지 못했으면 두 번째 부분 사용
  if (!sigungu && parts.length > 1) {
    sigungu = parts[1];
  }
  
  return `${sido}-${sigungu}`;
};

/**
 * 바이너리 문자열인 경우 한글로 디코딩 (예: b'\xc7\xd5\xc3\xb5\xb1\xba')
 */
export const decodeIfByteStr = (value: string | unknown): string | unknown => {
  if (typeof value === "string" && value.startsWith("b'")) {
    try {
      const byteStr = value
        .slice(2, -1)
        .split("\\x")
        .filter(Boolean)
        .map((hex) => parseInt(hex, 16));
      return new TextDecoder("euc-kr").decode(new Uint8Array(byteStr));
    } catch {
      return value;
    }
  }
  return value;
};

/**
 * 지역명에 따른 대략적인 좌표 매핑 (실제로는 더 정확한 데이터베이스나 지오코딩 서비스 사용 필요)
 */
export const getCoordinatesByRegion = (mainLocation: string): [number, number] | null => {
  // 주요 지역별 대략적인 좌표 
  const mainLocationCoords: Record<string, [number, number]> = {
    "서울특별시": [37.5665, 126.9780],
    "경기도": [37.4138, 127.5183],
    "강원도": [37.8228, 128.1555],
    "충청북도": [36.8, 127.7],
    "충청남도": [36.5, 126.8],
    "전라북도": [35.8, 127.1],
    "전라남도": [34.9, 126.9],
    "경상북도": [36.4, 128.9],
    "경상남도": [35.4, 128.2],
    "제주특별자치도": [33.4, 126.5],
    "부산광역시": [35.1796, 129.0756],
    "대구광역시": [35.8714, 128.6014],
    "인천광역시": [37.4563, 126.7052],
    "광주광역시": [35.1595, 126.8526],
    "대전광역시": [36.3504, 127.3845],
    "울산광역시": [35.5384, 129.3114],
    "세종특별자치시": [36.5, 127.25]
  };
  
  // 특정 좌표가 없으면 광역시/도의 좌표에 약간의 오프셋 추가
  if (mainLocationCoords[mainLocation]) {
    const [lat, lng] = mainLocationCoords[mainLocation];
    // 같은 지역 내 서로 다른 위치에 랜덤 오프셋 적용
    const randomOffsetLat = (Math.random() - 0.5) * 0.3; // ±0.15도 (약 16km)
    const randomOffsetLng = (Math.random() - 0.5) * 0.3;
    return [lat + randomOffsetLat, lng + randomOffsetLng];
  }
  
  // 매칭되는 좌표 없음
  return null;
};

/**
 * 한국 전체 지도 여백 설정
 */
export const KOREA_EXTENT = {
  minLng: 125.0,
  maxLng: 131.0,
  minLat: 33.0,
  maxLat: 38.5
};