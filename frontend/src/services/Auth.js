import { AccountsService } from './AccountsService';
import { SettingsService } from './SettingsService';


class Auth {
  constructor() {
    this.authenticated = false;
  }

  async getData(method) {
    const resp = await method();
    if (resp.error) {
      if (String(resp.error).match(/not authorized/i)) {
        alert('not authorized');
      } else {
        alert('error getting data:', resp.error);
      }
      this.authenticated = false;
      localStorage.removeItem('token');
      window.location.href = process.env.PUBLIC_URL;
      return false;
    }
    return resp;
  }

  async login(cb) {
    const accounts = await this.getData(AccountsService.listAll);
    if (accounts) {
      const defaults = await this.getData(SettingsService.getDefaults);
      if (defaults) {
        this.authenticated = true;
        cb(accounts, defaults);
      }
    }
  }

  logout(cb) {
    this.authenticated = false;
    cb();
  }

  isAuth() {
    if (!this.authenticated) {
      if (localStorage.getItem('token')) {
        return true;
      }
      return false;
    }
    return this.authenticated;
  }
}

export default new Auth();
