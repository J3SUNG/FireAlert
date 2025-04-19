import L from "leaflet";

/**
 * Leaflet 아이콘 기본 설정을 초기화하는 함수
 */
export function setupDefaultLeafletIcons(): void {
  interface IconDefault extends L.Icon.Default {
    _getIconUrl?: unknown;
  }

  delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
