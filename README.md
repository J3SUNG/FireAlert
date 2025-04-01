# 불씨알림 (FireAlert) - 산불 모니터링 시스템

## 🔥 프로젝트 소개

불씨알림은 전국의 산불 발생 정보를 실시간으로 시각화하여 제공하는 모니터링 시스템입니다. 지도 기반으로 산불 위치와 상태를 직관적으로 확인할 수 있으며, 산불 진행 상황에 따른 필터링 기능을 제공합니다.

## 📋 주요 기능

- **지도 기반 산불 시각화**: 산불 위치를 한국 지도에 마커로 표시
- **상태별 필터링**: 전체/진행중/통제중/진화완료 상태별 필터링
- **위험도 분류**: 산불의 대응단계에 따른 위험도 분류 및 시각화
- **상세 정보 제공**: 각 산불에 대한 위치, 진행 상황, 면적 등 상세 정보 확인

## 🌟 핵심 구현 사항

1. **FSD(Feature-Sliced Design) 아키텍처** 적용
   - app, pages, features, shared 레이어 구조화
   - 모듈별 명확한 책임 분리와 재사용성 향상
   - shared 레이어를 feature와 일관된 api, ui, lib, model 구조로 재설계

2. **프론트엔드 SOLID 원칙 적용**
   - 단일 책임 원칙: 각 컴포넌트와 훅이 단일 책임을 가짐
   - 개방-폐쇄 원칙: 기존 코드를 수정하지 않고 기능 확장 가능
   - 인터페이스 분리: 작고 집중된 컴포넌트 구성
   - 의존성 역전: 추상화에 의존하는 구조

3. **성능 최적화**
   - 데이터 캐싱으로 서버 요청 최소화
   - 컴포넌트 메모이제이션을 통한 렌더링 최적화
   - 지도 렌더링 지연 로딩 구현

## 🛠️ 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Vite
- Leaflet (지도 시각화)
- CSS (BEM 방법론)

### 백엔드
- Node.js
- Express
- Axios
- Cheerio (데이터 스크래핑)

## 📦 프로젝트 구조

```
FireAlert/
├── frontend/                # 프론트엔드 (React/TypeScript)
│   └── src/
│       ├── app/             # 앱 초기화, 전역 설정
│       ├── pages/           # 페이지 컴포넌트
│       ├── features/        # 기능 모듈
│       │   ├── api/         # API 연동
│       │   ├── ui/          # UI 컴포넌트
│       │   ├── lib/         # 유틸리티
│       │   └── model/       # 타입 정의
│       │
│       └── shared/          # 공유 코드 (일관된 구조)
│           ├── api/         # 공통 API 서비스
│           ├── ui/          # 공통 UI 컴포넌트
│           ├── lib/         # 공통 유틸리티, 훅, 에러 처리
│           └── model/       # 공통 타입 정의
│
├── backend/                # 백엔드 (Node.js/Express)
│   ├── index.js            # 서버 진입점
│   └── dummy.js            # 더미 데이터
│
└── package.json            # 루트 패키지 설정
```

## 🚀 시작하기

### 요구 사항
- Node.js 16 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/FireAlert.git
cd FireAlert

# 의존성 설치
npm install

# 프로젝트 실행 (프론트엔드 + 백엔드)
npm start
```

## 📱 실행 화면

![FireAlert Dashboard](https://example.com/firealert-screenshot.png)
*(이미지를 첨부하려면 프로젝트에 실제 스크린샷을 추가하세요)*

## 📚 학습 포인트

- FSD 아키텍처를 적용한 효율적인 프로젝트 구조화
  - shared 레이어를 feature와 일관된 구조로 재설계하여 코드 탐색성 및 유지보수성 향상
- 프론트엔드에 적합한 SOLID 원칙 구현
  - UI 컴포넌트, 상태 관리, 에러 처리 등 각 영역에 SOLID 원칙 적용
- React와 TypeScript를 활용한 타입 안정성 확보
  - 도메인 모델과 공통 타입을 정의하여 개발 단계에서 오류 방지
- 지도 데이터 시각화 구현 방법
  - Leaflet 라이브러리를 활용한 지도 및 마커 시각화
- 백엔드와 프론트엔드 간 효율적인 데이터 흐름 설계
  - 캐싱 전략과 에러 처리를 통한 안정적인 데이터 흐름 구현

## ⚖️ 라이센스

MIT 라이센스에 따라 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 기여자

- [J3SUNG](https://github.com/J3SUNG) - 개발자

## 🔗 참고 자료

- [Feature-Sliced Design](https://feature-sliced.design/)
- [SOLID Principles for React](https://konstantinlebedev.com/solid-in-react/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
