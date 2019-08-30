module.exports = {
  rootAccounts: [
    {
      allowValue: false,
      name: 'Incomes'
    },
    {
      allowValue: false,
      name: 'Expenses'
    },
    {
      allowValue: false,
      name: 'Current Accounts'
    },
    {
      allowValue: false,
      name: 'Future Payments'
    },
  ],
  firstLevel: [
    {
      allowValue: true,
      name: 'Salary',
      parentName: 'Incomes'
    },
    {
      allowValue: true,
      name: 'Others',
      parentName: 'Incomes'
    },
    {
      allowValue: false,
      name: 'Fixed',
      parentName: 'Expenses'
    },
    {
      allowValue: false,
      name: 'Car',
      parentName: 'Expenses'
    },
    {
      allowValue: false,
      name: 'Fun!',
      parentName: 'Expenses'
    },
    {
      allowValue: true,
      name: 'Wallet',
      parentName: 'Current Accounts'
    },
    {
      allowValue: true,
      name: 'Bank',
      parentName: 'Current Accounts'
    },
    {
      allowValue: false,
      name: 'Investments',
      parentName: 'Current Accounts'
    },
    {
      allowValue: false,
      name: 'To Pay',
      parentName: 'Future Payments'
    },
    {
      allowValue: false,
      name: 'To Receive',
      parentName: 'Future Payments'
    },
  ],
  secondLevel: [
    {
      allowValue: true,
      name: 'Electricity',
      parentName: 'Fixed'
    },
    {
      allowValue: true,
      name: 'Condominium',
      parentName: 'Fixed'
    },
    {
      allowValue: true,
      name: 'Gas',
      parentName: 'Car'
    },
    {
      allowValue: true,
      name: 'Tires',
      parentName: 'Car'
    },
    {
      allowValue: true,
      name: 'Trips',
      parentName: 'Fun!'
    },
    {
      allowValue: true,
      name: 'Savings',
      parentName: 'Investments'
    },
  ]
};
