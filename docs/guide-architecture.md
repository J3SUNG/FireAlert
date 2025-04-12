# FireAlert 아키텍처 가이드

## FSD 구조의 핵심

FSD(Feature-Sliced Design)는 기능 중심의 모듈화된 아키텍처입니다.

### 레이어 (Layers)

```
app/ → pages/ → features/ → shared/
```

- **app**: 전역 설정, 스타일, 라우팅
- **pages**: 라우팅 단위 페이지
- **features**: 독립적인 기능 단위
- **shared**: 재사용 가능한 공통 모듈

### 각 레이어의 세그먼트 구성

**app 레이어**:

- `providers/` - 전역 프로바이더 (상태, 테마 등)
- `styles/` - 전역 스타일, CSS 변수
- `config/` - 앱 구성 및 상수

**pages 레이어**:

- `ui/` - 페이지 컴포넌트
- `model/` - 페이지별 타입, 상태
- `lib/` - 페이지 관련 유틸리티

**features 레이어**:

- `ui/` - 기능 UI 컴포넌트
- `model/` - 기능 관련 타입, 상수
- `lib/` - 로직, 커스텀 훅
- `api/` - 기능별 API 통신 (필요시)

**shared 레이어**:

- `ui/` - 공통 UI 컴포넌트
- `lib/` - 공통 유틸리티, 헬퍼 함수
- `api/` - API 클라이언트, 인터셉터
- `config/` - 공통 설정 및 상수
- `types/` - 공통 타입 정의

### 세그먼트 (Segments) 역할

각 세그먼트의 역할:

```
ui/      # UI 컴포넌트만 포함
model/   # 타입, 상수, 상태 관리 관련
lib/     # 로직, 훅, 유틸리티 함수
api/     # API 통신 관련 코드
index.ts # 공개 API 정의
```

## 의존성 규칙

1. **단방향 의존성**:

   - 상위 레이어는 하위 레이어에 의존 가능 (O)
   - 하위 레이어는 상위 레이어에 의존 불가 (X)

2. **슬라이스 간 의존성**:

   - 같은 레이어 내 슬라이스 간 직접 의존성 최소화

3. **Public API 패턴**:
   - 모든 모듈은 `index.ts`를 통해서만 외부 노출
   ```typescript
   // features/forest-fire-data/index.ts
   export * from "./model";
   export * from "./lib";
   ```
