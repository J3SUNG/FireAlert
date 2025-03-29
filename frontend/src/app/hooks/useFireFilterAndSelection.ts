import { useState } from 'react';
import { ForestFireData } from '../../shared/types/forestFire';

/**
 * 산불 필터링 및 선택 상태를 관리하는 커스텀 훅 (SRP)
 */
export function useFireFilterAndSelection() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "contained" | "extinguished">("all");
  const [selectedFireId, setSelectedFireId] = useState<string | undefined>(undefined);

  // 필터링 함수
  const filterFires = (fires: ForestFireData[]): ForestFireData[] => {
    if (selectedFilter === "all") return fires;
    return fires.filter((fire) => fire.status === selectedFilter);
  };

  // 산불 선택 핸들러
  const handleFireSelect = (fire: ForestFireData): void => {
    setSelectedFireId((prevId) => (prevId === fire.id ? undefined : fire.id));
  };

  // 필터 버튼 클래스 계산 (OCP: 스타일 확장 가능)
  const getButtonClass = (filter: "all" | "active" | "contained" | "extinguished"): string => {
    const className = "fire-alert__button";

    if (filter === selectedFilter) {
      if (filter === "all") return `${className} fire-alert__button--active`;
      if (filter === "active") return `${className} fire-alert__button--active-red`;
      if (filter === "contained") return `${className} fire-alert__button--active-orange`;
      return `${className} fire-alert__button--active-green`;
    }

    return className;
  };

  // 필터 버튼 라벨 생성 (DIP: 상태 카운트를 매개변수로 받음)
  const getFilterButtonLabels = (counts: {
    total: number;
    active: number;
    contained: number;
    extinguished: number;
  }) => {
    return {
      all: `전체 (${counts.total})`,
      active: `진화중 (${counts.active})`,
      contained: `통제중 (${counts.contained})`,
      extinguished: `진화완료 (${counts.extinguished})`,
    };
  };

  return {
    selectedFilter,
    setSelectedFilter,
    selectedFireId,
    filterFires,
    handleFireSelect,
    getButtonClass,
    getFilterButtonLabels
  };
}