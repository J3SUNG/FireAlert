# 불씨알림 (FireAlert) - 프론트엔드

## 🔥 개요

이 디렉토리는 불씨알림 프로젝트의 프론트엔드 부분입니다. React와 TypeScript를 기반으로 개발되었으며, Vite를 빌드 도구로 사용합니다. FSD(Feature-Sliced Design) 아키텍처와 SOLID 원칙을 적용하여 유지보수가 용이한 코드 구조를 지향합니다.

## 📁 디렉토리 구조

```
src/
├── app/                # 앱 초기화, 라우팅, 전역 스타일
│   ├── index.tsx       # 앱 진입점
│   ├── Router.tsx      # 라우팅 설정
│   └── styles/         # 전역 스타일
│
├── pages/              # 페이지 컴포넌트
│   └── fire-alert/     # 메인 페이지
│
├── features/           # 기능별 모듈
│   ├── forest-fire-data/    # 산불 데이터 관리
│   │   ├── api/             # API 연동
│   │   ├── lib/             # 유틸리티
│   │   └── model/           # 타입 정의
│   │
│   ├── forest-fire-list/    # 산불 목록 기능
│   │   ├── ui/              # UI 컴포넌트
│   │   └── model/           # 타입 정의
│   │
│   └── forest-fire-map/     # 산불 지도 기능
│       ├── ui/              # 지도 UI 컴포넌트
│       ├── lib/             # 지도 관련 유틸리티
│       └── model/           # 타입 정의
│
└── shared/             # 공유 코드 (FSD 구조로 일관성 있게 구성)
    ├── api/            # 공통 API 서비스
    ├── ui/             # 공통 UI 컴포넌트
    ├── lib/            # 공통 유틸리티, 훅, 에러 처리
    └── model/          # 공통 타입 정의 및 상수
```

## 🛠️ 기술 스택

- **핵심**: React 18, TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **지도 라이브러리**: Leaflet
- **HTTP 클라이언트**: Axios
- **스타일링**: CSS (BEM 방법론)

## 🌟 주요 구현 내용

### FSD 아키텍처

Feature-Sliced Design(FSD) 아키텍처를 적용하여 코드의 모듈성과 확장성을 높였습니다:

- **app**: 애플리케이션 초기화와 전역 설정
- **pages**: 각 페이지 컴포넌트
- **features**: 독립적인 기능 단위 모듈
- **shared**: 여러 모듈에서 공유되는 코드 (api, ui, lib, model로 일관성 있게 구성)

### 프론트엔드 SOLID 원칙 적용

1. **단일 책임 원칙(SRP)**
   - 컴포넌트는 렌더링, 훅은 상태 관리, 서비스는 API 통신에 집중
   - `ForestFireMap`은 지도 렌더링, `FireMarkerManager`는 마커 관리만 담당

2. **개방-폐쇄 원칙(OCP)**
   - 기존 코드를 수정하지 않고 확장 가능한 구조
   - 예: 필터 시스템은 새로운 필터 추가 시 기존 코드 수정 없이 확장 가능

3. **인터페이스 분리 원칙(ISP)**
   - 작고 집중된 컴포넌트와 훅 설계
   - 예: `useMap`, `useGeoJsonManager` 등 단일 목적의 훅 분리

4. **의존성 역전 원칙(DIP)**
   - 추상화에 의존하는 코드 구조
   - 예: API 호출을 직접하지 않고 서비스 계층을 통해 간접 호출

### Shared 레이어 일관성 (리팩토링 결과)

- feature 슬라이스와 동일한 패턴(api, ui, lib, model)으로 shared 레이어 구조화
- 일관된 디렉토리 구조로 코드 탐색 용이성 향상
- 관심사 분리가 명확해져 코드 유지보수성 개선

## 📦 주요 컴포넌트 및 기능

### 지도 관련
- **ForestFireMap**: 지도 렌더링 및 설정
- **FireMarkerManager**: 지도에 산불 마커 관리
- **GeoJsonManager**: 지도에 지역 경계 렌더링

### 목록 관련
- **ForestFireList**: 산불 목록 표시
- **ForestFireItem**: 개별 산불 정보 카드

### 필터 및 상태 관리
- **useFireFilterAndSelection**: 산불 필터링 및 선택 상태 관리
- **useForestFireData**: 산불 데이터 가져오기 및 처리

### 공통 컴포넌트
- **FireStatusSummary**: 산불 상태 요약 정보 표시

## 🚀 개발 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 📚 코드 규칙

- **컴포넌트**: 기능별로 분리하고 재사용성을 고려해 설계
- **타입**: 인터페이스와 타입을 명확히 정의하여 타입 안정성 확보
- **스타일**: BEM 방법론을 따라 CSS 클래스 네이밍
- **API 통신**: 서비스 계층을 통해 처리하고 상태 관리와 분리
- **디렉토리 구조**: feature와 shared가 동일한 패턴(api, ui, lib, model)을 유지

## 📌 참고 자료

- [Feature-Sliced Design 방법론](https://feature-sliced.design/)
- [React SOLID 원칙](https://blog.bitsrc.io/solid-principles-in-react-3b73b7b9e85c)
- [React 성능 최적화](https://reactjs.org/docs/optimizing-performance.html)
- [Leaflet 문서](https://leafletjs.com/reference.html)
