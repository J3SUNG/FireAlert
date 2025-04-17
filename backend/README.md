# 불씨알림 백엔드

## 개요
Node.js와 Express 기반의 백엔드 서버로, 산불 데이터를 가공하여 프론트엔드에 제공합니다.

## 기술 스택
- **Node.js**: 자바스크립트 런타임
- **Express**: 웹 서버 프레임워크
- **Axios**: HTTP 요청 처리
- **Cheerio**: HTML 파싱
- **CORS**: 크로스 도메인 요청 허용

## 서버 구조
```
backend/
├── index.js        # 서버 진입점, 라우팅 설정
├── dummy.js        # 개발용 샘플 데이터
├── package.json    # 의존성 정의
└── node_modules/   # 설치된 라이브러리
```

## API 엔드포인트

### GET /api/fireList
산불 데이터 목록을 반환합니다.

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
  }
]
```

**상태 코드**:
- **200**: 성공
- **500**: 서버 오류

**오류 응답**:
```json
{
  "error": "산불 데이터를 가져오는 중 오류가 발생했습니다"
}
```

## 데이터 모델

| 필드       | 설명                       | 타입   | 예시         |
| ---------- | -------------------------- | ------ | ------------ |
| index      | 데이터 인덱스              | string | "1"          |
| location   | 산불 발생 위치             | string | "경주시 산내면" |
| sigungu    | 시군구 정보                | string | "경주시"     |
| percentage | 진화율 (%)                 | string | "80"         |
| date       | 발생 일자 (YYYYMMDD)       | string | "20250328"   |
| issueName  | 대응 단계 (1~3단계)        | string | "2단계"      |
| status     | 상태 (진행중/통제중/진화완료) | string | "진행중"     |

## 데이터 처리
1. 외부 소스에서 산불 정보 수집 (개발 환경에서는 dummy.js 사용)
2. 필요한 정보 추출 및 가공
3. JSON 형식으로 변환 후 API 응답

## 서버 실행
```bash
# 의존성 설치
npm install

# 서버 실행 (http://localhost:4000)
node index.js
```

## 설정
- **포트**: 기본값 4000
- **CORS**: localhost:3000에서 API 호출 가능
