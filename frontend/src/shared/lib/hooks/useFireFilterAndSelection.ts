import { useState, useMemo, useCallback } from "react";
import { ForestFireData } from "../../model/forestFire";
import { FireFilterType } from "../../model/common/filterTypes";

/**
 * 산불 필터링 및 선택 관리 훅
 * 산불 데이터의 필터링과 선택을 관리하는 훅입니다.
 * 상태별 필터링, 산불 선택 기능, 버튼 클래스 관리 등을 제공합니다.
 * 
 * @param fires 산불 데이터 배열
 * @returns 산불 필터링과 선택 관리에 필요한 상태와 함수들
 */
export function useFireFilterAndSelection(fires: ForestFireData[]) {
  /**
   * 선택된 필터 상태
   * 기본값은 "active"(진화중) 상태로 설정
   */
  const [selectedFilter, setSelectedFilter] = useState<FireFilterType>("active");
  
  /**
   * 선택된 산불 ID 상태
   */
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  /**
   * 필터링된 산불 데이터
   * 선택된 필터에 따라 산불 데이터를 필터링합니다.
   */
  const filteredData = useMemo(() => {
    if (selectedFilter === "all") return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  }, [fires, selectedFilter]);

  /**
   * 산불 선택 핵들러
   * 산불을 선택하거나 선택 해제하는 함수입니다.
   * 이미 선택된 산불을 다시 클릭하면 선택이 해제됩니다.
   * 
   * @param fire 선택한 산불 데이터
   */
  const handleFireSelect = useCallback((fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  }, []);

  /**
   * 필터 버튼 CSS 클래스 생성 함수
   * 필터 상태에 따라 적절한 CSS 클래스를 생성합니다.
   * 
   * @param filter 필터 유형
   * @returns CSS 클래스 문자열
   */
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

  /**
   * 필터 버튼 레이블 생성 함수
   * 필터별 버튼에 표시할 레이블을 생성합니다.
   * 각 카테고리의 산불 개수를 표시합니다.
   * 
   * @param counts 상태별 카운트
   * @returns 필터별 버튼 레이블 객체
   */
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

  /**
   * 필터 변경 처리 함수
   * 필터 변경 시 선택된 산불을 해제합니다.
   * 
   * @param newFilter 새 필터 값
   */
  const handleFilterChange = useCallback((newFilter: FireFilterType) => {
    setSelectedFilter(newFilter);
    // 필터 변경시 선택된 산불 해제
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
