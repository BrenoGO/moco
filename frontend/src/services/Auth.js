import { AccountsService } from './AccountsService';
import { SettingsService } from './SettingsService';

async function getData(method) {
  const resp = await method();
  if (resp.error) {
    if (String(resp.error).match(/not authorized/i)) {
      alert('not authorized');
      this.logout(() => {
        localStorage.removeItem('token');
      });
    } else {
      console.log(resp);
      alert(resp.error);
    }
  }
  return resp;
}

class Auth {
  constructor() {
    this.authenticated = false;
  }

  async login(cb) {
    const accounts = await getData(AccountsService.listAll);
    const defaults = await getData(SettingsService.getDefaults);
    this.authenticated = true;
    cb(accounts, defaults);
  }

  logout(cb) {
    this.authenticated = false;
    cb();
  }

  isAuth() {
    return this.authenticated;
  }
}

export default new Auth();
