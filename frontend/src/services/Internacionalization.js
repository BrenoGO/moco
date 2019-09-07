// here we will controll the object to set the language and place
class Internationalization {
  constructor() {
    this.initials = 'en-US';
    // this.initials = 'pt-BR';
  }

  setInitials(initials) {
    this.initials = initials;
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
    let newValue = value.replace(/\D/g, '');
    if (newValue === '') newValue = '000';
    if (newValue.length === 1) newValue = `00${newValue}`;
    newValue = `${newValue.substring(0, newValue.length - 2)}.${newValue.substr(-2, 2)}`;
    return formatter.format(newValue);
  }
}
export default new Internationalization();
