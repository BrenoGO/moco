import { ApiService } from './ApiService';

const endpoint = 'bills';

export const BillsService = {
  getTyped: type => ApiService.get(`${endpoint}/${type}`),
  getById: id => ApiService.get(`${endpoint}/id/${id}`),
  store: bills => ApiService.post(endpoint, bills),
  pay: (id, paymentDate) => ApiService.put(endpoint, id, paymentDate)
};
