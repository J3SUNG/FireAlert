# FireAlert 주석 가이드라인

## 주석 원칙

1. **가독성**: 명확하고 간결하게 작성
2. **필요성**: 복잡한 로직이나 비직관적인 코드에만 작성
3. **유지보수**: 코드 변경 시 주석도 함께 업데이트

## 파일/컴포넌트 상단 주석

컴포넌트나 파일의 목적을 설명하는 주석은 파일 상단에 작성합니다:

```tsx
/**
 * 산불 지도 컴포넌트
 * 
 * 지도에 산불 데이터를 마커로 표시하고 지역 경계를 GeoJSON으로 렌더링합니다.
 */
export const ForestFireMap: FC<ForestFireMapProps> = React.memo(({ ... }) => {
  // ...
});
```

```typescript
/**
 * 산불 통계 계산 관련 유틸리티 함수 모음
 */
```

## 함수 주석

함수의 목적과 동작을 설명하는 주석은 다음 형식으로 작성합니다:

```typescript
/**
 * 산불 데이터를 가져오고 관리하는 커스텀 훅
 * 
 * 서버에서 데이터를 가져오고 상태별/대응단계별 카운트를 계산합니다.
 */
export function useForestFireData() {
  // ...
}
```

```typescript
/**
 * 상태별 카운트 계산
 * 
 * 산불 상태별 개수 계산 (전체, 진행중, 통제중, 진화완료)
 */
export const calculateStatusCounts = (fires: ForestFireData[]) => {
  // ...
};
```

## 인라인 주석

코드 내부의 중요한 로직이나 결정을 설명할 때 사용합니다:

```typescript
// 고유 ID 생성 - 렌더링 간 안정성 보장
const instanceId = useMemo(() => `map-${Date.now()}`, []);

// 지도 로드 완료 시 준비 상태 업데이트
useEffect(() => {
  if (!mountedRef.current) return;
  
  if (isMapLoaded && map && mapContainerRef.current) {
    // 지연시간을 통해 DOM이 완전히 렌더링될 때까지 대기
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setMapReady(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }
  
  return undefined;
}, [isMapLoaded, map]);
```

## 상수와 매핑 주석

상수나 매핑 객체에 대한 설명은 다음과 같이 작성합니다:

```typescript
/**
 * 시도 이름 약어 매핑
 * 
 * 긴 행정구역명을 간결한 형태로 변환
 */
export const provinceShortNames: Record<string, string> = {
  "서울특별시": "서울",
  "부산광역시": "부산",
  // ...
};
```

## 주석 실천 가이드

### 좋은 주석의 특징

- 간결하고 명확한 문장 사용
- 함수나 컴포넌트의 "무엇"보다 "왜"에 초점
- 비즈니스 로직이나 복잡한 알고리즘 설명
- 코드만으로는 이해하기 어려운 맥락 제공

### 불필요한 주석 지양

```typescript
// 불필요: 코드가 이미 자명함
// fires 배열의 길이를 반환
return fires.length;

// 좋음: 비즈니스 로직이나 의도 설명
// 지연시간을 통해 DOM이 완전히 렌더링될 때까지 대기
const timer = setTimeout(() => {
  // ...
}, 300);
```

### 주석 형식

- 컴포넌트/파일/함수 설명: JSDoc 스타일 주석 (`/**...*/`)
- 코드 내 설명: 한 줄 주석 (`// ...`)
- 멀티라인 설명: 여러 줄의 한 줄 주석 (`// ... \n // ...`)

## 유지보수 가이드

- 코드를 수정할 때 관련 주석도 함께 업데이트
- 오래된/부정확한 주석은 제거하거나 수정
- 주석이 너무 많아지면 코드 자체의 가독성 개선 고려
