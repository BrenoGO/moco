// here we will controll the object to set the language and place
class Internationalization {
  constructor() {
    this.initials = 'en-US';
    // this.initials = 'pt-BR';
  }

  setInitials(initials) {
    this.initials = initials;
    localStorage.setItem('Intl-initials', initials);
  }

  resetInitials(initials) {
    this.initials = initials;
    localStorage.setItem('Intl-initials', initials);
    window.location.reload(false);
  }

  getInitials() {
    return this.initials;
  }

  currencyFormatter(value) {
    let currency = '';
    switch (this.initials) {
      case 'en-US':
        currency = 'USD';
        break;
      case 'pt-BR':
        currency = 'BRL';
        break;
      default:
        currency = 'USD';
    }
    const formatter = new Intl.NumberFormat(this.initials, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    });

    let newValue = value;
    if (typeof newValue === 'number') newValue = String(newValue.toFixed(2));
    newValue = newValue.replace(/\D/g, '');
    if (newValue === '') newValue = '000';
    if (newValue.length === 1) newValue = `00${newValue}`;
    newValue = `${newValue.substring(0, newValue.length - 2)}.${newValue.substr(-2, 2)}`;
    return formatter.format(newValue);
  }

  toNumber(str) {
    if (typeof str === 'number') return str;
    let value = (str.replace(/\D/gi, ''));
    if (value === '') value = '000';
    if (value.length === 1) value = `00${value}`;
    value = Number(`${value.substring(0, value.length - 2)}.${value.substr(-2, 2)}`);
    return value;
  }

  formatDate(date) {
    return new Intl.DateTimeFormat(this.initials).format(date);
  }

  formatDateAndTime(date) {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    };
    return new Intl.DateTimeFormat(this.initials, options).format(date);
  }
}
export default new Internationalization();
