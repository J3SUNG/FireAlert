// 한국 지역명 데이터 (영문, 한글 매핑)
export interface KoreanProvince {
  NL_NAME_1: string; // 한글 지역명
  koreanNameShort?: string; // 축약된 한글 지역명 (옵션)
}

// 한국 시도 매핑 데이터
export const KOREAN_PROVINCES: KoreanProvince[] = [
  { NL_NAME_1: "강원도", koreanNameShort: "강원" },
  { NL_NAME_1: "경기도", koreanNameShort: "경기" },
  { NL_NAME_1: "경상남도", koreanNameShort: "경남" },
  { NL_NAME_1: "경상북도", koreanNameShort: "경북" },
  { NL_NAME_1: "광주광역시", koreanNameShort: "광주" },
  { NL_NAME_1: "대구광역시", koreanNameShort: "대구" },
  { NL_NAME_1: "대전광역시", koreanNameShort: "대전" },
  { NL_NAME_1: "부산광역시", koreanNameShort: "부산" },
  { NL_NAME_1: "서울특별시", koreanNameShort: "서울" },
  { NL_NAME_1: "세종특별자치시", koreanNameShort: "세종" },
  { NL_NAME_1: "울산광역시", koreanNameShort: "울산" },
  { NL_NAME_1: "인천광역시", koreanNameShort: "인천" },
  { NL_NAME_1: "전라남도", koreanNameShort: "전남" },
  { NL_NAME_1: "전라북도", koreanNameShort: "전북" },
  { NL_NAME_1: "제주특별자치도", koreanNameShort: "제주" },
  { NL_NAME_1: "충청남도", koreanNameShort: "충남" },
  { NL_NAME_1: "충청북도", koreanNameShort: "충북" },
];
