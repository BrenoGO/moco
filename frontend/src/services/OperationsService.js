import { ApiService } from './ApiService';

const endpoint = 'operations';

export const OperationsService = {
  listAll: () => ApiService.get(endpoint),
  store: (operation) => ApiService.post(endpoint, operation),
  delete: (id) => ApiService.delete(endpoint, id),
};
