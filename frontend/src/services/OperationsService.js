import { ApiService } from './ApiService';

const endpoint = 'operations';

export const OperationsService = {
  listAll: () => ApiService.get(endpoint),
  store: (operation) => ApiService.post(endpoint, operation),
  delete: (id) => ApiService.delete(endpoint, id),
  storeInternationalOperation: (payload) => ApiService.post('operations/international', payload),
  storeTransferOperation: (payload) => ApiService.post('operations/transfer', payload),
  storeFutureOperation: (payload) => ApiService.post('operations/future', payload),
  storeComplexOperation: (payload) => ApiService.post('operations/complex', payload),
  payment: (payload) => ApiService.post('operations/payment', payload),
};
