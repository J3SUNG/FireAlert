import { forestFireService } from "../../../shared/services/forestFireService";

export const forestFireApi = {
  getForestFires: (forceRefresh = false) => forestFireService.getForestFires(forceRefresh),
  clearCache: () => forestFireService.clearCache(),
};
