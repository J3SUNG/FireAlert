import L from "leaflet";
import "leaflet/dist/leaflet.css";

let mapInstance: L.Map | null = null;

export async function getMap(containerId: string) {
  // 기존 지도 인스턴스 제거
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // 새 지도 생성 (시작 위치는 의미 없음 → 아래에서 fitBounds 할 거니까)
  mapInstance = L.map(containerId, {
    zoomControl: false,
    attributionControl: false,
  });

  // 배경 흰색 설정
  const mapEl = document.getElementById(containerId);
  if (mapEl) {
    mapEl.style.backgroundColor = "white";
  }

  // GeoJSON 데이터 불러오기
  const response = await fetch("/korea_sigungu_wgs84.geojson");
  const geojson = await response.json();

  console.log(geojson.features[0]);

  // GeoJSON 레이어 생성
  const geoLayer = L.geoJSON(geojson, {
    style: {
      color: "black", // 경계선 검정색
      weight: 1, // 선 두께
      fillOpacity: 0, // 내부 투명
    },
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.SIG_KOR_NM || "시군구";
      layer.bindTooltip(name, {
        permanent: false,
        direction: "center",
      });
    },
  });

  // 지도에 추가 및 자동 확대/이동
  geoLayer.addTo(mapInstance);
  mapInstance.fitBounds(geoLayer.getBounds());
}
