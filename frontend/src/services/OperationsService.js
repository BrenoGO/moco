import { ApiService } from './ApiService';

const endpoint = 'operations';

export const OperationsService = {
  listAll: () => ApiService.get(endpoint),
  store: (operation) => ApiService.post(endpoint, operation),
  delete: (id) => ApiService.delete(endpoint, id),
  storeInternationalOperation: (payload) => ApiService.post('operations/international', payload),
  storeTransferOperation: (payload) => ApiService.post('operations/transfer', payload),
};
