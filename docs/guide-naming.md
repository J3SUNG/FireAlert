# 네이밍 가이드라인

## 디렉토리 & 파일 네이밍
- 디렉토리: **kebab-case** (`forest-fire-map/`)
- 컴포넌트 파일: **PascalCase.tsx** (`ForestFireMap.tsx`)
- 스타일 파일: 컴포넌트와 동일명 (`ForestFireMap.css`)
- 일반 코드: **camelCase.ts** (`mapUtils.ts`)
- 모든 디렉토리에 `index.ts` 배치

## 코드 네이밍 규칙
- 컴포넌트: **PascalCase** (`ForestFireMap`)
- Props 인터페이스: **컴포넌트명Props** (`ForestFireMapProps`)
- 변수: **camelCase** (`fireData`)
- 불리언 변수: **is/has/should** 접두사 (`isLoading`)
- 참조 변수: **Ref** 접미사 (`mapRef`)
- 상수: **UPPER_SNAKE_CASE** (`MAP_INIT_OPTIONS`)
- 함수: 동사로 시작하는 camelCase (`fetchData()`)
- 이벤트 핸들러: **handle** 접두사 (`handleClick()`)
- 커스텀 훅: **use** 접두사 (`useMap()`)
- 타입/인터페이스: **PascalCase** (`ButtonVariant`)

## CSS 클래스 네이밍
BEM 방법론 기반:
- 블록: `forest-fire-map`
- 요소: `forest-fire-map__container`
- 수정자: `forest-fire-map--loading`

## 네이밍 원칙
- **명확성**: 목적과 의도가 이름에서 명확히 드러나야 함
- **일관성**: 동일한 개념에는 동일한 네이밍 패턴 적용
- **간결성**: 이해하기 쉽되 불필요하게 길지 않아야 함
- **검색성**: 관련 코드를 쉽게 찾을 수 있어야 함
