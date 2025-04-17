# 불씨알림 (FireAlert)

## 개요

산불 발생 정보를 실시간으로 시각화하는 단일 페이지 애플리케이션입니다. FSD 아키텍처와 함수형 프로그래밍 기반 SOLID 원칙을 적용했습니다.

## 핵심 기능

- **지도 시각화**: 산불 위치 마커 표시 및 상태별 색상 구분
- **필터링**: 진행중/통제중/진화완료 상태별 필터링
- **위험도 분류**: 대응단계별(1~3단계) 위험도 시각화
- **접근성**: 스크린 리더 및 키보드 접근성 지원

## 아키텍처

- **FSD 레이어**: app → pages → features → shared
- **세그먼트 구성**: api, ui, lib, model 구조
- **함수형 SOLID**: 함수형 패러다임 기반 SOLID 원칙 적용

## 기술 스택

- **FE**: React 18, TypeScript, Vite, Leaflet
- **BE**: Node.js, Express, Axios

## 시작하기

```bash
npm install && npm start
```

요구사항: Node.js 16+

## 실행 화면

![Image](https://github.com/user-attachments/assets/a4dbccf5-f46f-44d3-915a-c2c931e9675a)
