import { message } from 'antd';
import { AccountsService } from './AccountsService';
import { SettingsService } from './SettingsService';

class Auth {
  constructor() {
    this.authenticated = false;
  }

  async getData(method) {
    try {
      const resp = await method();

      return resp;
    } catch (err) {
      console.log('err getting data...');
      console.log(err);
      if (err.error === 401) {
        message.warning('not authorized');
      } else {
        message.error('error getting data:', err);
      }
      this.authenticated = false;
      localStorage.removeItem('token');
      window.location.href = process.env.PUBLIC_URL;
      return false;
    }
  }

  async login(cb) {
    try {
      const accounts = await this.getData(AccountsService.listAll);
      if (accounts) {
        const defaults = await this.getData(SettingsService.getDefaults);
        if (defaults) {
          this.authenticated = true;
          cb(accounts, defaults);
        }
      }
    } catch (err) {
      console.log('err login in..');
      console.log(err);
      if (err.status === 401) {
        console.log('status 401, loggin out....');
        this.authenticated = false;
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
