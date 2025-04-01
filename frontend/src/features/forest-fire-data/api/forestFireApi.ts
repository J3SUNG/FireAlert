import { forestFireService } from "../../../shared/api/forestFireService";

export const forestFireApi = {
  getForestFires: (forceRefresh = false) => forestFireService.getForestFires(forceRefresh),
  clearCache: () => forestFireService.clearCache(),
};
