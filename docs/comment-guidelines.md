# 주석 작성 가이드라인

## 핵심 원칙
- 코드는 자기 설명적으로, 주석은 꼭 필요할 때만 사용
- "무엇"보다 "왜"에 집중하는 주석 작성
- 명확하고 간결하게 유지

## JSDoc 사용
- **적용 대상**: 공개 API, 주요 컴포넌트, 복잡한 유틸리티 함수
- **형식**:
  ```typescript
  /**
   * 함수에 대한 간결한 설명
   * @param paramName 설명 (타입은 생략)
   */
  ```

## 일반 주석 사용
- **권장 사례**:
  - 복잡한 로직 설명
  - 예외 케이스 처리 이유
  - 최적화 코드 표시
  - 임시 해결책 표시

- **예시**:
  ```typescript
  // 캐싱으로 불필요한 API 호출 방지
  const cachedData = useMemo(() => computeValue(a, b), [a, b]);
  
  // TODO: API 변경 시 수정 필요
  ```

## 피해야 할 주석
- 코드를 단순히 반복하는 주석
- 오래되거나 부정확한 정보
- 불필요하게 긴 설명
- 자명한 코드에 대한 설명

## 표준 태그 (필요시)
- `// TODO: 작업 예정`
- `// FIXME: 수정 필요`
- `// NOTE: 중요 정보`

## 컴포넌트 문서화 예시

```typescript
/**
 * 산불 데이터를 필터링하여 지도에 표시하는 컴포넌트
 * 
 * @param fires 표시할 산불 데이터 배열
 * @param selectedFilter 현재 적용된 필터 (기본값: 'all')
 */
export const ForestFireMap: React.FC<ForestFireMapProps> = ({
  fires,
  selectedFilter = 'all'
}) => {
  // 구현...
}
```

## 유틸리티 함수 문서화 예시

```typescript
/**
 * 산불 심각도에 따라 적절한 마커 아이콘을 반환
 * 
 * @param severity 산불 심각도 레벨
 */
export function getMarkerIcon(severity: FireSeverity): L.Icon {
  // 구현...
}
```

이 가이드라인은 코드 이해도와 유지보수성을 높이면서도 불필요한 주석으로 인한 노이즈를 줄이는 데 중점을 둡니다.
