import { ApiService } from './ApiService';

const endpoint = 'settings';

export const SettingsService = {
  listAll: async () => ApiService.get(endpoint),
  getDefaults: async () => ApiService.get(`${endpoint}/defaults`),
  update: async (name, setting) => ApiService.put(endpoint, name, setting)
};
