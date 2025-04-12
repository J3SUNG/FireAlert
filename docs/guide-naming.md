# FireAlert 네이밍 가이드라인

## 디렉토리 네이밍

- 모든 디렉토리는 **kebab-case** 사용
  ```
  forest-fire-map/
  fire-alert-ui/
  ```

- FSD 레이어는 영어 소문자
  ```
  app/
  pages/
  features/
  shared/
  ```

## 파일 네이밍

### 컴포넌트 파일
- **PascalCase** + .tsx
  ```
  FireAlertPage.tsx
  ForestFireMap.tsx
  ```

### CSS 파일
- 컴포넌트와 동일한 이름
  ```
  FireAlertHeader.tsx
  FireAlertHeader.css
  ```

### 타입스크립트 파일
- **camelCase** + .ts
  ```
  types.ts
  mapUtils.ts
  forestFireService.ts
  ```

### 인덱스 파일
- 모든 디렉토리에 index.ts 또는 index.tsx
  ```typescript
  // 공개 API
  export * from './model';
  export * from './lib';
  ```

## 컴포넌트 명명

- React 컴포넌트: **PascalCase**
  ```typescript
  export const ForestFireMap = () => { ... }
  ```

- 컨테이너 컴포넌트: `Container` 접미사
  ```typescript
  export const ForestFireMapContainer = () => { ... }
  ```

## 변수 및 함수 명명

- 변수: **camelCase**
  ```typescript
  const fireData = fetchFireData();
  ```

- 불리언 변수: is, has, should 접두사
  ```typescript
  const isLoading = true;
  const hasError = false;
  ```

- 상수: **UPPER_SNAKE_CASE**
  ```typescript
  const MAX_RETRIES = 3;
  ```

- 함수: **camelCase** + 동사로 시작
  ```typescript
  function fetchFireData() { ... }
  ```

- 이벤트 핸들러: `handle` 접두사
  ```typescript
  const handleClick = () => { ... }
  ```

- 커스텀 훅: `use` 접두사
  ```typescript
  function useForestFireData() { ... }
  ```

## CSS 클래스 명명

- BEM 방법론 기반
  ```css
  .block { }
  .block__element { }
  .block__element--modifier { }
  ```

- 예시:
  ```css
  .fire-alert { }
  .fire-alert__header { }
  .fire-alert__button--active { }
  ```
