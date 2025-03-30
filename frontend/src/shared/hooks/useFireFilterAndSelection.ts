import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../types/forestFire";

/**
 * 산불 필터링 및 선택 상태를 관리하는 커스텀 훅 (SRP)
 */
export function useFireFilterAndSelection(fires: ForestFireData[]) {
  // 상태 관리
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "contained" | "extinguished"
  >("all");
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  // 필터링 함수 - 메모이제이션 적용
  const filteredData = useMemo(() => {
    if (selectedFilter === "all") return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  }, [fires, selectedFilter]);

  // 산불 선택 핸들러 - 메모이제이션 적용
  const handleFireSelect = useCallback((fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  }, []);

  // 필터 버튼 클래스 계산 - 메모이제이션 적용
  const getButtonClass = useMemo(() => {
    return (filter: "all" | "active" | "contained" | "extinguished"): string => {
      const className = "fire-alert__button";
  
      if (filter === selectedFilter) {
        if (filter === "all") return `${className} fire-alert__button--active`;
        if (filter === "active") return `${className} fire-alert__button--active-red`;
        if (filter === "contained") return `${className} fire-alert__button--active-orange`;
        return `${className} fire-alert__button--active-green`;
      }
  
      return className;
    };
  }, [selectedFilter]);

  // 필터 버튼 라벨 생성 - 메모이제이션 적용
  const getFilterButtonLabels = useMemo(() => {
    return (counts: {
      total: number;
      active: number;
      contained: number;
      extinguished: number;
    }) => ({
      all: `전체 (${counts.total})`,
      active: `진화중 (${counts.active})`,
      contained: `통제중 (${counts.contained})`,
      extinguished: `진화완료 (${counts.extinguished})`,
    });
  }, []);

  // 현재 필터에 따라 데이터 필터링

  return {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    setSelectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  };
}
