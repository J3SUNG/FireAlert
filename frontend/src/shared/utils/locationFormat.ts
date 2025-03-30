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

export function formatLocationName(location: string): string {
  if (!location || typeof location !== 'string') {
    return '알 수 없는 지역';
  }

  const parts = location.split(' ').filter(part => part.trim() !== '');
  if (parts.length === 0) {
    return '알 수 없는 지역';
  }

  let provinceName = parts[0];
  let district = '';

  for (const [fullName, shortName] of Object.entries(provinceShortNames)) {
    if (provinceName.includes(fullName) || fullName.includes(provinceName)) {
      provinceName = shortName;
      break;
    }
  }

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

  return district ? `${provinceName} ${district}` : provinceName;
}

export function extractLocationParts(location: string): { province: string; district: string } {
  if (!location || typeof location !== 'string') {
    return { province: '알 수 없음', district: '' };
  }

  const parts = location.split(' ').filter(part => part.trim() !== '');
  if (parts.length === 0) {
    return { province: '알 수 없음', district: '' };
  }

  const province = parts[0];
  let district = '';
  const originalProvince = province;

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