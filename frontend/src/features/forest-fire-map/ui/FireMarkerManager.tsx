import React, { FC } from "react";
import { FireMarkerManagerProps } from "../model/common-types";
import { useMarkerManager } from "../lib/useMarkerManager";

/**
 * 산불 마커 관리 컴포넌트
 * 마커의 생성, 업데이트, 이벤트 처리를 담당합니다.
 */
export const FireMarkerManager: FC<FireMarkerManagerProps> = React.memo(
  ({ map, fires, selectedFireId, onFireSelect, isGeoJsonLoaded }) => {
    useMarkerManager({
      map,
      fires,
      selectedFireId,
      onFireSelect,
      isGeoJsonLoaded,
    });

    return null;
  },
  (prevProps, nextProps) => {
    if (!nextProps.isGeoJsonLoaded || !prevProps.isGeoJsonLoaded) {
      return false;
    }

    if (prevProps.selectedFireId !== nextProps.selectedFireId) {
      return false;
    }

    if (prevProps.map !== nextProps.map) {
      return false;
    }

    if (prevProps.fires.length !== nextProps.fires.length) {
      return false;
    }

    const prevIds = prevProps.fires
      .map((f: any) => f.id)
      .sort()
      .join(",");
    const nextIds = nextProps.fires
      .map((f: any) => f.id)
      .sort()
      .join(",");

    return prevIds === nextIds;
  }
);
