/**
 * 백엔드 개발을 위한 더미 산불 데이터
 * 산림청 API를 대체하여 실제 데이터 구조와 유사한 테스트 데이터를 제공합니다.
 */

const dummy = {
  /**
   * 산불 데이터 리스트
   * 산림청 API와 동일한 필드명을 사용합니다.
   * - frfrSttmnAddr: 산불 발생 주소
   * - frfrPotfrRt: 진화율 (백분율)
   * - frfrSttmnDt: 발생 일자
   * - frfrStepIssuNm: 대응 단계(초기대응, 1단계, 2단계, 3단계)
   * - frfrPrgrsStcdNm: 진행 상태(진화중, 통제중, 진화완료)
   */
  fireShowInfoList: [
    {
      frfrSttmnAddr: "강원도 강릉시 성산면",
      frfrPotfrRt: "85%",
      frfrSttmnDt: "2025-04-01",
      frfrStepIssuNm: "2단계",
      frfrPrgrsStcdNm: "진화중",
    },
    {
      frfrSttmnAddr: "경기도 가평군 설악면",
      frfrPotfrRt: "60%",
      frfrSttmnDt: "2025-04-01",
      frfrStepIssuNm: "3단계",
      frfrPrgrsStcdNm: "진화완료",
    },
    {
      frfrSttmnAddr: "전라남도 순천시 해룡면",
      frfrPotfrRt: "40%",
      frfrSttmnDt: "2025-03-31",
      frfrStepIssuNm: "초기대응",
      frfrPrgrsStcdNm: "통제중",
    },
    {
      frfrSttmnAddr: "충청북도 청주시 상당구",
      frfrPotfrRt: "95%",
      frfrSttmnDt: "2025-03-31",
      frfrStepIssuNm: "2단계",
      frfrPrgrsStcdNm: "진화중",
    },
    {
      frfrSttmnAddr: "경상북도 포항시 남구",
      frfrPotfrRt: "70%",
      frfrSttmnDt: "2025-03-30",
      frfrStepIssuNm: "3단계",
      frfrPrgrsStcdNm: "진화완료",
    },
    {
      frfrSttmnAddr: "강원도 인제군 북면",
      frfrPotfrRt: "55%",
      frfrSttmnDt: "2025-03-30",
      frfrStepIssuNm: "1단계",
      frfrPrgrsStcdNm: "진화중",
    },
    {
      frfrSttmnAddr: "전라북도 전주시 덕진구",
      frfrPotfrRt: "30%",
      frfrSttmnDt: "2025-03-29",
      frfrStepIssuNm: "2단계",
      frfrPrgrsStcdNm: "통제중",
    },
    {
      frfrSttmnAddr: "경상남도 밀양시 삼랑진읍",
      frfrPotfrRt: "80%",
      frfrSttmnDt: "2025-03-29",
      frfrStepIssuNm: "3단계",
      frfrPrgrsStcdNm: "진화중",
    },
    {
      frfrSttmnAddr: "세종특별자치시 조치원읍",
      frfrPotfrRt: "20%",
      frfrSttmnDt: "2025-03-28",
      frfrStepIssuNm: "초기대응",
      frfrPrgrsStcdNm: "진화완료",
    },
    {
      frfrSttmnAddr: "부산광역시 해운대구 중동",
      frfrPotfrRt: "50%",
      frfrSttmnDt: "2025-03-28",
      frfrStepIssuNm: "1단계",
      frfrPrgrsStcdNm: "통제중",
    },
  ],
};

module.exports = { dummy };
