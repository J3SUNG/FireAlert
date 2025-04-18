/**
 * 위치 정보 포맷팅 관련 유틸리티
 */

/**
 * 시도 이름 약어 매핑
 */
export const provinceShortNames: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

/**
 * 위치 문자열에서 시도와 시군구 추출
 */
export const extractLocation = (
  location: string,
  sigungu?: string
): { province: string; district: string } => {
  if (!location || location === "") return { province: "기타", district: "" };

  const provinceMap: Record<string, string> = {};

  for (const [fullName, shortName] of Object.entries(provinceShortNames)) {
    provinceMap[shortName] = fullName;
  }

  Object.assign(provinceMap, {
    강원: "강원도",
    경기: "경기도",
    경남: "경상남도",
    경북: "경상북도",
    광주: "광주광역시",
    대구: "대구광역시",
    대전: "대전광역시",
    부산: "부산광역시",
    서울: "서울특별시",
    세종: "세종특별자치시",
    울산: "울산광역시",
    인천: "인천광역시",
    전남: "전라남도",
    전북: "전라북도",
    제주: "제주특별자치도",
    충남: "충청남도",
    충북: "충청북도",
  });

  const parts = location.split(" ").filter((part) => part.trim() !== "");
  let province = "기타";
  let district = "";

  if (parts.length > 0) {
    if (
      parts[0].includes("도") ||
      parts[0].includes("시") ||
      parts[0].includes("특별") ||
      parts[0].includes("광역")
    ) {
      province = parts[0];
    } else if (provinceMap[parts[0]]) {
      province = provinceMap[parts[0]];
    }
  }

  if (sigungu && sigungu.trim().length > 0) {
    district = sigungu.trim();
  } else if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].endsWith("시") || parts[i].endsWith("군") || parts[i].endsWith("구")) {
        district = parts[i];
        break;
      }
    }
  }

  return { province, district };
};

/**
 * 위치 정보 포맷팅
 */
export const formatLocation = (location: string, sigungu?: string): string => {
  const { province, district } = extractLocation(location, sigungu);

  const shortProvince = provinceShortNames[province] || province;

  if (district && district.trim() !== "") {
    return `${shortProvince} ${district}`;
  }

  return shortProvince;
};
