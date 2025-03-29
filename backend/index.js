const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/fireList", async (req, res) => {
  try {
    console.log("산불 데이터 API 요청 시작...");
    let data;
    try {
      const response = await axios.get(
        "https://fd.forest.go.kr/ffas/pubConn/selectPublicFireShowList.do",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );
      data = response.data;
      console.log("API 응답 성공");
    } catch (apiError) {
      console.error("API 호출 오류:", apiError.message);
      console.error("응답 상태 코드:", apiError.response?.status);
      console.error("응답 데이터:", apiError.response?.data);
    }

    const fireShowInfoList = data.fireShowInfoList || [];
    console.log(`총 ${fireShowInfoList.length}개의 데이터 받음`);

    // 첫 번째 데이터 샘플링
    if (fireShowInfoList.length > 0) {
      console.log("첫 번째 샘플 데이터:", {
        frfrSttmnAddr: fireShowInfoList[0].frfrSttmnAddr,
        frfrPotfrRt: fireShowInfoList[0].frfrPotfrRt,
        frfrStepIssuNm: fireShowInfoList[0].frfrStepIssuNm,
        frfrPrgrsStcdNm: fireShowInfoList[0].frfrPrgrsStcdNm,
      });
    }

    const items = fireShowInfoList.map((item, idx) => {
      // 주소 문자열에서 시군구를 추출하는 기본 로직
      const location = item.frfrSttmnAddr || "";
      let extractedSigungu = "";

      // 주소에서 시군구 추출 시도
      const parts = location.split(" ");
      if (parts.length > 2) {
        // 시군구 이름 찾기
        for (let i = 1; i < parts.length; i++) {
          if (parts[i].endsWith("시") || parts[i].endsWith("군") || parts[i].endsWith("구")) {
            extractedSigungu = parts[i];
            break;
          }
        }

        // 못 찾았으면 기본적으로 3번째 토큰 사용
        if (!extractedSigungu && parts.length > 2) {
          extractedSigungu = parts[2];
        }
      }

      // 원본 처리 저장
      return {
        index: (idx + 1).toString(),
        location: item.frfrSttmnAddr,
        sigungu: extractedSigungu, // 추출한 시군구 이름 추가
        percentage: (() => {
          // 퍼센트 값 안전하게 처리
          if (!item.frfrPotfrRt) return "0";

          // 문자열이면 % 기호 제거
          if (typeof item.frfrPotfrRt === "string") {
            return item.frfrPotfrRt.replace(/%/g, "");
          }

          // 숫자면 문자열로 변환
          if (typeof item.frfrPotfrRt === "number") {
            return String(item.frfrPotfrRt);
          }

          // 다른 타입은 그냥 문자열로 변환
          return String(item.frfrPotfrRt);
        })(),
        date: item.frfrSttmnDt,
        issueName: item.frfrStepIssuNm,
        status: item.frfrPrgrsStcdNm,
      };
    });

    // 변환된 데이터 샘플 확인
    if (items.length > 0) {
      console.log(
        "초기대응 단계(issueName) 값들:",
        [...new Set(items.map((item) => item.issueName))].filter(Boolean)
      );
      console.log(
        "현재 상태(status) 값들:",
        [...new Set(items.map((item) => item.status))].filter(Boolean)
      );
      console.log(
        "진화중 상태 존재 여부:",
        items.some(
          (item) => item.status && (item.status.includes("진화중") || item.status.includes("진행"))
        )
      );
    }

    res.json(items);
  } catch (e) {
    console.error("에러 발생:", e);
    res.status(500).send("서버 에러");
  }
});

app.listen(4000, () => {
  console.log("서버 실행 중: http://localhost:4000");
});
