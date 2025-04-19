import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../../model/forestFire";
import { FireFilterType } from "../../model/filterTypes";

/**
 * 산불 필터링 및 선택 관리 훅
 */
export function useFireFilterAndSelection(fires: ForestFireData[]) {
  const [selectedFilter, setSelectedFilter] = useState<FireFilterType>(FireFilterType.ACTIVE);
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  const filteredData = useMemo(() => {
    if (selectedFilter === FireFilterType.ALL) return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  }, [fires, selectedFilter]);

  const handleFireSelect = useCallback((fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  }, []);

  const getButtonClass = useMemo(() => {
    return (filter: FireFilterType): string => {
      const className = "btn btn--pill btn--filter";

      if (filter === selectedFilter) {
        if (filter === FireFilterType.ALL) return `${className} btn--active-all`;
        if (filter === FireFilterType.ACTIVE) return `${className} btn--active-red`;
        if (filter === FireFilterType.CONTAINED) return `${className} btn--active-orange`;
        return `${className} btn--active-green`;
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

  const handleFilterChange = useCallback((newFilter: FireFilterType) => {
    setSelectedFilter(newFilter);
    setSelectedFireId(undefined);
  }, []);

  return {
    selectedFilter,
    setSelectedFilter: handleFilterChange,
    selectedFireId,
    filteredData,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels,
  };
}
