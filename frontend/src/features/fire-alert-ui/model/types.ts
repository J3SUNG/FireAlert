import { ForestFireData } from "../../../shared/model/forestFire";

export interface FilterType {
  all: string;
  active: string;
  contained: string;
  extinguished: string;
}

export interface FireAlertFilterProps {
  selectedFilter: "all" | "active" | "contained" | "extinguished";
  setSelectedFilter: (filter: "all" | "active" | "contained" | "extinguished") => void;
  buttonLabels: FilterType;
  getButtonClass: (filter: "all" | "active" | "contained" | "extinguished") => string;
}

export interface FireAlertHeaderProps extends FireAlertFilterProps {
  currentTime: Date;
  formatDate: (date: Date) => string;
}

export interface FireAlertContentProps {
  loading: boolean;
  error: string | null;
  handleReload: () => void;
  filteredData: ForestFireData[];
  selectedFireId: string | undefined;
  selectedFilter: "all" | "active" | "contained" | "extinguished";
  handleFireSelect: (fire: ForestFireData) => void;
  responseLevelCounts: {
    level3: number;
    level2: number;
    level1: number;
    initial: number;
  };
  setSelectedFilter: (filter: "all" | "active" | "contained" | "extinguished") => void;
}

export interface FireAlertSidebarProps {
  filteredData: ForestFireData[];
  selectedFilter: "all" | "active" | "contained" | "extinguished";
  selectedFireId: string | undefined;
  handleFireSelect: (fire: ForestFireData) => void;
  setSelectedFilter: (filter: "all" | "active" | "contained" | "extinguished") => void;
}