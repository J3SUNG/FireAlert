import { useCurrentTime, useFireFilterAndSelection } from "./hooks";

import { formatLocation, extractLocation, provinceShortNames } from "./formatting";

import {
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  calculateStatusCounts,
  calculateResponseLevelCounts,
} from "./calculations/forestFireStats";

import { convertStatus, getResponseLevel } from "./data/forestFireUtils";

import { createCache } from "./cache/cacheUtils";

import { setupDefaultLeafletIcons } from "./leaflet/iconSetup";

export { useCurrentTime, useFireFilterAndSelection };

export { formatLocation, extractLocation, provinceShortNames };

export {
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  calculateStatusCounts,
  calculateResponseLevelCounts,
};

export { convertStatus, getResponseLevel };

export { createCache };

export { setupDefaultLeafletIcons };
