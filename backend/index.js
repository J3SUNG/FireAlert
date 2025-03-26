const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/fireList", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://fd.forest.go.kr/ffas/pubConn/selectPublicFireShowList.do",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    const items = data.fireShowInfoList.map((item, idx) => ({
      index: (idx + 1).toString(),
      location: item.frfrSttmnAddr,
      percentage: item.frfrPotfrRt + "%",
    }));

    res.json(items);
  } catch (e) {
    console.error("에러 발생:", e);
    res.status(500).send("서버 에러");
  }
});

app.listen(4000, () => {
  console.log("서버 실행 중: http://localhost:4000");
});
