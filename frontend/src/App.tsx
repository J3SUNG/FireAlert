import { useEffect, useState } from "react";
import axios from "axios";
import FireList from "./components/FireList";
import FireMap from "./components/FireMap";
import FireSummary from "./components/FireSummary";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:4000/api/fireList");
        setItems(res.data || []);
        // 데이터 형태 확인
        console.log("전체 데이터:", res.data);
        console.log("받은 데이터 예시:", res.data.slice(0, 3));
        console.log("쮘번째 항목 형식:", res.data[0] ? Object.keys(res.data[0]).map(key => `${key}: ${typeof res.data[0][key]} = ${res.data[0][key]}`) : "No data");
        console.log("issueName 존재 여부:", res.data.some(item => item.issueName));
        console.log("status 존재 여부:", res.data.some(item => item.status && item.status.includes("진행")));
        setError("");
      } catch (e) {
        console.error("데이터 가져오기 오류:", e);
        setError("데이터를 가져오는 중 오류가 발생했습니다.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b border-gray-200 p-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">🔥 산불 복구현황 모니터링</h1>
          <div className="text-sm text-gray-500">최종 업데이트: {new Date().toLocaleString('ko-KR')}</div>
        </div>
      </header>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">데이터를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">
          <div>
            <p className="text-lg">{error}</p>
            <p className="mt-2">서버 연결을 확인해주세요.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 bg-gray-50 border-b">
            <FireSummary items={items} />
          </div>
          <div className="flex-1 overflow-hidden">
            <FireMap items={items} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
