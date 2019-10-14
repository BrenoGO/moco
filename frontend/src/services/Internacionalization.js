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

    let sign = '';
    let newValue = value;

    if (typeof newValue === 'number') newValue = newValue.toFixed(2);
    if (newValue[0] === '-') sign = '-';
    newValue = newValue.replace(/\D/g, '');
    if (newValue === '') newValue = '000';
    if (newValue.length === 1) newValue = `00${newValue}`;
    newValue = `${sign}${newValue.substring(0, newValue.length - 2)}.${newValue.substr(-2, 2)}`;
    return formatter.format(newValue);
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
