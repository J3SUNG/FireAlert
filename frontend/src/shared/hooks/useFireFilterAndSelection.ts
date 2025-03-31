import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../types/forestFire";

export function useFireFilterAndSelection(fires: ForestFireData[]) {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "contained" | "extinguished"
  >("all");
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

  return {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  };
}