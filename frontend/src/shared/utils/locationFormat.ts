/**
 * 시도 이름을 약어로 변환하는 맵
 */
export const provinceShortNames: Record<string, string> = {
  "서울특별시": "서울",
  "부산광역시": "부산",
  "대구광역시": "대구",
  "인천광역시": "인천",
  "광주광역시": "광주",
  "대전광역시": "대전",
  "울산광역시": "울산",
  "세종특별자치시": "세종",
  "경기도": "경기",
  "강원특별자치도": "강원",
  "강원도": "강원",
  "충청북도": "충북",
  "충청남도": "충남",
  "전라북도": "전북",
  "전라남도": "전남",
  "경상북도": "경북",
  "경상남도": "경남",
  "제주특별자치도": "제주"
};

/**
 * 위치 문자열에서 시도와 시군구를 추출하여 간결하게 포맷팅합니다.
 * @param location 전체 위치 문자열 (예: '경기도 성남시 분당구 ...')
 * @returns 포맷팅된 위치 문자열 (예: '경기 성남시')
 */
export function formatLocationName(location: string): string {
  if (!location || typeof location !== 'string') {
    return '알 수 없는 지역';
  }

  // 공백으로 문자열 분리
  const parts = location.split(' ').filter(part => part.trim() !== '');
  if (parts.length === 0) {
    return '알 수 없는 지역';
  }

  // 첫 번째 부분은 시도로 간주
  let province = parts[0];
  let district = '';

  // 시도 약어 변환
  for (const [fullName, shortName] of Object.entries(provinceShortNames)) {
    if (province.includes(fullName) || fullName.includes(province)) {
      province = shortName;
      break;
    }
  }

  // 시군구 추출
  if (parts.length > 1) {
    // '시', '군', '구'로 끝나는 첫 번째 토큰을 시군구로 간주
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
        district = parts[i];
        break;
      }
    }

    // 시군구를 찾지 못했다면 두 번째 토큰을 사용
    if (!district && parts.length > 1) {
      district = parts[1];
    }
  }

  // 결과 포맷팅: "시도 시군구"
  return district ? `${province} ${district}` : province;
}

/**
 * 위치 정보에서 시도와 시군구를 분리하여 반환합니다.
 * @param location 전체 위치 문자열
 * @returns {province, district} 시도와 시군구 객체
 */
export function extractLocationParts(location: string): { province: string; district: string } {
  if (!location || typeof location !== 'string') {
    return { province: '알 수 없음', district: '' };
  }

  const parts = location.split(' ').filter(part => part.trim() !== '');
  if (parts.length === 0) {
    return { province: '알 수 없음', district: '' };
  }

  // 첫 번째 부분은 시도로 간주
  let province = parts[0];
  let district = '';

  // 시도 약어 변환 (원본 형태는 유지)
  const originalProvince = province;

  // 시군구 추출
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].endsWith('시') || parts[i].endsWith('군') || parts[i].endsWith('구')) {
        district = parts[i];
        break;
      }
    }

    if (!district && parts.length > 1) {
      district = parts[1];
    }
  }

  return { province: originalProvince, district };
}
