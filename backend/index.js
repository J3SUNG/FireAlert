const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

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
      // API 오류 시 빈 응답 반환
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

app.listen(4000, () => {
  console.log("서버 실행 중: http://localhost:4000");
});
