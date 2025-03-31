import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../types/forestFire";

export function useFireFilterAndSelection(fires: ForestFireData[]) {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "contained" | "extinguished"
  >("active"); // 기본값을 "active"(진화중)로 변경
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    if (selectedFilter === "all") return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  }, [fires, selectedFilter]);

  const handleFireSelect = useCallback((fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  }, []);

  const getButtonClass = useMemo(() => {
    return (filter: "all" | "active" | "contained" | "extinguished"): string => {
      const className = "fire-button";
  
      if (filter === selectedFilter) {
        if (filter === "all") return `${className} fire-button--active-all`;
        if (filter === "active") return `${className} fire-button--active-red`;
        if (filter === "contained") return `${className} fire-button--active-orange`;
        return `${className} fire-button--active-green`;
      }
  
      return className;
    };
  }, [selectedFilter]);

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

  // 필터 변경 시 선택된 산불 해제
  const handleFilterChange = useCallback((newFilter: "all" | "active" | "contained" | "extinguished") => {
    setSelectedFilter(newFilter);
    // 필터 변경시 선택된 산불 해제
    setSelectedFireId(undefined);
  }, []);

  return {
    selectedFilter,
    setSelectedFilter: handleFilterChange, // 기본 setter 대신 새 함수 사용
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  };
}