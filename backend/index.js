/**
 * 불씨알림(FireAlert) 백엔드 서버
 * 산불 데이터를 크롤링하거나 더미 데이터를 사용하여 API로 제공합니다.
 */

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

/**
 * 산불 데이터 조회 API 엔드포인트
 * 산림청의 산불 데이터를 조회하고 가공하여 제공합니다.
 * 현재는 더미 데이터를 사용하며, 실제 산림청 API는 주석 처리되어 있습니다.
 *
 * @route GET /api/fireList
 * @returns {object[]} 가공된 산불 데이터 배열
 */
app.get("/api/fireList", async (req, res) => {
  try {
    let data;
    try {
      const response = await axios.get(
        "https://fd.forest.go.kr/ffas/pubConn/selectPublicFireShowList.do",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
          timeout: 5000,
        }
      );
      data = response.data;
    } catch (apiError) {
      return res.json([]);
    }

    const fireShowInfoList = data.fireShowInfoList || [];

    const items = fireShowInfoList.map((item, idx) => {
      const location = item.frfrSttmnAddr || "";
      let extractedSigungu = "";

      const parts = location.split(" ");
      if (parts.length > 2) {
        for (let i = 1; i < parts.length; i++) {
          if (parts[i].endsWith("시") || parts[i].endsWith("군") || parts[i].endsWith("구")) {
            extractedSigungu = parts[i];
            break;
          }
        }

        if (!extractedSigungu && parts.length > 2) {
          extractedSigungu = parts[2];
        }
      }

      /**
       * 산불 데이터 형식 변환
       * - index: 순차 번호
       * - location: 산불 발생 위치(전체 주소)
       * - sigungu: 시군구 정보
       * - percentage: 진화율(% 기호 제거 및 숫자형으로 정규화)
       * - date: 발생 일자
       * - issueName: 대응 단계 정보
       * - status: 현재 산불 상태
       */
      return {
        index: (idx + 1).toString(),
        location: item.frfrSttmnAddr,
        sigungu: extractedSigungu,
        percentage: (() => {
          if (!item.frfrPotfrRt) return "0";

          if (typeof item.frfrPotfrRt === "string") {
            return item.frfrPotfrRt.replace(/%/g, "");
          }

          if (typeof item.frfrPotfrRt === "number") {
            return String(item.frfrPotfrRt);
          }

          return String(item.frfrPotfrRt);
        })(),
        date: item.frfrSttmnDt,
        issueName: item.frfrStepIssuNm,
        status: item.frfrPrgrsStcdNm,
      };
    });

    res.json(items);
  } catch (e) {
    res.status(500).send("서버 에러");
  }
});

/**
 * 서버 시작
 * 4000번 포트에서 서버를 시작합니다.
 */
app.listen(4000, () => {
  console.log("서버 실행 중: http://localhost:4000");
});
