import { ApiService } from './ApiService';

const endpoint = 'users';

export const UsersService = {
  login: userData => ApiService.post(`${endpoint}/login`, userData)
};
