# 파일 및 폴더 네이밍 가이드라인

이 문서는 불씨알림(FireAlert) 프로젝트의 파일 및 폴더 네이밍 규칙을 정의합니다. 일관된 네이밍 규칙을 따르면 코드의 가독성과 유지보수성이 향상됩니다.

## 디렉토리 네이밍 규칙

- 모든 디렉토리는 **kebab-case** 사용
  - 예: `fire-alert`, `forest-fire-data`, `forest-fire-map`
- FSD 아키텍처의 기본 레이어 이름은 영어 소문자 사용
  - `app`, `pages`, `features`, `shared`
- 모든 하위 디렉토리도 kebab-case 유지
  - 예: `fire-alert-ui`, `forest-fire-list`

## 파일 네이밍 규칙

### React 컴포넌트 파일
- **PascalCase** 사용
- `.tsx` 확장자 사용
- 예: `FireAlertPage.tsx`, `ForestFireList.tsx`, `MapInitializer.tsx`

### CSS 파일
- 연관된 컴포넌트와 동일한 **PascalCase** 사용
- 예:
  - `FireAlertHeader.tsx` → `FireAlertHeader.css`
  - `ForestFireList.tsx` → `ForestFireList.css`

### 타입 정의 파일
- **camelCase** 사용
- 접미사로 의미를 명확히
- 예: `types.ts`, `forestFireTypes.ts`, `mapErrorTypes.ts`

### API 및 서비스 파일
- **camelCase** 사용
- 서비스 성격을 접미사로 표현
- 예: `forestFireService.ts`, `geoJsonService.ts`

### 유틸리티 및 헬퍼 파일
- **camelCase** 사용
- 예: `mapSettings.ts`, `provinceLocations.ts`

### 상수 파일
- **camelCase** 사용
- 예: `api.ts`, `ui.ts`

### 인덱스 파일
- 모든 디렉토리에 `index.ts` 또는 `index.tsx` 포함
- 해당 디렉토리의 공개 API 내보내기 용도

## 파일명과 컴포넌트명 일치

- React 컴포넌트의 이름과 파일명은 항상 일치해야 함
- 예: `ForestFireMap.tsx` 파일 내에서는 `ForestFireMap`이라는 컴포넌트 선언

## 확장자 사용

- TypeScript 파일: `.ts`
- React 컴포넌트: `.tsx`
- 스타일시트: `.css`
- 상수, 설정 파일: `.ts`
