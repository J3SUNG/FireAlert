# FireAlert 스타일 가이드

## 스타일 파일 구조

```
app/
  styles/            # 전역 스타일
    variables/
      variables.css  # CSS 변수
    index.css        # 전역 스타일

features/
  feature-name/
    ui/
      Component.css  # 컴포넌트 스타일
```

## CSS 변수 사용

모든 디자인 토큰은 `app/styles/variables/variables.css`에 정의:

```css
.my-component {
  color: var(--color-text-primary);
  margin: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

## 주요 변수 카테고리

### 색상

```css
/* 기본 색상 팔레트 */
--color-white: #ffffff;
--color-gray-500: #64748b;

/* 의미적 색상 */
--color-text-primary: var(--color-gray-900);
--color-bg-primary: var(--color-white);
--color-status-active: var(--color-red-500);
```

### 간격

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

### 폰트

```css
--font-size-md: 1rem;     /* 16px (기본) */
--font-size-lg: 1.125rem; /* 18px */
--font-weight-normal: 400;
--font-weight-bold: 700;
```

### 반응형

```css
--breakpoint-sm: 576px;  /* 모바일 */
--breakpoint-md: 768px;  /* 태블릿 */
--breakpoint-lg: 992px;  /* 노트북 */
```

## CSS 클래스 작성 규칙

1. **CSS 변수 사용**
   ```css
   /* 좋은 예 */
   color: var(--color-text-primary);
   
   /* 나쁜 예 */
   color: #1e293b;
   ```

2. **컴포넌트 스코프 스타일**
   ```css
   /* 좋은 예 */
   .forest-fire-map__marker { }
   
   /* 나쁜 예 */
   .marker { } /* 너무 일반적인 이름 */
   ```

3. **의미적인 클래스 이름**
   ```css
   /* 좋은 예 */
   .fire-alert__status-badge { }
   
   /* 나쁜 예 */
   .red-text { } /* 스타일 기반 이름 */
   ```

4. **모바일 우선 접근법**
   ```css
   /* 기본 (모바일) */
   .component { }
   
   /* 태블릿 이상 */
   @media (min-width: var(--breakpoint-md)) {
     .component { }
   }
   ```
