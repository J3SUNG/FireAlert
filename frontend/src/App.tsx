import axios from "axios";
import { useEffect, useState } from "react";
import { getMap } from "./mapModule";

interface FireItem {
  index: string;
  location: string;
  percentage: string;
}

function App() {
  const [items, setItems] = useState<FireItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/fireList");
        console.log("🔥 받은 데이터:", res.data);
        setItems(res.data);
      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      }
    };

    getMap("map");
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">🔥 복구현황 리스트</h1>
      <table className="table-auto border-collapse w-full text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">번호</th>
            <th className="border px-2 py-1">주소</th>
            <th className="border px-2 py-1">진행률</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-100">
              <td className="border px-2 py-1">{item.index}</td>
              <td className="border px-2 py-1">{item.location}</td>
              <td className="border px-2 py-1">{item.percentage}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col items-center">
        <h1 className="text-lg font-bold my-4">🔥 산불 복구 지도</h1>
        <div
          id="map"
          style={{
            height: "600px",
            width: "100%",
            border: "1px solid black",
          }}
        />
      </div>
    </div>
  );
}

export default App;
