import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface GeoJsonProperties {
  NL_NAME_1?: string;
  NL_NAME_2?: string;
  TYPE_2?: string;
  [key: string]: unknown;
}

interface GeoJsonFeature {
  type: string;
  properties: GeoJsonProperties;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

interface UseGeoJsonLayersOptions {
  provincesUrl: string;
  districtsUrl: string;
}

export function useGeoJsonLayers(map: L.Map | null, options: UseGeoJsonLayersOptions) {
  const geoJsonLayersRef = useRef<{
    provinces?: L.GeoJSON;
    districts?: L.GeoJSON;
  }>({});
  const [isGeoJsonLoaded, setIsGeoJsonLoaded] = useState(false);

  useEffect(() => {
    if (!map) {
      return;
    }

    let provincesLayer: L.GeoJSON | undefined;
    let districtsLayer: L.GeoJSON | undefined;

    const loadProvinces = async (): Promise<void> => {
      try {
        const response = await fetch(options.provincesUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json() as GeoJsonData;

        provincesLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
          style: () => ({
            color: '#3388ff',
            weight: 2,
            opacity: 0.8,
            fillColor: '#f0f9ff',
            fillOpacity: 0.6
          }),
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const provinceName = properties.NL_NAME_1 ?? '알 수 없음';
            
            layer.bindTooltip(provinceName, {
              permanent: true,
              direction: 'center',
              className: 'province-label'
            });
          }
        });

        provincesLayer.addTo(map);
        geoJsonLayersRef.current.provinces = provincesLayer;
        
        await loadDistricts();
      } catch {
        setIsGeoJsonLoaded(true);
      }
    };

    const loadDistricts = async (): Promise<void> => {
      try {
        const response = await fetch(options.districtsUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${String(response.status)}`);
        }
        const data = await response.json() as GeoJsonData;
        
        districtsLayer = L.geoJSON(data as GeoJSON.GeoJsonObject, {
          style: () => ({
            color: '#666',
            weight: 1,
            opacity: 0.5,
            fillColor: 'transparent',
            fillOpacity: 0
          }),
          onEachFeature: (feature, layer) => {
            const properties = feature.properties as GeoJsonProperties;
            const districtName = properties.NL_NAME_2 ?? '알 수 없음';
            
            const tooltip = L.tooltip({
              permanent: true,
              direction: 'center',
              className: 'district-label',
              opacity: 0
            });
            
            tooltip.setContent(districtName);
            layer.bindTooltip(tooltip);
            
            map.on('zoomend', () => {
              try {
                const currentZoom = map.getZoom();
                if (currentZoom >= 9) {
                  const toolTip = layer.getTooltip();
                  if (toolTip) toolTip.setOpacity(1);
                } else {
                  const toolTip = layer.getTooltip();
                  if (toolTip) toolTip.setOpacity(0);
                }
              } catch {
                // 무시
              }
            });
          }
        });

        geoJsonLayersRef.current.districts = districtsLayer;

        map.on('zoomend', () => {
          try {
            const currentZoom = map.getZoom();
            if (currentZoom >= 8 && districtsLayer) {
              if (!map.hasLayer(districtsLayer)) {
                districtsLayer.addTo(map);
              }
            } else if (districtsLayer && map.hasLayer(districtsLayer)) {
              map.removeLayer(districtsLayer);
            }
          } catch {
            // 무시
          }
        });
        
        setIsGeoJsonLoaded(true);
      } catch {
        setIsGeoJsonLoaded(true);
      }
    };

    loadProvinces().catch(() => {
      setIsGeoJsonLoaded(true);
    });

    return () => {
      try {
        if (provincesLayer && map.hasLayer(provincesLayer)) {
          map.removeLayer(provincesLayer);
        }
        
        if (districtsLayer && map.hasLayer(districtsLayer)) {
          map.removeLayer(districtsLayer);
        }
      } catch {
        // 무시
      }
    };
  }, [map, options]);

  return {
    geoJsonLayers: geoJsonLayersRef.current,
    isGeoJsonLoaded
  };
}