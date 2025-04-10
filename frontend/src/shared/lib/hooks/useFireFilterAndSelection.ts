import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../../model/forestFire";
import { FireFilterType } from "../../model/common/filterTypes";

/**
 * 산불 필터링 및 선택 관리 훅
 * 
 * 산불 데이터의 필터링과 선택을 관리합니다.
 */
export function useFireFilterAndSelection(fires: ForestFireData[]) {
  // 선택된 필터 상태 - 기본값은 "active"(진화중)
  const [selectedFilter, setSelectedFilter] = useState<FireFilterType>("active");
  
  // 선택된 산불 ID 상태
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  // 필터링된 산불 데이터 계산
  const filteredData = useMemo(() => {
    if (selectedFilter === "all") return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  }, [fires, selectedFilter]);

  // 산불 선택 처리 - 이미 선택된 산불을 다시 클릭하면 선택 해제
  const handleFireSelect = useCallback((fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  }, []);

  // 필터 버튼 CSS 클래스 생성
  const getButtonClass = useMemo(() => {
    return (filter: FireFilterType): string => {
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

  // 필터별 버튼 레이블 생성 (각 카테고리의 산불 개수 포함)
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

  // 필터 변경 처리 - 필터 변경 시 선택된 산불 해제
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