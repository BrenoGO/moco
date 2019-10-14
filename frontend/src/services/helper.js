const helpers = {
  getChildren: (accounts, id) => {
    const children = accounts.filter(
      ac => (ac.parents[ac.parents.length - 1] === id)
    ).sort((a, b) => {
      if (b.allowValue) return 1;
      return b.id - a.id;
    });
    return children;
  },
  organizedAccounts: (accounts, id) => {
    const rootAccs = helpers.getChildren(accounts, id);
    const orgAc = [];

    function loopChildren(children) {
      if (children.length > 0) {
        children.forEach((child) => {
          orgAc.push(child);
          loopChildren(helpers.getChildren(accounts, child.id));
        });
      }
    }
    loopChildren(rootAccs);
    return (orgAc);
  },
  toNumber(str) {
    if (typeof str === 'number') return str;
    let value = str;
    let sign = '';
    if (str[0] === '-') sign = '-';
    value = (str.replace(/\D/gi, ''));
    if (value === '') value = '000';
    if (value.length === 1) value = `00${value}`;
    value = Number(`${sign}${value.substring(0, value.length - 2)}.${value.substr(-2, 2)}`);
    return value;
  },
  dbDateToNewDate(strDate) {
    const [date, time] = strDate.split('T');
    const [year, month, day] = date.split('-');
    const [hour, min, tempSec] = time.split(':');
    const [sec] = tempSec.split('.');

    return new Date(year, month - 1, day, hour, min, sec);
  },
  dateToInput(date) {
    const year = date.getFullYear();
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    if (month.length === 1) month = `0${month}`;
    if (day.length === 1) day = `0${day}`;
    return `${year}-${month}-${day}`;
  },
  inputDateToNewDate(strDate) {
    const [year, month, day] = strDate.split('-');
    return new Date(year, month - 1, day);
  }
};

export default helpers;
