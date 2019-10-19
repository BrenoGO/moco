import { ApiService } from './ApiService';

const endpoint = 'users';

export const UsersService = {
  login: userData => ApiService.post(`${endpoint}/login`, userData),
  signUp: userData => ApiService.post(`${endpoint}`, userData),
  change: user => ApiService.put(endpoint, 'update', user)
};
