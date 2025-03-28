/**
 * GeoJSON 데이터 처리 최적화 유틸리티
 * - 대용량 지도 데이터를 효율적으로 처리하기 위한 기능 제공
 */

/**
 * 산불 관련 시군구 이름 목록
 * - 산불 데이터에서 나타날 가능성이 높은 지역 이름
 */
const PRIORITY_REGIONS = [
  // 산림이 많은 주요 지역
  '강원도', '경기도', '경상북도', '경상남도', '전라북도', '전라남도', '충청북도', '충청남도',
  // 산불 다발 지역
  '안동시', '봉화군', '영양군', '송풍군', '평창군', '제천시', '가평군', '양주시',
  '포항시', '양양군', '인제군', '화성시', '양평군', '지리산', '소백산', '석관대'
];

/**
 * 대용량 GeoJSON 데이터 최적화 함수
 * - 대용량 지도 데이터 처리 시 메모리 사용량 최적화 및 성능 향상
 * @param data GeoJSON 데이터 객체
 * @param maxFeatures 최대 피처 수 (기본값 300)
 * @param relevantRegions 연관성 높은 지역명 목록 (사용할 시군구 이름 목록)
 * @returns 최적화된 GeoJSON 데이터
 */
export const optimizeGeoJson = (data: any, maxFeatures: number = 300, relevantRegions: string[] = []) => {
  // 데이터 유효성 검사
  if (!data || !data.features || !Array.isArray(data.features)) {
    console.warn('유효하지 않은 GeoJSON 데이터');
    return data;
  }

  console.log(`원본 GeoJSON 피처 수: ${data.features.length}`);
  
  // 메모리 사용량 최적화
  if (data.features.length > maxFeatures) {
    console.log(`성능 최적화를 위해 피처 수를 ${maxFeatures}개로 제한합니다.`);
    
    // 우선순위에 따른 필터링
    // 1. 시도 레벨 피처 (전국/도/광역시 단위)
    const sidoFeatures = data.features.filter((feature: any) => {
      const name = feature?.properties?.SIG_KOR_NM || '';
      return name.endsWith('도') || name.endsWith('광역시') || 
             name.endsWith('특별시') || name.endsWith('특별자치시') || name.endsWith('특별자치도');
    });

    // 2. 산불 관련 지역 피처 필터링
    const priorityRegions = [...PRIORITY_REGIONS, ...relevantRegions];
    const priorityFeatures = data.features.filter((feature: any) => {
      const name = feature?.properties?.SIG_KOR_NM || '';
      // 특정 시군구가 우선순위 목록에 있는지 확인
      return !sidoFeatures.includes(feature) && priorityRegions.some(region => 
        name.includes(region) || 
        region.includes(name)
      );
    });
    
    // 3. 일반 시군구 피처 (아직 선택되지 않은 피처)
    const otherFeatures = data.features.filter(
      feature => !sidoFeatures.includes(feature) && !priorityFeatures.includes(feature)
    );
    
    // 피처 할당 비율 (시도 25%, 우선순위 50%, 일반 25%)
    const sidoLimit = Math.floor(maxFeatures * 0.25);
    const priorityLimit = Math.floor(maxFeatures * 0.5);
    const otherLimit = maxFeatures - sidoLimit - priorityLimit;
    
    // 각 카테고리에서 제한된 수의 피처 선택
    const selectedSido = sidoFeatures.slice(0, Math.min(sidoFeatures.length, sidoLimit));
    const selectedPriority = priorityFeatures.slice(0, Math.min(priorityFeatures.length, priorityLimit));
    
    // 일반 피처는 랜덤 샘플링으로 다양성 확보
    const shuffledFeatures = [...otherFeatures].sort(() => Math.random() - 0.5);
    const selectedOther = shuffledFeatures.slice(0, Math.min(shuffledFeatures.length, otherLimit));
    
    // 최종 최적화된 GeoJSON 생성
    const optimizedData = {
      type: "FeatureCollection",
      features: [...selectedSido, ...selectedPriority, ...selectedOther]
    };
    
    console.log(`최적화 결과: 시도 ${selectedSido.length}개, 우선지역 ${selectedPriority.length}개, 기타 ${selectedOther.length}개`);
    console.log(`최적화 후 총 피처 수: ${optimizedData.features.length}`);
    
    return optimizedData;
  }
  
  return data;
};

/**
 * 시군구 이름 정규화 함수
 * - 지역 이름을 비교하기 쉽게 표준화
 * @param name 지역 이름
 * @returns 정규화된 지역 이름
 */
export const normalizeRegionName = (name: string): string => {
  if (!name) return '';
  
  // 특수문자, 공백 정리 및 소문자 변환
  const cleaned = name.trim()
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[^\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\uD7B0-\uD7FF\s]/g, '');
  
  return cleaned;
};

/**
 * 지역명 유사도 계산 함수
 * - 두 지역명 간의 유사도를 계산 (0~1 사이 값, 1이 완전 일치)
 * @param name1 첫 번째 지역명
 * @param name2 두 번째 지역명
 * @returns 유사도 점수 (0~1)
 */
export const calculateSimilarity = (name1: string, name2: string): number => {
  if (!name1 || !name2) return 0;
  
  const norm1 = normalizeRegionName(name1);
  const norm2 = normalizeRegionName(name2);
  
  // 완전 일치
  if (norm1 === norm2) return 1;
  
  // 포함 관계 (A가 B를 포함)
  if (norm1.includes(norm2)) return 0.8;
  if (norm2.includes(norm1)) return 0.8;
  
  // 부분 일치 (앞부분이 같은 경우)
  const minLength = Math.min(norm1.length, norm2.length);
  const prefixLength = [...Array(minLength)].findIndex((_, i) => norm1[i] !== norm2[i]);
  if (prefixLength > 0) {
    const prefixScore = prefixLength / minLength;
    return prefixScore * 0.6; // 가중치 적용
  }
  
  return 0; // 유사성 없음
};

/**
 * 최적의 지역 매칭 함수
 * - 주어진 지역명과 가장 유사한 지역을 찾음
 * @param regions 검색할 지역명 목록
 * @param targetName 찾을 지역명
 * @param threshold 최소 유사도 임계값 (기본값 0.6)
 * @returns 가장 유사한 지역명 또는 null
 */
export const findBestMatch = (regions: string[], targetName: string, threshold: number = 0.6): string | null => {
  if (!targetName || !regions || !regions.length) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const region of regions) {
    const score = calculateSimilarity(region, targetName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = region;
    }
  }
  
  // 임계값보다 높은 유사도를 가진 경우에만 결과 반환
  return bestScore >= threshold ? bestMatch : null;
};

/**
 * 지오메트리 단순화 함수
 * - 복잡한 지오메트리를 더 적은 포인트로 단순화
 * @param coordinates 좌표 배열
 * @param tolerance 단순화 허용 오차
 * @returns 단순화된 좌표 배열
 */
export const simplifyGeometry = (coordinates: any[], tolerance: number = 0.01): any[] => {
  // 단순한 구조는 그대로 반환
  if (!coordinates || coordinates.length <= 2) return coordinates;
  
  // 재귀적으로 중첩된 배열 처리
  if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
    return coordinates.map(coord => simplifyGeometry(coord, tolerance));
  }
  
  // 배열이 중첩된 좌표인 경우
  if (Array.isArray(coordinates[0]) && typeof coordinates[0][0] === 'number') {
    // 더글라스-포이커 알고리즘을 사용한 단순화 대신 샘플링
    if (coordinates.length > 50) {
      const samplingRate = Math.max(1, Math.floor(coordinates.length / 50));
      return coordinates.filter((_, i) => i % samplingRate === 0 || i === coordinates.length - 1);
    }
    return coordinates;
  }
  
  return coordinates;
};
