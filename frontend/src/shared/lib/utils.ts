// 단일 책임 원칙(SRP): 각 함수는 하나의 책임만 가짐

/**
 * 날짜 형식 변환 함수 (YYYYMMDD -> YYYY-MM-DD)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString.length !== 8) {
    return '';
  }
  
  return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
};

/**
 * 산불 단계에 따른 위험도 색상 결정
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
 * 완료 상태인지 확인
 */
export const isCompletedStatus = (status: string, percentage: number): boolean => {
  if (!status) return false;
  return status.includes("진화완료") || percentage === 100;
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