import { ApiService } from './ApiService';

const endpoint = 'settings';

export const SettingsService = {
  listAll: async () => ApiService.get(endpoint),
  getDefaults: async () => ApiService.get(`${endpoint}/defaults`),
};
