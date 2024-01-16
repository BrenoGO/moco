import { ApiService } from './ApiService';
import { AccountsService } from './AccountsService';
import { RepMsgs } from './Messages';
import store from '../reducers/store';

const endpoint = 'registers';

export const RegistersService = {
  store: (register) => ApiService.post(endpoint, register),
  search: (data) => ApiService.post(`${endpoint}/search`, data),
  getRegDescToShow: (reg) => {
    const whatAc = AccountsService.getAccount(reg.whatAccountId);
    let desc = reg.description;
    if (!desc) desc = whatAc && whatAc.name;
    if (!desc) {
      const { DefaultsReducer: { locale } } = store.getState();
      switch (reg.opType) {
        case 'transference':
          desc = RepMsgs[locale].transference;
          break;
        case 'payment':
          desc = RepMsgs[locale].payment;
          break;
        default:
          break;
      }
    }
    return desc;
  },
  update: (register) => ApiService.put(endpoint, register._id, register),
};
