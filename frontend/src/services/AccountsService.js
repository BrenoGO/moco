import { ApiService } from './ApiService';
import store from '../reducers/store';

const endpoint = 'accounts';

export const AccountsService = {
  listAll: () => ApiService.get(endpoint),
  store: account => ApiService.post(endpoint, account),
  delete: id => ApiService.delete(endpoint, id),
  update: (id, account) => ApiService.put(endpoint, id, account),
  getAccount: (id) => {
    const { AccountsReducer: { accounts } } = store.getState();
    return accounts.find(acc => acc.id === id);
  },
};
