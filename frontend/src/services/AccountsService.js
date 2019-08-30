import { ApiService } from './ApiService';

const endpoint = 'accounts';

export const AccountsService = {
  listAll: async () => ApiService.get(endpoint),
  store: async account => ApiService.post(endpoint, account),
  delete: async id => ApiService.delete(endpoint, id),
  update: async (id, account) => ApiService.put(endpoint, id, account)
};
