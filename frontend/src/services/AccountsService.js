import { ApiService } from './ApiService';

const endpoint = 'accounts';

export const AccountsService = {
  listAll: () => ApiService.get(endpoint),
  store: account => ApiService.post(endpoint, account),
  delete: id => ApiService.delete(endpoint, id),
  update: (id, account) => ApiService.put(endpoint, id, account)
};
