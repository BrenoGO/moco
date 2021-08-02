const helpers = {
  getChildren: (accounts, id) => {
    const children = accounts.filter(
      (ac) => (ac.parents[ac.parents.length - 1] === id),
    ).sort((a, b) => {
      if (a.allowValue && !b.allowValue) return -1;
      if (b.allowValue && !a.allowValue) return 1;
      return a.id - b.id;
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
  currencyFormatter: (locale, value) => {
    let currency = '';
    switch (locale) {
      case 'en-US':
        currency = 'USD';
        break;
      case 'pt-BR':
        currency = 'BRL';
        break;
      default:
        currency = 'USD';
    }
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    });

    let sign = '';
    let newValue = value;

    if (typeof newValue === 'number') newValue = newValue.toFixed(2);
    if (newValue[0] === '-') sign = '-';
    newValue = newValue.replace(/\D/g, '');
    if (newValue === '') newValue = '000';
    if (newValue.length === 1) newValue = `00${newValue}`;
    newValue = `${sign}${newValue.substring(0, newValue.length - 2)}.${newValue.substr(-2, 2)}`;
    return formatter.format(newValue);
  },
  formatDate(locale, date) {
    return new Intl.DateTimeFormat(locale).format(date);
  },
  formatDateAndTime(locale, date) {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    };
    return new Intl.DateTimeFormat(locale, options).format(date);
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
  },
  changeSignal(locale, strValue, changeValueFunc) {
    if (strValue.substring(0, 1) === '-') {
      return changeValueFunc(helpers.currencyFormatter(locale, strValue.substring(1)));
    }
    return changeValueFunc(helpers.currencyFormatter(locale, `-${strValue}`));
  },
};

export default helpers;
