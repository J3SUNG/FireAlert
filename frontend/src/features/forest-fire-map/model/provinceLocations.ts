/**
 * 각 시도별 레이블 좌표
 */
export const PROVINCE_LOCATIONS = [
  { name: "서울특별시", lat: 37.5665, lng: 126.978 },
  { name: "부산광역시", lat: 35.1796, lng: 129.0756 },
  { name: "대구광역시", lat: 35.8722, lng: 128.6025 },
  { name: "인천광역시", lat: 37.4563, lng: 126.7052 },
  { name: "광주광역시", lat: 35.1595, lng: 126.8526 },
  { name: "대전광역시", lat: 36.3504, lng: 127.3845 },
  { name: "울산광역시", lat: 35.5384, lng: 129.3114 },
  { name: "세종특별자치시", lat: 36.48, lng: 127.289 },
  { name: "경기도", lat: 37.4138, lng: 127.5183 },
  { name: "강원도", lat: 37.8228, lng: 128.1555 },
  { name: "충청북도", lat: 36.6357, lng: 127.4917 },
  { name: "충청남도", lat: 36.5184, lng: 126.8 },
  { name: "전라북도", lat: 35.7167, lng: 127.1442 },
  { name: "전라남도", lat: 34.8161, lng: 126.463 },
  { name: "경상북도", lat: 36.4919, lng: 128.8889 },
  { name: "경상남도", lat: 35.4606, lng: 128.2132 },
  { name: "제주특별자치도", lat: 33.4996, lng: 126.5312 },
];

/**
 * 이름으로 시도 좌표 찾기
 * @param name 시도 이름
 * @returns 좌표 또는 undefined
 */
export const findProvinceLocation = (name: string) => {
  // 정확한 일치 먼저 확인
  const exactMatch = PROVINCE_LOCATIONS.find((location) => location.name === name);
  if (exactMatch) return exactMatch;

  // 부분 일치 확인 (예: "강원도"가 "강원특별자치도"와 일치하도록)
  const partialMatch = PROVINCE_LOCATIONS.find(
    (location) => name.includes(location.name) || location.name.includes(name)
  );

  return partialMatch;
};