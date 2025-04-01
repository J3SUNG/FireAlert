# 불씨알림 (FireAlert) - 백엔드

## 📋 개요

불씨알림 프로젝트의 백엔드 서버입니다. Node.js와 Express를 기반으로 구현되었으며, 산림청의 산불 데이터를 가공하여 프론트엔드에 API 형태로 제공합니다.

## 🔧 기술 스택

- **Node.js**: 자바스크립트 런타임
- **Express**: 웹 서버 프레임워크
- **Axios**: HTTP 요청 라이브러리
- **Cheerio**: HTML 파싱 및 스크래핑 도구
- **CORS**: 교차 출처 리소스 공유 지원

## 📁 디렉토리 구조

```
backend/
├── index.js        # 서버 진입점 및 API 엔드포인트
├── dummy.js        # 더미 데이터 (개발 및 테스트용)
└── package.json    # 의존성 관리
```

## 🚀 API 엔드포인트

### 산불 데이터 API

```
GET /api/fireList
```

**응답 예시**:

```json
[
  {
    "index": "1",
    "location": "경상북도 경주시 산내면",
    "sigungu": "경주시",
    "percentage": "80",
    "date": "20250328",
    "issueName": "2단계",
    "status": "진행중"
  },
  {
    "index": "2",
    "location": "강원도 강릉시 옥계면",
    "sigungu": "강릉시",
    "percentage": "100",
    "date": "20250327",
    "issueName": "1단계",
    "status": "진화완료"
  }
]
```

## 📦 데이터 모델

### 산불 데이터 객체

| 필드       | 설명                                 | 타입   |
| ---------- | ------------------------------------ | ------ |
| index      | 데이터 인덱스                        | string |
| location   | 산불 발생 위치                       | string |
| sigungu    | 시군구 정보                          | string |
| percentage | 진화율 (%)                           | string |
| date       | 발생 일자 (YYYYMMDD)                 | string |
| issueName  | 대응 단계 (1~3단계)                  | string |
| status     | 현재 상태 (진행중, 통제중, 진화완료) | string |

## 🏗️ 주요 기능

1. **데이터 제공**

   - 산불 데이터를 JSON 형태로 가공하여 제공
   - CORS 설정으로 프론트엔드에서 API 호출 가능

2. **데이터 정제**

   - 위치 정보에서 시군구 데이터 추출
   - 진화율 데이터 정규화 (% 기호 제거)

3. **오류 처리**
   - API 호출 실패 시 빈 배열 반환
   - 서버 오류 발생 시 적절한 에러 코드 반환

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 서버 실행
node index.js
```

기본적으로 서버는 **4000번 포트**에서 실행됩니다 (http://localhost:4000).
