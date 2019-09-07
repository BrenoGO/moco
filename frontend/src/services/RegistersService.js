import { ApiService } from './ApiService';

const endpoint = 'registers';

export const RegistersService = {
  store: register => ApiService.post(endpoint, register)
};
