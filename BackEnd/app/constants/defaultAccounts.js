module.exports = [
  {
    allowValue: false,
    name: 'Incomes',
    id: 1
  },
  {
    allowValue: false,
    name: 'Expenses',
    id: 2
  },
  {
    allowValue: false,
    name: 'Current Accounts',
    id: 3
  },
  {
    allowValue: false,
    name: 'Future Payments',
    id: 4
  },
  {
    allowValue: false,
    name: 'To Pay',
    parents: [4],
    id: 13
  },
  {
    allowValue: false,
    name: 'To Receive',
    parents: [4],
    id: 14
  },
  {
    allowValue: true,
    name: 'Salary',
    parents: [1],
    id: 5
  },
  {
    allowValue: true,
    name: 'Others',
    parents: [1],
    id: 6
  },
  {
    allowValue: false,
    name: 'Fixed',
    parents: [2],
    id: 7
  },
  {
    allowValue: false,
    name: 'Car',
    parents: [2],
    id: 8
  },
  {
    allowValue: false,
    name: 'Fun!',
    parents: [2],
    id: 9
  },
  {
    allowValue: true,
    name: 'Wallet',
    parents: [3],
    id: 10
  },
  {
    allowValue: true,
    name: 'Bank',
    parents: [3],
    id: 11
  },
  {
    allowValue: false,
    name: 'Investments',
    parents: [3],
    id: 12
  },
  {
    allowValue: true,
    name: 'Electricity',
    parents: [2, 7],
    id: 15
  },
  {
    allowValue: true,
    name: 'Condominium',
    parents: [2, 7],
    id: 16
  },
  {
    allowValue: true,
    name: 'Gas',
    parents: [2, 8],
    id: 17
  },
  {
    allowValue: true,
    name: 'Tires',
    parents: [2, 8],
    id: 18
  },
  {
    allowValue: true,
    name: 'Trips',
    parents: [2, 9],
    id: 19
  },
  {
    allowValue: true,
    name: 'Savings',
    parents: [3, 12],
    id: 20
  },
  {
    allowValue: false,
    name: 'Market',
    parents: [2, 7],
    id: 21
  },
];
