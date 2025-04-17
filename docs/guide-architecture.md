# FSD 아키텍처 가이드

## 핵심 구조

```
app/ → pages/ → features/ → shared/
```

## 레이어 역할

- **app**: 앱 초기화, 전역 설정, 라우팅
- **pages**: 라우트별 페이지 컴포넌트
- **features**: 독립적 기능 단위
- **shared**: 재사용 가능한 공통 코드

## 세그먼트 구성

각 레이어는 다음 세그먼트로 구성할 수 있습니다:

```
ui/         # UI 컴포넌트
model/      # 타입, 인터페이스 정의
lib/        # 로직, 훅, 유틸리티
api/        # API 통신 코드
constants/  # 상수 정의
```

- 각 feature는 필요한 세그먼트만 포함 가능 (모든 세그먼트 필수 아님)
- 세그먼트 내부에 추가 하위 구조 사용 가능 (예: lib/hooks)

## 실제 구조 예시

```
src/
├── app/               # 앱 초기화, 전역 설정
├── pages/               # 라우트 단위 페이지 컴포넌트
├── features/
│   ├── fire-alert-ui/     # UI 관련 기능 (ui, lib, model)
│   ├── forest-fire-data/  # 데이터 관리 (lib, model)
│   └── forest-fire-map/   # 지도 기능 (ui, lib, model)
└── shared/            # 공통 코드 (api, ui, lib, model, constants)
```

## 의존성 규칙

- 상위 → 하위 레이어 참조만 허용 (app → pages → features → shared)
- 모듈은 index.ts를 통해서만 외부 노출 (Public API 패턴)
- 관심사별로 명확히 분리된 구조 유지
- 공통 기능은 shared에 구현하여 중복 방지
